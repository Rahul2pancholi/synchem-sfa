import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import type {
  PushNotificationPayload,
  PushNotificationPort,
} from './push-notification.port';

/**
 * Sends FCM push when FIREBASE_SERVER_KEY is set; otherwise logs only (dev-safe).
 */
@Injectable()
export class FcmPushNotificationAdapter implements PushNotificationPort {
  private readonly logger = new Logger(FcmPushNotificationAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async sendToEmployee(
    compCode: string,
    empId: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { compCode, id: empId, active: true },
      select: { pushToken: true, userName: true },
    });

    if (!employee?.pushToken) {
      this.logger.debug({
        module: 'notifications',
        action: 'push_skipped_no_token',
        compCode,
        empId,
        title: payload.title,
      });
      return;
    }

    const serverKey = this.config.get<string>('FIREBASE_SERVER_KEY')?.trim();
    if (!serverKey) {
      this.logger.log({
        module: 'notifications',
        action: 'push_logged',
        compCode,
        empId,
        userName: employee.userName,
        title: payload.title,
        body: payload.body,
      });
      return;
    }

    try {
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: employee.pushToken,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
        }),
      });

      if (!res.ok) {
        this.logger.warn({
          module: 'notifications',
          action: 'push_failed',
          compCode,
          empId,
          status: res.status,
        });
      }
    } catch (err) {
      this.logger.warn({
        module: 'notifications',
        action: 'push_error',
        compCode,
        empId,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }
}
