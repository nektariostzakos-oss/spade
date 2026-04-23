import { z } from 'zod';
import { cuidSchema } from './common';

export const reviewSchema = z.object({
  id: cuidSchema,
  bookingId: cuidSchema,
  raterId: cuidSchema,
  rateeId: cuidSchema,
  stars: z.number().int().min(1).max(5),
  text: z.string().max(2000).nullable(),
  photos: z.array(z.string().url()).max(6),
  createdAt: z.coerce.date(),
});
export type Review = z.infer<typeof reviewSchema>;

export const createReviewInput = z.object({
  bookingId: cuidSchema,
  stars: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(6).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewInput>;
