import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type {
  CreateLoginEventParams,
  LoginEventRecord,
  LoginEventRepositoryPort,
} from '../ports/login-event.repository.port';

@Injectable()
export class PrismaLoginEventRepository implements LoginEventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateLoginEventParams): Promise<string> {
    const { device } = params;
    const row = await this.prisma.loginEvent.create({
      data: {
        compCode: params.compCode,
        empId: params.empId,
        userName: params.userName,
        loginStatus: params.loginStatus,
        channel: device.channel,
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        osName: device.osName,
        osVersion: device.osVersion,
        browserName: device.browserName,
        browserVersion: device.browserVersion,
        appVersion: device.appVersion,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        acceptLanguage: device.acceptLanguage,
        requestId: device.requestId,
        refreshTokenId: params.refreshTokenId,
      },
      select: { id: true },
    });
    return row.id;
  }

  async findRecentByCompCode(
    compCode: string,
    since: Date,
    limit: number,
  ): Promise<LoginEventRecord[]> {
    return this.prisma.loginEvent.findMany({
      where: { compCode, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true } },
      },
    });
  }

  async findByCompCodeSince(compCode: string, since: Date): Promise<LoginEventRecord[]> {
    return this.prisma.loginEvent.findMany({
      where: { compCode, createdAt: { gte: since } },
      select: {
        id: true,
        compCode: true,
        empId: true,
        userName: true,
        loginStatus: true,
        channel: true,
        deviceId: true,
        deviceType: true,
        osName: true,
        browserName: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  }

  async countByCompCodeSince(
    compCode: string,
    since: Date,
    loginStatus?: 'SUCCESS' | 'FAILED',
  ): Promise<number> {
    return this.prisma.loginEvent.count({
      where: {
        compCode,
        createdAt: { gte: since },
        ...(loginStatus ? { loginStatus } : {}),
      },
    });
  }

  async countDistinctDevices(compCode: string, since: Date): Promise<number> {
    const rows = await this.prisma.loginEvent.findMany({
      where: {
        compCode,
        createdAt: { gte: since },
        deviceId: { not: null },
        loginStatus: 'SUCCESS',
      },
      distinct: ['deviceId'],
      select: { deviceId: true },
    });
    return rows.length;
  }

  async countActiveSessions(compCode: string): Promise<number> {
    return this.prisma.refreshToken.count({
      where: {
        compCode,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }
}
