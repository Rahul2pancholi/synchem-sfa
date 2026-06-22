import { z } from 'zod';

export const LoginAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export type LoginAnalyticsQuery = z.infer<typeof LoginAnalyticsQuerySchema>;

export interface LoginAnalyticsUserRow {
  empId: string;
  empCode: string | null;
  employeeName: string;
  userName: string | null;
  loginCount: number;
  failedCount: number;
  lastLoginAt: string | null;
  distinctDevices: number;
  distinctIps: number;
  activeSessions: number;
  multiDeviceFlag: boolean;
}

export interface LoginAnalyticsRecentEvent {
  id: string;
  createdAt: string;
  userName: string | null;
  employeeName: string | null;
  empCode: string | null;
  loginStatus: string;
  channel: string;
  deviceId: string | null;
  deviceType: string | null;
  osName: string | null;
  browserName: string | null;
  ipAddress: string | null;
}

export interface LoginAnalyticsResponse {
  periodDays: number;
  summary: {
    totalLogins: number;
    failedLogins: number;
    uniqueUsers: number;
    uniqueDevices: number;
    activeSessions: number;
    multiDeviceUsers: number;
    channelBreakdown: Record<string, number>;
    deviceTypeBreakdown: Record<string, number>;
  };
  users: LoginAnalyticsUserRow[];
  recentEvents: LoginAnalyticsRecentEvent[];
}
