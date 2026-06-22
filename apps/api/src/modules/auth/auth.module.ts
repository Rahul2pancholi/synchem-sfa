import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { AuditModule } from '../audit/audit.module';
import { SecurityModule } from '../security/security.module';
import { MenusModule } from '../menus/menus.module';
import { PrismaTenantSettingsRepository } from '../tenant/adapters/prisma-tenant-settings.repository';
import { TENANT_SETTINGS_REPOSITORY } from '../tenant/ports/tenant-settings.repository.port';
import { PrismaEmployeeAuthRepository } from './adapters/prisma-employee-auth.repository';
import { PrismaRefreshTokenRepository } from './adapters/prisma-refresh-token.repository';
import { AuthController } from './auth.controller';
import { AuthV1Controller } from './auth-v1.controller';
import { AuthService } from './auth.service';
import { EMPLOYEE_AUTH_REPOSITORY } from './ports/employee-auth.repository.port';
import { REFRESH_TOKEN_REPOSITORY } from './ports/refresh-token.repository.port';

@Module({
  imports: [
    MenusModule,
    AuditModule,
    SecurityModule,
    JwtModule.registerAsync({
      global: true,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as `${number}h` },
      }),
    }),
  ],
  controllers: [AuthController, AuthV1Controller],
  providers: [
    AuthService,
    {
      provide: EMPLOYEE_AUTH_REPOSITORY,
      useClass: PrismaEmployeeAuthRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: TENANT_SETTINGS_REPOSITORY,
      useClass: PrismaTenantSettingsRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
