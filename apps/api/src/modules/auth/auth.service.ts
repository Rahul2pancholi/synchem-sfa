import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  apiSuccess,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  VerifyOtpRequestSchema,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { RedisService } from '../../infrastructure/cache/redis.module';
import { AuditService } from '../audit/audit.service';
import {
  EMPLOYEE_AUTH_REPOSITORY,
  type EmployeeAuthRepositoryPort,
} from '../auth/ports/employee-auth.repository.port';
import { MenusService } from '../menus/menus.service';
import {
  TENANT_SETTINGS_REPOSITORY,
  type TenantSettingsRepositoryPort,
} from '../tenant/ports/tenant-settings.repository.port';
import {
  addSeconds,
  generateRefreshToken,
  hashToken,
} from '../../common/utils/token.util';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepositoryPort,
} from './ports/refresh-token.repository.port';
import type { AuthEmployeeRecord } from './ports/employee-auth.repository.port';

export interface TokenResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiredAt: string;
  empId: string;
  roleType: string;
  compCode: string;
  compName: string;
  menuList: string;
  employeeObj: string;
  configurationSetting: string;
  isFirstLogin: string;
  isMpin: boolean;
  isCheckIn: boolean;
}

const REFRESH_TOKEN_TTL_DAYS = 7;
const ACCESS_TOKEN_SECONDS = 12 * 60 * 60;
const OTP_TTL_SECONDS = 600;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(EMPLOYEE_AUTH_REPOSITORY)
    private readonly employeeAuthRepo: EmployeeAuthRepositoryPort,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
    @Inject(TENANT_SETTINGS_REPOSITORY)
    private readonly settingsRepo: TenantSettingsRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly menusService: MenusService,
    private readonly auditService: AuditService,
    private readonly redis: RedisService,
  ) {}

  async login(usernameField: string, password: string): Promise<TokenResult> {
    const [userName, compCode] = usernameField.split(',').map((s) => s.trim());

    if (!userName || !compCode) {
      throw new UnauthorizedException('Invalid username format. Use userName,compCode');
    }

    const employee = await this.employeeAuthRepo.findByUserNameAndCompCode(
      userName,
      compCode,
    );

    if (!employee) {
      this.logger.warn({ compCode, userName, module: 'auth', action: 'loginFailed' });
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, employee.passwordHash);
    if (!passwordValid) {
      this.logger.warn({ compCode, userName, module: 'auth', action: 'loginFailed' });
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.issueTenantTokens(employee);

    await this.auditService.log({
      compCode: employee.compCode,
      empId: employee.id,
      entityType: 'employee',
      entityId: employee.id,
      action: 'LOGIN',
      newValues: { userName: employee.userName },
    });

    this.logger.log({
      compCode: employee.compCode,
      empId: employee.id,
      module: 'auth',
      action: 'loginSuccess',
    });

    return result;
  }

  async refresh(refreshToken: string): Promise<TokenResult> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokenRepo.findValidByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const employee = await this.employeeAuthRepo.findByIdAndCompCode(
      stored.empId,
      stored.compCode,
    );

    if (!employee) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepo.revoke(stored.id);
    return this.issueTenantTokens(employee);
  }

  async forgotPassword(body: unknown) {
    const parsed = ForgotPasswordRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { userName, compCode } = parsed.data;
    const employee = await this.employeeAuthRepo.findByUserNameAndCompCode(
      userName,
      compCode.toUpperCase(),
    );

    if (employee && this.redis.isConfigured()) {
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
      const key = this.otpKey(compCode.toUpperCase(), userName);
      await this.redis.set(key, otp, OTP_TTL_SECONDS);
      this.logger.log({
        compCode,
        userName,
        module: 'auth',
        action: 'forgotPasswordOtpGenerated',
        otp: process.env.APP_ENV === 'dev' ? otp : undefined,
      });
    }

    return apiSuccess({
      message: 'If the account exists, an OTP has been sent.',
    });
  }

  async verifyOtp(body: unknown) {
    const parsed = VerifyOtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { userName, compCode, otp } = parsed.data;
    const valid = await this.validateOtp(compCode.toUpperCase(), userName, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return apiSuccess({ verified: true });
  }

  async resetPassword(body: unknown) {
    const parsed = ResetPasswordRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { userName, compCode, otp, newPassword } = parsed.data;
    const normalizedCompCode = compCode.toUpperCase();
    const valid = await this.validateOtp(normalizedCompCode, userName, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const employee = await this.employeeAuthRepo.findByUserNameAndCompCode(
      userName,
      normalizedCompCode,
    );

    if (!employee) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.employeeAuthRepo.updatePassword(employee.id, normalizedCompCode, passwordHash);
    await this.redis.del(this.otpKey(normalizedCompCode, userName));

    await this.auditService.log({
      compCode: normalizedCompCode,
      empId: employee.id,
      entityType: 'employee',
      entityId: employee.id,
      action: 'PASSWORD_RESET',
    });

    return apiSuccess({ message: 'Password updated successfully' });
  }

  private async issueTenantTokens(employee: AuthEmployeeRecord): Promise<TokenResult> {
    const payload: JwtPayload = {
      sub: employee.userName,
      empId: employee.id,
      fullName: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
      compCode: employee.compCode,
      industryType: employee.industryType,
      roleType: employee.roleType,
      companyName: employee.companyName,
      roleId: employee.roleId,
      actorType: 'tenant',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = generateRefreshToken();
    const expiresAt = addSeconds(new Date(), REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60);

    await this.refreshTokenRepo.create({
      compCode: employee.compCode,
      empId: employee.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    const menuList = await this.menusService.getLegacyMenuListJson(
      employee.compCode,
      employee.roleId,
    );
    const settings = await this.settingsRepo.getSettingsMap(employee.compCode);

    const employeeObj = {
      empId: employee.id,
      userName: employee.userName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      roleType: employee.roleType,
      roleName: employee.roleName,
      compCode: employee.compCode,
    };

    const expiredAt = addSeconds(new Date(), ACCESS_TOKEN_SECONDS).toISOString();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: ACCESS_TOKEN_SECONDS,
      expiredAt,
      empId: employee.id,
      roleType: employee.roleType,
      compCode: employee.compCode,
      compName: employee.companyName,
      menuList,
      employeeObj: JSON.stringify(employeeObj),
      configurationSetting: JSON.stringify(settings),
      isFirstLogin: 'false',
      isMpin: false,
      isCheckIn: false,
    };
  }

  private otpKey(compCode: string, userName: string): string {
    return `otp:${compCode}:${userName.toLowerCase()}`;
  }

  private async validateOtp(compCode: string, userName: string, otp: string): Promise<boolean> {
    if (!this.redis.isConfigured()) {
      return false;
    }

    const stored = await this.redis.get(this.otpKey(compCode, userName));
    return stored === otp;
  }
}
