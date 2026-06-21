export interface EmployeeProfileRecord {
  empId: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  roleType: string;
  roleName: string;
  compCode: string;
}

export interface EmployeeRepositoryPort {
  findById(compCode: string, empId: string): Promise<EmployeeProfileRecord | null>;
}

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');
