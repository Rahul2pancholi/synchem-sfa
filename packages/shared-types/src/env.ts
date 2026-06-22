import { z } from 'zod';

export const EnvSchema = z.object({
  APP_ENV: z.enum(['dev', 'uat', 'prod']).default('dev'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('12h'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;
