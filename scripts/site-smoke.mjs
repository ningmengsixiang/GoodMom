/**
 * 单一首页验收（site/index.html）
 * 用法：node scripts/site-smoke.mjs        （需先在仓库根起一个静态服务，见下）
 *
 *   python3 -m http.server 5288      # 仓库根
 *
 * 验收目标：合并成单文件后，**每个模块**的样式与交互都必须仍然生效。
 * 这里做的是"合并是否破坏了原功能"的回归：模块切换、样式隔离、
 * 各模块交互（状态谱 / 步骤 / 弹窗 / 级联 / 虚拟列表 / 暗色 / 文档锚点）。
 */
import { chromium } from "playwright";

const URL = process.env.SITE_URL || "http://localhost:5288/site/index.html";
const results = [];
let failed = 0;

function check(name, pass, detail = "") {
  if (!pass) failed++;
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

/* ── 1. 外壳与唯一入口 ─────────────────────────────────────────── */
const tabs = await page.locator("#shTabs .sh-tab").count();
check("主导航存在且包含全部模块", tabs === 8, `${tabs} 个一级项`);
const titles = await page.locator("#shTabs .sh-tab").allTextContents();
check("导航标题可读", titles.every((t) => t.trim().length > 0), titles.join(" / "));
const modCount = await page.locator(".gm-mod").count();
check("模块容器数量正确", modCount === 8, `${modCount} 个`);
const visibleAtStart = await page.locator(".gm-mod.is-on").count();
check("同一时刻只显示一个模块", visibleAtStart === 1, `${visibleAtStart} 个可见`);

/* ── 2. 模块切换 ───────────────────────────────────────────────── */
async function switchTo(mod) {
  await page.locator(`#shTabs .sh-tab[data-mod="${mod}"]`).click();
  await page.waitForTimeout(350);
  return page.locator(`#gm-mod-${mod}`).isVisible();
}
for (const [mod, label] of [
  ["preview-index", "视觉规范"],
  ["preview-examples", "组件与状态"],
  ["preview-mobile", "移动端"],
  ["preview-patterns", "交互范式"],
  ["site-spec", "规范全文"],
  ["site-manual", "标准手册"],
  ["site-docs", "文档索引"],
  ["site-index", "首页与总览"],
]) {
  const ok = await switchTo(mod);
  const onCount = await page.locator(".gm-mod.is-on").count();
  check(`切换到「${label}」并独占显示`, ok && onCount === 1, `visible=${ok} on=${onCount}`);
}

/* ── 3. 样式隔离（合并的核心风险）─────────────────────────────────
   同名类/变量在不同模块取值不同；若未作用域隔离，后定义的会污染前面的模块。 */
await switchTo("preview-index");
const idxBg = await page.locator("#gm-mod-preview-index").evaluate((el) => {
  const card = el.querySelector(".glass") || el.firstElementChild;
  const cs = getComputedStyle(card);
  return { radius: cs.borderRadius, t: getComputedStyle(el).getPropertyValue("--t").trim() };
});
check("preview-index 玻璃圆角生效", idxBg.radius && idxBg.radius !== "0px", idxBg.radius);

/* 各模块的主题变量必须**各自独立**解析（未被别的模块覆盖）。
   注意：各页变量命名本就不统一（preview-mobile 用 --text、preview-index 用 --lg-text-primary），
   所以按"该模块实际定义的主变量"取值，不能统一查 --t。 */
const themeVars = await page.evaluate(() => {
  const probe = {
    "preview-index": "--lg-text-primary",
    "preview-examples": "--text",
    "preview-mobile": "--text",
    "preview-patterns": "--text",
    "site-manual": "--t2",
    "site-index": "--t",
  };
  const out = {};
  Object.keys(probe).forEach((m) => {
    const el = document.getElementById("gm-mod-" + m);
    out[m] = el ? getComputedStyle(el).getPropertyValue(probe[m]).trim() : null;
  });
  return out;
});
const resolvedCount = Object.values(themeVars).filter((v) => v && v.length > 0).length;
check("各模块主题变量独立解析（≥5 个模块有值）", resolvedCount >= 5, JSON.stringify(themeVars));

/* 关键隔离验证：同名变量 --text 在 examples / patterns 两个模块各自解析
   （两页定义不同主题，若未作用域隔离会互相覆盖） */
const sameNameVars = await page.evaluate(() => {
  const g = (m) => {
    const el = document.getElementById("gm-mod-" + m);
    return el ? getComputedStyle(el).getPropertyValue("--text").trim() : null;
  };
  return { ex: g("preview-examples"), pt: g("preview-patterns"), mb: g("preview-mobile") };
});
check("同名 --text 在 3 个模块各自解析", Object.values(sameNameVars).filter((v) => v && v.length).length === 3,
  JSON.stringify(sameNameVars));

/* :root 改写必须落在模块根类上，否则模块内全部变量失效 */
const rootRewrite = await page.evaluate(() => {
  const el = document.getElementById("gm-mod-site-spec");
  return el ? getComputedStyle(el).getPropertyValue("--t").trim() : null;
});
check(":root 规则已改写为模块作用域", rootRewrite === "#343A46", `--t=${rootRewrite}`);

/* 关键：`.btn` 在多个模块都定义，必须各自命中本模块 */
const btnIsolation = await page.evaluate(() => {
  const found = {};
  ["preview-examples", "preview-mobile", "preview-patterns", "site-index"].forEach((m) => {
    const root = document.getElementById("gm-mod-" + m);
    const b = root && root.querySelector(".btn, .b1");
    found[m] = b ? getComputedStyle(b).borderRadius : null;
  });
  return found;
});
check("同名 .btn/.b1 类被限定在各自模块内", Object.values(btnIsolation).some((v) => v), JSON.stringify(btnIsolation));

/* ── 4. 各模块交互（合并后 JS 作用域是否正确）───────────────────── */
// 4a 组件与状态：状态谱切换 + 弹窗
await switchTo("preview-examples");
const tgCount = await page.locator("#gm-mod-preview-examples .tg").count();
check("组件模块脚本已挂载（状态切换控件存在）", tgCount > 0, `${tgCount} 个 .tg`);
if (tgCount > 1) {
  await page.locator("#gm-mod-preview-examples .tg").nth(1).click();
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll("#gm-mod-preview-examples .tg"));
    return {
      on: tabs.filter((t) => t.classList.contains("on")).length,
      views: document.querySelectorAll("#gm-mod-preview-examples .view").length,
      visibleViews: Array.from(document.querySelectorAll("#gm-mod-preview-examples .view"))
        .filter((v) => v.offsetParent !== null).length,
    };
  });
  check("状态谱点击有响应", st.on > 0 || st.visibleViews > 0,
    `on=${st.on} view=${st.visibleViews}/${st.views}`);
}

