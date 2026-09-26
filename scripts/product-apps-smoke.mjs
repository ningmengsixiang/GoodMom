/**
 * 6 个独立产品页验收（fuyouaicansai/p01…p06 + 索引页）
 *
 * 用法：
 *   python3 -m http.server 5288 --bind 127.0.0.1   # 仓库根，另开一个终端
 *   node scripts/product-apps-smoke.mjs
 *   SITE_URL=http://127.0.0.1:5288 node scripts/product-apps-smoke.mjs
 *
 * 为什么需要它（page-qa / a11y-dom 覆盖不到的部分）：
 *   · 这两支门禁**只审页面的默认呈现状态**。本页有 4 个视图靠 .is-on 切换，
 *     另外 3 个视图的对比度/溢出/热区/表格配方在切页之前完全不被检视；
 *   · 这几个页面的主要价值是**交互**（KPI 筛选 / 行内推进 / AI 采纳与复核 /
 *     助手对话 / 侧栏与顶栏切换），静态检查与截图都看不出"点了没反应"。
 *
 * 断言分组：
 *   A. 外壳：4 视图、侧栏与顶栏页签、默认侧栏模式、导航形态记忆（只记显式选择）
 *   B. 每页：桌面/移动无横向溢出、logo、Primary 唯一、曲线渲染（p03/p04/p05）
 *   C. 主功能交互：视图切换、KPI 筛选、行内推进、AI 采纳闭环、
 *      转人工复核弹层、助手对话、移动端自动切顶栏 + 热区 ≥44
 *   D. 数据呈现：表格表头 14/600 + scope、行高 44–52、tabular-nums、操作列右对齐
 *   E. 索引页：6 个产品入口齐备且指向存在的文件
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ⚠️ 不能用 new URL(...).pathname：仓库路径含中文，pathname 是 URL 编码过的（%E7%8E%BB…），
   fs.existsSync 会一律判"不存在"。必须 fileURLToPath 解码。 */

const BASE = (process.env.SITE_URL || "http://localhost:5288/site/index.html").replace(/\/site\/index\.html.*$/, "");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PAGES = [
  { slug: "p01-women-health", name: "01 妇女健康管理系统" },
  { slug: "p02-preconception", name: "02 婚前孕前保健系统" },
  { slug: "p03-maternity", name: "03 孕产妇全程管理系统" },
  { slug: "p04-newborn", name: "04 新生儿健康管理系统" },
  { slug: "p05-child-health", name: "05 儿童健康管理系统" },
  { slug: "p06-ai-care", name: "06 妇幼AI智能体平台" },
];
const WITH_CHART = ["p03-maternity", "p04-newborn", "p05-child-health"];

let pass = 0;
const fails = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fails.push(`${name}${detail ? " — " + detail : ""}`); console.log(`FAIL  ${name} — ${detail}`); }
}

const STATE = () => {
  const on = document.querySelector(".gm-pm-view.is-on");
  const table = document.querySelector("table.gm-tbl");
  const th = table && table.querySelector("thead th");
  const rows = table ? [...table.querySelectorAll("tbody tr")] : [];
  return {
    view: on && on.dataset.v,
    views: document.querySelectorAll(".gm-pm-view").length,
    nav: document.querySelectorAll(".gm-side .nv[data-go]").length,
    tabs: document.querySelectorAll(".gm-tab").length,
    mode: document.body.className,
    chart: document.querySelectorAll(".gm-gx__svg").length,
    chartLine: document.querySelectorAll(".gm-gx__line").length,
    ai: document.querySelectorAll(".gm-ai").length,
    aiDone: document.querySelectorAll(".gm-ai.is-done").length,
    /* ⚠️ 按**当前视图**统计：业务模块页上线后一页有 7 张表，全局计数会把它们加在一起，
       断言"5 条待处理"这类数字就失去意义（也会掩盖"筛选串到别的视图"这类真问题）。 */
    todos: on ? on.querySelectorAll(".gm-pm-todos tbody tr").length : 0,
    visible: on ? [...on.querySelectorAll(".gm-pm-todos tbody tr")].filter((t) => !t.classList.contains("gm-pm-off")).length : 0,
    modules: document.querySelectorAll(".gm-side .nv[data-go^=mod-]").length,
    modulePages: document.querySelectorAll(".gm-pm-view[data-v^=mod-]").length,
    fakeTools: document.querySelectorAll(".gm-side [data-tool]").length,
    tl: document.querySelectorAll(".gm-tl li").length,
    chat: document.querySelectorAll(".gm-chat .gm-bubble").length,
    feed: document.querySelectorAll("[data-feed] li").length,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    primary: [...document.querySelectorAll(".gm-pm-btn--pri")].filter((x) => x.offsetParent).length,
    logoOk: [...document.querySelectorAll("img")].every((i) => i.naturalWidth > 0),
    table: table ? {
      th14: th ? Math.round(parseFloat(getComputedStyle(th).fontSize)) === 14 : false,
      thWeight: th ? (parseInt(getComputedStyle(th).fontWeight, 10) || 400) >= 600 : false,
      scope: table.querySelectorAll("thead th[scope]").length === table.querySelectorAll("thead th").length,
      tabular: getComputedStyle(table).fontVariantNumeric.includes("tabular-nums"),
      rows: rows.map((r) => Math.round(r.getBoundingClientRect().height)),
      opsRight: (() => {
        const c = table.querySelector("td.col-ops");
        return c ? getComputedStyle(c).textAlign === "right" : false;
      })(),
      td14: (() => {
        const c = table.querySelector("tbody td");
        return c ? Math.round(parseFloat(getComputedStyle(c).fontSize)) === 14 : false;
      })(),
    } : null,
  };
};

