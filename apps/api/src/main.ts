import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(AppConfigService);

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: config.corsOrigins, credentials: true });

  if (config.sentryDsn) {
    // Optional: install @sentry/nestjs and init here when SENTRY_DSN is set
    app.get(Logger).warn('SENTRY_DSN is set — add @sentry/nestjs init in main.ts for full error tracking');
  }

  const port = config.port;
  await app.listen(port);
}

void bootstrap();
