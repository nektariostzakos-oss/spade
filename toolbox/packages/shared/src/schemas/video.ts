import { z } from 'zod';
import { VIDEO_STATUS, VIDEO_VISIBILITY } from '../enums';
import { cuidSchema, latSchema, lngSchema, tradeSchema } from './common';

export const videoSchema = z.object({
  id: cuidSchema,
  creatorId: cuidSchema,
  caption: z.string().max(500).nullable(),
  muxAssetId: z.string().nullable(),
  muxPlaybackId: z.string().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  durationSec: z.number().int().min(0).nullable(),
  status: z.enum(VIDEO_STATUS),
  visibility: z.enum(VIDEO_VISIBILITY),
  viewCount: z.number().int().min(0),
  likeCount: z.number().int().min(0),
  commentCount: z.number().int().min(0),
  shareCount: z.number().int().min(0),
  hashtags: z.array(z.string().max(32)).max(20),
  trade: tradeSchema.nullable(),
  locationLat: latSchema.nullable(),
  locationLng: lngSchema.nullable(),
  city: z.string().max(120).nullable(),
  createdAt: z.coerce.date(),
});
export type Video = z.infer<typeof videoSchema>;

export const createVideoInput = z.object({
  caption: z.string().max(500).optional(),
  hashtags: z.array(z.string().max(32)).max(20).default([]),
  trade: tradeSchema.optional(),
  locationLat: latSchema.optional(),
  locationLng: lngSchema.optional(),
  city: z.string().max(120).optional(),
  visibility: z.enum(VIDEO_VISIBILITY).default('PUBLIC'),
});
export type CreateVideoInput = z.infer<typeof createVideoInput>;

export const muxWebhookEvent = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string().optional(),
    playback_ids: z
      .array(z.object({ id: z.string(), policy: z.string() }))
      .optional(),
    duration: z.number().optional(),
    passthrough: z.string().optional(),
  }),
});
export type MuxWebhookEvent = z.infer<typeof muxWebhookEvent>;
