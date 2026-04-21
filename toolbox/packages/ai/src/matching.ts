export interface ScoreInputs {
  distanceKm: number;
  serviceRadiusKm: number;
  ratingAvg: number;
  ratingCount: number;
  responseRateP30: number;
  avgResponseMinutes: number;
  daysSinceLastActive: number;
  cosineSimilarity: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const scoreMatch = (x: ScoreInputs): number => {
  const distanceScore = clamp01(1 - x.distanceKm / Math.max(x.serviceRadiusKm, 1));
  const ratingScore = x.ratingCount >= 3 ? clamp01(x.ratingAvg / 5) : 0.6;
  const responseScore = clamp01(
    0.6 * x.responseRateP30 + 0.4 * (1 - Math.min(x.avgResponseMinutes, 120) / 120),
  );
  const recencyScore = clamp01(1 - Math.min(x.daysSinceLastActive, 30) / 30);
  const similarity = clamp01((x.cosineSimilarity + 1) / 2);

  return (
    0.35 * similarity +
    0.25 * distanceScore +
    0.2 * ratingScore +
    0.15 * responseScore +
    0.05 * recencyScore
  );
};

export const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
  const R = 6371;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
