import { Inject, Injectable } from '@nestjs/common';
import { apiSuccess } from '@synchem-sfa/shared-types';
import type {
  LoginAnalyticsResponse,
  LoginAnalyticsUserRow,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import {
  LOGIN_EVENT_REPOSITORY,
  type LoginEventRecord,
  type LoginEventRepositoryPort,
} from './ports/login-event.repository.port';

interface UserAggregate {
  empId: string;
  userName: string | null;
  loginCount: number;
  failedCount: number;
  lastLoginAt: Date | null;
  deviceIds: Set<string>;
  ipAddresses: Set<string>;
}

@Injectable()
export class SecurityAnalyticsService {
  constructor(
    @Inject(LOGIN_EVENT_REPOSITORY)
    private readonly loginEvents: LoginEventRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async getLoginAnalytics(compCode: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      events,
      totalLogins,
      failedLogins,
      uniqueDevices,
      activeSessions,
      recentRaw,
    ] = await Promise.all([
      this.loginEvents.findByCompCodeSince(compCode, since),
      this.loginEvents.countByCompCodeSince(compCode, since, 'SUCCESS'),
      this.loginEvents.countByCompCodeSince(compCode, since, 'FAILED'),
      this.loginEvents.countDistinctDevices(compCode, since),
      this.loginEvents.countActiveSessions(compCode),
      this.loginEvents.findRecentByCompCode(compCode, since, 100),
    ]);

    const userMap = new Map<string, UserAggregate>();

    for (const event of events) {
      if (!event.empId) continue;
      let agg = userMap.get(event.empId);
      if (!agg) {
        agg = {
          empId: event.empId,
          userName: event.userName,
          loginCount: 0,
          failedCount: 0,
          lastLoginAt: null,
          deviceIds: new Set(),
          ipAddresses: new Set(),
        };
        userMap.set(event.empId, agg);
      }

      if (event.loginStatus === 'SUCCESS') {
        agg.loginCount += 1;
        if (!agg.lastLoginAt || event.createdAt > agg.lastLoginAt) {
          agg.lastLoginAt = event.createdAt;
        }
        if (event.deviceId) agg.deviceIds.add(event.deviceId);
        if (event.ipAddress) agg.ipAddresses.add(event.ipAddress);
      } else {
        agg.failedCount += 1;
      }
    }

    const empIds = [...userMap.keys()];
    const employees =
      empIds.length > 0
        ? await this.prisma.employee.findMany({
            where: { compCode, id: { in: empIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              userName: true,
            },
          })
        : [];

    const employeeById = new Map(employees.map((e) => [e.id, e]));

    const sessionCounts =
      empIds.length > 0
        ? await this.prisma.refreshToken.groupBy({
            by: ['empId'],
            where: {
              compCode,
              empId: { in: empIds },
              revokedAt: null,
              expiresAt: { gt: new Date() },
            },
            _count: { id: true },
          })
        : [];

    const sessionsByEmp = new Map(sessionCounts.map((s) => [s.empId, s._count.id]));

    const users: LoginAnalyticsUserRow[] = [...userMap.values()]
      .map((agg) => {
        const emp = employeeById.get(agg.empId);
        const distinctDevices = agg.deviceIds.size;
        return {
          empId: agg.empId,
          empCode: emp?.employeeCode ?? null,
          employeeName: emp
            ? `${emp.firstName} ${emp.lastName ?? ''}`.trim()
            : agg.userName ?? '—',
          userName: emp?.userName ?? agg.userName,
          loginCount: agg.loginCount,
          failedCount: agg.failedCount,
          lastLoginAt: agg.lastLoginAt?.toISOString() ?? null,
          distinctDevices,
          distinctIps: agg.ipAddresses.size,
          activeSessions: sessionsByEmp.get(agg.empId) ?? 0,
          multiDeviceFlag: distinctDevices > 1,
        };
      })
      .sort((a, b) => b.loginCount - a.loginCount);

    const uniqueUsers = users.filter((u) => u.loginCount > 0).length;
    const multiDeviceUsers = users.filter((u) => u.multiDeviceFlag).length;

    const channelBreakdown = this.countByField(events, 'channel');
    const deviceTypeBreakdown = this.countByField(
      events.filter((e) => e.loginStatus === 'SUCCESS'),
      'deviceType',
    );

    const payload: LoginAnalyticsResponse = {
      periodDays: days,
      summary: {
        totalLogins,
        failedLogins,
        uniqueUsers,
        uniqueDevices,
        activeSessions,
        multiDeviceUsers,
        channelBreakdown,
        deviceTypeBreakdown,
      },
      users,
      recentEvents: recentRaw.map((e) => this.toRecentEvent(e)),
    };

    return apiSuccess(payload);
  }

  private countByField(
    events: Pick<LoginEventRecord, 'channel' | 'deviceType'>[],
    field: 'channel' | 'deviceType',
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of events) {
      const key = (event[field] as string | null) ?? 'unknown';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }

  private toRecentEvent(event: LoginEventRecord) {
    const name = event.employee
      ? `${event.employee.firstName} ${event.employee.lastName ?? ''}`.trim()
      : event.userName;

    return {
      id: event.id,
      createdAt: event.createdAt.toISOString(),
      userName: event.userName,
      employeeName: name ?? null,
      empCode: event.employee?.employeeCode ?? null,
      loginStatus: event.loginStatus,
      channel: event.channel,
      deviceId: event.deviceId,
      deviceType: event.deviceType,
      osName: event.osName,
      browserName: event.browserName,
      ipAddress: event.ipAddress,
    };
  }
}
