import { Module } from '@nestjs/common';
import { PrismaEmployeeRepository } from './adapters/prisma-employee.repository';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { EMPLOYEE_REPOSITORY } from './ports/employee.repository.port';

@Module({
  controllers: [TenantController],
  providers: [
    TenantService,
    { provide: EMPLOYEE_REPOSITORY, useClass: PrismaEmployeeRepository },
  ],
})
export class TenantModule {}
