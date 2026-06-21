import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  CreateEmployeeInput,
  EmployeeProfileRecord,
  EmployeeRecord,
  EmployeeRepositoryPort,
  RoleRecord,
  UpdateEmployeeInput,
} from '../ports/employee.repository.port';

const employeeInclude = {
  role: true,
  hierarchy: { select: { hierarchyCode: true } },
  headQuarter: { select: { hqName: true } },
  reportingManager: { select: { firstName: true, lastName: true } },
} as const;

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

  async list(compCode: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where = { compCode, deletedAt: null };

    const [rows, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ firstName: 'asc' }, { userName: 'asc' }],
        include: employeeInclude,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items: rows.map(toEmployeeRecord), total };
  }

  async findMasterById(compCode: string, empId: string): Promise<EmployeeRecord | null> {
    const row = await this.prisma.employee.findFirst({
      where: { id: empId, compCode, deletedAt: null },
      include: employeeInclude,
    });

    return row ? toEmployeeRecord(row) : null;
  }

  async findByUserName(compCode: string, userName: string): Promise<EmployeeRecord | null> {
    const row = await this.prisma.employee.findFirst({
      where: { compCode, userName, deletedAt: null },
      include: employeeInclude,
    });

    return row ? toEmployeeRecord(row) : null;
  }

  async create(compCode: string, input: CreateEmployeeInput): Promise<EmployeeRecord> {
    const row = await this.prisma.employee.create({
      data: {
        compCode,
        userName: input.userName,
        passwordHash: input.passwordHash,
        employeeCode: input.employeeCode,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        mobileNo: input.mobileNo,
        roleId: input.roleId,
        hierarchyId: input.hierarchyId ?? null,
        headQuarterId: input.headQuarterId ?? null,
        reportingManagerId: input.reportingManagerId ?? null,
        active: input.active ?? true,
      },
      include: employeeInclude,
    });

    return toEmployeeRecord(row);
  }

  async update(compCode: string, empId: string, input: UpdateEmployeeInput): Promise<EmployeeRecord> {
    const row = await this.prisma.employee.update({
      where: { id: empId },
      data: {
        userName: input.userName,
        passwordHash: input.passwordHash,
        employeeCode: input.employeeCode,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        mobileNo: input.mobileNo,
        roleId: input.roleId,
        hierarchyId: input.hierarchyId,
        headQuarterId: input.headQuarterId,
        reportingManagerId: input.reportingManagerId,
        active: input.active,
      },
      include: employeeInclude,
    });

    if (row.compCode !== compCode) {
      throw new Error('Tenant mismatch after employee update');
    }

    return toEmployeeRecord(row);
  }

  async softDelete(compCode: string, empId: string): Promise<EmployeeRecord> {
    const row = await this.prisma.employee.update({
      where: { id: empId },
      data: { active: false, deletedAt: new Date() },
      include: employeeInclude,
    });

    if (row.compCode !== compCode) {
      throw new Error('Tenant mismatch after employee delete');
    }

    return toEmployeeRecord(row);
  }

  async listRoles(compCode: string): Promise<RoleRecord[]> {
    const rows = await this.prisma.role.findMany({
      where: { compCode, active: true },
      orderBy: { roleName: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      roleName: row.roleName,
      roleType: row.roleType,
    }));
  }
}

function toEmployeeRecord(row: {
  id: string;
  compCode: string;
  userName: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobileNo: string | null;
  roleId: string;
  hierarchyId: string | null;
  headQuarterId: string | null;
  reportingManagerId: string | null;
  active: boolean;
  role: { roleName: string; roleType: string };
  hierarchy?: { hierarchyCode: string } | null;
  headQuarter?: { hqName: string } | null;
  reportingManager?: { firstName: string; lastName: string | null } | null;
}): EmployeeRecord {
  return {
    id: row.id,
    compCode: row.compCode,
    userName: row.userName,
    employeeCode: row.employeeCode,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    mobileNo: row.mobileNo,
    roleId: row.roleId,
    roleName: row.role.roleName,
    roleType: row.role.roleType,
    hierarchyId: row.hierarchyId,
    hierarchyCode: row.hierarchy?.hierarchyCode ?? null,
    headQuarterId: row.headQuarterId,
    headQuarterName: row.headQuarter?.hqName ?? null,
    reportingManagerId: row.reportingManagerId,
    reportingManagerName: row.reportingManager
      ? `${row.reportingManager.firstName}${row.reportingManager.lastName ? ` ${row.reportingManager.lastName}` : ''}`
      : null,
    active: row.active,
  };
}
