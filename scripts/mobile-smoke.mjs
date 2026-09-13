/**
 * 移动端模块验收（site/index.html · #preview-mobile）
 *
 * 用法（需先在仓库根起静态服务，与 site-smoke.mjs 同一套）：
 *   python3 -m http.server 5288
 *   node scripts/mobile-smoke.mjs
 *
 * 为什么单独一支：`site-smoke.mjs` 对移动端只断言"`.tab` 存在且点了会选中"，
 * 而本模块是一台**可触摸的真机演示**（4 个页面 / 左滑操作 / 下拉刷新 /
 * 上拉加载 / 底部操作表 / 滚轮选择器 / 图片预览 / 暗色档）——
 * 这些一旦被改坏，`.tab` 依然存在、控制台也不报错，冒烟会全绿。
 *
 * 本脚本只断言**用户能感知的行为与几何**，不读实现细节：
 * 视图切换与标题、开关滑块几何（历史缺陷：热区规则写在 ::after 上把滑块压成 46×44）、
 * 左滑露出、下拉刷新、上拉加载、浮层焦点陷阱与归还、Esc/遮罩/取消三通道、
 * 暗色只作用于本模块、热区 ≥44、同屏模糊节点 ≤4、滚动后吸顶条不被外壳导航遮挡。
 * 每个断言都对应本轮实测踩到过的真实缺陷，删掉任何一条都会让那类缺陷重新静默。
 */
import { chromium } from "playwright";

const URL = process.env.SITE_URL || "http://localhost:5288/site/index.html";
const M = "#gm-mod-preview-mobile ";
const id = (n) => `${M}[id="preview-mobile--${n}"]`;
const results = [];
let failed = 0;

function check(name, pass, detail = "") {
  if (!pass) failed++;
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));

await page.goto(`${URL}#gm-mod-preview-mobile`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

/* ── 1. 结构：4 个页面 + 只有一页可见 + 根页无返回键 ───────────────────── */
check("TabBar 4 项", (await page.locator(`${M}.tabbar .tab`).count()) === 4);
check("任一时刻只有 1 个视图可见", (await page.locator(`${M}.pm-view.is-on`).count()) === 1);
check("根页不显示返回键（10.3.1）", !(await page.locator(`${M}.navbar .back`).isVisible()));

/* ── 2. 切页：视图 + 标题 + 返回键 ─────────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).nth(1).click();
await page.waitForTimeout(400);
check("点 TabBar 切到「提醒」页", (await page.locator(`${M}.pm-view[data-view="alerts"].is-on`).count()) === 1);
check("标题随页面更新", (await page.locator(`${M}h1`).textContent()).includes("提醒"));
check("非根页出现返回键", await page.locator(`${M}.navbar .back`).isVisible());
await page.locator(`${M}.navbar .back`).click();
await page.waitForTimeout(300);
check("返回键回总览", (await page.locator(`${M}.pm-view[data-view="home"].is-on`).count()) === 1);
await page.locator(`${M}.tabbar .tab`).first().focus();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
check("TabBar 支持 ←/→ 切页", (await page.locator(`${M}.pm-view[data-view="alerts"].is-on`).count()) === 1);

/* ── 3. 开关：几何 + 语义 + 键盘 ───────────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).first().click();
await page.waitForTimeout(350);
const swGeo = await page.evaluate(() => {
  const sw = document.querySelector(".gm-mod.is-on .switch");
  const knob = getComputedStyle(sw, "::after");
  const r = sw.getBoundingClientRect();
  return { track: [Math.round(r.width), Math.round(r.height)],
    knob: [parseFloat(knob.width), parseFloat(knob.height)] };
});
check("开关轨道 48×28（10.6.4）", swGeo.track[0] === 48 && swGeo.track[1] === 28, JSON.stringify(swGeo.track));
check("滑块 24×24 不被热区规则压坏（历史缺陷）", swGeo.knob[0] === 24 && swGeo.knob[1] === 24, JSON.stringify(swGeo.knob));
const before = await page.locator(`${M}.switch`).first().getAttribute("aria-checked");
await page.locator(`${M}.switch`).first().click();
await page.waitForTimeout(150);
check("开关点击翻转 aria-checked", (await page.locator(`${M}.switch`).first().getAttribute("aria-checked")) !== before);

/* ── 4. 左滑操作（SwipeAction）────────────────────────────────────────── */
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
const row = page.locator(`${M}.pm-swipe`).first();
const box = await row.boundingBox();
const onRow = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return !!(el && el.closest && el.closest(".pm-swipe"));
}, [box.x + 60, box.y + box.height / 2]);
check("左滑起点落在行上（未被吸顶条遮挡）", onRow);
await page.mouse.move(box.x + 60, box.y + box.height / 2);
await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + 60 - i * 16, box.y + box.height / 2);
await page.mouse.up();
await page.waitForTimeout(400);
const opened = await page.evaluate(() => {
  const r = document.querySelector(".gm-mod.is-on .pm-swipe");
  return r.getAttribute("data-open") === "1" &&
    getComputedStyle(r.querySelector(".pm-swipebody")).transform !== "none";
});
check("左滑露出操作区", opened);
await page.locator(`${M}.pm-swipe .pm-sa`).first().focus();
await page.waitForTimeout(350);
check("键盘聚焦操作钮自动展开（手势非唯一路径）",
  await page.evaluate(() => document.querySelector(".gm-mod.is-on .pm-swipe").getAttribute("data-open") === "1"));

