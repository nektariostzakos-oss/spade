import { haversineKm, scoreMatch } from '@toolbox/ai';
import { DEFAULT_LEAD_FEE_CENTS } from '@toolbox/shared';
import { prisma, Prisma } from '@toolbox/db';

const LEAD_EXPIRY_SECONDS = 60;
const RADIUS_BUFFER_KM = 15;

interface CandidateRow {
  id: string;
  user_id: string;
  business_name: string;
  service_radius_km: number;
  rating_avg: number;
  rating_count: number;
  response_rate_p30: number;
  avg_response_minutes: number;
  updated_at: Date;
  location_lat: number | null;
  location_lng: number | null;
  similarity: number;
}

export const matchProsForJob = async (params: {
  jobId: string;
  jobEmbedding: readonly number[];
  jobLat: number;
  jobLng: number;
  trade: string | null;
  topN?: number;
}): Promise<{ leads: number }> => {
  const topN = params.topN ?? 5;
  const vec = `[${params.jobEmbedding.join(',')}]`;
  const tradeFilter = params.trade ? Prisma.sql`AND ${params.trade} = ANY(p.trades)` : Prisma.empty;

  // Cosine similarity = 1 - (embedding <=> vec). Pull a wider net (25), score client-side.
  const rows = await prisma.$queryRaw<CandidateRow[]>(Prisma.sql`
    SELECT p.id, p."userId" AS user_id, p."businessName" AS business_name,
           p."serviceRadiusKm" AS service_radius_km, p."ratingAvg" AS rating_avg,
           p."ratingCount" AS rating_count, p."responseRateP30" AS response_rate_p30,
           p."avgResponseMinutes" AS avg_response_minutes, p."updatedAt" AS updated_at,
           u."locationLat" AS location_lat, u."locationLng" AS location_lng,
           1 - (p.embedding <=> ${vec}::vector) AS similarity
    FROM "ProProfile" p
    JOIN "User" u ON u.id = p."userId"
    WHERE p."licenseStatus" = 'VERIFIED'
      AND p."insuranceStatus" = 'VERIFIED'
      AND p.embedding IS NOT NULL
      ${tradeFilter}
    ORDER BY p.embedding <=> ${vec}::vector
    LIMIT 25
  `);

  const scored = rows
    .map((r) => {
      const lat = r.location_lat;
      const lng = r.location_lng;
      const distanceKm =
        lat != null && lng != null
          ? haversineKm({ lat: params.jobLat, lng: params.jobLng }, { lat, lng })
          : Infinity;
      const daysSinceLastActive =
        (Date.now() - r.updated_at.getTime()) / (1000 * 60 * 60 * 24);
      const score = scoreMatch({
        distanceKm,
        serviceRadiusKm: r.service_radius_km,
        ratingAvg: r.rating_avg,
        ratingCount: r.rating_count,
        responseRateP30: r.response_rate_p30,
        avgResponseMinutes: r.avg_response_minutes,
        daysSinceLastActive,
        cosineSimilarity: r.similarity,
      });
      return { row: r, score, distanceKm };
    })
    .filter((c) => c.distanceKm <= c.row.service_radius_km + RADIUS_BUFFER_KM)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  if (scored.length === 0) return { leads: 0 };

  const expiresAt = new Date(Date.now() + LEAD_EXPIRY_SECONDS * 1000);
  await prisma.$transaction([
    ...scored.map((c) =>
      prisma.lead.upsert({
        where: { jobId_proId: { jobId: params.jobId, proId: c.row.id } },
        update: {},
        create: {
          jobId: params.jobId,
          proId: c.row.id,
          matchScore: c.score,
          distanceKm: Number.isFinite(c.distanceKm) ? c.distanceKm : 0,
          feeAmountCents: DEFAULT_LEAD_FEE_CENTS,
          expiresAt,
        },
      }),
    ),
    prisma.job.update({ where: { id: params.jobId }, data: { status: 'MATCHING' } }),
  ]);

  return { leads: scored.length };
};
