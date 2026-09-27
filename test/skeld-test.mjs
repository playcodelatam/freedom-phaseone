import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log("Launching Chrome to test The Skeld facility...");
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--no-sandbox",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 780 });

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("c:" + m.text());
  });

  console.log("Navigating to http://localhost:5173/...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(600);

  await page.type("#name-input", "Crewmate");
  await page.click("#btn-solo");
  console.log("Entering The Skeld...");
  await sleep(3500);

  // 1. Cafeteria View
  const initialPos = await page.evaluate(() => {
    const p = window.__bbPlayer;
    return p ? { x: +p.pos.x.toFixed(1), y: +p.pos.y.toFixed(1), z: +p.pos.z.toFixed(1) } : null;
  });
  console.log("Spawn Pos (Cafeteria):", initialPos);
  await page.screenshot({ path: "skeld-cafeteria.png" });
  console.log("Saved skeld-cafeteria.png");

  // 2. Admin Room
  console.log("Teleporting to Admin...");
  await page.evaluate(() => {
    const p = window.__bbPlayer;
    if (p) { p.pos.x = 16; p.pos.z = 4; }
  });
  await sleep(1000);
  await page.screenshot({ path: "skeld-admin.png" });
  console.log("Saved skeld-admin.png");

  // 3. Storage Bay
  console.log("Teleporting to Storage...");
  await page.evaluate(() => {
    const p = window.__bbPlayer;
    if (p) { p.pos.x = 0; p.pos.z = 24; }
  });
  await sleep(1000);
  await page.screenshot({ path: "skeld-storage.png" });
  console.log("Saved skeld-storage.png");

  // 4. Electrical
  console.log("Teleporting to Electrical...");
  await page.evaluate(() => {
    const p = window.__bbPlayer;
    if (p) { p.pos.x = -14; p.pos.z = 12; }
  });
  await sleep(1000);
  await page.screenshot({ path: "skeld-electrical.png" });
  console.log("Saved skeld-electrical.png");

  // 5. Reactor
  console.log("Teleporting to Reactor...");
  await page.evaluate(() => {
    const p = window.__bbPlayer;
    if (p) { p.pos.x = -52; p.pos.z = 0; }
  });
  await sleep(1000);
  await page.screenshot({ path: "skeld-reactor.png" });
  console.log("Saved skeld-reactor.png");

  // 6. Test Interactive Wiring Task Modal
  console.log("Testing Electrical Wiring Task Modal...");
  await page.evaluate(async () => {
    const { launchTaskModal } = await import("/src/tasks.js");
    launchTaskModal("electrical-wiring", (k) => {
      window.__wiringSolved = k;
    });
  });
  await sleep(800);
  await page.screenshot({ path: "skeld-task-wiring.png" });
  console.log("Saved skeld-task-wiring.png");

  // Solve all 4 wires
  console.log("Connecting wires...");
  await page.evaluate(() => {
    const lefts = Array.from(document.querySelectorAll(".left-col .wire-port"));
    const rights = Array.from(document.querySelectorAll(".right-col .wire-port"));
    lefts.forEach((l) => {
      l.click();
      const col = l.getAttribute("data-color");
      const match = rights.find((r) => r.getAttribute("data-color") === col);
      if (match) match.click();
    });
  });
  await sleep(1800);

  const solved = await page.evaluate(() => window.__wiringSolved || null);
  console.log("Wiring Task Solved Result:", solved);

  console.log("Errors logged:", errors);
  await browser.close();
  console.log("The Skeld facility test completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
