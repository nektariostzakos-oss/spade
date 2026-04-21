import { z } from 'zod';
import { JOB_STATUS, URGENCY } from '../enums';
import { cuidSchema, latSchema, lngSchema, tradeSchema } from './common';

export const jobSchema = z.object({
  id: cuidSchema,
  homeownerId: cuidSchema,
  description: z.string().min(10).max(2000),
  photos: z.array(z.string().url()).max(8),
  trade: tradeSchema.nullable(),
  urgency: z.enum(URGENCY),
  budgetMinCents: z.number().int().min(0).nullable(),
  budgetMaxCents: z.number().int().min(0).nullable(),
  locationLat: latSchema,
  locationLng: lngSchema,
  address: z.string().max(240).nullable(),
  status: z.enum(JOB_STATUS),
  createdAt: z.coerce.date(),
});
export type Job = z.infer<typeof jobSchema>;

export const createJobInput = jobSchema
  .pick({
    description: true,
    photos: true,
    trade: true,
    urgency: true,
    locationLat: true,
    locationLng: true,
    address: true,
  })
  .extend({
    budgetMinCents: z.number().int().min(0).optional(),
    budgetMaxCents: z.number().int().min(0).optional(),
  })
  .refine(
    (v) =>
      v.budgetMinCents === undefined ||
      v.budgetMaxCents === undefined ||
      v.budgetMaxCents >= v.budgetMinCents,
    { message: 'budgetMaxCents must be >= budgetMinCents', path: ['budgetMaxCents'] },
  );
export type CreateJobInput = z.infer<typeof createJobInput>;
