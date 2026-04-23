import Mux from '@mux/mux-node';
import { embedText, toPgVector } from '@toolbox/ai';
import { prisma, Prisma, type Video } from '@toolbox/db';
import {
  appError,
  err,
  ok,
  type CreateVideoInput,
  type MuxWebhookEvent,
  type Result,
} from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

let client: Mux | null = null;
const getMux = (): Mux => {
  if (!client) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!tokenId || !tokenSecret) throw new Error('MUX_TOKEN_ID / MUX_TOKEN_SECRET are not set');
    client = new Mux({ tokenId, tokenSecret });
  }
  return client;
};

export interface CreateUploadResult {
  uploadId: string;
  uploadUrl: string;
  videoId: string;
}

export const createSignedUpload = async (
  authed: AuthedUser,
  input: CreateVideoInput,
): Promise<Result<CreateUploadResult>> => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));

  const video = await prisma.video.create({
    data: {
      creatorId: user.id,
      caption: input.caption ?? null,
      hashtags: input.hashtags,
      trade: input.trade ?? null,
      locationLat: input.locationLat ?? null,
      locationLng: input.locationLng ?? null,
      city: input.city ?? null,
      visibility: input.visibility,
      status: 'PROCESSING',
    },
  });

  const upload = await getMux().video.uploads.create({
    cors_origin: process.env.WEB_URL ?? '*',
    new_asset_settings: {
      playback_policy: ['public'],
      passthrough: video.id,
      input: [{ generated_subtitles: [{ language_code: 'en', name: 'English (auto)' }] }],
      mp4_support: 'standard',
      normalize_audio: true,
    },
  });

  return ok({ uploadId: upload.id, uploadUrl: upload.url, videoId: video.id });
};

export const handleMuxWebhook = async (event: MuxWebhookEvent): Promise<Result<null>> => {
  if (event.type !== 'video.asset.ready' && event.type !== 'video.asset.errored') return ok(null);
  const videoId = event.data.passthrough;
  if (!videoId) return err(appError('VALIDATION', 'missing passthrough'));

  if (event.type === 'video.asset.errored') {
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    return ok(null);
  }

  const playbackId = event.data.playback_ids?.[0]?.id ?? null;
  const updated = await prisma.video.update({
    where: { id: videoId },
    data: {
      status: 'READY',
      muxAssetId: event.data.id,
      muxPlaybackId: playbackId,
      durationSec: event.data.duration ? Math.round(event.data.duration) : null,
      thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1` : null,
    },
  });

  const embedSrc = [updated.caption ?? '', updated.hashtags.join(' '), updated.trade ?? '']
    .filter(Boolean)
    .join(' · ');
  if (embedSrc.trim()) {
    const vec = await embedText(embedSrc);
    await prisma.$executeRaw(
      Prisma.sql`UPDATE "Video" SET embedding = ${toPgVector(vec)}::vector WHERE id = ${updated.id}`,
    );
  }
  return ok(null);
};

export const getVideo = async (id: string): Promise<Result<Video>> => {
  const video = await prisma.video.findFirst({
    where: { id, status: 'READY', visibility: 'PUBLIC' },
  });
  if (!video) return err(appError('NOT_FOUND', 'Video not found'));
  await prisma.video.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  return ok(video);
};
