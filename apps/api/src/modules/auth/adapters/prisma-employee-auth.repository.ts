import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type { RoleType } from '@synchem-sfa/shared-types';
import type {
  AuthEmployeeRecord,
  EmployeeAuthRepositoryPort,
} from '../ports/employee-auth.repository.port';

@Injectable()
export class PrismaEmployeeAuthRepository implements EmployeeAuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserNameAndCompCode(
    userName: string,
    compCode: string,
  ): Promise<AuthEmployeeRecord | null> {
    return this.findEmployee({
      compCode,
      userName,
      active: true,
      deletedAt: null,
    });
  }

  async findByIdAndCompCode(
    empId: string,
    compCode: string,
  ): Promise<AuthEmployeeRecord | null> {
    return this.findEmployee({
      id: empId,
      compCode,
      active: true,
      deletedAt: null,
    });
  }

  async updatePassword(empId: string, compCode: string, passwordHash: string): Promise<void> {
    await this.prisma.employee.updateMany({
      where: { id: empId, compCode },
      data: { passwordHash, isFirstLogin: false },
    });
  }

  private async findEmployee(where: {
    id?: string;
    compCode: string;
    userName?: string;
    active: boolean;
    deletedAt: null;
  }): Promise<AuthEmployeeRecord | null> {
    const employee = await this.prisma.employee.findFirst({
      where,
      include: {
        role: true,
        company: true,
      },
    });

    if (!employee) {
      return null;
    }

    return {
      id: employee.id,
      compCode: employee.compCode,
      userName: employee.userName,
      passwordHash: employee.passwordHash,
      firstName: employee.firstName,
      lastName: employee.lastName,
      roleId: employee.roleId,
      roleType: employee.role.roleType as RoleType,
      roleName: employee.role.roleName,
      companyName: employee.company.compName,
      industryType: employee.company.industryType,
    };
  }
}
