import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  apiSuccess,
  CreateCompanyRequestSchema,
  defaultTenantFeatures,
  TENANT_FEATURE_KEYS,
  UpdateTenantFeaturesSchema,
  UpdateCompanyRequestSchema,
  type JwtPayload,
  type TenantFeatureState,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { AuditService } from '../audit/audit.service';
import {
  COMPANY_REPOSITORY,
  PLATFORM_USER_REPOSITORY,
  type CompanyRepositoryPort,
  type PlatformUserRepositoryPort,
} from './ports/platform.repository.port';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(
    @Inject(PLATFORM_USER_REPOSITORY)
    private readonly platformUserRepo: PlatformUserRepositoryPort,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.platformUserRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.email,
      fullName: user.fullName,
      actorType: 'platform',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.auditService.log({
      compCode: 'PLATFORM',
      entityType: 'platform_user',
      entityId: user.id,
      action: 'LOGIN',
      newValues: { email: user.email },
    });

    this.logger.log({ module: 'platform', action: 'loginSuccess', email: user.email });

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 12 * 60 * 60,
    };
  }

  async listCompanies(page = 1, pageSize = 20) {
    const result = await this.companyRepo.list(page, pageSize);
    return apiSuccess({
      items: result.items,
      page,
      pageSize,
      total: result.total,
    });
  }

  async getCompany(compCode: string) {
    const company = await this.companyRepo.findByCompCode(compCode);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return apiSuccess(company);
  }

  async createCompany(body: unknown) {
    const parsed = CreateCompanyRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ConflictException(parsed.error.message);
    }

    const input = parsed.data;
    const compCode = input.compCode.toUpperCase();
    const existing = await this.companyRepo.findByCompCode(compCode);
    if (existing) {
      throw new ConflictException(`Company ${compCode} already exists`);
    }

    const company = await this.companyRepo.create({
      compCode,
      compName: input.compName,
      industryType: input.industryType,
      timezone: input.timezone,
      locale: input.locale,
    });

    const roleId = await this.seedTenantDefaults(compCode);
    await this.seedTenantFeatures(compCode);
    await this.seedTenantSettings(compCode);

    const adminPassword =
      input.adminPassword ??
      process.env.TENANT_DEFAULT_ADMIN_PASSWORD ??
      process.env.SEED_ADMIN_PASSWORD ??
      'Admin@123';
    const adminUserName = input.adminUserName.toLowerCase();
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await this.prisma.employee.create({
      data: {
        compCode,
        userName: adminUserName,
        passwordHash,
        firstName: input.adminFirstName,
        lastName: 'Admin',
        email: input.adminEmail ?? null,
        roleId,
        active: true,
        isFirstLogin: true,
      },
    });

    const adminBootstrap = {
      userName: adminUserName,
      compCode,
      loginUsername: `${adminUserName},${compCode}`,
      initialPassword: adminPassword,
    };

    await this.auditService.log({
      compCode: 'PLATFORM',
      entityType: 'company',
      entityId: roleId,
      action: 'CREATE',
      newValues: { ...company, adminUserName },
    });

    this.logger.log({
      module: 'platform',
      action: 'createCompany',
      compCode: company.compCode,
      adminUserName,
    });

    return apiSuccess({ ...company, adminBootstrap });
  }

  async updateCompany(compCode: string, body: unknown) {
    const parsed = UpdateCompanyRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ConflictException(parsed.error.message);
    }

    const existing = await this.companyRepo.findByCompCode(compCode);
    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.companyRepo.update(compCode, parsed.data);
    const adminRole = await this.prisma.role.findFirst({
      where: { compCode, roleName: 'ADMIN' },
    });

    if (adminRole) {
      await this.auditService.log({
        compCode: 'PLATFORM',
        entityType: 'company',
        entityId: adminRole.id,
        action: 'UPDATE',
        oldValues: { ...existing },
        newValues: { ...company },
      });
    }

    return apiSuccess(company);
  }

  async getCompanyFeatures(compCode: string) {
    const existing = await this.companyRepo.findByCompCode(compCode);
    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const rows = await this.prisma.tenantFeature.findMany({ where: { compCode } });
    const features = defaultTenantFeatures();

    for (const row of rows) {
      if (TENANT_FEATURE_KEYS.includes(row.featureKey as (typeof TENANT_FEATURE_KEYS)[number])) {
        features[row.featureKey as keyof TenantFeatureState] = row.enabled;
      }
    }

    return apiSuccess({ compCode, features });
  }

  async updateCompanyFeatures(compCode: string, body: unknown) {
    const parsed = UpdateTenantFeaturesSchema.safeParse(body);
    if (!parsed.success) {
      throw new ConflictException(parsed.error.message);
    }

    const existing = await this.companyRepo.findByCompCode(compCode);
    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const entries = Object.entries(parsed.data.features) as [string, boolean][];

    await this.prisma.$transaction(
      entries.map(([featureKey, enabled]) =>
        this.prisma.tenantFeature.upsert({
          where: { compCode_featureKey: { compCode, featureKey } },
          create: { compCode, featureKey, enabled },
          update: { enabled },
        }),
      ),
    );

    await this.auditService.log({
      compCode: 'PLATFORM',
      entityType: 'tenant_features',
      entityId: compCode,
      action: 'UPDATE',
      newValues: parsed.data.features,
    });

    return this.getCompanyFeatures(compCode);
  }

  private async seedTenantFeatures(compCode: string) {
    const defaults = defaultTenantFeatures();
    await this.prisma.tenantFeature.createMany({
      data: TENANT_FEATURE_KEYS.map((featureKey) => ({
        compCode,
        featureKey,
        enabled: defaults[featureKey],
      })),
      skipDuplicates: true,
    });
  }

  private async seedTenantSettings(compCode: string) {
    for (const [settingKey, settingValue] of [
      ['SET001', '1'],
      ['SET002', '1'],
      ['SET010', 'Asia/Kolkata'],
    ] as const) {
      await this.prisma.companySetting.upsert({
        where: { compCode_settingKey: { compCode, settingKey } },
        update: { settingValue },
        create: {
          compCode,
          settingKey,
          settingValue,
          dataType: 'string',
        },
      });
    }
  }

  private async seedTenantDefaults(compCode: string): Promise<string> {
    const role = await this.prisma.role.create({
      data: {
        compCode,
        roleName: 'ADMIN',
        roleType: 'AD',
      },
    });

    const menus = await this.prisma.menu.findMany({ where: { active: true } });

    if (menus.length > 0) {
      await this.prisma.roleMenuPermission.createMany({
        data: menus.map((menu) => ({
          compCode,
          roleId: role.id,
          menuId: menu.id,
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canPreview: true,
          canPrint: true,
        })),
      });
    }

    return role.id;
  }
}
