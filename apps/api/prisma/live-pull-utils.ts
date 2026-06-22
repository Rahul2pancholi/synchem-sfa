import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');

export const COMP_CODE = 'SYN';

/** Deterministic UUID v4-shaped id from live Salestrip numeric id. */
export function liveUuid(entity: string, liveId: string | number): string {
  const hash = createHash('sha256').update(`${COMP_CODE}:${entity}:${liveId}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function livePullDir(): string {
  return process.env.LIVE_PULL_DIR ?? path.join(ROOT, 'data/live-pull/raw');
}

export async function readLiveJson<T = unknown>(...parts: string[]): Promise<T> {
  const filePath = path.join(livePullDir(), ...parts);
  const raw = JSON.parse(await readFile(filePath, 'utf8')) as Record<string, unknown>;
  return raw as T;
}

export function unwrapList<T>(payload: Record<string, unknown>, keys: string[]): T[] {
  const data = (payload.data ?? payload) as Record<string, unknown>;
  for (const key of keys) {
    const val = data[key];
    if (Array.isArray(val)) return val as T[];
  }
  return [];
}

export function normName(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseLiveInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseSeedLimit(envKey: string): number | undefined {
  const raw = process.env[envKey]?.trim();
  if (!raw || raw === 'all' || raw === '0') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export async function batchCreateMany<T>(
  label: string,
  rows: T[],
  insert: (chunk: T[]) => Promise<{ count: number }>,
  chunkSize = 2000,
): Promise<number> {
  let total = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const result = await insert(chunk);
    total += result.count;
    process.stdout.write(`  ${label}: ${Math.min(i + chunk.length, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ${label}: ${total} rows`);
  return total;
}
