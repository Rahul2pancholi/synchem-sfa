import { chromium } from '@playwright/test';

const OUT = '/private/tmp/claude-501/-Users-rahulpancholi-synchem-salestrip-clone/2538d538-7c51-439e-b6ba-cee73fb30f17/scratchpad';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
await page.goto('http://localhost:5173/login');
await page.waitForLoadState('networkidle');
await page.locator('#userName').fill('admin');
await page.locator('#password').fill('Admin@123');
await page.locator('#compCode').fill('SYN');
await page.locator('button[type="submit"], .ant-btn-primary').click();
await page.waitForURL('**/app/**');
await page.waitForTimeout(2000);

// Expand sidebar menus and screenshot
const routes = [
  ['approvals', '06-approvals'],
  ['monthlyRTP', '08-monthly-rtp'],
  ['dcrRecord', '09-dcr'],
  ['expenseStatement', '10-expense'],
  ['leaveApplication', '11-leave'],
  ['employees', '12-employees'],
  ['doctor', '13-doctor'],
  ['report/dcr-summary', '14-report-dcr'],
  ['leavePolicy', '15-leave-policy'],
  ['insightsChatConfig', '16-ai-config'],
];

for (const [route, name] of routes) {
  await page.goto(`http://localhost:5173/app/${route}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`${name}: ${page.url()}`);
}

await browser.close();
