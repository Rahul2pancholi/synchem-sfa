export interface PlatformUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
}

export interface PlatformUserRepositoryPort {
  findByEmail(email: string): Promise<PlatformUserRecord | null>;
}

export const PLATFORM_USER_REPOSITORY = Symbol('PLATFORM_USER_REPOSITORY');

export interface CompanyRecord {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
  active: boolean;
}

export interface CreateCompanyInput {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
}

export interface CompanyRepositoryPort {
  list(page: number, pageSize: number): Promise<{ items: CompanyRecord[]; total: number }>;
  findByCompCode(compCode: string): Promise<CompanyRecord | null>;
  create(input: CreateCompanyInput): Promise<CompanyRecord>;
}

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');
