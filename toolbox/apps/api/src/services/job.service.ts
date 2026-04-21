import { embedText, toPgVector } from '@toolbox/ai';
import { prisma, Prisma, type Job } from '@toolbox/db';
import {
  appError,
  err,
  ok,
  type CreateJobInput,
  type Result,
} from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';
import { matchProsForJob } from './matching.service';

export const createJob = async (
  authed: AuthedUser,
  input: CreateJobInput,
): Promise<Result<Job & { leadsCreated: number }>> => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));

  const embedding = await embedText(input.description);

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        homeownerId: user.id,
        description: input.description,
        photos: input.photos ?? [],
        trade: input.trade ?? null,
        urgency: input.urgency,
        budgetMinCents: input.budgetMinCents ?? null,
        budgetMaxCents: input.budgetMaxCents ?? null,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        address: input.address ?? null,
      },
    });
    await tx.$executeRaw(
      Prisma.sql`UPDATE "Job" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${created.id}`,
    );
    return created;
  });

  const { leads } = await matchProsForJob({
    jobId: job.id,
    jobEmbedding: embedding,
    jobLat: job.locationLat,
    jobLng: job.locationLng,
    trade: job.trade,
  });

  return ok({ ...job, leadsCreated: leads });
};

export const getMyJobs = async (authed: AuthedUser) => {
  const user = await prisma.user.findUnique({ where: { clerkId: authed.clerkId } });
  if (!user) return err(appError('UNAUTHORIZED', 'No user'));
  const jobs = await prisma.job.findMany({
    where: { homeownerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { leads: true },
    take: 50,
  });
  return ok(jobs);
};
