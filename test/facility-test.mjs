import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log("Launching Chrome...");
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
  await page.setViewport({ width: 1200, height: 750 });

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("c:" + m.text());
  });

  console.log("Navigating to http://localhost:5173/...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(600);

  // Type name and enter solo mode
  await page.type("#name-input", "Operative");
  await page.click("#btn-solo");
  console.log("Entering 3D Continuous Facility...");
  await sleep(3500); // Give time for modular models and GLBs to assemble

  // Check canvas and containment HUD
  const canvasExists = await page.$eval("#game-root canvas", (c) => c.width > 0).catch(() => false);
  const hudText = await page.$eval("#containment-hud", (e) => e.innerText).catch(() => "");
  console.log("Containment HUD Text:", JSON.stringify(hudText));

  // Take screenshot of Central Hub
  await page.screenshot({ path: "central-hub.png" });
  console.log("Saved central-hub.png");

  // Check window.__bbPortals
  const portals = await page.evaluate(() => window.__bbPortals || []);
  console.log("Discovered Portals:", portals);

  // Check player pos
  const initialPos = await page.evaluate(() => {
    const p = window.__bbPlayer;
    return p ? { x: +p.pos.x.toFixed(1), y: +p.pos.y.toFixed(1), z: +p.pos.z.toFixed(1) } : null;
  });
  console.log("Initial Player Pos:", initialPos);

  // Walk player towards North Wing (Sector Alpha - Neural Bay, z = -22)
  console.log("Navigating to Sector Alpha (Neural Bay)...");
  await page.evaluate(() => {
    const p = window.__bbPlayer;
    if (p) {
      p.pos.x = 0;
      p.pos.z = -22.5;
    }
  });
  await sleep(1000);
  await page.screenshot({ path: "sector-alpha.png" });
  console.log("Saved sector-alpha.png");

  // Test opening a Cyber Task Modal
  console.log("Testing Task Modal launch...");
  await page.evaluate(async () => {
    const { launchTaskModal } = await import("/src/tasks.js");
    launchTaskModal("prompt-filter", (k) => {
      window.__taskCompleted = k;
    });
  });
  await sleep(800);
  const modalVisible = await page.$eval("#task-modal", (e) => !e.classList.contains("hidden")).catch(() => false);
  const taskTitle = await page.$eval("#task-modal .task-title", (e) => e.textContent).catch(() => "");
  console.log("Modal Visible:", modalVisible, "Task Title:", taskTitle);
  await page.screenshot({ path: "task-modal.png" });
  console.log("Saved task-modal.png");

  // Click the malicious prompt in the task
  console.log("Solving prompt injection task...");
  const maliciousClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll(".prompt-btn"));
    const bad = btns.find((b) => b.getAttribute("data-safe") === "false");
    if (bad) {
      bad.click();
      return true;
    }
    return false;
  });
  console.log("Malicious prompt clicked:", maliciousClicked);
  await sleep(1800);

  const completed = await page.evaluate(() => window.__taskCompleted || null);
  console.log("Task Completed Result:", completed);

  console.log("Errors logged during run:", errors);

  await browser.close();
  console.log("Test finished successfully!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
