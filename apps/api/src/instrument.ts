import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.APP_ENV ?? 'dev',
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.APP_ENV === 'prod' ? 0.2 : 1.0,
    profilesSampleRate: 1.0,
  });
}
