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
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
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
    const existing = await this.companyRepo.findByCompCode(input.compCode);
    if (existing) {
      throw new ConflictException(`Company ${input.compCode} already exists`);
    }

    const company = await this.companyRepo.create({
      compCode: input.compCode.toUpperCase(),
      compName: input.compName,
      industryType: input.industryType,
      timezone: input.timezone,
      locale: input.locale,
    });

    await this.seedTenantDefaults(company.compCode);

    this.logger.log({ module: 'platform', action: 'createCompany', compCode: company.compCode });

    return apiSuccess(company);
  }

  private async seedTenantDefaults(compCode: string) {
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
  }
}
