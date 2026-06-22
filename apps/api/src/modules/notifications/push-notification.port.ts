export type PushNotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export interface PushNotificationPort {
  sendToEmployee(
    compCode: string,
    empId: string,
    payload: PushNotificationPayload,
  ): Promise<void>;
}

export const PUSH_NOTIFICATION_PORT = Symbol('PUSH_NOTIFICATION_PORT');
