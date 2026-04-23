import { describe, expect, it } from 'vitest';
import { createJobInput, proOnboardingInput } from '../schemas';

describe('proOnboardingInput', () => {
  const base = {
    businessName: 'Athens Plumbing Co',
    trades: ['PLUMBING'] as const,
    serviceRadiusKm: 30,
    locationLat: 33.96,
    locationLng: -83.37,
    city: 'Athens',
    country: 'US',
  };

  it('accepts valid input', () => {
    expect(proOnboardingInput.safeParse(base).success).toBe(true);
  });

  it('rejects empty trades', () => {
    expect(proOnboardingInput.safeParse({ ...base, trades: [] }).success).toBe(false);
  });

  it('rejects invalid country length', () => {
    expect(proOnboardingInput.safeParse({ ...base, country: 'USA' }).success).toBe(false);
  });
});

describe('createJobInput', () => {
  const base = {
    description: 'My kitchen sink is leaking under the cabinet, need a plumber today.',
    photos: [],
    trade: 'PLUMBING' as const,
    urgency: 'HIGH' as const,
    locationLat: 33.96,
    locationLng: -83.37,
    address: null,
  };

  it('accepts valid', () => {
    expect(createJobInput.safeParse(base).success).toBe(true);
  });

  it('rejects budgetMax < budgetMin', () => {
    const r = createJobInput.safeParse({
      ...base,
      budgetMinCents: 20000,
      budgetMaxCents: 10000,
    });
    expect(r.success).toBe(false);
  });
});
