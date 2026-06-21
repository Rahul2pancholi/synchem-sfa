import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AppConfigService } from '../src/config/config.service';
import { RedisService } from '../src/infrastructure/cache/redis.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma.module';
import { MenusService } from '../src/modules/menus/menus.service';
import { apiSuccess } from '@synchem-sfa/shared-types';

describe('Auth guards (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppConfigService)
      .useValue({
        appEnv: 'dev',
        port: 3000,
        databaseUrl: 'postgresql://test',
        redisUrl: undefined,
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
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .overrideProvider(MenusService)
      .useValue({
        getMenuTree: jest.fn().mockResolvedValue(apiSuccess([])),
        getLegacyMenuListJson: jest.fn().mockResolvedValue('[]'),
        hasPermission: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects unauthenticated menu access', () => {
    return request(app.getHttpServer()).get('/api/v1/menus').expect(401);
  });

  it('rejects platform token on tenant menu route', async () => {
    const token = await jwtService.signAsync({
      sub: 'superadmin@synchem.co',
      fullName: 'Platform Admin',
      actorType: 'platform',
    });

    return request(app.getHttpServer())
      .get('/api/v1/menus')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('allows tenant token on menu route', async () => {
    const token = await jwtService.signAsync({
      sub: 'admin',
      empId: 'emp-1',
      fullName: 'Admin',
      compCode: 'SYN',
      roleType: 'AD',
      roleId: 'role-1',
      actorType: 'tenant',
    });

    return request(app.getHttpServer())
      .get('/api/v1/menus')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
