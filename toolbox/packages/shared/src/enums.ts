export const USER_ROLES = ['HOMEOWNER', 'PRO', 'APPRENTICE', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VERIFICATION_STATUS = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const SUBSCRIPTION_TIERS = ['FREE', 'STANDARD', 'PRO'] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const VIDEO_STATUS = ['PROCESSING', 'READY', 'FAILED', 'REMOVED'] as const;
export type VideoStatus = (typeof VIDEO_STATUS)[number];

export const VIDEO_VISIBILITY = ['PUBLIC', 'UNLISTED', 'PRIVATE'] as const;
export type VideoVisibility = (typeof VIDEO_VISIBILITY)[number];

export const URGENCY = ['LOW', 'MED', 'HIGH', 'EMERGENCY'] as const;
export type Urgency = (typeof URGENCY)[number];

export const JOB_STATUS = [
  'OPEN',
  'MATCHING',
  'QUOTED',
  'BOOKED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

export const LEAD_STATUS = [
  'SENT',
  'VIEWED',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'WON',
  'LOST',
] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

export const LEAD_FEE_STATUS = ['PENDING', 'CHARGED', 'REFUNDED'] as const;
export type LeadFeeStatus = (typeof LEAD_FEE_STATUS)[number];

export const BOOKING_STATUS = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const TRADES = [
  'PLUMBING',
  'ELECTRICAL',
  'HVAC',
  'CARPENTRY',
  'ROOFING',
  'PAINTING',
  'LANDSCAPING',
  'HANDYMAN',
  'MASONRY',
  'FLOORING',
  'TILE',
  'APPLIANCE_REPAIR',
  'LOCKSMITH',
  'PEST_CONTROL',
  'WINDOW_DOOR',
  'GARAGE_DOOR',
  'CLEANING',
  'OTHER',
] as const;
export type Trade = (typeof TRADES)[number];

export const LOCALES = ['en', 'el'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const PLATFORM_FEE_BPS = 1000;
export const DEFAULT_LEAD_FEE_CENTS = 5000;
