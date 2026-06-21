export interface EmployeeProfileRecord {
  empId: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  roleType: string;
  roleName: string;
  compCode: string;
}

export interface EmployeeRecord {
  id: string;
  compCode: string;
  userName: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobileNo: string | null;
  roleId: string;
  roleName: string;
  roleType: string;
  hierarchyId: string | null;
  hierarchyCode: string | null;
  headQuarterId: string | null;
  headQuarterName: string | null;
  reportingManagerId: string | null;
  reportingManagerName: string | null;
  active: boolean;
}

export interface CreateEmployeeInput {
  userName: string;
  passwordHash: string;
  employeeCode?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobileNo?: string;
  roleId: string;
  hierarchyId?: string | null;
  headQuarterId?: string | null;
  reportingManagerId?: string | null;
  active?: boolean;
}

export interface UpdateEmployeeInput {
  userName?: string;
  passwordHash?: string;
  employeeCode?: string | null;
  firstName?: string;
  lastName?: string | null;
  email?: string | null;
  mobileNo?: string | null;
  roleId?: string;
  hierarchyId?: string | null;
  headQuarterId?: string | null;
  reportingManagerId?: string | null;
  active?: boolean;
}

export interface RoleRecord {
  id: string;
  roleName: string;
  roleType: string;
}

export interface EmployeeRepositoryPort {
  findById(compCode: string, empId: string): Promise<EmployeeProfileRecord | null>;
  list(compCode: string, page: number, pageSize: number): Promise<{ items: EmployeeRecord[]; total: number }>;
  findMasterById(compCode: string, empId: string): Promise<EmployeeRecord | null>;
  findByUserName(compCode: string, userName: string): Promise<EmployeeRecord | null>;
  create(compCode: string, input: CreateEmployeeInput): Promise<EmployeeRecord>;
  update(compCode: string, empId: string, input: UpdateEmployeeInput): Promise<EmployeeRecord>;
  softDelete(compCode: string, empId: string): Promise<EmployeeRecord>;
  listRoles(compCode: string): Promise<RoleRecord[]>;
}

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');
