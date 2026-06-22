#!/usr/bin/env node
/**
 * Pull JSON from live synchem.salestrip.in into data/live-pull/raw/
 *
 * Usage:
 *   SALESTRIP_TOKEN='Bearer …' pnpm live-pull:quick
 *   SALESTRIP_TOKEN='…' SALESTRIP_TOKEN_MR='…' pnpm live-pull:full
 *   pnpm live-pull:retry-failed
 *
 * Optional MR token (field-staff APIs): auto-login MRAligarh1 if SALESTRIP_MR_USER/PASS set
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LIVE_PULL_ENDPOINTS,
  LIVE_PULL_QUICK_GROUPS,
  resolvePath,
} from './endpoints.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'data/live-pull/raw');
const BASE_URL = process.env.SALESTRIP_BASE_URL ?? 'https://synchem.salestrip.in/api/';
const TOKEN_URL = process.env.SALESTRIP_TOKEN_URL ?? 'https://synchem.salestrip.in/token';

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const retryFailed = args.includes('--retry-failed');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyGroups = onlyArg
  ? new Set(onlyArg.replace('--only=', '').split(',').map((s) => s.trim()))
  : null;

function normalizeBearer(raw) {
  const t = raw.trim().replace(/^['"]|['"]$/g, '');
  return t.startsWith('Bearer ') ? t : `Bearer ${t}`;
}

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = await readFile(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

async function loginMrToken() {
  const user = process.env.SALESTRIP_MR_USER ?? 'MRAligarh1,SYN';
  const pass = process.env.SALESTRIP_MR_PASSWORD ?? 'MR@12345';
  const body = new URLSearchParams({
    grant_type: 'password',
    username: user,
    password: pass,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    console.warn(`MR auto-login failed (${res.status}) — MR-only endpoints skipped`);
    return null;
  }
  const json = await res.json();
  return json.access_token ? normalizeBearer(json.access_token) : null;
}

async function loadTokens() {
  const fileEnv = await loadEnvFile(path.join(ROOT, '.env.live-pull'));
  const adminRaw = process.env.SALESTRIP_TOKEN ?? fileEnv.SALESTRIP_TOKEN;
  const tokens = { admin: null, mr: null };
  if (adminRaw) {
    tokens.admin = normalizeBearer(adminRaw);
  }
  const mrRaw = process.env.SALESTRIP_TOKEN_MR ?? fileEnv.SALESTRIP_TOKEN_MR;
  if (mrRaw) {
    tokens.mr = normalizeBearer(mrRaw);
  } else {
    tokens.mr = await loginMrToken();
  }
  if (!tokens.admin) {
    tokens.admin = tokens.mr;
  }
  if (!tokens.admin) {
    console.error('Missing SALESTRIP_TOKEN (or MR auto-login failed)');
    process.exit(1);
  }
  if (!tokens.mr) tokens.mr = tokens.admin;
  return tokens;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isSuccessPayload(json, httpStatus) {
  if (httpStatus < 200 || httpStatus >= 300) return false;
  if (json && typeof json === 'object' && 'responseCode' in json) {
    if (json.responseCode !== 200) return false;
    const err = json.errorObj?.errorMessage;
    if (err && String(err).trim()) return false;
  }
  return true;
}

async function fetchEndpoint(auth, ep) {
  const relPath = resolvePath(ep.path, ep.pathParams ?? {});
  const url = new URL(relPath.replace(/^\//, ''), BASE_URL);
  if (ep.query) {
    for (const [key, value] of Object.entries(ep.query)) {
      url.searchParams.set(key, String(value));
    }
  }
  const urlStr = url.toString();
  const method = ep.method ?? 'GET';
  const init = {
    method,
    headers: {
      Authorization: auth,
      Accept: 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
    },
  };
  if (method === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(ep.body ?? {});
  }
  const res = await fetch(urlStr, init);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _parseError: true, _rawPreview: text.slice(0, 500) };
  }
  return { url: urlStr, relPath, status: res.status, json, bytes: text.length };
}

function selectEndpoints() {
  let endpoints = LIVE_PULL_ENDPOINTS.filter((e) => !e.skip);
  if (quick) {
    endpoints = endpoints.filter((e) => LIVE_PULL_QUICK_GROUPS.has(e.group));
  }
  if (onlyGroups) {
    endpoints = endpoints.filter((e) => onlyGroups.has(e.group));
  }
  return endpoints;
}

async function loadFailedKeys() {
  const manifestPath = path.join(OUT_DIR, '_manifest.json');
  if (!existsSync(manifestPath)) return new Set();
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const runs = manifest.runs ?? [manifest];
    const keys = new Set();
    for (const run of runs) {
      for (const r of run.results ?? []) {
        if (!r.ok) keys.add(`${r.group}/${r.file}`);
      }
    }
    return keys;
  } catch {
    return new Set();
  }
}

async function main() {
  const tokens = await loadTokens();
  await mkdir(OUT_DIR, { recursive: true });

  let endpoints = selectEndpoints();
  if (retryFailed) {
    const failed = await loadFailedKeys();
    endpoints = endpoints.filter((e) => failed.has(`${e.group}/${e.file}`));
    if (endpoints.length === 0) {
      console.log('No failed endpoints to retry (or manifest missing).');
      return;
    }
    console.log(`Retrying ${endpoints.length} previously failed endpoint(s)\n`);
  }

  const manifestPath = path.join(OUT_DIR, '_manifest.json');
  let previous = { runs: [] };
  if (existsSync(manifestPath)) {
    try {
      previous = JSON.parse(await readFile(manifestPath, 'utf8'));
      if (!Array.isArray(previous.runs)) previous = { runs: [previous] };
    } catch {
      previous = { runs: [] };
    }
  }

  const run = {
    pulledAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    mode: retryFailed ? 'retry-failed' : quick ? 'quick' : onlyGroups ? `only:${[...onlyGroups].join(',')}` : 'full',
    results: [],
  };

  console.log(`Pulling ${endpoints.length} endpoints → ${OUT_DIR}\n`);

  for (const ep of endpoints) {
    const tokenProfile = ep.token ?? 'admin';
    const auth = tokenProfile === 'mr' ? tokens.mr : tokens.admin;
    if (!auth) {
      run.results.push({
        group: ep.group,
        file: ep.file,
        path: ep.path,
        ok: false,
        skipped: true,
        error: 'MR token not available',
      });
      console.log(`SKIP ${ep.path} (no MR token)`);
      continue;
    }

    const dest = path.join(OUT_DIR, ep.group, `${ep.file}.json`);
    await mkdir(path.dirname(dest), { recursive: true });

    const label = `${ep.method ?? 'GET'} ${ep.path}`;
    process.stdout.write(`${label} … `);
    try {
      const result = await fetchEndpoint(auth, ep);
      const ok = isSuccessPayload(result.json, result.status);
      const payload = {
        _meta: {
          path: result.relPath,
          url: result.url,
          method: ep.method ?? 'GET',
          httpStatus: result.status,
          responseCode: result.json?.responseCode ?? null,
          apiError: result.json?.errorObj?.errorMessage ?? null,
          bytes: result.bytes,
          pulledAt: new Date().toISOString(),
          tokenProfile,
          note: ep.note ?? null,
        },
        ...result.json,
      };
      await writeFile(dest, JSON.stringify(payload, null, 2));
      run.results.push({
        group: ep.group,
        file: ep.file,
        path: result.relPath,
        method: ep.method ?? 'GET',
        httpStatus: result.status,
        responseCode: result.json?.responseCode ?? null,
        bytes: result.bytes,
        ok,
        dest: path.relative(ROOT, dest),
        apiError: result.json?.errorObj?.errorMessage ?? null,
      });
      console.log(`${result.status} ${ok ? 'OK' : 'API_ERR'} (${(result.bytes / 1024).toFixed(1)} KB)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      run.results.push({
        group: ep.group,
        file: ep.file,
        path: ep.path,
        ok: false,
        error: message,
      });
      console.log(`FAIL: ${message}`);
    }
    await sleep(200);
  }

  const ok = run.results.filter((r) => r.ok).length;
  const fail = run.results.filter((r) => !r.ok && !r.skipped).length;
  const skipped = run.results.filter((r) => r.skipped).length;
  run.summary = { total: run.results.length, ok, fail, skipped };

  previous.runs.push(run);
  await writeFile(manifestPath, JSON.stringify(previous, null, 2));

  await writeFile(
    path.join(OUT_DIR, '_skipped-endpoints.json'),
    JSON.stringify(
      LIVE_PULL_ENDPOINTS.filter((e) => e.skip).map((e) => ({
        path: e.path,
        note: e.note,
      })),
      null,
      2,
    ),
  );

  console.log(`\nDone: ${ok} ok, ${fail} failed, ${skipped} skipped.`);
  console.log(`Manifest: data/live-pull/raw/_manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
