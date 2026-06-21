import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  EmployeeProfileRecord,
  EmployeeRepositoryPort,
} from '../ports/employee.repository.port';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(compCode: string, empId: string): Promise<EmployeeProfileRecord | null> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: empId,
        compCode,
        active: true,
        deletedAt: null,
      },
      include: { role: true },
    });

    if (!employee) {
      return null;
    }

    return {
      empId: employee.id,
      userName: employee.userName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      roleType: employee.role.roleType,
      roleName: employee.role.roleName,
      compCode: employee.compCode,
    };
  }
}