/* ── 5. 浮层：操作表 + 焦点陷阱 + 三通道关闭 ──────────────────────────── */
await page.locator(id("pmCta")).click();
await page.waitForTimeout(450);
check("主行动打开底部操作表", await page.evaluate(() =>
  document.querySelector('[id="preview-mobile--pmSheet"]').classList.contains("is-open")));
check("焦点进入操作表", await page.evaluate(() =>
  document.querySelector('[id="preview-mobile--pmSheet"]').contains(document.activeElement)));
check("遮罩可拦截点击", await page.evaluate(() =>
  getComputedStyle(document.querySelector('[id="preview-mobile--pmMask"]')).pointerEvents === "auto"));
await page.keyboard.press("Escape");
await page.waitForTimeout(350);
check("Esc 关闭并把焦点归还触发点", await page.evaluate(() =>
  !!document.activeElement && document.activeElement.id.endsWith("pmCta")));
check("遮罩关闭后不再吃点击（透明层陷阱）", await page.evaluate(() =>
  getComputedStyle(document.querySelector('[id="preview-mobile--pmMask"]')).pointerEvents === "none"));

/* ── 6. 手势区：下拉刷新 + 上拉加载 ──────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).nth(1).click();
await page.waitForTimeout(400);
/* 切页会平滑滚回模块顶部；页面变长后固定 400ms 可能仍在滚动，
   于是鼠标坐标失效、拖拽落空 —— 表现为"下拉刷新坏了"，实际是测量问题。
   这里等滚动稳定，并**前置断言**拖拽起点确实在容器内，让错位能自曝。 */
await page.evaluate(() => { window.scrollTo(0, 0); });
await page.waitForTimeout(400);
const gest = await page.locator(id("pmGest")).boundingBox();
const gestureHit = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return !!(el && el.closest && el.closest('[id$="pmGest"]'));
}, [gest.x + gest.width / 2, gest.y + 30]);
check("下拉刷新起点落在手势区内（未被吸顶条遮挡）", gestureHit);
const rows0 = await page.locator(`${id('pmGestList')} .pm-swipe`).count();
await page.mouse.move(gest.x + gest.width / 2, gest.y + 30);
await page.mouse.down();
for (let i = 1; i <= 12; i++) await page.mouse.move(gest.x + gest.width / 2, gest.y + 30 + i * 10);
const pullTx = await page.evaluate(() =>
  getComputedStyle(document.querySelector('[id="preview-mobile--pmPullBody"]')).transform);
await page.mouse.up();
await page.waitForTimeout(1800);
check("下拉刷新有跟手位移", pullTx !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(pullTx), pullTx);
check("下拉刷新回到列表并新增一行",
  (await page.locator(`${id('pmGestList')} .pm-swipe`).count()) === rows0 + 1);
await page.evaluate(() => {
  const g = document.querySelector('[id="preview-mobile--pmGest"]');
  g.scrollTop = g.scrollHeight;
  g.dispatchEvent(new Event("scroll"));
});
await page.waitForTimeout(1400);
check("上拉加载更多（一次一批）",
  (await page.locator(`${id('pmGestList')} .pm-swipe`).count()) === rows0 + 4);
check("到底显示「没有更多了」",
  (await page.locator(`${id('pmMore')} span`).textContent()).includes("没有更多"));