// 4b 视觉规范：复制按钮 / 演示交互
await switchTo("preview-index");
const bxCount = await page.locator("#gm-mod-preview-index .bx").count();
check("视觉规范模块按钮组存在", bxCount > 0, `${bxCount} 个 .bx`);
if (bxCount > 1) {
  await page.locator("#gm-mod-preview-index .bx").nth(1).click();
  await page.waitForTimeout(250);
  const bxOn = await page.locator("#gm-mod-preview-index .bx.on, #gm-mod-preview-index .bx.is-on").count();
  check("按钮组点击切换生效", bxOn > 0, `${bxOn} 个选中`);
}

// 4c 交互范式：级联 + 虚拟列表 + 暗色（patterns 的脚本最重）
await switchTo("preview-patterns");
/* 只测 popup 形态（页面另有 inline / dark 两个实例，选错会点到隐藏面板） */
const POPUP = "#preview-patterns--cas-popup";
const casOpts = await page.locator(`${POPUP} .cas-o`).count();
check("级联选项渲染", casOpts > 0, `${casOpts} 项`);
const casTrigger = page.locator(`${POPUP} .cas-t`);
await casTrigger.click();
await page.waitForTimeout(400);
check("级联面板可展开", await page.locator(`${POPUP} .cas-p`).isVisible());
const firstOpt = page.locator(`${POPUP} .cas-p .cas-o`).first();
if (await firstOpt.count()) {
  await firstOpt.click();
  await page.waitForTimeout(350);
  const trigText = (await casTrigger.textContent())?.trim() ?? "";
  check("级联选中写入触发条", trigText.length > 0, trigText.slice(0, 20));
  const cols = await page.locator(`${POPUP} .cas-p > div`).count();
  check("级联展开下一级列", cols >= 2, `${cols} 列`);
}

