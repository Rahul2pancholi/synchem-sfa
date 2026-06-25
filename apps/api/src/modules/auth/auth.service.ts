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
import type { AppLanguage, MessageKey } from '@synchem-sfa/shared-i18n';
import { apiTranslate } from '../../common/i18n/language.util';
import { RedisService } from '../../infrastructure/cache/redis.module';
import { AuditService } from '../audit/audit.service';
import { LoginTrackingService } from '../security/login-tracking.service';
import type { DeviceContext } from '../../common/http/device-context';
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
  permissionMenuList: string;
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
    private readonly loginTracking: LoginTrackingService,
    private readonly redis: RedisService,
  ) {}

  async login(
    usernameField: string,
    password: string,
    language: AppLanguage = 'en',
    device?: DeviceContext,
  ): Promise<TokenResult> {
    const [userName, compCode] = usernameField.split(',').map((s) => s.trim());

    if (!userName || !compCode) {
      throw new UnauthorizedException(this.msg('auth.login.invalidUsernameFormat', language));
    }

    const employee = await this.employeeAuthRepo.findByUserNameAndCompCode(
      userName,
      compCode,
    );

    const deviceContext = device ?? {
      channel: 'web',
      deviceId: null,
      deviceType: null,
      osName: null,
      osVersion: null,
      browserName: null,
      browserVersion: null,
      appVersion: null,
      ipAddress: null,
      userAgent: null,
      acceptLanguage: null,
      requestId: null,
    };

    if (!employee) {
      this.logger.warn({ compCode, userName, module: 'auth', action: 'loginFailed' });
      await this.loginTracking.recordFailure({
        compCode,
        userName,
        device: deviceContext,
      });
      throw new UnauthorizedException(this.msg('auth.login.invalidCredentials', language));
    }

    if (!employee.companyActive) {
      this.logger.warn({ compCode, userName, module: 'auth', action: 'loginCompanySuspended' });
      await this.loginTracking.recordFailure({
        compCode,
        userName,
        empId: employee.id,
        device: deviceContext,
      });
      throw new UnauthorizedException(this.msg('auth.login.companySuspended', language));
    }

    const passwordValid = await bcrypt.compare(password, employee.passwordHash);
    if (!passwordValid) {
      this.logger.warn({ compCode, userName, module: 'auth', action: 'loginFailed' });
      await this.loginTracking.recordFailure({
        compCode,
        userName,
        empId: employee.id,
        device: deviceContext,
      });
      throw new UnauthorizedException(this.msg('auth.login.invalidCredentials', language));
    }

    const { result, refreshTokenId } = await this.issueTenantTokens(employee);

    await this.loginTracking.recordSuccess({
      compCode: employee.compCode,
      empId: employee.id,
      userName: employee.userName,
      device: deviceContext,
      refreshTokenId,
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

    if (!employee.companyActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepo.revoke(stored.id);
    const { result } = await this.issueTenantTokens(employee);
    return result;
  }

  async forgotPassword(body: unknown, language: AppLanguage = 'en') {
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
      message: this.msg('auth.forgot.otpSent', language),
    });
  }

  async verifyOtp(body: unknown, language: AppLanguage = 'en') {
    const parsed = VerifyOtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { userName, compCode, otp } = parsed.data;
    const valid = await this.validateOtp(compCode.toUpperCase(), userName, otp);
    if (!valid) {
      throw new UnauthorizedException(this.msg('auth.forgot.otpInvalid', language));
    }

    return apiSuccess({ verified: true });
  }

  async resetPassword(body: unknown, language: AppLanguage = 'en') {
    const parsed = ResetPasswordRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { userName, compCode, otp, newPassword } = parsed.data;
    const normalizedCompCode = compCode.toUpperCase();
    const valid = await this.validateOtp(normalizedCompCode, userName, otp);
    if (!valid) {
      throw new UnauthorizedException(this.msg('auth.forgot.otpInvalid', language));
    }

    const employee = await this.employeeAuthRepo.findByUserNameAndCompCode(
      userName,
      normalizedCompCode,
    );

    if (!employee) {
      throw new UnauthorizedException(this.msg('auth.forgot.otpInvalid', language));
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

    return apiSuccess({ message: this.msg('auth.forgot.passwordUpdated', language) });
  }

  private msg(key: MessageKey, language: AppLanguage): string {
    return apiTranslate(key, language);
  }

  private async issueTenantTokens(
    employee: AuthEmployeeRecord,
  ): Promise<{ result: TokenResult; refreshTokenId: string }> {
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

    const refreshTokenId = await this.refreshTokenRepo.create({
      compCode: employee.compCode,
      empId: employee.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    const menuList = await this.menusService.getLegacyMenuListJson(
      employee.compCode,
      employee.roleId,
    );
    const permissionMenuList = await this.menusService.getPermissionMenuListJson(
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
      result: {
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
        permissionMenuList,
        employeeObj: JSON.stringify(employeeObj),
        configurationSetting: JSON.stringify(settings),
        isFirstLogin: 'false',
        isMpin: false,
        isCheckIn: false,
      },
      refreshTokenId,
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
