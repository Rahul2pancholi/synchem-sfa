import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  apiSuccess,
  CreateEmployeeRequestSchema,
  UpdateEmployeeRequestSchema,
  type EmployeeSummary,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRecord,
  type EmployeeRepositoryPort,
} from './ports/employee.repository.port';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

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

  async listEmployees(compCode: string, page = 1, pageSize = 20) {
    const result = await this.employeeRepo.list(compCode, page, pageSize);
    return apiSuccess({
      items: result.items.map(toSummary),
      page,
      pageSize,
      total: result.total,
    });
  }

  async getEmployee(compCode: string, empId: string) {
    const employee = await this.employeeRepo.findMasterById(compCode, empId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return apiSuccess(toSummary(employee));
  }

  async createEmployee(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateEmployeeRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const existing = await this.employeeRepo.findByUserName(compCode, parsed.data.userName);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    if (parsed.data.reportingManagerId) {
      await this.assertEmployee(compCode, parsed.data.reportingManagerId);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const created = await this.employeeRepo.create(compCode, {
      ...parsed.data,
      passwordHash,
    });

    this.logger.log({ module: 'employees', action: 'create', compCode, id: created.id });
    return apiSuccess(toSummary(created), 201);
  }

  async updateEmployee(compCode: string, empId: string, body: Record<string, unknown>) {
    const parsed = UpdateEmployeeRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const current = await this.employeeRepo.findMasterById(compCode, empId);
    if (!current) {
      throw new NotFoundException('Employee not found');
    }

    if (parsed.data.userName && parsed.data.userName !== current.userName) {
      const duplicate = await this.employeeRepo.findByUserName(compCode, parsed.data.userName);
      if (duplicate) {
        throw new ConflictException('Username already exists');
      }
    }

    if (parsed.data.reportingManagerId) {
      if (parsed.data.reportingManagerId === empId) {
        throw new BadRequestException('Employee cannot report to themselves');
      }
      await this.assertEmployee(compCode, parsed.data.reportingManagerId);
    }

    const { password, ...rest } = parsed.data;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const updated = await this.employeeRepo.update(compCode, empId, {
      ...rest,
      passwordHash,
    });

    this.logger.log({ module: 'employees', action: 'update', compCode, id: empId });
    return apiSuccess(toSummary(updated));
  }

  async deactivateEmployee(compCode: string, empId: string) {
    const current = await this.employeeRepo.findMasterById(compCode, empId);
    if (!current) {
      throw new NotFoundException('Employee not found');
    }

    const updated = await this.employeeRepo.softDelete(compCode, empId);
    this.logger.log({ module: 'employees', action: 'deactivate', compCode, id: empId });
    return apiSuccess(toSummary(updated));
  }

  async listRoles(compCode: string) {
    const items = await this.employeeRepo.listRoles(compCode);
    return apiSuccess({ items });
  }

  private async assertEmployee(compCode: string, empId: string) {
    const employee = await this.employeeRepo.findMasterById(compCode, empId);
    if (!employee || !employee.active) {
      throw new BadRequestException('Invalid reporting manager');
    }
  }
}

function toSummary(record: EmployeeRecord): EmployeeSummary {
  return {
    id: record.id,
    userName: record.userName,
    employeeCode: record.employeeCode,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    mobileNo: record.mobileNo,
    roleId: record.roleId,
    roleName: record.roleName,
    roleType: record.roleType,
    hierarchyId: record.hierarchyId,
    hierarchyCode: record.hierarchyCode,
    headQuarterId: record.headQuarterId,
    headQuarterName: record.headQuarterName,
    reportingManagerId: record.reportingManagerId,
    reportingManagerName: record.reportingManagerName,
    active: record.active,
  };
}
