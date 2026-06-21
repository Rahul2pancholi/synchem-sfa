import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import {
  PrismaCompanyRepository,
  PrismaPlatformUserRepository,
} from './adapters/prisma-platform.repository';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import {
  COMPANY_REPOSITORY,
  PLATFORM_USER_REPOSITORY,
} from './ports/platform.repository.port';

@Module({
  imports: [AuditModule],
  controllers: [PlatformController],
  providers: [
    PlatformService,
    { provide: PLATFORM_USER_REPOSITORY, useClass: PrismaPlatformUserRepository },
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
  ],
})
export class PlatformModule {}
