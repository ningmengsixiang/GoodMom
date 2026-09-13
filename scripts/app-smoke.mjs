/**
 * 产品工程 UI 冒烟（frontend-app）
 *
 * 用法（需先起 dev server，脚本会自己等它就绪）：
 *   cd frontend-app && npm run dev          # http://localhost:3081
 *   node scripts/app-smoke.mjs
 * 或在 CI 里由同一条 run 块起停（见 .github/workflows/ci.yml 的 app-smoke）。
 *
 * 为什么单开一支：`mobile-smoke.mjs` 守的是**设计系统站内的移动端模块**（site/index.html），
 * 与应用（React + Arco + @goodmom/ui 的产品工程）是两件事。应用侧此前只有
 * typecheck + 构建 + 架构门禁 —— 这些都能全绿而页面照样是坏的
 * （V2.9 实测：`useRequest` 在 StrictMode 下永久停在骨架，控制台干净、页面"就是没数据"）。
 *
 * 断言分两层：
 *   A. 结构与三端形态（路由、TabBar/侧栏、列表 ↔ 表格降级、暗色、权限守卫）
 *   B. 四态可被**确定性**演出来（加载 / 空 / 错 / 重试），靠开发期 QA 开关
 *      `window.__GM_MOCK`，不靠断网也不靠改代码
 */
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://localhost:3081/";
const results = [];
let failed = 0;
function check(name, pass, detail = "") {
  if (!pass) failed++;
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();

/* ══ A. 移动档（390×844）：结构与形态 ══════════════════════════════ */
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await mob.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));
const TAB = (t) => page.locator(".app-tabbar a", { hasText: t });

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
check("默认落到工作台路由", page.url().includes("#/workbench"), page.url().split("#")[1] || "(无 hash)");
check("顶栏标题渲染", (await page.locator(".app-top__title").textContent()).includes("今日待办"));
check("底部 TabBar 4 项（10.3.2：3–5 项）", (await page.locator(".app-tabbar a").count()) === 4,
  `${await page.locator(".app-tabbar a").count()} 项`);
check("移动档隐藏侧栏（左侧栏移动端禁用）", !(await page.locator(".app-side").isVisible()));
check("列表行是 button（键盘与读屏可达）", (await page.locator("button.gm-listrow").count()) > 0);
check("状态标签来自 15 章词库", (await page.locator(".gm-status-tag").count()) > 0);

await page.locator("button.gm-listrow").first().click();
await page.waitForTimeout(900);
check("点行进入档案详情（路由参数生效）", page.url().includes("#/archive/"), page.url().split("#")[1]);
check("详情页渲染服务对象卡", (await page.locator('[class*="gm-client"]').count()) > 0);

await TAB("随访队列").click();
await page.waitForTimeout(1000);
check("TabBar 切页到随访队列", page.url().includes("#/followup"));
check("队列渲染（仅未结案：5 条里筛出 4 条）", (await page.locator(".gm-listrow").count()) === 4,
  `${await page.locator(".gm-listrow").count()} 行`);
const beforeToggle = await page.locator(".gm-listrow").count();
await page.locator("button.gm-btn", { hasText: "仅未结案" }).click();
await page.waitForTimeout(500);
check("切换筛选改变列表条数", (await page.locator(".gm-listrow").count()) > beforeToggle,
  `${beforeToggle} → ${await page.locator(".gm-listrow").count()}`);

await TAB("数据中心").click();
await page.waitForTimeout(1200);
const rings = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".gm-progress"))
    .filter((e) => e.querySelector("svg"))
    .map((e) => Math.round(e.getBoundingClientRect().width)));
check("环形进度直径生效（96 / 72 两档；GmProgress 走 width 的回归位）",
  rings.some((w) => w >= 94 && w <= 100) && rings.some((w) => w >= 70 && w <= 76), JSON.stringify(rings));

await page.locator(".app-top button.gm-btn", { hasText: "暗色" }).click();
await page.waitForTimeout(400);
check("暗色档挂在 html 上（19.7：只换 Token）",
  await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark"));

/* 权限守卫：机构运营仅 admin */
await page.goto(`${BASE}#/institution`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
check("非授权角色看到权限提示而非白屏/报错",
  (await page.locator('[class*="gm-result"]').count()) > 0);

/* ══ B. 四态：加载 / 空 / 错 / 重试（确定性）════════════════════════ */
await page.goto(`${BASE}#/followup`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);
check("开发期 QA 开关已注入", await page.evaluate(() => typeof window.__GM_MOCK === "object"));

await page.evaluate(() => window.__GM_MOCK.setDelay(1600));
await TAB("今日待办").click();
await page.waitForTimeout(250);
check("加载态：GmSkeleton 出现", (await page.locator(".gm-skeleton").count()) > 0);
await page.waitForTimeout(2000);
check("加载态：骨架让位给数据",
  (await page.locator(".gm-skeleton").count()) === 0 && (await page.locator(".gm-listrow").count()) > 0);

await page.evaluate(() => { window.__GM_MOCK.setDelay(60); window.__GM_MOCK.fail("/workbench/today", true); });
await page.locator(".app-top button.gm-btn", { hasText: "组件演示" }).click();
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('.app-tabbar a[href*="workbench"]')?.click());
await page.waitForTimeout(900);
check("错误态：GmResult 三通道渲染", (await page.locator('[class*="gm-result"]').count()) > 0);
check("错误态：给出可执行动作", (await page.getByText("重新加载").count()) > 0);
await page.evaluate(() => window.__GM_MOCK.fail("/workbench/today", false));
await page.getByText("重新加载").first().click();
await page.waitForTimeout(1200);
check("错误态：重试后恢复有数据", (await page.locator(".gm-listrow").count()) > 0);

await page.evaluate(() => { window.__GM_MOCK.empty("/workbench/today", true); window.__GM_MOCK.clearCache(); });
await page.locator(".app-top button.gm-btn", { hasText: "组件演示" }).click();
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('.app-tabbar a[href*="workbench"]')?.click());
await page.waitForTimeout(900);
check("空态：GmEmpty 文案 + 行动", (await page.getByText("今天没有待办").count()) > 0
  && (await page.getByText("去随访队列").count()) > 0);

check("移动档无控制台错误 / 未捕获异常", errors.length === 0, errors.slice(0, 3).join(" | "));

/* ══ C. 桌面档（1440）：侧栏 + 表格降级 ═══════════════════════════ */
await mob.close();
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desk.newPage();
const derr = [];
dp.on("pageerror", (e) => derr.push(String(e).split("\n")[0]));
await dp.goto(`${BASE}#/archive`, { waitUntil: "domcontentloaded" });
await dp.waitForTimeout(1200);
check("桌面档显示侧栏", await dp.locator(".app-side").isVisible());
check("桌面档隐藏 TabBar", !(await dp.locator(".app-tabbar").isVisible()));
check("桌面档档案页用玻璃表格（10.5.3 降级另一半）", (await dp.locator(".arco-table").count()) > 0);
check("桌面档无控制台错误", derr.length === 0, derr.slice(0, 2).join(" | "));

await browser.close();

console.log(`\n${results.length - failed}/${results.length} 通过`);
if (failed) {
  console.log("失败项：" + results.filter((r) => !r.pass).map((r) => r.name).join("、"));
  process.exit(1);
}
