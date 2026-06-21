import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  CompanyRecord,
  CompanyRepositoryPort,
  CreateCompanyInput,
  PlatformUserRecord,
  PlatformUserRepositoryPort,
} from '../ports/platform.repository.port';

@Injectable()
export class PrismaPlatformUserRepository implements PlatformUserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<PlatformUserRecord | null> {
    const user = await this.prisma.platformUser.findFirst({
      where: { email, active: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
    };
  }
}

@Injectable()
export class PrismaCompanyRepository implements CompanyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: pageSize,
        orderBy: { compCode: 'asc' },
      }),
      this.prisma.company.count(),
    ]);

    return {
      items: items.map(toCompanyRecord),
      total,
    };
  }

  async findByCompCode(compCode: string): Promise<CompanyRecord | null> {
    const company = await this.prisma.company.findUnique({ where: { compCode } });
    return company ? toCompanyRecord(company) : null;
  }

  async create(input: CreateCompanyInput): Promise<CompanyRecord> {
    const company = await this.prisma.company.create({
      data: {
        compCode: input.compCode,
        compName: input.compName,
        industryType: input.industryType,
        timezone: input.timezone,
        locale: input.locale,
      },
    });

    return toCompanyRecord(company);
  }

  async update(
    compCode: string,
    input: Partial<Pick<CompanyRecord, 'compName' | 'active' | 'timezone' | 'locale'>>,
  ): Promise<CompanyRecord> {
    const company = await this.prisma.company.update({
      where: { compCode },
      data: input,
    });

    return toCompanyRecord(company);
  }
}

function toCompanyRecord(company: {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
  active: boolean;
}): CompanyRecord {
  return {
    compCode: company.compCode,
    compName: company.compName,
    industryType: company.industryType,
    timezone: company.timezone,
    locale: company.locale,
    active: company.active,
  };
}
