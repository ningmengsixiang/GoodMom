/**
 * 产品矩阵模块验收（site/index.html#gm-mod-products）
 *
 * 用法：
 *   python3 -m http.server 5288 --bind 127.0.0.1   # 仓库根，另开一个终端
 *   node scripts/products-smoke.mjs
 *   SITE_URL=http://127.0.0.1:5288/site/index.html node scripts/products-smoke.mjs
 *
 * 为什么需要这个脚本（而不是靠 site-smoke / page-qa / a11y-dom）：
 *   ① 「产品矩阵」是**一个模块里 7 个页面**（1 个对接首页 + 6 个工作台，靠 .is-on 切换），
 *      而 page-qa.mjs 与 a11y-dom.py 只审"模块的默认呈现状态" —— 另外 6 页的对比度、
 *      横向溢出、热区、表格配方**完全不设防**（其余模块一页一模块，不存在这个问题）。
 *   ② 本模块的主要功能是**交互**（KPI 筛选 / 行内推进 / 工具反馈），
 *      静态检查与截图都看不出"点了没反应" —— 这里逐条点击并断言结果。
 *
 * 断言分四组：
 *   A. 导航（下拉菜单、深链、首页产品卡、互联链路）
 *   B. 每个工作台：对比度 / 横向溢出（桌面+移动）/ 热区 / 表格配方 / Primary 唯一 / 曲线
 *   C. 每个工作台的主功能交互：KPI 与 chips 与队列筛选、行内推进、快捷工具
 *   D. 首页内容完整性：6 个产品入口 / 链路 / 数据主责 13 行 / 5 个销售组合
 */
import { chromium } from "playwright";

const BASE = process.env.SITE_URL || "http://localhost:5288/site/index.html";
const URL_ = BASE + "#gm-mod-products";
const PRODUCTS = ["p01", "p02", "p03", "p04", "p05", "p06"];
const CHART_PRODUCTS = ["p03", "p04", "p05"];   // 有体重/生长曲线的产品

let pass = 0;
const fails = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fails.push(`${name}${detail ? " — " + detail : ""}`); console.log(`FAIL  ${name} — ${detail}`); }
}

