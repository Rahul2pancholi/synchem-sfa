import PgBoss from 'pg-boss';
import pino from 'pino';

const logger = pino({ name: 'synchem-sfa-worker' });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error('DATABASE_URL is required');
  process.exit(1);
}

const boss = new PgBoss(connectionString);

async function main() {
  boss.on('error', (error) => logger.error({ err: error }, 'pg-boss error'));

  await boss.start();
  await boss.createQueue('health.ping');

  await boss.work('health.ping', async (job) => {
    logger.info({ jobId: job.id, module: 'worker', action: 'healthPing' }, 'Worker alive');
  });

  await boss.send('health.ping', { startedAt: new Date().toISOString() });
  logger.info({ module: 'worker', action: 'started' }, 'Worker skeleton running');
}

main().catch((error) => {
  logger.error({ err: error }, 'Worker failed to start');
  process.exit(1);
});
