#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   布局体检门禁（多断点响应式 + 背景白条 + 组件错位）
   ⚠️ 为什么需要它：用户三次报「背景后面留有很大的白色缝隙」「所有页面都要响应式」
   「模块组件格式错位、布局不好」。这三类问题**没有一条现成门禁能守**：
     · page-qa.mjs 只跑 1440/375 两档，且按规则分类，不看"未被绘制的区域"；
     · products-smoke / product-apps-smoke 只看各自模块的 375 档；
     · 320 档（iPhone SE 宽度）此前完全没人测 —— 实测 3 处页面级横向溢出都在 320/768。
   这里按"真实成因"判据逐档扫，而不是按组件规则扫：

   P0 · 页面级横向溢出（docScrollWidth > vw）与"背景白条"（该点没有任何祖先绘制背景）
   P1 · 元素出框（未被任何裁切/滚动祖先挡住）、块级兄弟大面积重叠
   P2 · 文字真的被切（Range 文本宽 > 内容盒 **且** scrollWidth > clientWidth，且 > 4px）
   P3 · 触控热区 < 44×44（<768 档，含 ::after/::before 热区扩展）、字号 < 12px（登记不阻塞）

   判据细节都有实测依据（写在各处注释里）：白条要排除"被裁切的装饰层"，重叠要按**逐行**
   文本矩形比（多行 inline 的 bounding box 天然互相交叠），文字溢出必须同时满足布局与文本两个条件
   （粗体全角「）」的墨迹会让 Range 宽出 4px，而布局并不溢出），热区要认 44×44 伪元素扩展。
   ══════════════════════════════════════════════════════════════════════════ */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
/* 自起静态服务（与 page-qa.mjs 同口径）：CI 里只需 `node scripts/layout-gate.mjs` 一条命令，
   不必依赖外部服务；本地若已有服务，用 SITE_BASE 指向它即可复用。 */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".woff2": "font/woff2", ".json": "application/json" };
function serve() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      let file = join(ROOT, url);
      try {
        if (statSync(file).isDirectory()) file = join(file, "index.html");
        res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
        res.end(readFileSync(file));
      } catch { res.writeHead(404); res.end("404"); }
    });
    srv.listen(0, "127.0.0.1", () => resolve({ srv, port: srv.address().port }));
  });
}
const SRV = process.env.SITE_BASE ? null : await serve();
const BASE = process.env.SITE_BASE || `http://127.0.0.1:${SRV.port}`;
const WIDTHS = (process.env.LAYOUT_WIDTHS || "320,375,414,768,1024,1440,1920").split(",").map(Number);

