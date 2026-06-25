import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MenuPermissionGuard } from './common/guards/menu-permission.guard';
import { AppConfigModule } from './config/config.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { PrismaModule } from './infrastructure/persistence/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MenusModule } from './modules/menus/menus.module';
import { PlatformModule } from './modules/platform/platform.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { HierarchiesModule } from './modules/hierarchies/hierarchies.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { SyncModule } from './modules/sync/sync.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { MonthlyCycleModule } from './modules/monthly-cycle/monthly-cycle.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SalesInsightsModule } from './modules/sales-insights/sales-insights.module';
import { InsightsConfigModule } from './modules/insights-config/insights-config.module';
import { InsightsChatModule } from './modules/insights-chat/insights-chat.module';
import { SecurityModule } from './modules/security/security.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit:
          process.env.LOAD_TEST === '1' || process.env.APP_ENV === 'dev'
            ? 10_000
            : 100,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        customProps: (req) => ({
          requestId: req.id,
          compCode: (req as { user?: { compCode?: string } }).user?.compCode,
        }),
        genReqId: (req, res) => {
          const existing = req.headers['x-request-id'];
          const id = typeof existing === 'string' ? existing : crypto.randomUUID();
          res.setHeader('X-Request-Id', id);
          return id;
        },
      },
    }),
    RedisModule,
    PrismaModule,
    AuditModule,
    HealthModule,
    MenusModule,
    AuthModule,
    PlatformModule,
    TenantModule,
    HierarchiesModule,
    MasterDataModule,
    SyncModule,
    TransactionsModule,
    AccessControlModule,
    ApprovalsModule,
    MonthlyCycleModule,
    ReportsModule,
    SalesInsightsModule,
    InsightsConfigModule,
    InsightsChatModule,
    SecurityModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: MenuPermissionGuard },
  ],
})
export class AppModule {}