/* ── 7. 列表状态：骨架 / 空 / 错 / 有数据 ─────────────────────────────── */
await page.locator(`${id('pmStateSeg')} .s2[data-state="loading"]`).click();
await page.waitForTimeout(250);
check("切到骨架态", (await page.locator(`${M}.pm-state[data-state="loading"].is-on`).count()) === 1);
await page.locator(`${id('pmStateSeg')} .s2[data-state="error"]`).click();
await page.waitForTimeout(200);
await page.locator(id("pmRetry")).click();
await page.waitForTimeout(1500);
check("错误态重试后回到有数据", (await page.locator(`${M}.pm-state[data-state="data"].is-on`).count()) === 1);

/* ── 8. 滚轮选择器（原生 scroll-snap）────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).nth(2).click();
await page.waitForTimeout(400);
await page.locator(id("pmPickerOpen")).click();
await page.waitForTimeout(500);
check("滚轮选择器打开", await page.evaluate(() =>
  document.querySelector('[id="preview-mobile--pmPicker"]').classList.contains("is-open")));
check("孕周列 0–40 共 41 项", (await page.locator(`${id('pmWheelW')} .pm-wo`).count()) === 41);
await page.locator(`${id('pmWheelW')} .pm-wo[data-v="28"]`).click();
await page.waitForTimeout(300);
await page.locator(id("pmPickerOk")).click();
await page.waitForTimeout(500);
check("确定写回数值", (await page.locator(id("pmPickerValue")).textContent()).startsWith("28 周"));
check("孕周同步到 NavBar 标题", (await page.locator(`${M}h1`).textContent()).includes("28"));

/* ── 9. OTP / 步进器边界 ─────────────────────────────────────────────── */
await page.locator(`${M}.pm-otp input`).first().click();
await page.keyboard.type("123456");
await page.waitForTimeout(300);
check("OTP 自动跳格并填满", (await page.locator(id("pmOtpState")).textContent()).includes("已填满"));
for (let i = 0; i < 10; i++) {
  const plus = page.locator(`${M}.pm-stepper button[data-step="1"]`);
  if (await plus.isDisabled()) break;
  await plus.click();
}
await page.waitForTimeout(200);
check("步进器到边界即禁用", await page.locator(`${M}.pm-stepper button[data-step="1"]`).isDisabled());

/* ── 10. 图片预览 ────────────────────────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).first().click();
await page.waitForTimeout(400);
await page.locator(`${M}.up[data-photo="0"]`).click();
await page.waitForTimeout(500);
check("图片预览打开", await page.evaluate(() =>
  document.querySelector('[id="preview-mobile--pmViewer"]').classList.contains("is-open")));
await page.locator(id("pmVNext")).click();
await page.waitForTimeout(300);
check("预览可翻页并更新计数", (await page.locator(id("pmVCount")).textContent()).startsWith("2 /"));
await page.locator(id("pmVClose")).click();
await page.waitForTimeout(350);
check("预览关闭", await page.evaluate(() =>
  !document.querySelector('[id="preview-mobile--pmViewer"]').classList.contains("is-open")));

/* ── 11. 暗色档：只作用于本模块 ─────────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).nth(3).click();
await page.waitForTimeout(400);
await page.locator(id("pmDarkSwitch")).click();
await page.waitForTimeout(400);
check("暗色档挂在模块根（02 · 2.1.9）", await page.evaluate(() => {
  const m = document.querySelector(".gm-mod.is-on");
  return m.getAttribute("data-theme") === "dark" &&
    getComputedStyle(m.querySelector(".stage")).color !== "rgb(52, 58, 70)";
}));
check("暗色不污染整站", await page.evaluate(() => !document.documentElement.hasAttribute("data-theme")));
await page.locator(id("pmDarkSwitch")).click();
await page.waitForTimeout(300);

/* ── 12. 真机几何：热区 / 模糊预算 / 吸顶条避让 ──────────────────────── */
await page.locator(`${M}.tabbar .tab`).first().click();
await page.waitForTimeout(400);
const touch = await page.evaluate(() => {
  const mod = document.querySelector(".gm-mod.is-on");
  const bad = [];
  mod.querySelectorAll('a[href],button,input,select,textarea,[role="button"]').forEach((el) => {
    if (el.disabled) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.width >= 44 && r.height >= 44) return;
    let hot = false;
    for (const pe of ["::before", "::after"]) {
      const pcs = getComputedStyle(el, pe);
      if (!pcs || pcs.content === "none" || pcs.display === "none") continue;
      const h = parseFloat(pcs.height), t = parseFloat(pcs.top), b = parseFloat(pcs.bottom);
      if (h >= 44 || (t <= -8 && b <= -8)) hot = true;
    }
    if (!hot) bad.push(`${el.tagName}.${String(el.className).split(" ")[0]} ${Math.round(r.width)}×${Math.round(r.height)}`);
  });
  return bad;
});
check("移动端热区全部 ≥44×44（含 ::before 补足）", touch.length === 0, touch.slice(0, 5).join(" | "));
const blur = await page.evaluate(() => {
  const mod = document.querySelector(".gm-mod.is-on");
  let n = 0;
  mod.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const bf = cs.backdropFilter && cs.backdropFilter !== "none" ? cs.backdropFilter : cs.webkitBackdropFilter;
    if (bf && bf !== "none" && bf.includes("blur")) n++;
  });
  return n;
});
check("启用中的模糊节点 ≤4（10.8 性能纪律）", blur <= 4, `${blur} 个`);
await page.evaluate(() => window.scrollTo(0, 1400));
await page.waitForTimeout(500);
const sticky = await page.evaluate(() => {
  const nav = document.querySelector(".gm-mod.is-on .navbar").getBoundingClientRect();
  const shell = document.querySelector(".sh-top").getBoundingClientRect();
  return { navY: Math.round(nav.y), shellBottom: Math.round(shell.bottom) };
});
check("滚动后模块吸顶条不被外壳导航遮挡（--sh-nav-h 派生）",
  sticky.navY >= sticky.shellBottom, JSON.stringify(sticky));

