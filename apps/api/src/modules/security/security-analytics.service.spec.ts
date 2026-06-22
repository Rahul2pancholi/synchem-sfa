import { SecurityAnalyticsService } from './security-analytics.service';
import type { LoginEventRepositoryPort } from './ports/login-event.repository.port';

describe('SecurityAnalyticsService', () => {
  const loginEvents: jest.Mocked<LoginEventRepositoryPort> = {
    create: jest.fn(),
    findRecentByCompCode: jest.fn(),
    findByCompCodeSince: jest.fn(),
    countByCompCodeSince: jest.fn(),
    countDistinctDevices: jest.fn(),
    countActiveSessions: jest.fn(),
  };

  const prisma = {
    employee: { findMany: jest.fn().mockResolvedValue([]) },
    refreshToken: { groupBy: jest.fn().mockResolvedValue([]) },
  };

  let service: SecurityAnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SecurityAnalyticsService(loginEvents, prisma as never);
  });

  it('aggregates multi-device users from login events', async () => {
    const since = new Date();
    loginEvents.findByCompCodeSince.mockResolvedValue([
      {
        id: '1',
        compCode: 'SYN',
        empId: 'emp-1',
        userName: 'mr1',
        loginStatus: 'SUCCESS',
        channel: 'web',
        deviceId: 'device-a',
        deviceType: 'desktop',
        osName: 'macOS',
        browserName: 'Chrome',
        ipAddress: '1.1.1.1',
        createdAt: since,
      },
      {
        id: '2',
        compCode: 'SYN',
        empId: 'emp-1',
        userName: 'mr1',
        loginStatus: 'SUCCESS',
        channel: 'web',
        deviceId: 'device-b',
        deviceType: 'mobile',
        osName: 'iOS',
        browserName: 'Safari',
        ipAddress: '2.2.2.2',
        createdAt: since,
      },
    ]);
    loginEvents.countByCompCodeSince.mockImplementation(async (_c, _s, status) =>
      status === 'FAILED' ? 0 : 2,
    );
    loginEvents.countDistinctDevices.mockResolvedValue(2);
    loginEvents.countActiveSessions.mockResolvedValue(1);
    loginEvents.findRecentByCompCode.mockResolvedValue([]);
    prisma.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        firstName: 'MR',
        lastName: 'One',
        employeeCode: 'MR001',
        userName: 'mr1',
      },
    ]);

    const result = await service.getLoginAnalytics('SYN', 30);

    expect(result.data.summary.multiDeviceUsers).toBe(1);
    expect(result.data.users[0].distinctDevices).toBe(2);
    expect(result.data.users[0].multiDeviceFlag).toBe(true);
  });
});
