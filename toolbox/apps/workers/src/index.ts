import { createLogger } from '@toolbox/shared';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const log = createLogger('workers');

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const queues = {
  videoProcessing: new Queue('video-processing', { connection }),
  moderation: new Queue('moderation', { connection }),
  leadRouting: new Queue('lead-routing', { connection }),
  notifications: new Queue('notifications', { connection }),
} as const;

const workers: Worker[] = [];

for (const [name] of Object.entries(queues)) {
  workers.push(
    new Worker(
      name,
      async (job) => {
        log.info({ queue: name, id: job.id }, 'job received (stub)');
      },
      { connection },
    ),
  );
}

log.info({ queues: Object.keys(queues) }, 'workers started');

const shutdown = async () => {
  log.info('shutting down workers');
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
