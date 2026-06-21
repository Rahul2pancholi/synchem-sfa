import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { apiSuccess, type JwtPayload } from '@synchem-sfa/shared-types';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from './ports/employee.repository.port';

@Injectable()
export class TenantService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
  ) {}

  async getCurrentEmployee(user: JwtPayload) {
    const employee = await this.employeeRepo.findById(user.compCode!, user.empId!);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return apiSuccess(employee);
  }
}
