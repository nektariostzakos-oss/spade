import { z } from 'zod';
import { SUBSCRIPTION_TIERS, USER_ROLES, VERIFICATION_STATUS } from '../enums';
import { cuidSchema, emailSchema, latSchema, lngSchema, localeSchema, phoneSchema, tradeSchema } from './common';

export const userSchema = z.object({
  id: cuidSchema,
  clerkId: z.string().min(1),
  role: z.enum(USER_ROLES),
  email: emailSchema.nullable(),
  phone: phoneSchema.nullable(),
  displayName: z.string().min(1).max(80),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  locationLat: latSchema.nullable(),
  locationLng: lngSchema.nullable(),
  city: z.string().max(120).nullable(),
  country: z.string().length(2).nullable(),
  languages: z.array(localeSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;

export const updateUserInput = userSchema
  .pick({
    displayName: true,
    avatarUrl: true,
    bio: true,
    city: true,
    country: true,
    languages: true,
  })
  .partial();
export type UpdateUserInput = z.infer<typeof updateUserInput>;

export const proProfileSchema = z.object({
  id: cuidSchema,
  userId: cuidSchema,
  businessName: z.string().min(1).max(120),
  trades: z.array(tradeSchema).min(1).max(6),
  serviceRadiusKm: z.number().int().min(1).max(200),
  licenseNumber: z.string().max(64).nullable(),
  licenseState: z.string().max(64).nullable(),
  licenseStatus: z.enum(VERIFICATION_STATUS),
  insuranceStatus: z.enum(VERIFICATION_STATUS),
  stripeAccountId: z.string().nullable(),
  subscriptionTier: z.enum(SUBSCRIPTION_TIERS),
  responseRateP30: z.number().min(0).max(1),
  avgResponseMinutes: z.number().int().min(0),
  completedJobs: z.number().int().min(0),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().int().min(0),
});
export type ProProfile = z.infer<typeof proProfileSchema>;

export const proOnboardingInput = z.object({
  businessName: z.string().min(1).max(120),
  trades: z.array(tradeSchema).min(1).max(6),
  serviceRadiusKm: z.number().int().min(1).max(200),
  locationLat: latSchema,
  locationLng: lngSchema,
  city: z.string().max(120),
  country: z.string().length(2),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  licenseNumber: z.string().max(64).optional(),
  licenseState: z.string().max(64).optional(),
  licenseDocumentUrl: z.string().url().optional(),
  insuranceDocumentUrl: z.string().url().optional(),
});
export type ProOnboardingInput = z.infer<typeof proOnboardingInput>;
