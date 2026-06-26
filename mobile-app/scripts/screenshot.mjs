// Chụp screenshot các màn chính của app (bản build web) bằng Playwright.
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:59139";
const OUT = "screenshots";
fs.mkdirSync(OUT, { recursive: true });

// Một số màn cần tham số -> truyền sẵn để render đầy đủ bố cục
const combosParam = encodeURIComponent(
  JSON.stringify([{ name: "Combo Cặp Đôi", quantity: 1, price: 250000 }])
);
const pages = [
  { name: "01-welcome", path: "/" },
  { name: "02-sign-in", path: "/sign-in" },
  { name: "03-sign-up", path: "/signup" },
  { name: "04-select-seat", path: "/select-seat?showtimeId=demo&movieTitle=Avengers" },
  {
    name: "05-combo",
    path: `/combo?showtimeId=demo&seats=A1,A2&totalPrice=140000&movieTitle=Avengers&roomName=Phòng 1`,
  },
  {
    name: "06-payment",
    path: `/payment?showtimeId=demo&seats=A1,A2&grandTotal=390000&movieTitle=Avengers&roomName=Phòng 1&combos=${combosParam}`,
  },
  {
    name: "07-my-ticket",
    path: `/my-ticket?bookingId=64f0c1a2b3d4e5f600000001&title=Avengers: Infinity War&duration=149&room=Phòng 1&time=14:15&date=22/06/2026&seats=A1, A2&totalPrice=390000&status=completed&combos=${combosParam}`,
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 412, height: 915 }, // kích thước điện thoại
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

for (const p of pages) {
  try {
    await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 20000 });
  } catch {
    // networkidle có thể timeout do app cố gọi API (host không chạy) -> vẫn chụp
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
  console.log(`📸 ${p.name} -> ${OUT}/${p.name}.png`);
}

await browser.close();
console.log(`\n✅ Đã chụp ${pages.length} màn.`);
if (errors.length) {
  console.log(`\n⚠️ Console errors (${errors.length}):`);
  [...new Set(errors)].slice(0, 15).forEach((e) => console.log(" -", e.slice(0, 200)));
}
