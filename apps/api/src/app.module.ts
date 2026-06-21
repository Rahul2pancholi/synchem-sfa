import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/persistence/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MenusModule } from './modules/menus/menus.module';
import { PlatformModule } from './modules/platform/platform.module';
import { TenantModule } from './modules/tenant/tenant.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        customProps: (req) => ({
          requestId: req.id,
        }),
        genReqId: (req, res) => {
          const existing = req.headers['x-request-id'];
          const id = typeof existing === 'string' ? existing : crypto.randomUUID();
          res.setHeader('X-Request-Id', id);
          return id;
        },
      },
    }),
    PrismaModule,
    HealthModule,
    MenusModule,
    AuthModule,
    PlatformModule,
    TenantModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
