import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.API_URL || 'http://localhost:3000';
const COMP = __ENV.LOAD_COMP_CODE || 'SYN';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const users = [
  { user: 'mr1', pass: 'Mr@123' },
  { user: 'rm1', pass: 'Rm@123' },
  { user: 'admin', pass: 'Admin@123' },
];

export default function () {
  const cred = users[__VU % users.length];
  const loginRes = http.post(
    `${BASE}/token`,
    {
      grant_type: 'password',
      username: `${cred.user},${COMP}`,
      password: cred.pass,
    },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  check(loginRes, { 'login 200': (r) => r.status === 200 });
  const token = loginRes.json('access_token');
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    'X-App-Language': 'en',
  };

  check(http.get(`${BASE}/api/v1/daily-call-reports`, { headers }), {
    'dcr 200': (r) => r.status === 200,
  });
  check(http.get(`${BASE}/api/v1/approvals/summary`, { headers }), {
    'summary 200': (r) => r.status === 200,
  });

  sleep(1);
}