/* ── 页内探针：对比度 / 溢出 / 表格 / 图标 / emoji / Primary / 曲线 ───── */
const PROBE = () => {
  const parse = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = ({ r, g, b }) => {
    const f = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  function bgOf(el) {
    let acc = null, n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { grad: true };
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { acc = acc ? over(acc, c) : c; if (acc.a >= 0.999) return { c: acc }; }
      n = n.parentElement;
    }
    return { c: acc || { r: 255, g: 255, b: 255, a: 1 } };
  }
  const root = document.getElementById("gm-mod-products");
  const view = root.querySelector(".gm-pm-view.is-on");
  const out = { view: view && view.id.replace(/^products--/, ""), contrast: [], overflow: 0,
    widest: [], icons: [], emoji: 0, shadowBlack: 0, primaries: 0, tables: [], charts: 0, chartPaths: 0 };
  if (!view) return out;

  out.overflow = document.documentElement.scrollWidth - window.innerWidth;
  root.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    /* 排除"被祖先裁切的层"：环境光斑 .gm-pm__amb 内部 right:-8% 的光斑会探出视口，
       但它被自己的 overflow:hidden 裁掉、且 aria-hidden + pointer-events:none，
       页面 scrollWidth 并不增加（实测 doc 溢出 0px）—— 报它属于误报。 */
    if (r.width > 0 && cs.display !== "none" && r.right > window.innerWidth + 1
        && !el.closest(".gm-tbl-wrap") && !el.closest(".gm-pm__amb"))
      out.widest.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ").slice(0, 2).join(".") + " right=" + Math.round(r.right));
  });
  out.widest = out.widest.slice(0, 6);

  view.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join("");
    if (txt) {
      const fg = parse(cs.color);
      const bg = bgOf(el);
      if (fg && !bg.grad) {
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const need = (size >= 24 || (size >= 18.66 && weight >= 700)) ? 3 : 4.5;
        const c = ratio(over(fg, bg.c), bg.c);
        if (c < need - 0.01)
          out.contrast.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}「${txt.slice(0, 14)}」${c.toFixed(2)} < ${need}`);
      }
    }
    if (cs.boxShadow && /rgba?\(0,\s*0,\s*0/.test(cs.boxShadow)) out.shadowBlack++;
    if (/gm-pm-btn--pri/.test(el.className) && el.offsetParent) out.primaries++;
    if (el.tagName === "svg") {
      const cls = String(el.className);
      const isIcon = /(^|[\s-])(ico|icon|ic-)/.test(cls) ||
        (el.getAttribute("role") === "img" && el.getBoundingClientRect().width <= 32);
      if (isIcon) { const vb = el.getAttribute("viewBox"); if (vb && vb !== "0 0 24 24") out.icons.push(vb); }
    }
  });
  const growth = [...view.querySelectorAll(".gm-growth__svg")];
  out.charts = growth.length;
  out.chartPaths = growth.reduce((n, c) => n + c.querySelectorAll("path").length, 0);
  view.querySelectorAll("table.gm-tbl").forEach((t) => {
    const ths = [...t.querySelectorAll("thead th")];
    out.tables.push({
      rows: [...t.querySelectorAll("tbody tr")].map((tr) => Math.round(tr.getBoundingClientRect().height)),
      th14: ths.every((th) => Math.round(parseFloat(getComputedStyle(th).fontSize)) === 14),
      thWeight: ths.every((th) => (parseInt(getComputedStyle(th).fontWeight, 10) || 400) >= 600),
      scope: ths.every((th) => th.hasAttribute("scope")),
      tabular: getComputedStyle(t).fontVariantNumeric.includes("tabular-nums"),
    });
  });
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}]/gu;
  const TYPO = new Set(["\u2192", "\u2190", "\u2713", "\u2717", "\u2265", "\u2264", "\u00b1", "\u00d7", "\u00b7", "\u2022"]);
  const w = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const p = w.currentNode.parentElement;
    if (!p || p.closest("script,style,pre,code")) continue;
    out.emoji += (w.currentNode.textContent.match(EMOJI) || []).filter((c) => !TYPO.has(c)).length;
  }
  out.overflowOk = out.widest.length === 0;
  return out;
};

/* ── 移动端热区（同 page-qa 口径：识别 ::after 扩热区的合规实现）── */
const TOUCH = (spec) => {
  const pseudoHot = (el) => {
    for (const pe of ["::after", "::before"]) {
      const cs = getComputedStyle(el, pe);
      if (!cs || cs.content === "none" || cs.display === "none") continue;
      const h = parseFloat(cs.height), t = parseFloat(cs.top), b = parseFloat(cs.bottom);
      if (h >= spec.min || (!Number.isNaN(t) && !Number.isNaN(b) && t <= -8 && b <= -8)) return true;
    }
    return false;
  };
  const root = document.getElementById("gm-mod-products");
  const bad = [];
  for (const el of root.querySelectorAll('a[href],button,input,select,textarea,[role="button"],summary')) {
    let n = el, hidden = false;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === "none") { hidden = true; break; } if (n === root) break; n = n.parentElement; }
    if (hidden) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    const isInline = el.tagName === "A" && cs.display.startsWith("inline") && el.closest("p,li,td,dd") && (el.closest("p,li,td,dd").innerText || "").length > 40;
    if (isInline && r.height >= 24) continue;
    if (r.width >= spec.min && r.height >= spec.min) continue;
    if (pseudoHot(el)) continue;
    bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} ${Math.round(r.width)}×${Math.round(r.height)}「${(el.innerText || el.getAttribute("aria-label") || "").slice(0, 12)}」`);
  }
  return bad.slice(0, 8);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 160)));