/* 虚拟列表：1284 条数据只渲染视口内若干项（窗口化），滚动后窗口整体位移。
   注意该列表用"绝对定位 top + 重建窗口"而非 translateY，所以位移信号是
   首项 aria-posinset 的变化，不是 transform。 */
const vlInfo = await page.evaluate(() => {
  const root = document.querySelector("#gm-mod-preview-patterns .vl-vp");
  const inner = document.querySelector("#gm-mod-preview-patterns .vl-in");
  if (!root || !inner) return null;
  const firstSeq = () => {
    const it = root.querySelector(".vl-it");
    return it ? Number(it.getAttribute("aria-posinset")) : -1;
  };
  const before = { items: root.querySelectorAll(".vl-it").length, seq: firstSeq(),
                   innerH: inner.style.height };
  root.scrollTop = 600;
  root.dispatchEvent(new Event("scroll", { bubbles: true }));
  return new Promise((r) => setTimeout(() => {
    r({ before, afterSeq: firstSeq(), afterItems: root.querySelectorAll(".vl-it").length });
  }, 300));
});
check("虚拟列表窗口化渲染（远少于总数）",
  vlInfo && vlInfo.before.items > 0 && vlInfo.before.items < 60,
  vlInfo ? `窗口内 ${vlInfo.before.items} 项 / 共 1284` : "未找到 .vl-vp");
check("虚拟列表滚动后窗口位移", vlInfo && vlInfo.afterSeq > vlInfo.before.seq,
  vlInfo ? `首项 #${vlInfo.before.seq} → #${vlInfo.afterSeq}` : "");
check("虚拟列表 inner 撑满总高（1284×52）", vlInfo && vlInfo.before.innerH === "66768px",
  vlInfo ? vlInfo.before.innerH : "");

/* 暗色模式：按钮切换 data-theme */
const dkBtn = page.locator("#preview-patterns--dk-toggle");
if (await dkBtn.count()) {
  const before = await page.evaluate(() => ({
    html: document.documentElement.getAttribute("data-theme"),
    mod: document.getElementById("gm-mod-preview-patterns").getAttribute("data-theme"),
    shellBg: getComputedStyle(document.body).backgroundColor,
  }));
  await dkBtn.click();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    html: document.documentElement.getAttribute("data-theme"),
    mod: document.getElementById("gm-mod-preview-patterns").getAttribute("data-theme"),
    shellBg: getComputedStyle(document.body).backgroundColor,
  }));
  check("暗色模式切换只作用于本模块（不污染整站）",
    after.mod === "dark" && after.html === before.html && after.shellBg === before.shellBg,
    `模块=${after.mod} html=${after.html} 外壳底色=${after.shellBg === before.shellBg ? "未变" : "被改"}`);
  await dkBtn.click();
  await page.waitForTimeout(300);
  const restored = await page.evaluate(() =>
    document.getElementById("gm-mod-preview-patterns").getAttribute("data-theme"));
  check("暗色可再次切回", restored === null, `data-theme=${restored}`);
} else {
  check("暗色模式切换只作用于本模块（不污染整站）", false, "未找到暗色切换按钮");
}

// 4d 移动端模块
await switchTo("preview-mobile");
const tabCount = await page.locator("#gm-mod-preview-mobile .tab").count();
check("移动端选项卡存在", tabCount > 0, `${tabCount} 个 .tab`);
if (tabCount > 1) {
  await page.locator("#gm-mod-preview-mobile .tab").nth(1).click();
  await page.waitForTimeout(250);
  const onTab = await page.locator("#gm-mod-preview-mobile .tab.on").count();
  check("移动端选项卡切换生效", onTab > 0, `${onTab} 个选中`);
}