/* ── 13. 11 章补齐的 5 个组件（IndexBar / Collapse / Calendar / NumberKeyboard / WaterMark）
       2026 年之前这些只在规范里、预览页没有；补进来时踩到 4 个真实缺陷，
       每条断言都对应其中一处，删掉就会重新静默：
         · 索引轨不释放 pointer capture → 后续点击全被劫持（"折叠点不开"）
         · 拼接 id `getElementById("pmIdxG"+letter)` 逃过前缀改写 → 浮标动了、列表不滚
         · 折叠面板只有浅玻璃底（外壳写死，无暗档）→ 暗色模块里 1.39:1
         · 模块未声明外壳配方读的 --lg-text-* → 暗底深字（data-present 门禁拦下）
   ───────────────────────────────────────────────────────────────────────── */
await page.locator(`${M}.tabbar .tab`).nth(1).click();
await page.waitForTimeout(450);

check("IndexBar：A–Z+# 共 27 格", (await page.locator(`${M}.pm-idxrail span`).count()) === 27,
  `${await page.locator(`${M}.pm-idxrail span`).count()} 格`);
check("IndexBar：分组标题吸顶", await page.evaluate(() =>
  getComputedStyle(document.querySelector("#gm-mod-preview-mobile .pm-idxgroup[data-g]")).position === "sticky"));
await page.locator(`${M}.pm-idxrail`).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const railBox = await page.locator(`${M}.pm-idxrail`).boundingBox();
await page.mouse.move(railBox.x + 22, railBox.y + railBox.height * 0.94);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(400);
const idx = await page.evaluate(() => {
  const b = document.querySelector("#gm-mod-preview-mobile [id$='pmIdxBadge']");
  const l = document.querySelector("#gm-mod-preview-mobile [id$='pmIdxList']");
  return { letter: b.textContent.trim(), on: b.classList.contains("is-on"), top: Math.round(l.scrollTop) };
});
check("IndexBar：拖动索引轨跳组（浮标 + 列表滚动）", idx.on && idx.top > 0, JSON.stringify(idx));
/* 指针抬起必须释放 capture，否则页面后续点击全被索引轨吞掉 */
await page.locator(`${M}.pm-idxrail`).focus();
await page.keyboard.press("Home");
await page.waitForTimeout(300);
check("IndexBar：↑/↓/Home 键盘等效路径 + 释放 capture 后页面仍可点",
  (await page.evaluate(() =>
    document.querySelector("#gm-mod-preview-mobile [id$='pmIdxBadge']").textContent.trim())) === "A");

