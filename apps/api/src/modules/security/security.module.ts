import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaLoginEventRepository } from './adapters/prisma-login-event.repository';
import { LoginTrackingService } from './login-tracking.service';
import { LOGIN_EVENT_REPOSITORY } from './ports/login-event.repository.port';
import { SecurityAnalyticsService } from './security-analytics.service';
import { SecurityController } from './security.controller';

@Module({
  imports: [AuditModule],
  controllers: [SecurityController],
  providers: [
    LoginTrackingService,
    SecurityAnalyticsService,
    {
      provide: LOGIN_EVENT_REPOSITORY,
      useClass: PrismaLoginEventRepository,
    },
  ],
  exports: [LoginTrackingService],
})
export class SecurityModule {}
