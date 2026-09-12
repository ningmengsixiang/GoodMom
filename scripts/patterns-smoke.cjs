/* 验证 preview/patterns.html（V2.5 新增能力示例页）真实渲染与交互
   运行：node /tmp/gm-patterns/run.cjs */
/* 示例页渲染回归（V2.5）：用 Playwright 真机打开 preview/patterns.html，断言 DOM/交互/暗色/窗口化。
   依赖：根 node_modules 的 playwright（chromium headless shell）。用法：node scripts/patterns-smoke.cjs */
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { chromium } = require(ROOT + "/node_modules/playwright");
const CHROME = process.env.GM_CHROMIUM || (process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");

const out = [];
const chk = (name, cond, extra) =>
  out.push((cond ? "PASS  " : "FAIL  ") + name + (extra !== undefined ? "   [" + JSON.stringify(extra) + "]" : ""));

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto("file://" + ROOT + "/preview/patterns.html");
  await page.waitForTimeout(400);

  // ── 1 Link ──
  chk("Link 元素数 ≥ 9", (await page.locator(".lk").count()) >= 9, await page.locator(".lk").count());
  chk("禁用链接 aria-disabled", (await page.locator(".lk.dis").getAttribute("aria-disabled")) === "true");
  const ext = page.locator('a.lk[target="_blank"]').first();
  chk("外链 target/rel", (await ext.getAttribute("rel") || "").includes("noopener"));
  chk("外链读屏后缀", (await ext.locator(".sr").innerText()).includes("新窗口"));

  // ── 2 Cascader popup ──
  const pop = page.locator("#cas-popup");
  chk("popup 初始为关闭", !(await pop.evaluate((el) => el.classList.contains("open"))));
  await pop.locator(".cas-t").click();
  await page.waitForTimeout(120);
  chk("popup 打开后 aria-expanded=true", (await pop.locator(".cas-t").getAttribute("aria-expanded")) === "true");
  chk("popup 列数=1", (await pop.locator(".cas-col").count()) === 1, await pop.locator(".cas-col").count());
  await pop.locator(".cas-o", { hasText: "市妇幼保健院" }).click();
  await page.waitForTimeout(80);
  chk("选一级后列数=2（不提交）", (await pop.locator(".cas-col").count()) === 2, await pop.locator(".cas-col").count());
  await pop.locator(".cas-o", { hasText: "孕产保健科" }).click();
  await page.waitForTimeout(80);
  chk("选二级后列数=3", (await pop.locator(".cas-col").count()) === 3, await pop.locator(".cas-col").count());
  await pop.locator(".cas-o", { hasText: "产科门诊" }).click();
  await page.waitForTimeout(150);
  chk("选叶子后关闭", !(await pop.evaluate((el) => el.classList.contains("open"))));
  chk("触发条回填全路径", (await pop.locator(".cas-t").innerText()).includes("产科门诊"), (await pop.locator(".cas-t").innerText()).trim());

  // ── 3 Cascader inline ──
  chk("inline 常显 1 列", (await page.locator("#cas-inline .cas-col").count()) >= 1);

  // ── 4 Cascader picker（移动底部多列） ──
  await page.locator("#cas-open").click();
  await page.waitForTimeout(200);
  chk("picker 遮罩出现", (await page.locator(".cas-mask").count()) === 1);
  chk("picker 面板 role=dialog", (await page.locator(".cas-sheet").getAttribute("role")) === "dialog");
  chk("picker 确定初始禁用", await page.locator(".cas-sheet [data-ok]").isDisabled());
  await page.locator(".cas-sheet .cas-o", { hasText: "区人民医院" }).click();
  await page.waitForTimeout(80);
  await page.locator(".cas-sheet .cas-o", { hasText: "妇产科" }).click();
  await page.waitForTimeout(80);
  await page.locator(".cas-sheet .cas-o", { hasText: "产科一区" }).click();
  await page.waitForTimeout(80);
  chk("picker 选到叶子后确定可用", !(await page.locator(".cas-sheet [data-ok]").isDisabled()));
  await page.locator(".cas-sheet [data-ok]").click();
  await page.waitForTimeout(150);
  chk("picker 确定后收起", (await page.locator(".cas-sheet").count()) === 0);

  // ── 5 ResponsiveView：容器宽度驱动三形态 ──
  const modeText = async () => (await page.locator("#rv-mode").innerText());
  const shape = async () => {
    const t = await page.locator("#rv-out table.gm").count();
    const c = await page.locator("#rv-out .cd").count();
    return t > 0 ? "table" : c > 0 ? "card" : "?";
  };
  await page.evaluate(() => { document.getElementById("rv-box").style.width = "1200px"; });
  await page.waitForTimeout(250);
  chk("宽容器 → table 形态", (await shape()) === "table", await modeText());
  await page.evaluate(() => { document.getElementById("rv-box").style.width = "900px"; });
  await page.waitForTimeout(250);
  chk("中容器 → condensed（无卡片/仍为表）", (await shape()) === "table", await modeText());
  chk("condensed 列数减少（4 列）", (await page.locator("#rv-out table.gm th").count()) === 4, await page.locator("#rv-out table.gm th").count());
  await page.evaluate(() => { document.getElementById("rv-box").style.width = "420px"; });
  await page.waitForTimeout(250);
  chk("窄容器 → card 形态", (await shape()) === "card", await modeText());
  chk("卡片流 role=list/listitem", (await page.locator('#rv-out [role="list"] [role="listitem"]').count()) === 5);
  chk("卡片含 dl 键值对", (await page.locator("#rv-out .cd dl dd").count()) >= 20);
  await page.locator('[data-rv="table"]').click();
  await page.waitForTimeout(150);
  chk("锁定 table 覆盖容器宽度", (await shape()) === "table");
  await page.locator('[data-rv="auto"]').click();
  await page.evaluate(() => { document.getElementById("rv-box").style.width = "1200px"; });
  await page.waitForTimeout(200);

  // ── 6 VirtualList ──
  const rows = await page.locator(".vl-it").count();
  chk("窗口化：DOM 行数 < 25（数据 1284）", rows > 0 && rows < 25, rows);
  chk("行高/总高正确", (await page.locator("#vl-in").evaluate((el) => el.style.height)) === "66768px",
      await page.locator("#vl-in").evaluate((el) => el.style.height));
  chk("aria-posinset/setsize", (await page.locator(".vl-it").first().getAttribute("aria-posinset")) === "1" &&
      (await page.locator(".vl-it").first().getAttribute("aria-setsize")) === "1284");
  await page.locator("#vl-vp").evaluate((el) => { el.scrollTop = 20000; });
  await page.waitForTimeout(200);
  chk("滚动后渲染窗口位移", (await page.locator("#vl-idx").innerText()) !== "0", await page.locator("#vl-idx").innerText());
  chk("滚动后 DOM 行数仍 < 25", (await page.locator(".vl-it").count()) < 25, await page.locator(".vl-it").count());
  await page.locator("#vl-vp").evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(250);
  chk("触底触发 onEndReached 一次", (await page.locator("#vl-end").innerText()) === "1", await page.locator("#vl-end").innerText());
  await page.locator("#vl-vp").focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(200);
  chk("键盘 Home 回到顶部", (await page.locator("#vl-vp").evaluate((el) => el.scrollTop)) === 0);

  // ── 7 暗黑模式 ──
  const bodyBg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const lightBg = await bodyBg();
  await page.locator("#dk-toggle").click();
  await page.waitForTimeout(250);
  chk("data-theme=dark 生效", (await page.evaluate(() => document.documentElement.getAttribute("data-theme"))) === "dark");
  const darkBg = await bodyBg();
  chk("整体背景切暗（#1B1A21）", darkBg === "rgb(27, 26, 33)", darkBg);
  const dkText = await page.locator("#dk-demo").evaluate((el) => getComputedStyle(el.querySelector("h3")).color);
  chk("暗色文字 #F3EFEC", dkText === "rgb(243, 239, 236)", dkText);
  await page.locator("#dk-toggle").click();
  await page.waitForTimeout(200);
  chk("恢复浅色", (await bodyBg()) === lightBg);
  await page.locator("#dk-demo").evaluate((el) => el.setAttribute("data-theme", "dark")); // 局部暗色
  await page.waitForTimeout(150);
  chk("局部暗色容器仍可读", (await page.locator("#dk-demo h3").evaluate((el) => getComputedStyle(el).color)) === "rgb(243, 239, 236)");

  // ── 8 边框档 ──
  const bws = await page.locator(".bw .bx").evaluateAll((els) => els.map((e) => getComputedStyle(e).borderTopWidth));
  chk("边框档自 1px 起、最高档 2px（DPR1 下 1.5px 被浏览器吸附到 1px，属预期）", bws[0] === "1px" && bws[3] === "2px", bws);

  // ── 9 布局体检（无横向溢出 / 区块可见 / 移动视口） ──
  const overflow = async () => page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
    wide: [].slice.call(document.querySelectorAll("body *")).filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
      .map((e) => e.className || e.tagName).slice(0, 4),
  }));
  let ov = await overflow();
  chk("桌面 1400：无横向溢出", ov.scrollW <= ov.innerW + 1, ov);
  const secHeights = await page.locator("section.sec").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  chk("6 个区块均有实际高度", secHeights.length === 6 && secHeights.every((h) => h > 120), secHeights);
  const overlap = await page.evaluate(() => {
    const a = document.querySelectorAll("section.sec");
    for (let i = 1; i < a.length; i++) if (a[i].getBoundingClientRect().top < a[i - 1].getBoundingClientRect().bottom - 2) return i;
    return -1;
  });
  chk("区块不重叠", overlap === -1, overlap);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  ov = await overflow();
  chk("移动 390：无横向溢出", ov.scrollW <= ov.innerW + 1, ov);
  const trig = await page.locator("#cas-popup .cas-t").evaluate((e) => Math.round(e.getBoundingClientRect().width));
  chk("移动端级联触发条满宽（≥300）", trig >= 300, trig);
  chk("移动端 6 区块仍在", (await page.locator("section.sec").count()) === 6);
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.waitForTimeout(200);

  await page.evaluate(() => document.getElementById("dk-demo").removeAttribute("data-theme"));
  await page.waitForTimeout(150);
  await page.screenshot({ path: "/tmp/gm-patterns-full.png", fullPage: true });
  await page.locator("#dk-demo").evaluate((el) => el.setAttribute("data-theme", "dark"));
  await page.screenshot({ path: "/tmp/gm-patterns-dark.png", fullPage: true });

  await browser.close();
  console.log(out.join("\n"));
  const fails = out.filter((l) => l.startsWith("FAIL")).length;
  console.log("\n== " + (out.length - fails) + "/" + out.length + " PASS ==");
  if (errors.length) console.log("页面错误：\n" + errors.join("\n")); else console.log("页面无 console/page 错误");
  process.exit(fails || errors.length ? 1 : 0);
})();