/* 站点模块从 build-site.py 的 MODULES 读，独立页从生成器读 —— 与其它门禁同源，不另立清单。 */
const build = readFileSync(join(ROOT, "scripts", "build-site.py"), "utf8");
const MODULES = [...build.matchAll(/\(\s*"([a-z-]+)",\s*"[^"]+",\s*"[a-z]+"/g)].map((m) => m[1]);
/* ⚠️ slug 在数据层（products_data.py）而不在生成器里 —— 原来从 gen-product-apps.py 里正则
   取 `"slug":` 一直是**空列表**，于是 6 个独立产品页从未被本门禁扫过（只扫了站点模块与手册）。 */
const data = readFileSync(join(ROOT, "scripts", "products_data.py"), "utf8");
const SUBS = [...data.matchAll(/slug="([a-z0-9-]+)"/g)].map((m) => m[1]);

/* 业务模块页（PRD 一级模块）不是写死的清单：直接读**已生成页面**里的视图标记，
   与产物同源（产品页新增模块时门禁自动覆盖，不会漏）。 */
const modViewsOf = (slug) => {
  try {
    const html = readFileSync(join(ROOT, "fuyouaicansai", slug + ".html"), "utf8");
    return [...new Set([...html.matchAll(/data-v="(mod-[a-z0-9-]+)"/g)].map((m) => m[1]))];
  } catch { return []; }
};

const CASES = [];
for (const m of MODULES) CASES.push({ name: `site#${m}`, url: `site/index.html#gm-mod-${m}`, root: `#gm-mod-${m}`, widths: WIDTHS });
for (const s of SUBS) {
  for (const v of ["work", "archive", "ai", "detail"])
    CASES.push({ name: `app/${s}#${v}`, url: `fuyouaicansai/${s}.html#${v}`, root: "body", widths: WIDTHS });
  /* 模块页数量最多（每个产品 5~8 页），全断点扫会显著拉长 CI，取 4 档代表性断点
     （极窄 320 / 手机 414 / 平板 768 / 桌面 1440）——横向溢出与断行问题都在这四档暴露。 */
  const mw = [320, 414, 768, 1440].filter((w) => WIDTHS.includes(w));
  for (const v of modViewsOf(s))
    CASES.push({ name: `app/${s}#${v}`, url: `fuyouaicansai/${s}.html#${v}`, root: "body", widths: mw });
}
CASES.push({ name: "preview/manual", url: "preview/manual.html", root: "body", widths: WIDTHS });

/* ── 页面内探针 ── */
const PROBE = ({ rootSel }) => {
  const root = rootSel === "body" ? document.body : document.querySelector(rootSel);
  if (!root) return { missing: true };
  const vw = window.innerWidth, vh = window.innerHeight;
  const vis = (e) => { const c = getComputedStyle(e);
    return c.display !== "none" && c.visibility !== "hidden" && parseFloat(c.opacity) !== 0; };
  const path = (e) => { const parts = []; let n = e;
    while (n && n !== document.body && parts.length < 5) {
      parts.unshift(n.tagName.toLowerCase() + (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\s+/).slice(0, 2).join(".") : ""));
      n = n.parentElement; } return parts.join(">"); };
  const clippedBy = (e) => { let n = e.parentElement;
    while (n && n !== document.body) { const cs = getComputedStyle(n);
      if (["auto", "scroll", "hidden", "clip"].includes(cs.overflowX)) return true;
      if (/gm-pm__amb|sr-only/.test(n.className || "")) return true;
      n = n.parentElement; } return false; };
  const pseudoHot = (el) => { for (const pe of ["::after", "::before"]) { const cs = getComputedStyle(el, pe);
      if (!cs || cs.content === "none" || cs.display === "none") continue;
      const h = parseFloat(cs.height), t = parseFloat(cs.top), b = parseFloat(cs.bottom);
      if (h >= 44 || (!Number.isNaN(t) && !Number.isNaN(b) && t <= -8 && b <= -8)) return true; } return false; };

  const out = { overflowX: document.documentElement.scrollWidth - vw, white: [], outOfBox: [], overlap: [], textClip: [], collapse: [], navCover: [], kpiStack: [], touch: [], tiny: [], tinyMock: [] };

  /* ① 背景白条：全页网格取点，命中元素到 <html> 之间**没有任何一层**画了底色/渐变 = 露出默认白画布 */
  const paintedAt = (x, y) => { const el = document.elementFromPoint(x, y);
    if (!el) return true; let n = el;
    while (n && n.nodeType === 1) { const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return true;
      const m = (cs.backgroundColor || "").match(/rgba?\(([^)]+)\)/);
      if (m) { const a = m[1].split(",").length > 3 ? Number(m[1].split(",")[3]) : 1; if (a > 0.02) return true; }
      n = n.parentElement; } return false; };
  const docH = document.documentElement.scrollHeight;
  const maxY = Math.max(0, docH - vh);
  for (const sy of [...new Set([0, Math.round(maxY / 2), maxY])]) {
    window.scrollTo(0, sy);
    for (let x = 1; x < vw; x += Math.max(24, Math.round(vw / 24))) {
      if (!paintedAt(x, Math.round(vh / 2))) out.white.push(`x=${x} y=${window.scrollY + Math.round(vh / 2)}`);
      if (!paintedAt(x, 1)) out.white.push(`x=${x} y=${window.scrollY + 1}`);
    }
  }
  window.scrollTo(0, 0);

  for (const e of root.querySelectorAll("*")) {
    if (!(e instanceof HTMLElement) || !vis(e)) continue;
    const cs = getComputedStyle(e);
    const r = cs.display !== "inline" ? e.getBoundingClientRect() : (e.getClientRects()[0] || e.getBoundingClientRect());
    if (r.width < 6 || r.height < 6 || /sr-only/.test(e.className || "")) continue;

    if ((r.right > vw + 1 || r.left < -1) && !clippedBy(e))
      out.outOfBox.push(`${path(e)} ${r.left < -1 ? "left=" + Math.round(r.left) : "right=" + Math.round(r.right)}`);

    /* 重叠：块级盒 + 逐行矩形（多行 inline 的 bounding box 天然交叠，是构造性假报） */
    if (cs.display !== "inline" && cs.position === "static" && e.parentElement && e.parentElement !== root) {
      const p = e.parentElement, pcs = getComputedStyle(p);
      if (!/grid/.test(pcs.display) && !(pcs.display.includes("flex") && pcs.flexDirection === "row")) {
        for (const sib of p.children) {
          if (sib === e || !vis(sib) || getComputedStyle(sib).position !== "static") continue;
          const sr = sib.getClientRects()[0] || sib.getBoundingClientRect();
          const ox = Math.min(r.right, sr.right) - Math.max(r.left, sr.left);
          const oy = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top);
          if (ox > 4 && oy > 4) { out.overlap.push(`${path(e)} ✕ ${path(sib)}`); break; }
        }
      }
    }

    /* 导航遮挡（用户两次报「有导航遮挡」）：固定侧栏压住主内容列。
       ⚠️ 这条只有真实的**几何**能发现 —— 侧栏声明 `width:252px` 但没写 box-sizing 时，
       实际占 252+padding24+边框2=278px，而内容列按 252px 预留左内边距 → 压住内容 18px。
       "无溢出 / 无重叠 / 无白条 / 无被切"这些判据全都看不见它（实测 1440 档 h2 的「工」
       与首张 KPI 卡左沿被盖住，门禁却全绿）。 */
    if (e.matches && e.matches(".gm-side")) {
      const wrap = document.querySelector(".gm-app__wrap");
      if (wrap) {
        const wr = wrap.getBoundingClientRect();
        if (r.right - wr.left > 1)
          out.navCover.push(`${path(e)} 右沿 ${Math.round(r.right)} 压住内容左沿 ${Math.round(wr.left)}（${Math.round(r.right - wr.left)}px）`);
      }
    }

    /* KPI 三行必须**纵向堆叠**（label / 数字 / 说明）。按钮默认把子 span 当行内内容排在
       一条基线上：数字与说明挤在同一行、`margin-top` 完全不生效，窄档（768 的 170px 卡）
       说明折成两行还压到相邻卡片下。同样没有一条通用判据能发现（不是溢出、不是出框）。 */
    if (e.classList && e.classList.contains("gm-pm-kpi")) {
      const lab = e.querySelector(".gm-pm-kpi__l"), val = e.querySelector(".gm-pm-kpi__v"),
            des = e.querySelector(".gm-pm-kpi__d");
      if (lab && val && des) {
        const lb = lab.getBoundingClientRect(), vb = val.getBoundingClientRect(), db = des.getBoundingClientRect();
        if (vb.top < lb.bottom - 1 || db.top < vb.bottom - 1)
          out.kpiStack.push(`${path(e)} 数字/说明未纵向堆叠（label ${Math.round(lb.bottom)} / 数字 ${Math.round(vb.top)} / 说明 ${Math.round(db.top)}）`);
      }
    }

    /* 文字被切：Range 文本宽 > 内容盒 且 布局层面确实溢出（排除伪元素热区虚高与墨迹高估） */
    if (!e.children.length && (e.textContent || "").trim()) {
      let scrollable = false, n2 = e;
      while (n2 && n2 !== document.body) { const c2 = getComputedStyle(n2);
        if (["auto", "scroll", "hidden", "clip"].includes(c2.overflowX)) { scrollable = true; break; } n2 = n2.parentElement; }
      const rng = document.createRange(); rng.selectNodeContents(e);
      const rects = [...rng.getClientRects()];
      if (!scrollable && !["CODE", "PRE"].includes(e.tagName) && rects.length) {
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const over = Math.max(...rects.map((q) => q.width)) - (r.width - pad);
        if (over > 4 && e.scrollWidth > e.clientWidth + 1)
          out.textClip.push(`${path(e)} 超出 ${Math.round(over)}px「${(e.textContent || "").trim().slice(0, 18)}」`);
      }
    }

    /* 布局塌陷：表格容器被压到远小于视口 —— 网格项错位（多一个/少一个子元素）的典型症状。
       实测过：把工作台菜单拆成两个 <nav> 后 `.gm-pm-wb` 多出一个网格项，内容被塞进 212px 的菜单列、
       表格横向滚 641px —— 而"无溢出 / 无重叠 / 无白条"这些判据**全都看不出来**。 */
    if (e.classList && e.classList.contains("gm-tbl-wrap")) {
      const inner = e.clientWidth;
      if (inner > 0 && inner < Math.min(220, vw * 0.3))
        out.collapse.push(`${path(e)} 表格容器仅 ${inner}px（视口 ${vw}）`);
    }

    const fs = parseFloat(cs.fontSize);
    /* 字号 <12px：分两桶 —— 设备模拟（.phone/.scr/.pm-screen/.mkpi…）里的文字是按缩放画的，
       11px 在 238px 宽的机身里等效于真机 ~17px，属于**刻意**的；真实内容里的 <12px 才要修。 */
    if (!e.children.length && (e.textContent || "").trim() && fs && fs < 12) {
      const mock = e.closest(".phone,.phones,.scr,.pm-screen,.pm-frame,.demo-card,.demo-stage,.pm-at-root");
      (mock ? out.tinyMock : out.tiny).push(`${path(e)} ${fs}px`);
    }
    if (vw < 768 && /^(BUTTON|A|INPUT|SELECT|SUMMARY)$/.test(e.tagName) && !e.disabled
        /* 亚像素容差：44×44 实测可能报 43.99（<0.5px 舍入），不算违规 */
        && !(r.width >= 43.5 && r.height >= 43.5) && !pseudoHot(e)
        && !(e.tagName === "A" && cs.display.startsWith("inline") && e.closest("p,li,td,dd")
             && (e.closest("p,li,td,dd").innerText || "").length > 40 && r.height >= 24))
      out.touch.push(`${path(e)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  for (const k of Object.keys(out)) if (Array.isArray(out[k])) out[k] = [...new Set(out[k])];
  return out;
};

const browser = await chromium.launch();
const findings = { P0: [], P1: [], P2: [], P3: [] };
const rows = [];
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const c of CASES.filter((x) => x.widths.includes(w))) {
    await page.goto(`${BASE}/${c.url}`, { waitUntil: "load" });
    await page.waitForTimeout(260);
    const r = await page.evaluate(PROBE, { rootSel: c.root });
    if (r.missing) { findings.P1.push(`${c.name} @${w} 未找到根节点 ${c.root}`); continue; }
    const tag = `${c.name} @${w}`;
    if (r.overflowX > 1) findings.P0.push(`${tag} 页面横向溢出 ${r.overflowX}px`);
    if (r.white.length) findings.P0.push(`${tag} 背景白条 ${r.white.length} 点（${r.white.slice(0, 2).join(" / ")}）`);
    if (r.outOfBox.length) findings.P1.push(`${tag} 出框 ${r.outOfBox.length}：${r.outOfBox.slice(0, 2).join(" | ")}`);
    if (r.overlap.length) findings.P1.push(`${tag} 块级重叠 ${r.overlap.length}：${r.overlap.slice(0, 2).join(" | ")}`);
    if (r.textClip.length) findings.P2.push(`${tag} 文字被切 ${r.textClip.length}：${r.textClip.slice(0, 2).join(" | ")}`);
    if (r.collapse.length) findings.P1.push(`${tag} 布局塌陷 ${r.collapse.length}：${r.collapse.slice(0, 2).join(" | ")}`);
    if (r.navCover.length) findings.P1.push(`${tag} 导航遮挡 ${r.navCover.length}：${r.navCover.slice(0, 2).join(" | ")}`);
    if (r.kpiStack.length) findings.P1.push(`${tag} KPI 未纵向堆叠 ${r.kpiStack.length}：${r.kpiStack.slice(0, 2).join(" | ")}`);
    if (r.touch.length) findings.P3.push(`${tag} 热区不足 ${r.touch.length}：${r.touch.slice(0, 2).join(" | ")}`);
    if (r.tiny.length) findings.P3.push(`${tag} 字号 <12px ${r.tiny.length}：${r.tiny.slice(0, 2).join(" | ")}`);
    if (r.tinyMock.length) findings.P3.push(`${tag} 字号 <12px（设备模拟内，登记）${r.tinyMock.length}：${r.tinyMock.slice(0, 1).join("")}`);
    rows.push({ tag, overflowX: r.overflowX, white: r.white.length, outOfBox: r.outOfBox.length,
      overlap: r.overlap.length, textClip: r.textClip.length, collapse: r.collapse.length,
      navCover: r.navCover.length, kpiStack: r.kpiStack.length,
      touch: r.touch.length, tiny: r.tiny.length, tinyMock: r.tinyMock.length });
  }
  await page.close();
}
await browser.close();
SRV?.srv.close();

const report = [`# 布局体检（多断点响应式 · 背景白条 · 组件错位）`, ``,
  `断点：${WIDTHS.join(" / ")}　用例：${CASES.length} 个页面/视图 × ${WIDTHS.length} 档 = ${rows.length} 次扫描`, ``,
  `| 用例 | 溢出 | 白条 | 出框 | 重叠 | 塌陷 | 导航遮挡 | KPI 堆叠 | 被切 | 热区 | <12px | <12px（设备模拟，登记） |`,
  `| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`,
  ...rows.map((r) => `| ${r.tag} | ${r.overflowX} | ${r.white} | ${r.outOfBox} | ${r.overlap} | ${r.collapse} | ${r.navCover} | ${r.kpiStack} | ${r.textClip} | ${r.touch} | ${r.tiny} | ${r.tinyMock} |`), ``];
for (const lvl of ["P0", "P1", "P2", "P3"]) {
  report.push(`## ${lvl}（${findings[lvl].length}）`, ...(findings[lvl].length ? findings[lvl].slice(0, 40).map((x) => `- ${x}`) : ["（无）"]), ``);
}
writeFileSync(join(ROOT, "docs", "layout-gate-report.md"), report.join("\n"), "utf8");

const blocking = findings.P0.length + findings.P1.length + findings.P2.length;
console.log(`布局体检：${rows.length} 次扫描 · P0 ${findings.P0.length} · P1 ${findings.P1.length} · P2 ${findings.P2.length} · P3 ${findings.P3.length}`);
for (const lvl of ["P0", "P1", "P2"]) for (const f of findings[lvl].slice(0, 8)) console.log(`  [${lvl}] ${f}`);
console.log(`-> docs/layout-gate-report.md`);
if (blocking) { console.log(`\n布局体检未通过：P0–P2 共 ${blocking} 条`); process.exit(1); }
console.log(`\nOK 布局体检通过（P0–P2 = 0；P3 ${findings.P3.length} 条为登记项）`);