const TOUCH = () => {
  const hot = (el) => ["::after", "::before"].some((pe) => {
    const cs = getComputedStyle(el, pe);
    if (!cs || cs.content === "none" || cs.display === "none") return false;
    const h = parseFloat(cs.height), t = parseFloat(cs.top), b = parseFloat(cs.bottom);
    return h >= 44 || (!Number.isNaN(t) && !Number.isNaN(b) && t <= -8 && b <= -8);
  });
  const bad = [];
  for (const el of document.querySelectorAll(".gm-tab, .nv, .gm-pm-btn, .gm-pm-act, .gm-pm-filter, .gm-opt, .gm-iconb, .gm-pm-qbtn")) {
    if (!el.offsetParent) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.width >= 44 && r.height >= 44) continue;
    if (hot(el)) continue;
    bad.push(`${el.className.split(" ")[0]} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  return bad.slice(0, 6);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 160)));

/* ── A/B/C/D：逐页 ── */
for (const { slug, name } of PAGES) {
  await page.goto(`${BASE}/fuyouaicansai/${slug}.html`, { waitUntil: "load" });
  await page.waitForTimeout(650);
  let st = await page.evaluate(STATE);

  check(`${name} · 4 个对象视图 + 业务模块页齐备（侧栏菜单 = 真实页面）`,
    st.tabs === 4 && st.views === 4 + st.modules && st.nav === 4 + st.modules && st.modulePages === st.modules
    && st.modules >= 4 && st.fakeTools === 0,
    JSON.stringify({ v: st.views, n: st.nav, t: st.tabs, mod: st.modules, pages: st.modulePages, fake: st.fakeTools }));
  check(`${name} · 默认工作台 + 侧栏模式`, st.view === "work" && st.mode.includes("mode-sider"),
    `${st.view} / ${st.mode}`);
  check(`${name} · 桌面无横向溢出`, st.overflow <= 1, `${st.overflow}px`);
  check(`${name} · logo 与图片正常`, st.logoOk);
  check(`${name} · 每屏 Primary 唯一`, st.primary <= 1, `${st.primary} 个`);
  check(`${name} · 曲线${WITH_CHART.includes(slug) ? "已渲染（13 · 13.2）" : "不出现"}`,
    WITH_CHART.includes(slug) ? st.chart === 1 && st.chartLine === 1 : st.chart === 0,
    `svg ${st.chart} / line ${st.chartLine}`);

  const t = st.table;
  check(`${name} · 表格配方（表头/行高/tabular/操作列）`,
    t && t.th14 && t.thWeight && t.scope && t.tabular && t.td14 && t.opsRight &&
    t.rows.length > 0 && t.rows.every((h) => h >= 44 && h <= 52), JSON.stringify(t));

  for (const v of ["archive", "ai", "detail", "work"]) {
    await page.locator(`.gm-side .nv[data-go=${v}]`).click();
    await page.waitForTimeout(200);
    st = await page.evaluate(STATE);
    check(`${name} · 侧栏切到「${v}」`, st.view === v, st.view);
  }
  st = await page.evaluate(STATE);
  check(`${name} · 档案视图含时间线与指标`, st.tl >= 4, `${st.tl} 条时间线`);

  const total = st.todos;
  await page.locator(".gm-pm-view.is-on button.gm-pm-kpi").nth(1).click();
  await page.waitForTimeout(200);
  const filtered = (await page.evaluate(STATE)).visible;
  check(`${name} · KPI 点选筛选待处理清单`, filtered <= total, `${filtered}/${total}`);
  await page.locator(".gm-pm-view.is-on .gm-pm-filter[data-tone-filter=all]").first().click();
  await page.waitForTimeout(150);

  const adv = await page.evaluate(() => {
    const b = document.querySelector(".gm-pm-todos tbody tr:not(.gm-pm-off) .gm-pm-act[data-act=advance]");
    if (!b) return null;
    const tr = b.closest("tr");
    const before = tr.querySelector("[data-status]").textContent;
    b.click();
    return { before, after: tr.querySelector("[data-status]").textContent, disabled: b.disabled };
  });
  await page.waitForTimeout(250);
  check(`${name} · 行内动作推进状态并置灰`, !!adv && adv.before !== adv.after && adv.disabled,
    JSON.stringify(adv));

  await page.locator(".gm-side .nv[data-go=ai]").click();
  await page.waitForTimeout(200);
  await page.locator(".gm-ai .gm-pm-btn--pri").first().click();
  await page.waitForTimeout(250);
  st = await page.evaluate(STATE);
  const tagText = await page.locator(".gm-ai [data-ai-tag]").first().textContent();
  check(`${name} · AI 建议采纳闭环（状态 + 动态）`,
    st.aiDone === 1 && tagText.trim() === "审核通过" && st.feed >= 1,
    `${st.aiDone} / ${tagText} / feed ${st.feed}`);

  await page.locator(".gm-ai:not(.is-done) [data-ai-act=human]").first().click();
  await page.waitForTimeout(250);
  const opened = await page.evaluate(() => !!document.querySelector(".gm-mask.is-on"));
  await page.locator(".gm-mask [data-modal-ok]").click();
  await page.waitForTimeout(250);
  const closed = await page.evaluate(() => ({
    closed: !document.querySelector(".gm-mask.is-on"),
    done: document.querySelectorAll(".gm-ai.is-done").length,
  }));
  check(`${name} · 转人工复核弹层开合并落状态`,
    opened && closed.closed && closed.done >= 2, JSON.stringify({ opened, ...closed }));

  await page.locator(".gm-qa button").first().click();
  await page.waitForTimeout(1100);
  st = await page.evaluate(STATE);
  check(`${name} · AI 助手问答有回复`, st.chat >= 3, `${st.chat} 条气泡`);

  /* ── 业务模块页（PRD 一级模块）：侧栏菜单每一项都必须是**真实页面** ──
     ⚠️ 这条断言针对的是一个已发生的缺陷：这 6 个菜单项此前只有 `data-tool`，点了只弹一句提示、
     没有任何页面（用户："把菜单里边的这些页面全部完善"）。现在逐项点开，检查
     标题/一句话说明/KPI/主表/侧栏卡都在位，并且行内动作与 KPI 筛选真的生效。 */
  const modKeys = await page.$$eval(".gm-side .nv[data-go^=mod-]", (els) => els.map((e) => e.getAttribute("data-go")));
  let modBad = [];
  for (const key of modKeys) {
    await page.locator(`.gm-side .nv[data-go="${key}"]`).click();
    await page.waitForTimeout(220);
    const r = await page.evaluate((k) => {
      const v = document.querySelector(".gm-pm-view.is-on");
      const rows = v ? [...v.querySelectorAll("tbody tr")] : [];
      return { id: v && v.dataset.v, expect: "mod-" + k.replace(/^mod-/, ""), h2: v && v.querySelector("h2") && v.querySelector("h2").textContent,
        desc: !!(v && v.querySelector(".gm-pm-head__d")), kpis: v ? v.querySelectorAll(".gm-pm-kpi").length : 0,
        rows: rows.length, side: v ? v.querySelectorAll(".gm-pm-list li").length : 0,
        count: v && v.querySelector("[data-count]") ? v.querySelector("[data-count]").textContent : "" };
    }, key);
    if (r.id !== r.expect || !r.h2 || !r.desc || r.kpis < 3 || r.rows < 4 || r.side < 1 || !r.count)
      modBad.push(`${key}:${JSON.stringify(r)}`);
  }
  check(`${name} · 业务菜单每一项都打开真实页面（${modKeys.length} 项：标题/KPI/主表/侧栏卡）`,
    modKeys.length >= 4 && modBad.length === 0, modBad.slice(0, 2).join(" | "));

  /* 模块页交互：KPI 筛选只作用于本页表格 + 行内动作推进状态 */
  const modItx = await page.evaluate(() => {
    const v = document.querySelector(".gm-pm-view.is-on");
    const other = document.querySelector(".gm-pm-view[data-v=work]");
    const beforeOther = other.querySelector("[data-count]").textContent;
    const kpi = v.querySelector("button.gm-pm-kpi[data-tone-filter]:not([data-tone-filter=all])");
    const total = v.querySelectorAll("tbody tr").length;
    const countBefore = v.querySelector("[data-count]").textContent;
    if (kpi) kpi.click();
    const countAfter = v.querySelector("[data-count]").textContent;
    const vis = [...v.querySelectorAll("tbody tr")].filter((t) => !t.classList.contains("gm-pm-off")).length;
    /* 该语气在本页可能一条都没有（数据相关）—— 那也算筛选**确实生效**（计数变了），
       复位后再验行内动作，避免把"筛到 0 条"误判成交互坏掉。 */
    const filtered = countAfter !== countBefore && vis <= total;
    if (!vis) v.querySelector(".gm-pm-filter[data-tone-filter=all]").click();
    const count = v.querySelector("[data-count]").textContent;
    const tr = v.querySelector("tbody tr:not(.gm-pm-off)");
    const btn = tr && tr.querySelector(".gm-pm-act[data-act=advance]");
    const before = tr ? tr.querySelector("[data-status]").textContent : "";
    if (btn) btn.click();
    return { filtered, count, before, after: tr ? tr.querySelector("[data-status]").textContent : "",
      disabled: btn ? btn.disabled : false, otherUntouched: other.querySelector("[data-count]").textContent === beforeOther };
  });
  check(`${name} · 模块页筛选与行内动作只作用于本页（不串到工作台）`,
    modItx.filtered && modItx.before !== modItx.after && modItx.disabled && modItx.otherUntouched,
    JSON.stringify(modItx));
  await page.locator('.gm-side .nv[data-go=work]').click();
  await page.waitForTimeout(200);

  /* ── 响应式表格（17 · 17.1.3）：桌面保持单行 44–52，窄屏走合并单元且**不得横向滚动** ──
     ⚠️ 这条针对用户反复提的"页面要做到响应式"。此前的实测：模块页表格在 375 档宽 748px、
     卡片内容宽仅 ~290px —— 每看一行都要横向拖动，操作列默认在屏幕外；1024 档也还要滚 178px。
     现在：≤900 用 `colspan` 合并单元（行内自带列名标签、表头隐藏），>900 用原列。 */
  {
    const desk = await page.evaluate(() => {
      const wr = document.querySelector(".gm-pm-view.is-on .gm-tbl-wrap");
      if (!wr) return null;
      const tr = wr.querySelector("tbody tr");
      const cells = [...tr.children];
      const vis = (c) => c.getBoundingClientRect().width > 0;
      return { deskShown: cells.filter((c) => c.classList.contains("gm-tbl__desk") && vis(c)).length,
        deskTotal: cells.filter((c) => c.classList.contains("gm-tbl__desk")).length,
        mobShown: cells.filter((c) => c.classList.contains("gm-tbl__mob") && vis(c)).length,
        row: Math.round(tr.getBoundingClientRect().height), scroll: wr.scrollWidth - wr.clientWidth };
    });
    /* 桌面：所有 `.gm-tbl__desk` 格都在，合并格隐藏；行高 44–52；无横向滚动 */
    check(`${name} · 桌面表格单行 44–52 且不横向滚动`,
      desk && desk.deskShown === desk.deskTotal && desk.deskTotal >= 3 && desk.mobShown === 0
      && desk.row >= 44 && desk.row <= 52 && desk.scroll <= 1,
      JSON.stringify(desk));
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  const m = await page.evaluate(STATE);
  const touch = await page.evaluate(TOUCH);
  const tabsVisible = await page.evaluate(() => getComputedStyle(document.querySelector(".gm-tabs")).display);
  check(`${name} · 移动端无横向溢出`, m.overflow <= 1, `${m.overflow}px`);
  /* 窄屏必须能从顶栏进业务模块页：≤1280 切顶栏模式后侧栏被隐藏，
     若没有这个下拉，37 个业务模块页在手机上**完全不可达**（实测过）。 */
  const navm = await page.evaluate(() => {
    const box = document.querySelector(".gm-navm");
    const btn = document.querySelector("[data-act=navm]");
    if (!box || getComputedStyle(box).display === "none") return { visible: false };
    btn.click();
    const panel = document.querySelector(".gm-navm__panel");
    const items = [...panel.querySelectorAll(".gm-navm__it")];
    return { visible: true, opened: !panel.hidden, items: items.length,
      groups: panel.querySelectorAll(".gm-navm__grp").length,
      firstMod: items.filter((i) => i.getAttribute("data-go").startsWith("mod-")).length };
  });
  check(`${name} · 窄屏顶栏「业务菜单」可进模块页`,
    navm.visible && navm.opened && navm.items >= 6 && navm.groups === 2 && navm.firstMod >= 2,
    JSON.stringify(navm));
  if (navm.visible) {
    await page.locator(".gm-navm__it[data-go^=mod-]").first().click();
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => ({ view: document.querySelector(".gm-pm-view.is-on").dataset.v,
      closed: document.querySelector(".gm-navm__panel").hidden }));
    check(`${name} · 下拉选中即切页并自动收起`,
      after.view.startsWith("mod-") && after.closed, JSON.stringify(after));
    await page.locator(".gm-side .nv[data-go=work]").count().catch(() => {});
    await page.evaluate(() => { document.querySelectorAll(".gm-navm__it[data-go=work]").forEach((b) => b.click()); });
    await page.waitForTimeout(200);
  }

  check(`${name} · 窄屏自动切顶栏模式`, m.mode.includes("mode-top") && tabsVisible === "flex",
    `${m.mode} / tabs ${tabsVisible}`);
  check(`${name} · 移动端热区 ≥44×44`, touch.length === 0, touch.join(" | "));

  const mobTbl = await page.evaluate(() => {
    const wr = document.querySelector(".gm-pm-view.is-on .gm-tbl-wrap");
    if (!wr) return null;
    const tr = wr.querySelector("tbody tr");
    const cells = [...tr.children];
    const vis = cells.filter((c) => c.getBoundingClientRect().width > 0);
    return { scroll: wr.scrollWidth - wr.clientWidth, visible: vis.length, total: cells.length,
      colspan: vis[0] ? vis[0].getAttribute("colspan") : null,
      headHidden: getComputedStyle(wr.querySelector("thead")).display === "none",
      labels: vis[0] ? vis[0].querySelectorAll(".r2 i").length : 0,
      row: Math.round(tr.getBoundingClientRect().height) };
  });
  check(`${name} · 移动端表格零横滚（合并单元 + 行内列名标语）`,
    mobTbl && mobTbl.scroll <= 2 && mobTbl.visible === 1 && Number(mobTbl.colspan) === mobTbl.total - 1
    && mobTbl.headHidden && mobTbl.labels >= 1 && mobTbl.row >= 60,
    JSON.stringify(mobTbl));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(200);
}

/* ── E：索引页 ── */
{
  await page.goto(`${BASE}/fuyouaicansai/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(400);
  const idx = await page.evaluate(() => ({
    cards: document.querySelectorAll(".gm-pm-prod").length,
    hrefs: [...document.querySelectorAll(".gm-pm-prod__cta a")].map((a) => a.getAttribute("href")),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  check("索引页列出 6 个产品入口", idx.cards === 6, `${idx.cards} 个`);
  check("索引页入口全部指向存在的文件",
    idx.hrefs.length === 6 && idx.hrefs.every((h) => fs.existsSync(path.join(ROOT, "fuyouaicansai", h))),
    idx.hrefs.join(","));
  check("索引页无横向溢出", idx.overflow <= 1, `${idx.overflow}px`);
}

check("无控制台错误 / 未捕获异常", errs.length === 0, errs.slice(0, 3).join(" | "));

await browser.close();
console.log(`\n${pass}/${pass + fails.length} 通过`);
if (fails.length) { console.log("未通过：\n- " + fails.join("\n- ")); process.exit(1); }
