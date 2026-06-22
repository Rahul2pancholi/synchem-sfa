import { Inject, Injectable, Logger } from '@nestjs/common';
import type { DeviceContext } from '../../common/http/device-context';
import { deviceAuditSnapshot } from '../../common/http/device-context';
import { AuditService } from '../audit/audit.service';
import {
  LOGIN_EVENT_REPOSITORY,
  type LoginEventRepositoryPort,
} from './ports/login-event.repository.port';

@Injectable()
export class LoginTrackingService {
  private readonly logger = new Logger(LoginTrackingService.name);

  constructor(
    @Inject(LOGIN_EVENT_REPOSITORY)
    private readonly loginEvents: LoginEventRepositoryPort,
    private readonly auditService: AuditService,
  ) {}

  async recordSuccess(params: {
    compCode: string;
    empId: string;
    userName: string;
    device: DeviceContext;
    refreshTokenId: string;
  }): Promise<void> {
    await this.loginEvents.create({
      compCode: params.compCode,
      empId: params.empId,
      userName: params.userName,
      loginStatus: 'SUCCESS',
      device: params.device,
      refreshTokenId: params.refreshTokenId,
    });

    await this.auditService.log({
      compCode: params.compCode,
      empId: params.empId,
      entityType: 'employee',
      entityId: params.empId,
      action: 'LOGIN',
      newValues: {
        userName: params.userName,
        ...deviceAuditSnapshot(params.device),
      },
    });

    this.logger.log({
      compCode: params.compCode,
      empId: params.empId,
      module: 'security',
      action: 'loginTracked',
      channel: params.device.channel,
      deviceId: params.device.deviceId,
    });
  }

  async recordFailure(params: {
    compCode: string;
    userName: string;
    empId?: string;
    device: DeviceContext;
  }): Promise<void> {
    await this.loginEvents.create({
      compCode: params.compCode,
      empId: params.empId,
      userName: params.userName,
      loginStatus: 'FAILED',
      device: params.device,
    });

    await this.auditService.log({
      compCode: params.compCode,
      empId: params.empId,
      entityType: 'employee',
      entityId: params.empId ?? params.userName,
      action: 'LOGIN_FAILED',
      newValues: {
        userName: params.userName,
        ...deviceAuditSnapshot(params.device),
      },
    });

    this.logger.warn({
      compCode: params.compCode,
      userName: params.userName,
      module: 'security',
      action: 'loginFailedTracked',
      ipAddress: params.device.ipAddress,
    });
  }
}
