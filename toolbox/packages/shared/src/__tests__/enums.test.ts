import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LEAD_FEE_CENTS,
  JOB_STATUS,
  LEAD_STATUS,
  PLATFORM_FEE_BPS,
  SUBSCRIPTION_TIERS,
  TRADES,
  URGENCY,
  USER_ROLES,
  VIDEO_STATUS,
  VIDEO_VISIBILITY,
} from '../enums';

describe('enum catalog', () => {
  it('user roles cover the brief', () => {
    expect(USER_ROLES).toEqual(['HOMEOWNER', 'PRO', 'APPRENTICE', 'ADMIN']);
  });
  it('subscription tiers include FREE', () => {
    expect(SUBSCRIPTION_TIERS).toContain('FREE');
  });
  it('video lifecycle', () => {
    expect(VIDEO_STATUS).toEqual(['PROCESSING', 'READY', 'FAILED', 'REMOVED']);
    expect(VIDEO_VISIBILITY).toEqual(['PUBLIC', 'UNLISTED', 'PRIVATE']);
  });
  it('job + lead statuses', () => {
    expect(JOB_STATUS).toContain('MATCHING');
    expect(LEAD_STATUS).toContain('EXPIRED');
  });
  it('urgency has emergency', () => {
    expect(URGENCY).toContain('EMERGENCY');
  });
  it('trades include the brief examples', () => {
    ['PLUMBING', 'ELECTRICAL', 'HVAC', 'CARPENTRY'].forEach((t) =>
      expect(TRADES).toContain(t),
    );
  });
  it('economics defaults are reasonable', () => {
    expect(DEFAULT_LEAD_FEE_CENTS).toBeGreaterThanOrEqual(1000);
    expect(PLATFORM_FEE_BPS).toBeLessThanOrEqual(3000);
  });
});