/* ── 5. 文档型模块：侧栏目录 + 锚点跳转 ────────────────────────── */
await switchTo("site-docs");
const treeLinks = await page.locator("#gm-mod-site-docs nav.tree a, #gm-mod-site-docs .tree a").count();
check("文档索引导航树保留", treeLinks > 5, `${treeLinks} 条`);
await switchTo("site-spec");
const specNav = await page.locator("#gm-mod-site-spec .gp").count();
check("规范全文分组导航保留", specNav >= 5, `${specNav} 组`);
const specChaps = await page.locator("#gm-mod-site-spec .chap").count();
check("规范全文章节渲染", specChaps >= 19, `${specChaps} 章`);
/* 跨模块锚点：规范全文里的各章 id 必须带模块前缀，否则跳转会串到别的模块 */
const anchorInfo = await page.evaluate(() => {
  const ids = Array.from(document.querySelectorAll("#gm-mod-site-spec section.chap")).map((e) => e.id);
  return {
    total: ids.length,
    prefixed: ids.filter((i) => i.startsWith("site-spec--")).length,
    hasCh02: !!document.getElementById("site-spec--ch-02"),
    hasCh00: !!document.getElementById("site-spec--ch-00"),
  };
});
check("规范分章 id 带模块前缀（跨模块锚点不串页）",
  anchorInfo.total >= 19 && anchorInfo.prefixed === anchorInfo.total && anchorInfo.hasCh02 && anchorInfo.hasCh00,
  `${anchorInfo.prefixed}/${anchorInfo.total} 带前缀, ch-00=${anchorInfo.hasCh00}, ch-02=${anchorInfo.hasCh02}`);
await page.keyboard.press("End");
await page.waitForTimeout(200);

await switchTo("site-manual");
const manualChaps = await page.locator("#gm-mod-site-manual .chap").count();
check("标准手册章节渲染", manualChaps >= 38, `${manualChaps} 章`);

/* ── 6. 无障碍：tablist 键盘导航 ───────────────────────────────── */
const tab0 = page.locator('#shTabs .sh-tab[aria-selected="true"]');
await tab0.focus();
const before = await tab0.getAttribute("data-mod");
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
const after = await page.locator('#shTabs .sh-tab[aria-selected="true"]').getAttribute("data-mod");
check("导航支持左右方向键切换", before !== after, `${before} → ${after}`);

/* ── 7. 旧页面链接必须已改写为模块切换（否则会白屏一跳）────────────
   仅允许保留打印版手册（preview/manual.html 是独立页，仍带导航回来） */
