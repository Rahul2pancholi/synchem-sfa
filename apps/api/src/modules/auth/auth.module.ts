import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { MenusModule } from '../menus/menus.module';
import { PrismaEmployeeAuthRepository } from './adapters/prisma-employee-auth.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EMPLOYEE_AUTH_REPOSITORY } from './ports/employee-auth.repository.port';

@Module({
  imports: [
    MenusModule,
    JwtModule.registerAsync({
      global: true,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as `${number}h` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: EMPLOYEE_AUTH_REPOSITORY,
      useClass: PrismaEmployeeAuthRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
