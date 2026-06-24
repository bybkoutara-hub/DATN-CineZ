import { chromium } from 'playwright';

const URL = 'http://localhost:8081';
const OUT = 'screenshots';

const browser = await chromium.launch();
// Mô phỏng khung điện thoại (iPhone-ish)
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
});
const page = await context.newPage();

const logs = [];
page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
// Chờ app render
await page.waitForTimeout(6000);

await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true });
console.log('Đã chụp 01-home.png');

console.log('--- LOG TRÌNH DUYỆT ---');
console.log(logs.join('\n') || '(không có log)');

await browser.close();
