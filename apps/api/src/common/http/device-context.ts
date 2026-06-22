import type { Request } from 'express';

export interface DeviceContext {
  channel: string;
  deviceId: string | null;
  deviceType: string | null;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  appVersion: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  requestId: string | null;
}

function headerValue(req: Request, name: string): string | null {
  const raw = req.headers[name.toLowerCase()];
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().slice(0, 200);
  }
  return null;
}

export function resolveClientIp(req: Request): string | null {
  const forwarded = headerValue(req, 'x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim().slice(0, 45) ?? null;
  }
  const ip = req.ip ?? req.socket?.remoteAddress;
  return ip ? ip.replace(/^::ffff:/, '').slice(0, 45) : null;
}

function parseUserAgent(ua: string): Pick<
  DeviceContext,
  'deviceType' | 'osName' | 'osVersion' | 'browserName' | 'browserVersion'
> {
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const tablet = /iPad|Tablet/i.test(ua);

  let osName = 'Unknown';
  let osVersion: string | null = null;
  if (/Windows NT ([\d.]+)/i.test(ua)) {
    osName = 'Windows';
    osVersion = RegExp.$1;
  } else if (/Mac OS X ([\d_]+)/i.test(ua)) {
    osName = 'macOS';
    osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/Android ([\d.]+)/i.test(ua)) {
    osName = 'Android';
    osVersion = RegExp.$1;
  } else if (/iPhone OS ([\d_]+)/i.test(ua) || /CPU OS ([\d_]+)/i.test(ua)) {
    osName = 'iOS';
    osVersion = (RegExp.$1 ?? '').replace(/_/g, '.');
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux';
  }

  let browserName = 'Unknown';
  let browserVersion: string | null = null;
  if (/Edg\/([\d.]+)/i.test(ua)) {
    browserName = 'Edge';
    browserVersion = RegExp.$1;
  } else if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg/i.test(ua)) {
    browserName = 'Chrome';
    browserVersion = RegExp.$1;
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    browserName = 'Firefox';
    browserVersion = RegExp.$1;
  } else if (/Version\/([\d.]+).*Safari/i.test(ua)) {
    browserName = 'Safari';
    browserVersion = RegExp.$1;
  }

  const deviceType = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';

  return { deviceType, osName, osVersion, browserName, browserVersion };
}

export function extractDeviceContext(req: Request): DeviceContext {
  const userAgent = headerValue(req, 'user-agent');
  const parsed = userAgent ? parseUserAgent(userAgent) : {
    deviceType: null,
    osName: null,
    osVersion: null,
    browserName: null,
    browserVersion: null,
  };

  const requestId =
    headerValue(req, 'x-request-id') ??
    (typeof req.id === 'string' ? req.id : null);

  return {
    channel: headerValue(req, 'x-app-channel') ?? 'web',
    deviceId: headerValue(req, 'x-device-id'),
    appVersion: headerValue(req, 'x-app-version'),
    ipAddress: resolveClientIp(req),
    userAgent: userAgent?.slice(0, 500) ?? null,
    acceptLanguage: headerValue(req, 'accept-language'),
    requestId,
    ...parsed,
  };
}

export function deviceAuditSnapshot(device: DeviceContext): Record<string, string | null> {
  return {
    channel: device.channel,
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    osName: device.osName,
    browserName: device.browserName,
    ipAddress: device.ipAddress,
    appVersion: device.appVersion,
  };
}
