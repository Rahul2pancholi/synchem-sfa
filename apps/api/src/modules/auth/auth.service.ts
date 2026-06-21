import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { AppConfigService } from '../../config/config.service';
import {
  EMPLOYEE_AUTH_REPOSITORY,
  type EmployeeAuthRepositoryPort,
} from './ports/employee-auth.repository.port';

export interface TokenResult {
  access_token: string;
  token_type: string;
  expires_in: number;
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(EMPLOYEE_AUTH_REPOSITORY)
    private readonly employeeAuthRepo: EmployeeAuthRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
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

    const payload: JwtPayload = {
      sub: employee.userName,
      empId: employee.id,
      fullName: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
      compCode: employee.compCode,
      industryType: employee.industryType,
      roleType: employee.roleType,
      companyName: employee.companyName,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresInSeconds = 12 * 60 * 60;

    this.logger.log({
      compCode: employee.compCode,
      empId: employee.id,
      module: 'auth',
      action: 'loginSuccess',
    });

    const employeeObj = {
      empId: employee.id,
      userName: employee.userName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      roleType: employee.roleType,
      roleName: employee.roleName,
      compCode: employee.compCode,
    };

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: expiresInSeconds,
      empId: employee.id,
      roleType: employee.roleType,
      compCode: employee.compCode,
      compName: employee.companyName,
      menuList: '[]',
      employeeObj: JSON.stringify(employeeObj),
      configurationSetting: '{}',
      isFirstLogin: 'false',
      isMpin: false,
      isCheckIn: false,
    };
  }
}
