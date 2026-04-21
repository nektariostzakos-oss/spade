import { describe, expect, it } from 'vitest';
import { haversineKm, scoreMatch } from './matching';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm({ lat: 33.96, lng: -83.37 }, { lat: 33.96, lng: -83.37 })).toBeCloseTo(0, 5);
  });

  it('Athens GA to Atlanta is ~100km', () => {
    const d = haversineKm({ lat: 33.96, lng: -83.37 }, { lat: 33.75, lng: -84.39 });
    expect(d).toBeGreaterThan(90);
    expect(d).toBeLessThan(120);
  });
});

describe('scoreMatch', () => {
  const base = {
    distanceKm: 5,
    serviceRadiusKm: 25,
    ratingAvg: 4.8,
    ratingCount: 50,
    responseRateP30: 0.95,
    avgResponseMinutes: 10,
    daysSinceLastActive: 1,
    cosineSimilarity: 0.8,
  };

  it('a perfect match scores > 0.8', () => {
    expect(scoreMatch(base)).toBeGreaterThan(0.8);
  });

  it('distance at service radius pulls the score down', () => {
    const close = scoreMatch(base);
    const far = scoreMatch({ ...base, distanceKm: 24 });
    expect(close).toBeGreaterThan(far);
  });

  it('low response rate hurts score', () => {
    const responsive = scoreMatch(base);
    const slow = scoreMatch({ ...base, responseRateP30: 0.1, avgResponseMinutes: 120 });
    expect(responsive).toBeGreaterThan(slow);
  });

  it('never returns above 1', () => {
    const max = scoreMatch({
      distanceKm: 0,
      serviceRadiusKm: 100,
      ratingAvg: 5,
      ratingCount: 1000,
      responseRateP30: 1,
      avgResponseMinutes: 0,
      daysSinceLastActive: 0,
      cosineSimilarity: 1,
    });
    expect(max).toBeLessThanOrEqual(1);
  });

  it('never returns below 0', () => {
    const min = scoreMatch({
      distanceKm: 1000,
      serviceRadiusKm: 1,
      ratingAvg: 0,
      ratingCount: 0,
      responseRateP30: 0,
      avgResponseMinutes: 600,
      daysSinceLastActive: 365,
      cosineSimilarity: -1,
    });
    expect(min).toBeGreaterThanOrEqual(0);
  });
});
