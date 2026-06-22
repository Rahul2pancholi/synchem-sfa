import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { InsightsConfigService } from './config/insights-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(InsightsConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: config.corsOrigins, credentials: true });

  const port = config.port;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`insights-service listening on :${port}`);
}

void bootstrap();
