import Mux from '@mux/mux-node';
import { prisma } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';

let client: Mux | null = null;
const getMux = (): Mux => {
  if (!client) {
    client = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });
  }
  return client;
};

export const startLive = async (
  authed: AuthedUser,
): Promise<Result<{ streamKey: string; playbackId: string; rtmpUrl: string }>> => {
  const user = await prisma.user.findUnique({
    where: { clerkId: authed.clerkId },
    include: { proProfile: true },
  });
  if (!user?.proProfile) return err(appError('NOT_FOUND', 'No pro profile'));
  if (user.proProfile.subscriptionTier === 'FREE')
    return err(appError('PAYMENT_REQUIRED', 'Live is a paid feature'));

  const stream = await getMux().video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: { playback_policy: ['public'] },
    latency_mode: 'low',
    reconnect_window: 60,
  });
  const playbackId = stream.playback_ids?.[0]?.id;
  if (!stream.stream_key || !playbackId) return err(appError('UPSTREAM', 'Mux live create failed'));

  return ok({
    streamKey: stream.stream_key,
    playbackId,
    rtmpUrl: 'rtmps://global-live.mux.com:443/app',
  });
};

export const listActiveStreams = async () => {
  const streams = await getMux().video.liveStreams.list({ status: 'active' });
  return ok(streams.data);
};
