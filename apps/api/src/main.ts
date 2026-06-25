import './instrument'; // Sentry must be imported before everything else
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  if (config.appEnv !== 'prod') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Synchem SFA API')
      .setDescription('Pharma Sales Force Automation — REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }


  const port = config.port;
  await app.listen(port);
}

void bootstrap();
