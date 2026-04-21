import { z } from 'zod';
import { LOCALES, TRADES } from '../enums';

export const cuidSchema = z.string().min(12).max(64);
export const emailSchema = z.string().email().max(254);
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'E.164 phone number required');

export const latSchema = z.number().gte(-90).lte(90);
export const lngSchema = z.number().gte(-180).lte(180);

export const locationSchema = z.object({
  lat: latSchema,
  lng: lngSchema,
  city: z.string().max(120).optional(),
  country: z.string().length(2).optional(),
});

export const localeSchema = z.enum(LOCALES);
export const tradeSchema = z.enum(TRADES);

export const cursorSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const pagedResultSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