await page.goto(URL_, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const state = () => page.evaluate(() => {
  const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
  const rows = on ? [...on.querySelectorAll(".gm-pm-todos tbody tr")] : [];
  return { view: on ? on.id.replace(/^products--/, "") : null,
    rows: rows.length, visible: rows.filter((t) => !t.classList.contains("gm-pm-off")).length,
    feed: on ? on.querySelectorAll("[data-feed] li").length : 0,
    toast: !!document.querySelector(".gm-toast") };
});

/* ════ A. 导航 ════ */
{
  const menuItems = await page.locator("#shTabs .sh-menu__pop a").count();
  check("主导航「产品矩阵」下拉含 7 项（首页 + 6 产品）", menuItems === 7, `${menuItems} 项`);
  await page.locator('#shTabs .sh-tab[data-mod="products"]').click();
  await page.waitForTimeout(250);
  check("点击「产品矩阵」展开下拉菜单", await page.locator("#shTabs .sh-menu.is-open").count() === 1);
  check("展开后焦点进入菜单首项",
    await page.evaluate(() => !!document.activeElement && document.activeElement.getAttribute("role") === "menuitem"));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check("Esc 收起下拉菜单", await page.locator("#shTabs .sh-menu.is-open").count() === 0);

  await page.locator('#shTabs .sh-tab[data-mod="products"]').click();
  await page.waitForTimeout(200);
  await page.locator('#shTabs .sh-menu__pop a[href="#products--p04-work"]').click();
  await page.waitForTimeout(400);
  let st = await state();
  check("下拉选择产品 → 直达该工作台", st.view === "p04-work", `实得 ${st.view}`);
  check("选择后菜单自动收起", await page.locator("#shTabs .sh-menu.is-open").count() === 0);

  await page.goto(BASE + "#products--p06-work", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  st = await state();
  check("深链 #products--p06-work 直达工作台", st.view === "p06-work", `实得 ${st.view}`);

  /* ⚠️ 必须**重载文档**再断言：`goto` 到只差 hash 的同一文档属于同文档导航，
     脚本状态会保留（模块 JS 有意"点页签不改视图"），测不出"首次进入"的行为。 */
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  st = await state();
  check("首次进入默认显示对接首页", st.view === "home", `实得 ${st.view}`);
}

/* ════ D. 首页内容完整性 ════ */
{
  const home = await page.evaluate(() => {
    const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
    return { prods: on.querySelectorAll(".gm-pm-prod").length,
      links: [...on.querySelectorAll(".gm-pm-prod__cta a")].map((a) => a.getAttribute("href")),
      chain: on.querySelectorAll(".gm-pm-chain li").length,
      chainLinks: on.querySelectorAll(".gm-pm-chain a").length,
      dmRows: on.querySelectorAll("table.gm-tbl tbody tr").length,
    };
  });
  check("首页含 6 个产品入口", home.prods === 6, `${home.prods} 个`);
  check("每个产品入口都指向其工作台", home.links.every((h) => /^#products--p0\d-work$/.test(h)), home.links.join(","));
  check("首页含互联链路（6 条，5 条可跳转）", home.chain === 6 && home.chainLinks === 5, `${home.chain}/${home.chainLinks}`);
  check("首页含数据主责矩阵（13 行）", home.dmRows === 13, `${home.dmRows} 行`);

  await page.locator("#gm-mod-products .gm-pm-view.is-on .gm-pm-prod__cta a").nth(2).click();
  await page.waitForTimeout(400);
  check("首页产品卡点开 = 该产品工作台", (await state()).view === "p03-work");
}

/* ════ 业务菜单必须是真实跳转（不是 9 个指向同一锚点的死链）════
   ⚠️ 这条针对一个已发生的缺陷：模块里 6 个工作台的「业务菜单」原来把 PRD 的 9 个模块名
   全部渲染成 `<a href="#p01-work">` —— **每一项都指向同一个工作台锚点**，
   用户看到 9 个不同名字、点下去却哪儿都没去（与"不要假控件"的裁决直接冲突）。
   现在菜单与独立产品页同一份数据源（`module_pages`），每组都指向真实页面。 */
{
  const menu = await page.evaluate(() => {
    const navs = [...document.querySelectorAll("#gm-mod-products .gm-pm-side")].map((nav) => ({
      label: nav.getAttribute("aria-label"),
      items: [...nav.querySelectorAll("a")].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") })),
    }));
    return navs;
  });
  const bad = [], dupes = [];
  for (const nav of menu) {
    const hrefs = nav.items.map((i) => i.href);
    if (hrefs.some((h) => /^#\w+-work$/.test(h))) bad.push(`${nav.label} 仍有同锚点死链`);
    if (hrefs.length >= 3 && new Set(hrefs).size < hrefs.length) dupes.push(`${nav.label} 目标重复`);
    for (const it of nav.items) {
      if (!/^\.\.\/fuyouaicansai\/[a-z0-9-]+\.html#(work|archive|ai|detail|mod-[a-z0-9-]+)$/.test(it.href || ""))
        bad.push(`${nav.label}「${it.text}」目标不合规：${it.href}`);
    }
  }
  const byLabel = Object.fromEntries(menu.map((m) => [m.label, m.items]));
  check("工作台业务菜单 = 真实页面跳转（6 产品 × 对象视图 + PRD 模块页）",
    menu.length === 12 && bad.length === 0 && dupes.length === 0 &&
    (byLabel["对象视图"] || []).length === 4 && (byLabel["业务菜单"] || []).length >= 5,
    bad.concat(dupes).slice(0, 2).join(" | ") || `导航组 ${menu.length} 个`);
}

/* ════ B + C. 六个工作台 ════ */
const goto = async (pid) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(BASE + `#products--${pid}-work`, { waitUntil: "networkidle" });
  await page.waitForTimeout(450);
};

for (const pid of PRODUCTS) {
  const name = `${pid} 工作台`;
  await goto(pid);
  const r = await page.evaluate(PROBE);
  check(`${name} · 视图已切换`, r.view === `${pid}-work`, `实得 ${r.view}`);
  /* 桌面：表格保持单行 44–52（03 · 3.7，page-qa P2 同口径），且主表不再被压到横向滚动 */
  const deskTbl = await page.evaluate(() => {
    const wr = document.querySelector("#gm-mod-products .gm-pm-view.is-on .gm-tbl-wrap");
    if (!wr) return null;
    const tr = wr.querySelector("tbody tr");
    const vis = (c) => c.getBoundingClientRect().width > 0;
    return { row: Math.round(tr.getBoundingClientRect().height), scroll: wr.scrollWidth - wr.clientWidth,
      clientW: wr.clientWidth,
      deskShown: [...tr.children].filter((c) => c.classList.contains("gm-tbl__desk") && vis(c)).length,
      mobShown: [...tr.children].filter((c) => c.classList.contains("gm-tbl__mob") && vis(c)).length };
  });
  check(`${name} · 桌面表格单行 44–52 且不被压窄`,
    deskTbl && deskTbl.row >= 44 && deskTbl.row <= 52 && deskTbl.scroll <= 1 && deskTbl.clientW >= 320
    && deskTbl.deskShown >= 3 && deskTbl.mobShown === 0,
    JSON.stringify(deskTbl));

  check(`${name} · 桌面无横向溢出`, r.overflow <= 1 && r.overflowOk,
    `溢出 ${r.overflow}px ${r.widest.join(" | ")}`);
  check(`${name} · 文字对比度合格`, r.contrast.length === 0, r.contrast.slice(0, 4).join(" | "));
  check(`${name} · 无纯黑阴影 / 图标 24 网格 / 无 emoji`,
    r.shadowBlack === 0 && r.icons.length === 0 && r.emoji === 0,
    `阴影黑 ${r.shadowBlack} · viewBox ${r.icons.join(",")} · emoji ${r.emoji}`);
  check(`${name} · 表格配方（表头/scope/行高/tabular）`,
    r.tables.length > 0 && r.tables.every((t) => t.th14 && t.thWeight && t.scope && t.tabular &&
      t.rows.every((h) => h >= 44 && h <= 52)), JSON.stringify(r.tables));
  check(`${name} · Primary 每屏唯一`, r.primaries === 1, `${r.primaries} 个`);
  const wantChart = CHART_PRODUCTS.includes(pid);
  check(`${name} · 生长曲线（13 · 13.2 母题）`,
    wantChart ? r.charts === 1 && r.chartPaths >= 5 : r.charts === 0,
    `svg ${r.charts} · path ${r.chartPaths}（期望 ${wantChart ? "1 / ≥5" : "0 / 0"}）`);

  /* C. 主功能交互 */
  let st = await state();
  const total = st.rows;
  check(`${name} · 待处理清单默认全部可见`, total > 1 && st.visible === total, `行 ${st.visible}/${total}`);

  const tone = await page.evaluate(() => {
    const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
    const b = [...on.querySelectorAll(".gm-pm-kpi")].find((x) => x.getAttribute("data-tone-filter") !== "all");
    b.click();
    return b.getAttribute("data-tone-filter");
  });
  await page.waitForTimeout(250);
  st = await state();
  check(`${name} · KPI「${tone}」点选后收敛行数`, st.visible < total && st.visible >= 0, `${st.visible}/${total}`);

  await page.evaluate(() => {
    const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
    on.querySelector('.gm-pm-filter[data-tone-filter="all"]').click();
  });
  await page.waitForTimeout(250);
  st = await state();
  check(`${name} · 「全部」筛选复位`, st.visible === total, `${st.visible}/${total}`);

  const feedBefore = st.feed;
  const advanced = await page.evaluate(() => {
    const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
    const btn = on.querySelector('.gm-pm-todos tbody tr:not(.gm-pm-off) .gm-pm-act[data-act="advance"]');
    if (!btn) return null;
    const tr = btn.closest("tr");
    const before = tr.querySelector("[data-status]").textContent;
    btn.click();
    return { before, after: tr.querySelector("[data-status]").textContent, disabled: btn.disabled };
  });
  await page.waitForTimeout(350);
  st = await state();
  check(`${name} · 行内动作推进状态（标签变化 + 动作置灰）`,
    !!advanced && advanced.before !== advanced.after && advanced.disabled, JSON.stringify(advanced));
  check(`${name} · 推进后写入最新动态 + 反馈提示`, st.feed > feedBefore && st.toast,
    `feed ${feedBefore}→${st.feed} toast=${st.toast}`);

  const feed2 = (await state()).feed;
  await page.locator("#gm-mod-products .gm-pm-view.is-on [data-tool]").first().click();
  await page.waitForTimeout(300);
  st = await state();
  check(`${name} · 快捷工具点击有反馈并记入动态`, st.feed > feed2, `feed ${feed2}→${st.feed}`);

  /* 移动端：溢出 + 热区 */
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(350);
  const m = await page.evaluate(PROBE);
  const touch = await page.evaluate(TOUCH, { min: 44 });
  check(`${name} · 移动端无横向溢出`, m.overflow <= 1 && m.overflowOk, `溢出 ${m.overflow}px ${m.widest.join(" | ")}`);
  check(`${name} · 移动端热区 ≥44×44`, touch.length === 0, touch.join(" | "));

  /* 响应式表格（17 · 17.1.3）：≤900 走合并单元 + 行内列名标语，零横向滚动 */
  const mobTbl = await page.evaluate(() => {
    const wr = document.querySelector("#gm-mod-products .gm-pm-view.is-on .gm-tbl-wrap");
    if (!wr) return null;
    const tr = wr.querySelector("tbody tr");
    const vis = [...tr.children].filter((c) => c.getBoundingClientRect().width > 0);
    return { scroll: wr.scrollWidth - wr.clientWidth, visible: vis.length, total: tr.children.length,
      colspan: vis[0] ? vis[0].getAttribute("colspan") : null, labels: vis[0] ? vis[0].querySelectorAll(".r2 i").length : 0 };
  });
  check(`${name} · 移动端表格零横滚（合并单元 + 行内列名标语）`,
    mobTbl && mobTbl.scroll <= 2 && mobTbl.visible === 1 && Number(mobTbl.colspan) === mobTbl.total - 1 && mobTbl.labels >= 1,
    JSON.stringify(mobTbl));
}

/* ════ 首页移动端 + 移动端下拉 ════ */
{
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(URL_, { waitUntil: "networkidle" });
  /* ⚠️ 必须 reload：上一轮停在某个工作台，`goto` 只改了 hash（同文档导航），
     模块 JS 有意"点页签不改视图" —— 不重载就会拿工作台冒充首页来断言（曾经因此假通过）。 */
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(450);
  const homeView = await page.evaluate(() => {
    const on = document.querySelector("#gm-mod-products .gm-pm-view.is-on");
    return on && on.id.replace(/^products--/, "");
  });
  check("首页移动端检查确实在对接首页上执行", homeView === "home", `实得 ${homeView}`);
  const m = await page.evaluate(PROBE);
  const touch = await page.evaluate(TOUCH, { min: 44 });
  check("对接首页 · 移动端无横向溢出", m.overflow <= 1 && m.overflowOk, `溢出 ${m.overflow}px ${m.widest.join(" | ")}`);
  check("对接首页 · 移动端热区 ≥44×44", touch.length === 0, touch.join(" | "));
  await page.locator('#shTabs .sh-tab[data-mod="products"]').click();
  await page.waitForTimeout(250);
  const menuBox = await page.evaluate(() => {
    const pop = document.querySelector("#shTabs .sh-menu__pop");
    const r = pop.getBoundingClientRect();
    return { open: !!document.querySelector("#shTabs .sh-menu.is-open"),
      w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth };
  });
  check("移动端下拉为整宽面板（不被横向滚动容器裁切）",
    menuBox.open && menuBox.left >= 0 && menuBox.right <= menuBox.vw && menuBox.w > 200, JSON.stringify(menuBox));
}

check("无控制台错误 / 未捕获异常", errs.length === 0, errs.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass}/${pass + fails.length} 通过`);
if (fails.length) { console.log("未通过：\n- " + fails.join("\n- ")); process.exit(1); }
