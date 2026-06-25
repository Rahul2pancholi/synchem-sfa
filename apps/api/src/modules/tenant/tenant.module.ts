import { Module } from '@nestjs/common';
import { PrismaEmployeeRepository } from './adapters/prisma-employee.repository';
import { TenantController } from './tenant.controller';
import { TenantFeaturesController } from './tenant-features.controller';
import { TenantFeaturesService } from './tenant-features.service';
import { TenantService } from './tenant.service';
import { EMPLOYEE_REPOSITORY } from './ports/employee.repository.port';

@Module({
  controllers: [TenantController, TenantFeaturesController],
  providers: [
    TenantService,
    TenantFeaturesService,
    { provide: EMPLOYEE_REPOSITORY, useClass: PrismaEmployeeRepository },
  ],
  exports: [TenantService, TenantFeaturesService, EMPLOYEE_REPOSITORY],
})
export class TenantModule {}
