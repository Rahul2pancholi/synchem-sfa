import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { EmployeeAuthRepositoryPort } from './ports/employee-auth.repository.port';
import { EMPLOYEE_AUTH_REPOSITORY } from './ports/employee-auth.repository.port';
import { REFRESH_TOKEN_REPOSITORY } from './ports/refresh-token.repository.port';
import { TENANT_SETTINGS_REPOSITORY } from '../tenant/ports/tenant-settings.repository.port';
import { MenusService } from '../menus/menus.service';
import { AuditService } from '../audit/audit.service';
import { RedisService } from '../../infrastructure/cache/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<EmployeeAuthRepositoryPort>;

  beforeEach(async () => {
    repo = {
      findByUserNameAndCompCode: jest.fn(),
      findByIdAndCompCode: jest.fn(),
      updatePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EMPLOYEE_AUTH_REPOSITORY, useValue: repo },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: { create: jest.fn(), findValidByHash: jest.fn(), revoke: jest.fn() },
        },
        {
          provide: TENANT_SETTINGS_REPOSITORY,
          useValue: { getSettingsMap: jest.fn().mockResolvedValue({ SET001: '1' }) },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('jwt-token') },
        },
        {
          provide: MenusService,
          useValue: { getLegacyMenuListJson: jest.fn().mockResolvedValue('[]') },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: { isConfigured: jest.fn().mockReturnValue(false), set: jest.fn(), get: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should reject invalid username format', async () => {
    await expect(service.login('admin', 'pass')).rejects.toThrow(UnauthorizedException);
  });

  it('should reject unknown user', async () => {
    repo.findByUserNameAndCompCode.mockResolvedValue(null);
    await expect(service.login('admin,SYN', 'pass')).rejects.toThrow(UnauthorizedException);
  });

  it('should return token for valid credentials', async () => {
    const hash = await bcrypt.hash('Admin@123', 10);
    repo.findByUserNameAndCompCode.mockResolvedValue({
      id: 'emp-1',
      compCode: 'SYN',
      userName: 'admin',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: 'role-1',
      roleType: 'AD',
      roleName: 'ADMIN',
      companyName: 'Synchem',
      industryType: 'SYN',
    });

    const result = await service.login('admin,SYN', 'Admin@123');
    expect(result.access_token).toBe('jwt-token');
    expect(result.refresh_token).toBeDefined();
    expect(result.compCode).toBe('SYN');
    expect(result.menuList).toBe('[]');
  });
});
