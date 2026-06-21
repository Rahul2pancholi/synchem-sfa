import { Module } from '@nestjs/common';
import { PrismaEmployeeRepository } from './adapters/prisma-employee.repository';
import { RolesController, TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { EMPLOYEE_REPOSITORY } from './ports/employee.repository.port';

@Module({
  controllers: [TenantController, RolesController],
  providers: [
    TenantService,
    { provide: EMPLOYEE_REPOSITORY, useClass: PrismaEmployeeRepository },
  ],
  exports: [TenantService, EMPLOYEE_REPOSITORY],
})
export class TenantModule {}
