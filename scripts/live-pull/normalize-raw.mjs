#!/usr/bin/env node
/**
 * Fix incomplete / stale live-pull JSON files using known-good copies.
 * Run after pull-live-data.mjs — safe to re-run.
 */
import { copyFile, mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RAW = path.join(ROOT, 'data/live-pull/raw');

const REPAIRS = [
  {
    dest: 'masters/role-list.json',
    sources: ['roles/roles-list.json'],
    note: 'role → roles (404 fix)',
  },
  {
    dest: 'transactions/notifications.json',
    sources: ['transactions/notifications-page1.json', 'har/notifications-header.json'],
    note: 'notification/viewmore/ path fix',
  },
  {
    dest: 'dashboard/targetVsAchievement-admin.json',
    sources: ['har/targetVsAchievement-MONTH.json'],
    note: 'live SQL bug on /{empId} — use period endpoint',
  },
  {
    dest: 'dashboard/targetVsAchievement-mr.json',
    sources: ['har/targetVsAchievement-MONTH.json'],
    note: 'live SQL bug on /{empId} — use period endpoint',
  },
];

const STALE_FILES = [
  'dashboard/dailyCalls.json',
  'dashboard/targetVsAchievement.json',
  'dashboard/upComing-crm-emp2.json',
  'dashboard/fieldstaff.json',
  'dashboard/tourProgram-calendar.json',
  'dashboard/doctorFollowUpDone.json',
  'dashboard/wish-birth-anniversary.json',
  'management-dashboard/top-five-product.json',
];

async function copyFirstAvailable(destRel, sourceRels) {
  for (const srcRel of sourceRels) {
    const src = path.join(RAW, srcRel);
    if (!existsSync(src)) continue;
    const dest = path.join(RAW, destRel);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(src, dest);
    return srcRel;
  }
  return null;
}

async function main() {
  console.log('Normalizing live-pull raw data…\n');

  for (const repair of REPAIRS) {
    const used = await copyFirstAvailable(repair.dest, repair.sources);
    if (used) {
      console.log(`✓ ${repair.dest} ← ${used} (${repair.note})`);
    } else {
      console.warn(`⚠ skip ${repair.dest} — no source found`);
    }
  }

  for (const rel of STALE_FILES) {
    const full = path.join(RAW, rel);
    if (!existsSync(full)) continue;
    const raw = JSON.parse(await readFile(full, 'utf8'));
    const bad =
      raw._meta?.httpStatus === 404 ||
      raw._meta?.responseCode === 404 ||
      (raw._meta?.apiError && String(raw._meta.apiError).trim()) ||
      raw.message?.includes?.('No HTTP resource');
    if (bad) {
      await unlink(full);
      console.log(`✗ removed stale ${rel}`);
    }
  }

  const manifestPath = path.join(RAW, '_manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.normalizedAt = new Date().toISOString();
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