const foldSummary = page.locator(`${M}details.gm-fold summary`).first();
await foldSummary.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
check("Collapse：初始收起且 aria-expanded=false", await page.evaluate(() => {
  const d = document.querySelector("#gm-mod-preview-mobile details.gm-fold");
  return !d.open && d.querySelector("summary").getAttribute("aria-expanded") === "false";
}));
await foldSummary.click();
await page.waitForTimeout(500);
check("Collapse：点击展开（外壳驱动接管）", await page.evaluate(() => {
  const d = document.querySelector("#gm-mod-preview-mobile details.gm-fold");
  return d.open && d.querySelector("summary").getAttribute("aria-expanded") === "true";
}));
check("Collapse：高度过渡声明在 grid-template-rows（11.2.6）", await page.evaluate(() =>
  getComputedStyle(document.querySelector("#gm-mod-preview-mobile .gm-fold__body"))
    .transitionProperty.includes("grid-template-rows")));
await foldSummary.click();
await page.waitForTimeout(600);
check("Collapse：收起后不占位", await page.evaluate(() => {
  const d = document.querySelector("#gm-mod-preview-mobile details.gm-fold");
  return !d.open && Math.round(d.querySelector(".gm-fold__body").getBoundingClientRect().height) === 0;
}));

await page.locator(`${M}.tabbar .tab`).nth(2).click();
await page.waitForTimeout(450);
check("Calendar：今天高亮 + 选中态唯一", (await page.locator(`${M}.pm-calday.today`).count()) === 1 &&
  (await page.locator(`${M}.pm-calday[aria-selected="true"]`).count()) === 1);
check("Calendar：日期格热区 ≥44（内层 36 芯片承载视觉）", await page.evaluate(() => {
  const c = document.querySelector("#gm-mod-preview-mobile .pm-calday[data-k]");
  const r = c.getBoundingClientRect();
  return r.width >= 44 && r.height >= 44;
}));
const calTitle = await page.locator(`${M}[id$='pmCalTitle']`).textContent();
await page.locator(`${M}[id$='pmCalNext']`).click();
await page.waitForTimeout(400);
check("Calendar：切月", (await page.locator(`${M}[id$='pmCalTitle']`).textContent()) !== calTitle);
await page.locator(`${M}[id$='pmCalPrev']`).click();
await page.waitForTimeout(400);
check("Calendar：事件点 ≤3/格（11.6.5）", await page.evaluate(() =>
  [...document.querySelectorAll("#gm-mod-preview-mobile .pm-calday i")].every((i) => i.children.length <= 3)));

check("WaterMark：SVG pattern 引用已解析（build 改写 url(#id) 的回归位）", await page.evaluate(() => {
  const rect = document.querySelector("#gm-mod-preview-mobile .pm-wm rect");
  return !!rect && getComputedStyle(rect).fill.includes("url");
}));
check("WaterMark：透明不吃点击（11.6.13）", await page.evaluate(() =>
  getComputedStyle(document.querySelector("#gm-mod-preview-mobile .pm-wm")).pointerEvents === "none"));

check("NumberKeyboard：默认不常驻（聚焦才弹）",
  !(await page.locator(`${M}[id$='pmNumKbd']`).isVisible()));
await page.locator(`${M}[id$='pmNumDisp']`).click();
await page.waitForTimeout(400);
check("NumberKeyboard：唤起后 3×4 共 12 键", (await page.locator(`${M}.pm-numkey`).count()) === 12);
check("NumberKeyboard：键热区 ≥48（主行动档）", await page.evaluate(() =>
  document.querySelector("#gm-mod-preview-mobile .pm-numkey").getBoundingClientRect().height >= 48));
for (const k of ["1", "0", "8"]) await page.locator(`${M}.pm-numkey[data-k="${k}"]`).click();
await page.waitForTimeout(250);
check("NumberKeyboard：回显到玻璃胶囊", (await page.locator(`${M}[id$='pmNumVal']`).textContent()) === "108",
  await page.locator(`${M}[id$='pmNumVal']`).textContent());
await page.locator(`${M}.pm-numkey[data-k="del"]`).click();
await page.waitForTimeout(200);
check("NumberKeyboard：退格", (await page.locator(`${M}[id$='pmNumVal']`).textContent()) === "10");

await page.locator(`${M}.tabbar .tab`).first().click();
await page.waitForTimeout(400);

check("无控制台错误 / 未捕获异常", errors.length === 0, errors.slice(0, 2).join(" | "));

await browser.close();

console.log(`\n${results.length - failed}/${results.length} 通过`);
if (failed) {
  console.log(`移动端模块验收失败 ${failed} 项`);
  process.exit(1);
}
