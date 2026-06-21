import type { RoleType } from '@synchem-sfa/shared-types';

export interface AuthEmployeeRecord {
  id: string;
  compCode: string;
  userName: string;
  passwordHash: string;
  firstName: string;
  lastName: string | null;
  roleId: string;
  roleType: RoleType;
  roleName: string;
  companyName: string;
  industryType: string;
}

export interface EmployeeAuthRepositoryPort {
  findByUserNameAndCompCode(
    userName: string,
    compCode: string,
  ): Promise<AuthEmployeeRecord | null>;
  findByIdAndCompCode(empId: string, compCode: string): Promise<AuthEmployeeRecord | null>;
  updatePassword(empId: string, compCode: string, passwordHash: string): Promise<void>;
}

export const EMPLOYEE_AUTH_REPOSITORY = Symbol('EMPLOYEE_AUTH_REPOSITORY');
