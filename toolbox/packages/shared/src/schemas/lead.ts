import { z } from 'zod';
import { LEAD_FEE_STATUS, LEAD_STATUS } from '../enums';
import { cuidSchema } from './common';

export const leadSchema = z.object({
  id: cuidSchema,
  jobId: cuidSchema,
  proId: cuidSchema,
  status: z.enum(LEAD_STATUS),
  feeAmountCents: z.number().int().min(0),
  feeStatus: z.enum(LEAD_FEE_STATUS),
  matchScore: z.number().min(0).max(1),
  distanceKm: z.number().min(0),
  sentAt: z.coerce.date(),
  respondedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
});
export type Lead = z.infer<typeof leadSchema>;

export const respondToLeadInput = z.object({
  leadId: cuidSchema,
  accept: z.boolean(),
  message: z.string().max(1000).optional(),
});
export type RespondToLeadInput = z.infer<typeof respondToLeadInput>;