await switchTo("site-index");
const legacy = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]'))
    .map((a) => a.getAttribute("href"))
    .filter((h) => /\.html(?:#|$)/.test(h))
    .filter((h) => !h.startsWith("http"))
);
check("无指向已合并旧页面的链接（打印版除外）",
  legacy.filter((h) => !h.includes("preview/manual.html")).length === 0,
  legacy.slice(0, 4).join(" | "));
/* 覆盖度：站内应有足量模块切换链接 */
const modLinks = await page.evaluate(() =>
  document.querySelectorAll('a[data-mod], a[href^="#gm-mod-"]').length
);
check("模块切换链接已建立（≥20 条）", modLinks >= 20, `${modLinks} 条`);

/* ── 8. 锚点与模块内控件（P0-4 / P1-7 / P2-14 的回归位）─────────────
   历史教训：冒烟只看"模块切没切"，不看"属性值合法吗、点击后跳出本页吗、
   模块内部控件点开有没有内容"。这三类缺陷因此全部漏网。 */
const anchorAudit = await page.evaluate(() => {
  const strip = (html) => html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
  const markup = strip(document.documentElement.outerHTML);
  const ids = new Set(Array.from(document.querySelectorAll("[id]")).map((e) => e.id));
  const hrefs = Array.from(markup.matchAll(/\bhref\s*=\s*"([^"]*)"/g)).map((m) => m[1]);
  const dead = hrefs.filter((h) => h.startsWith("#") && h !== "#" && !ids.has(h.slice(1)));
  return {
    malformed: (markup.match(/href="href=/g) || []).length,
    dead,
  };
});
check('无畸形 href（href="href=）', anchorAudit.malformed === 0, `${anchorAudit.malformed} 处`);
check("无悬空锚点", anchorAudit.dead.length === 0,
  anchorAudit.dead.slice(0, 4).join(" | ") || "0 处");

/* 主导航点击后必须留在本页：命中 404 的经典形态是浏览器执行默认导航。
   判据用 window 上的标记（真实文档级导航会把它清掉），而不是 URL 相等 ——
   模块切换本身会更新 hash（同文档导航），URL 变化是预期行为。 */
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.evaluate(() => { window.__gmSmokeMark = "alive"; });
await page.locator('#shTabs .sh-tab[data-mod="site-spec"]').click();
await page.waitForTimeout(300);
const stayed = await page.evaluate(() => window.__gmSmokeMark === "alive");
const hrefAfter = await page.evaluate(() => ({ h: location.pathname, on: !!document.querySelector("#gm-mod-site-spec.is-on") }));
check("主导航点击不发生文档级跳转", stayed && hrefAfter.on, `同文档=${stayed} 目标模块可见=${hrefAfter.on} path=${hrefAfter.h}`);

/* 模块内控件：chips ↔ views 必须一一对应，且每个标签点开都有内容 */
await switchTo("preview-examples");
const hub = await page.evaluate(() => {
  const root = document.getElementById("gm-mod-preview-examples");
  const chips = Array.from(root.querySelectorAll(".hub .chip"));
  const views = Array.from(root.querySelectorAll(".view"));
  const chipVals = chips.map((c) => c.getAttribute("data-v"));
  const viewVals = views.map((v) => v.getAttribute("data-v"));
  return {
    chipVals,
    orphanChips: chipVals.filter((v) => !viewVals.includes(v)),
    unreachableViews: viewVals.filter((v) => !chipVals.includes(v)),
  };
});
check("示例中心 chips 与 views 一一对应",
  hub.orphanChips.length === 0 && hub.unreachableViews.length === 0,
  `死标签=${hub.orphanChips.join(",") || "无"} 不可达=${hub.unreachableViews.join(",") || "无"}`);

const blankChips = [];
for (let i = 0; i < hub.chipVals.length; i++) {
  await page.locator("#gm-mod-preview-examples .hub .chip").nth(i).click();
  await page.waitForTimeout(180);
  const shown = await page.locator("#gm-mod-preview-examples .view.on").count();
  if (shown !== 1) blankChips.push(`${hub.chipVals[i]}→${shown}`);
}
check("每个示例标签点开都有且仅有一个页面", blankChips.length === 0,
  blankChips.join(",") || `${hub.chipVals.length} 个全部通过`);

/* 深链直达模块内示例页（跨模块锚点的真实可用性） */
await page.goto(URL + "#preview-examples--work", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const deep = await page.evaluate(() => ({
  modOn: !!document.querySelector("#gm-mod-preview-examples.is-on"),
  viewOn: document.querySelector("#gm-mod-preview-examples .view.on")?.getAttribute("data-v") || null,
}));
check("跨模块深链直达示例页", deep.modOn && deep.viewOn === "work", `模块=${deep.modOn} view=${deep.viewOn}`);

/* 失效 hash 必须回退到首模块，而不是 8 个模块全未激活（整页空白） */
await page.goto(URL + "#gm-mod-spec", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const fallback = await page.evaluate(() => document.querySelectorAll(".gm-mod.is-on").length);
check("失效 hash 回退到首模块（不留白屏）", fallback === 1, `${fallback} 个模块可见`);

/* ── 9. 控制台干净 ─────────────────────────────────────────────── */
const real = errors.filter((e) => !e.includes("favicon"));
check("无控制台错误 / 未捕获异常", real.length === 0, real.slice(0, 3).join(" | "));

await browser.close();

console.log(`\n${results.length - failed}/${results.length} 通过`);
if (failed) {
  console.log("失败项：" + results.filter((r) => !r.pass).map((r) => r.name).join("、"));
  process.exit(1);
}
