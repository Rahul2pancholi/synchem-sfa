/**
 * MVP load test — concurrent login + read endpoints.
 * Usage: LOAD_TEST=1 pnpm dev:api   (disables throttle)
 *        API_URL=http://localhost:3000 pnpm load-test
 */
const BASE = process.env.API_URL ?? 'http://localhost:3001';
const USERS = Number(process.env.LOAD_USERS ?? 20);
const DURATION_SEC = Number(process.env.LOAD_DURATION_SEC ?? 30);
const COMP = process.env.LOAD_COMP_CODE ?? 'SYN';

const credentials = [
  { user: 'mr1', pass: process.env.GO_LIVE_MR_PASSWORD ?? 'Mr@123', readPath: '/api/v1/leave-balances' },
  { user: 'rm1', pass: process.env.GO_LIVE_RM_PASSWORD ?? 'Rm@123', readPath: '/api/v1/approvals/summary' },
  {
    user: 'admin',
    pass: process.env.GO_LIVE_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123',
    readPath: () => {
      const now = new Date();
      return `/api/v1/reports/dcr-summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`;
    },
  },
];

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function login(cred) {
  const start = performance.now();
  const body = new URLSearchParams({
    grant_type: 'password',
    username: `${cred.user},${COMP}`,
    password: cred.pass,
  });
  const res = await fetch(`${BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const ms = performance.now() - start;
  if (!res.ok) throw new Error(`login ${cred.user} HTTP ${res.status}`);
  const json = await res.json();
  return { ms, token: json.access_token };
}

async function authedGet(path, token) {
  const start = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-App-Language': 'en',
    },
  });
  const ms = performance.now() - start;
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  await res.json();
  return ms;
}

async function virtualUser(id, latencies, errors) {
  const cred = credentials[id % credentials.length];
  try {
    const { ms: loginMs, token } = await login(cred);
    latencies.login.push(loginMs);
    latencies.dcr.push(await authedGet('/api/v1/daily-call-reports', token));
    const readPath = typeof cred.readPath === 'function' ? cred.readPath() : cred.readPath;
    latencies.summary.push(await authedGet(readPath, token));
    const healthStart = performance.now();
    await fetch(`${BASE}/health`);
    latencies.health.push(performance.now() - healthStart);
    return true;
  } catch (err) {
    errors.push(String(err));
    return false;
  }
}

const latencies = { login: [], dcr: [], summary: [], health: [] };
const errors = [];
const endAt = Date.now() + DURATION_SEC * 1000;
let iterations = 0;
let successIters = 0;

console.log(`Load test: ${USERS} concurrent workers, ${DURATION_SEC}s, API=${BASE}`);
console.log('Tip: restart API with LOAD_TEST=1 to avoid throttle 429s\n');

while (Date.now() < endAt) {
  const results = await Promise.all(
    Array.from({ length: USERS }, (_, i) => virtualUser(i, latencies, errors)),
  );
  iterations += 1;
  successIters += results.filter(Boolean).length;
  await new Promise((r) => setTimeout(r, 250));
}

const totalReqs =
  latencies.login.length +
  latencies.dcr.length +
  latencies.summary.length +
  latencies.health.length;
const totalAttempts = USERS * iterations;
const errorRate = totalAttempts > 0 ? ((totalAttempts - successIters) / totalAttempts) * 100 : 0;

function report(name, arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  console.log(
    `  ${name}: n=${sorted.length} p50=${percentile(sorted, 50).toFixed(0)}ms p95=${percentile(sorted, 95).toFixed(0)}ms`,
  );
}

console.log('\nResults:');
console.log(`  iterations: ${iterations}`);
console.log(`  successful worker-runs: ${successIters}/${totalAttempts}`);
console.log(`  total HTTP ok: ${totalReqs}`);
console.log(`  errors: ${errors.length} (${errorRate.toFixed(2)}% failed worker-runs)`);
if (errors.length > 0 && errors.length <= 5) {
  console.log(`  sample: ${errors[0]}`);
} else if (errors.length > 5) {
  console.log(`  sample: ${errors[0]}`);
}

report('login', latencies.login);
report('dcr list', latencies.dcr);
report('approval summary', latencies.summary);
report('health', latencies.health);

const loginP95 = percentile([...latencies.login].sort((a, b) => a - b), 95);
const p95Max = Number(process.env.LOAD_P95_MAX_MS ?? 750);
const pass = latencies.login.length >= 10 && loginP95 < p95Max && errorRate < 5;
console.log(`\nGate: login n>=10, p95 < ${p95Max}ms, error rate < 5% → ${pass ? 'PASS' : 'FAIL'}`);
if (!pass) process.exit(1);
