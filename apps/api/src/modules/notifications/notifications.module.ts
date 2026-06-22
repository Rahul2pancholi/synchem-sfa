import { Module } from '@nestjs/common';
import { FcmPushNotificationAdapter } from './fcm-push-notification.adapter';
import { PUSH_NOTIFICATION_PORT } from './push-notification.port';
import { PushNotificationService } from './push-notification.service';

@Module({
  providers: [
    PushNotificationService,
    { provide: PUSH_NOTIFICATION_PORT, useClass: FcmPushNotificationAdapter },
  ],
  exports: [PushNotificationService],
})
export class NotificationsModule {}
