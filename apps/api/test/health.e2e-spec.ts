import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AppConfigService } from '../src/config/config.service';
import { RedisService } from '../src/infrastructure/cache/redis.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma.module';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppConfigService)
      .useValue({
        appEnv: 'dev',
        port: 3000,
        databaseUrl: 'postgresql://test',
        jwtSecret: 'x'.repeat(32),
        jwtExpiresIn: '12h',
        logLevel: 'error',
      })
      .overrideProvider(PrismaService)
      .useValue({
        isHealthy: jest.fn().mockResolvedValue(true),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .overrideProvider(RedisService)
      .useValue({
        isConfigured: jest.fn().mockReturnValue(false),
        ping: jest.fn().mockResolvedValue(false),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });
});
