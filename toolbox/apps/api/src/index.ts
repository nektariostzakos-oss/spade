import { logger } from '@toolbox/shared';
import { buildServer } from './server';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

async function main() {
  const app = await buildServer();
  await app.listen({ port, host });
  logger.info({ port, host }, 'api listening');
}

main().catch((err) => {
  logger.error({ err }, 'fatal api startup error');
  process.exit(1);
});
