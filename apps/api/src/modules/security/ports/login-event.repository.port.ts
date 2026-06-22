import type { DeviceContext } from '../../../common/http/device-context';

export interface LoginEventRecord {
  id: string;
  compCode: string;
  empId: string | null;
  userName: string | null;
  loginStatus: string;
  channel: string;
  deviceId: string | null;
  deviceType: string | null;
  osName: string | null;
  browserName: string | null;
  ipAddress: string | null;
  createdAt: Date;
  employee?: {
    firstName: string;
    lastName: string | null;
    employeeCode: string | null;
  } | null;
}

export interface CreateLoginEventParams {
  compCode: string;
  empId?: string;
  userName?: string;
  loginStatus: 'SUCCESS' | 'FAILED';
  device: DeviceContext;
  refreshTokenId?: string;
}

export interface LoginEventRepositoryPort {
  create(params: CreateLoginEventParams): Promise<string>;
  findRecentByCompCode(compCode: string, since: Date, limit: number): Promise<LoginEventRecord[]>;
  findByCompCodeSince(compCode: string, since: Date): Promise<LoginEventRecord[]>;
  countByCompCodeSince(
    compCode: string,
    since: Date,
    loginStatus?: 'SUCCESS' | 'FAILED',
  ): Promise<number>;
  countDistinctDevices(compCode: string, since: Date): Promise<number>;
  countActiveSessions(compCode: string): Promise<number>;
}

export const LOGIN_EVENT_REPOSITORY = Symbol('LOGIN_EVENT_REPOSITORY');
