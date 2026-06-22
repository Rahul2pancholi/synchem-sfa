import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGO = 'aes-256-gcm';

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(`insights-config:${secret}`).digest();
}

export function encryptSecret(plainText: string, secret: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, deriveKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([encrypted, tag]);
  return {
    ciphertext: payload.toString('base64'),
    iv: iv.toString('base64'),
  };
}

export function decryptSecret(ciphertext: string, iv: string, secret: string): string {
  const payload = Buffer.from(ciphertext, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');
  const tag = payload.subarray(payload.length - 16);
  const data = payload.subarray(0, payload.length - 16);
  const decipher = createDecipheriv(ALGO, deriveKey(secret), ivBuf);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '********';
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}
