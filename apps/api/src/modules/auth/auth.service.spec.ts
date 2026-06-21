import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { EmployeeAuthRepositoryPort } from './ports/employee-auth.repository.port';
import { EMPLOYEE_AUTH_REPOSITORY } from './ports/employee-auth.repository.port';
import { AppConfigService } from '../../config/config.service';
import { MenusService } from '../menus/menus.service';

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<EmployeeAuthRepositoryPort>;

  beforeEach(async () => {
    repo = {
      findByUserNameAndCompCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EMPLOYEE_AUTH_REPOSITORY, useValue: repo },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('jwt-token') },
        },
        {
          provide: AppConfigService,
          useValue: { jwtSecret: 'x'.repeat(32), jwtExpiresIn: '12h' },
        },
        {
          provide: MenusService,
          useValue: { getLegacyMenuListJson: jest.fn().mockResolvedValue('[]') },
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
    expect(result.compCode).toBe('SYN');
    expect(result.menuList).toBe('[]');
  });
});
