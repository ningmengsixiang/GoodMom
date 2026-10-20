/**
 * React 组件库契约冒烟（不随包发布）
 *
 * 用法：node playground/smoke.mjs        （自己构建 + 起静态服务，无需先开 dev server）
 *
 * 与 `goodmom-vue/playground/smoke.mjs` **逐项对应**：同名组件在两个包里必须渲染出同契约的
 * DOM / 语义色 / 无障碍属性。此前只有 Vue 侧有这套验收，React 侧一项都没有 ——
 * 上轮实测到的两个真实缺陷（环形直径被 Arco 的 `size` 吃掉、`actions` 与 `tags` 契约不一致）
 * 都属于"类型能过、渲染不对"，正是缺了这层验收才长期存活。
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

/* 先构建（保证测的是当前源码，而不是上一次的产物） */
execFileSync(process.execPath, [path.join(here, "build.mjs")], { stdio: "inherit" });

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = url === "/" ? path.join(here, "index.html") : path.join(here, url.replace(/^\//, ""));
  try {
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const URL = `http://127.0.0.1:${srv.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".gm-btn", { timeout: 15000 });

/* ── 1. 渲染计数（与 Vue 冒烟同口径）────────────────────────────── */
check("按钮渲染 ≥13", (await page.locator(".gm-btn").count()) >= 13, `${await page.locator(".gm-btn").count()} 个`);
check("标签渲染 ≥6", (await page.locator(".gm-tag").count()) >= 6);
check("状态标签渲染 ≥6", (await page.locator(".gm-status-tag").count()) >= 6);
check("头像渲染 ≥3", (await page.locator(".gm-avatar").count()) >= 3);
check("卡片渲染 ≥2", (await page.locator(".gm-card").count()) >= 2);
check("服务对象卡渲染", (await page.locator(".gm-client").count()) >= 1);
check("空状态渲染", (await page.locator(".gm-empty").count()) >= 1);
check("结果页渲染", (await page.locator('[class^="gm-result"]').count()) >= 1);
check("骨架渲染（胶囊行 ≥3）", (await page.locator(".gm-skeleton i").count()) >= 3);
check("Spin 渲染", (await page.locator(".gm-spin").count()) >= 3);
check("步骤条 4 步是 <ol>/<li> 有序列表", await page.evaluate(() => {
  const ol = document.querySelector("ol.gm-steps");
  return !!ol && ol.querySelectorAll("li.gm-step").length === 4;
}));
check("步骤条当前步带 aria-current=step", (await page.locator('.gm-step[aria-current="step"]').count()) === 1);
check("风险五色渲染 5 项 role=radio", (await page.locator('.gm-risk-it[role="radio"]').count()) === 5);

/* ── V2.10 Modal：先断言 role=dialog，再点取消关闭回收遮罩 ──
   演示里 Modal 默认打开（用于断言 DOM），其 fixed 遮罩会拦截页面上**一切**后续点击
   （实测把 Cascader 展开、排序点击等全部挡住），因此必须在一开始就关掉。 */
check("Modal role=dialog aria-modal", (await page.locator('.gm-modal__panel[role="dialog"][aria-modal="true"]').count()) >= 1);
await page.locator(".gm-modal__btn").first().click();
await page.waitForSelector(".gm-modal", { state: "detached", timeout: 3000 });

/* V2.9 视觉契约：五色**只承载装饰**，文字走主文字色。
   把亮色当文字用实测 1.57–2.19:1（GmStatusTag / GmRiskPicker 都踩过），
   依据站点五色图例与标准手册 D6「亮渐变=装饰，文字承载=深档」。 */
const fiveInk = await page.evaluate(() => {
  const FIVE = ["rgb(76, 185, 138)", "rgb(242, 193, 78)", "rgb(240, 149, 74)", "rgb(238, 92, 112)", "rgb(143, 106, 224)"];
  /* 必须挑**五色**标签（按住色点颜色认），别挑到语义标签 —— 第一版就挑错了，断言因此假失败 */
  const tag = [...document.querySelectorAll(".gm-status-tag")].find((e) => {
    const dot = e.querySelector(".gm-status-dot");
    return dot && FIVE.includes(getComputedStyle(dot).backgroundColor);
  });
  const chip = document.querySelector(".gm-risk-it[role=radio]");
  const cs = (el) => (el ? getComputedStyle(el) : null);
  return {
    tagText: cs(tag)?.color,
    tagDot: cs(tag?.querySelector(".gm-status-dot"))?.backgroundColor,
    chipText: cs(chip)?.color,
    chipDot: cs(chip?.querySelector("i"))?.backgroundColor,
  };
});
check("五色标签文字不用亮色（走主文字色）",
  fiveInk.tagText === "rgb(52, 58, 70)", `实际 ${fiveInk.tagText}`);
check("五色标签的**色点**仍承载五色（颜色不丢）",
  /rgb\(76, 185, 138\)|rgb\(242, 193, 78\)|rgb\(240, 149, 74\)|rgb\(238, 92, 112\)|rgb\(143, 106, 224\)/.test(fiveInk.tagDot || ""),
  `实际 ${fiveInk.tagDot}`);
check("风险 chip 文字不用亮色（色点/描边承载五色）",
  fiveInk.chipText === "rgb(52, 58, 70)" && !/rgb\(76, 185, 138\)/.test(fiveInk.chipText || ""),
  `文字 ${fiveInk.chipText} · 色点 ${fiveInk.chipDot}`);

/* 头像三档：浅底渐变 + 同色系深墨字（站点 .avt 同配方，三档实测 4.59–4.65:1） */
const avatars = await page.evaluate(() =>
  [...document.querySelectorAll(".gm-avatar")].slice(0, 3).map((e) => ({
    bg: getComputedStyle(e).backgroundImage, ink: getComputedStyle(e).color })));
check("头像三档都是浅底渐变 + 深墨字（非白字压亮粉）",
  avatars.length >= 3 && avatars.every((a) => /rgb\(2[0-5][0-9], 2[0-5][0-9], 2[0-5][0-9]\)/.test(a.bg)) &&
  avatars.every((a) => ["rgb(178, 58, 99)", "rgb(37, 113, 93)", "rgb(98, 66, 184)"].includes(a.ink)),
  avatars.map((a) => a.ink).join(" / "));
check("级联触发点渲染 ≥2", (await page.locator(".gm-cascader__trigger").count()) >= 2);
check("级联 inline 面板常驻", (await page.locator(".gm-cascader--inline .gm-cascader__panel").count()) === 1);

/* ── 2. 虚拟列表窗口化（1284 条只渲染窗口内）────────────────────── */
const vl = await page.evaluate(() => {
  const vp = document.querySelector(".gm-vlist__viewport");
  if (!vp) return null;
  const inner = vp.querySelector(".gm-vlist__inner");
  return {
    rendered: vp.querySelectorAll(".gm-vlist__item").length,
    innerH: inner ? Math.round(inner.getBoundingClientRect().height) : 0,
    first: vp.querySelector(".gm-vlist__item [role], .gm-vlist__item")?.textContent?.trim().slice(0, 12),
    role: vp.getAttribute("role"),
    setSize: vp.querySelector('[aria-setsize]')?.getAttribute("aria-setsize"),
  };
});
check("虚拟列表窗口化渲染（远少于 1284）", vl && vl.rendered > 0 && vl.rendered < 40, `窗口内 ${vl?.rendered}`);
check("虚拟列表 inner 撑满总高（1284×52）", vl && vl.innerH === 66768, `${vl?.innerH}px`);
check("虚拟列表 viewport role=list + 项报 aria-setsize", vl?.role === "list" && vl?.setSize === "1284", JSON.stringify(vl));

/* ── 3. 业务状态词 → 语义色（15 章字典唯一源）──────────────────── */
/* ⚠️ 期望值是**实现值**（theme.css 的 --lg-sem-* 浅底档），不是 02 章旧表里的值：
   02 章表 B 原写的 #B9771C 等是 V2.8「语义色板达 AA」**之前**的取值（作文字仅 3.67–4.38:1），
   深档化后表格漏改；照抄旧表写出来的断言会长期为红。V2.9 已统一口径并加
   `audit.py --only semantic-parity` 守门（02 / 14 / skill reference ⇄ theme.css）。
   另：读数必须**剔掉 sr-only 前缀**（标签里带「注意：待随访」这类读屏前缀），
   否则按文案找不到元素 —— 这是本冒烟第一版的真实 bug。 */
const tagColors = await page.evaluate(() =>
  [...document.querySelectorAll(".gm-status-tag")].map((e) => {
    const own = [...e.childNodes]
      .filter((n) => !(n.nodeType === 1 && n.classList && n.classList.contains("gm-sr-only")))
      .map((n) => n.textContent || "").join("").trim();
    const dot = e.querySelector(".gm-status-dot");
    return {
      text: own,
      color: getComputedStyle(e).color,
      dot: dot ? getComputedStyle(dot).backgroundColor : null,
      ds: e.getAttribute("data-semantic"),
    };
  })
);
const pick = (t) => tagColors.find((x) => x.text === t);
const fu = pick("待随访"), gao = pick("高危"), yang = pick("阳性");
const yijian = pick("已建档"), unknown = pick("这不是登记过的词");
check("待随访 → attention 琥珀 #8D5A15", fu?.color === "rgb(141, 90, 21)", `${fu?.color} / dot ${fu?.dot}`);
check("高危 → risk 珊瑚 #B72F42", gao?.color === "rgb(183, 47, 66)", `${gao?.color} / dot ${gao?.dot}`);
check("阳性 → risk 珊瑚 #B72F42", yang?.color === "rgb(183, 47, 66)", `${yang?.color} / dot ${yang?.dot}`);
check("已建档 → info 蓝 #3261C1", yijian?.color === "rgb(50, 97, 193)", `${yijian?.color} / dot ${yijian?.dot}`);
check("未登记文案回落 neutral 灰 #5E6673", unknown?.color === "rgb(94, 102, 115)", `${unknown?.color} / dot ${unknown?.dot}`);
check("色点与文字取同一个变量（暗色档一起翻）",
  !!fu && fu.dot === fu.color && !!gao && gao.dot === gao.color,
  `待随访 dot ${fu?.dot} vs text ${fu?.color}`);
check("状态标签走 data-semantic 而非内联色", await page.evaluate(() =>
  !!document.querySelector('.gm-status-tag[data-semantic="attention"]')));
check("semantic 与业务词推导出同一个 data-semantic",
  gao?.ds === "risk", `高危 → ${gao?.ds}`);

/* ── 4. 主行动按钮契约（D9：亮粉底必须深字）────────────────────── */
const btnAudit = await page.evaluate(() => {
  /* 尺寸类用 `--sz-*` 前缀（与 type="default" 的 `--default` 区分开） */
  const btns = [...document.querySelectorAll(".gm-btn")];
  let whiteOnPink = 0, badBg = [];
  const primary = btns.find((b) => b.className.includes("gm-btn--primary"));
  for (const b of btns) {
    const cs = getComputedStyle(b);
    const isDarkText = cs.color === "rgb(52, 58, 70)";
    const pinkish = cs.backgroundImage.includes("gradient") || /255, (196|169)|247, 127/.test(cs.backgroundColor);
    if (pinkish && !isDarkText) whiteOnPink++;
    if (b.className.includes("gm-btn--primary") && !cs.backgroundImage.includes("gradient")) badBg.push(b.textContent);
  }
  return {
    count: btns.length, whiteOnPink, badBg,
    primaryColor: primary ? getComputedStyle(primary).color : null,
    primaryBg: primary ? getComputedStyle(primary).backgroundImage.slice(0, 60) : null,
    smallPrimaryBg: (() => {
      const b = [...document.querySelectorAll(".gm-btn--sz-small")].find((x) => x.className.includes("gm-btn--primary"));
      return b ? getComputedStyle(b).backgroundImage.slice(0, 40) : null;
    })(),
    sizeClassCount: document.querySelectorAll(".gm-btn--sz-small, .gm-btn--sz-large").length,
  };
});
check("primary 文字为深字 #343A46", btnAudit.primaryColor === "rgb(52, 58, 70)", `${btnAudit.primaryColor}`);
check("primary 底色为品牌粉渐变", (btnAudit.primaryBg || "").includes("gradient"), (btnAudit.primaryBg || "").slice(0, 40));
check("无「粉底白字」违规按钮", btnAudit.whiteOnPink === 0, `${btnAudit.whiteOnPink} 个`);
check("尺寸类未覆盖 primary 底色（--sz-* 前缀）", (btnAudit.smallPrimaryBg || "").includes("gradient"), `${btnAudit.smallPrimaryBg || "未找到 sz 类"} · sz 类 ${btnAudit.sizeClassCount} 个`);
check("loading 按钮报 aria-busy 且保留宽度", await page.evaluate(() => {
  const b = [...document.querySelectorAll(".gm-btn")].find((x) => x.getAttribute("aria-busy") === "true");
  return !!b && b.getBoundingClientRect().width > 40;
}));
check("circle 形按钮有可访问名", await page.evaluate(() => {
  const b = [...document.querySelectorAll(".gm-btn")].find((x) => x.className.includes("gm-btn--circle"));
  return !!b && (b.getAttribute("aria-label") || "").length > 0;
}));

/* ── 5. 进度条 aria + 环形直径（V2.9 修复回归位）───────────────── */
const pb = await page.evaluate(() => {
  const el = [...document.querySelectorAll(".gm-progress")].find((e) => e.getAttribute("aria-valuenow") === "45");
  return el ? { now: el.getAttribute("aria-valuenow"), text: el.getAttribute("aria-valuetext") } : null;
});
check("进度条 aria-valuenow", pb?.now === "45", JSON.stringify(pb));
check("进度条 aria-valuetext 人话", pb?.text === "已完成 45%", pb?.text);
const rings = await page.evaluate(() => [...document.querySelectorAll("#ring-row .gm-progress")]
  .filter((e) => e.querySelector("svg"))
  .map((e) => Math.round(e.getBoundingClientRect().width)));
check("环形直径生效（88 / 120 两档）",
  rings.includes(88) && rings.includes(120),
  `${JSON.stringify(rings)}（修复前 Arco 的 size 会吃掉像素直径，恒为默认档）`);
check("环形 small 档仍在（≤72）", rings.some((w) => w <= 72), JSON.stringify(rings));
const indet = await page.evaluate(() => {
  const el = document.querySelector(".gm-progress--indet");
  return el ? { now: el.getAttribute("aria-valuenow"), text: el.getAttribute("aria-valuetext") } : null;
});
check("不确定进度不报假数值", indet && indet.now === null, JSON.stringify(indet));

/* ── 6. 键盘可达：RiskPicker 方向键 + 焦点跟随 ─────────────────── */
const first = page.locator('.gm-risk-it[role="radio"]').first();
await first.focus();
const before = await page.evaluate(() => document.activeElement?.textContent?.trim());
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(120);
const after = await page.evaluate(() => document.activeElement?.textContent?.trim());
check("RiskPicker 方向键切换", before !== after, `${before} → ${after}`);
check("RiskPicker 焦点跟随选中项", await page.evaluate(() =>
  document.activeElement?.getAttribute("role") === "radio"));
check("RiskPicker 组有可访问名", await page.evaluate(() =>
  (document.querySelector('.gm-risk[role="radiogroup"]')?.getAttribute("aria-label") || "").length > 0));

/* ── 7. 键盘可达：Cascader 展开 / roving / Esc 归还焦点 ─────────── */
const trig = page.locator(".gm-cascader__trigger").first();
await trig.focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(300);
const POPUP = ".gm-cascader:not(.gm-cascader--inline):not(.gm-cascader--picker)";
const cols1 = await page.locator(`${POPUP} .gm-cascader__panel > .gm-cascader__col`).count();
check("Cascader 展开面板（初始 1 级列）", cols1 === 1, `${cols1} 列（inline 实例的面板不算）`);
await page.locator(`${POPUP} .gm-cascader__col button:not([disabled])`).first().click();
await page.waitForTimeout(300);
const cols2 = await page.locator(`${POPUP} .gm-cascader__panel > .gm-cascader__col`).count();
check("Cascader 选父级后展开下一列", cols2 === 2, `${cols2} 列`);
const roving = await page.evaluate(() => {
  const root = [...document.querySelectorAll(".gm-cascader__panel")]
    .find((p) => !p.closest(".gm-cascader--inline") && !p.closest(".gm-cascader--picker"));
  if (!root) return null;
  const cols = [...root.querySelectorAll(".gm-cascader__col")];
  return {
    cols: cols.length,
    perCol: cols.map((c) => [...c.querySelectorAll('button[role="option"][tabindex="0"]')].length),
  };
});
/* 契约是**每列**恰好 1 个 Tab 停靠点（Vue 侧同实现：`active[ci]` 逐列取值），
   整列变成 N 个停靠点才是缺陷；因此断言"每列各 1"，而不是跨列合计 1。 */
check("Cascader 列内 roving tabindex（每列恰好 1 项可 Tab 停靠）",
  !!roving && roving.perCol.length > 0 && roving.perCol.every((n) => n === 1),
  roving ? `${roving.cols} 列 → 每列 ${roving.perCol.join("/")}` : "未找到面板");
await page.keyboard.press("Escape");
await page.waitForTimeout(250);
check("Cascader Escape 后焦点归还触发点", await page.evaluate(() =>
  !!document.activeElement?.classList.contains("gm-cascader__trigger")));

/* ── 8. 响应式：按容器宽度切形态 + 无 RO 循环报错 ──────────────── */
const modeAt = async (w) => {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(220);
  return page.evaluate(() => document.querySelector(".gm-rv")?.getAttribute("data-mode"));
};
const wide = await modeAt(1280);
const narrow = await modeAt(390);
check("ResponsiveView 宽容器解析为 table", wide === "table", `${wide}`);
check("ResponsiveView 窄容器解析为 card", narrow === "card", `${narrow}`);
const stepsDirection = await page.evaluate(() =>
  getComputedStyle(document.querySelector(".gm-steps")).flexDirection);
check("步骤条移动端纵向", stepsDirection === "column", stepsDirection);
const modes = [];
for (const w of [1280, 900, 700, 390, 900, 1280]) modes.push(await modeAt(w));
check("反复改尺寸无 ResizeObserver 循环报错",
  errors.filter((e) => e.includes("ResizeObserver")).length === 0,
  errors.filter((e) => e.includes("ResizeObserver")).slice(0, 2).join(" | "));
check("改尺寸后形态仍可解析", modes.every((m) => ["table", "condensed", "card"].includes(m)), modes.join(","));

/* ── 9. 暗色档：只换变量（页面零暗色规则）─────────────────────── */
const darkProbe = () => page.evaluate(() => {
  const tag = [...document.querySelectorAll(".gm-status-tag")]
    .find((e) => (e.textContent || "").includes("待随访"));
  const dot = tag ? tag.querySelector(".gm-status-dot") : null;
  const card = document.querySelector(".gm-card");
  return {
    text: getComputedStyle(document.documentElement).getPropertyValue("--lg-text-primary").trim(),
    sem: getComputedStyle(document.documentElement).getPropertyValue("--lg-sem-attention").trim(),
    cardBg: card ? getComputedStyle(card).backgroundImage.slice(0, 70) : null,
    dot: dot ? getComputedStyle(dot).backgroundColor : null,
  };
});
const lightSnap = await darkProbe();
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
await page.waitForTimeout(200);
const darkSnap = await darkProbe();
check("暗色档文字变量切换（#F3EFEC）", lightSnap.text !== "#F3EFEC" && darkSnap.text === "#F3EFEC",
  `${lightSnap.text} → ${darkSnap.text}`);
check("暗色档语义色变量切换（attention #F2C14E）", darkSnap.sem === "#F2C14E", `${lightSnap.sem} → ${darkSnap.sem}`);
check("暗色档组件随之换档：卡片渐变不同", !!lightSnap.cardBg && lightSnap.cardBg !== darkSnap.cardBg,
  `${(lightSnap.cardBg || "").slice(15, 58)} → ${(darkSnap.cardBg || "").slice(15, 58)}`);
check("暗色档组件随之换档：语义色点翻浅档", lightSnap.dot !== darkSnap.dot && darkSnap.dot === "rgb(242, 193, 78)",
  `${lightSnap.dot} → ${darkSnap.dot}`);
await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));

/* ── 10. Toast：error 走 role=alert ───────────────────────────── */
const roles = await page.evaluate(() => [...document.querySelectorAll(".gm-toast")]
  .map((t) => t.getAttribute("role")));
check("GmToast error → role=alert，其余 → role=status",
  roles.includes("alert") && roles.includes("status"), JSON.stringify(roles));

/* ── 11. 字典自检 ─────────────────────────────────────────────── */
const biz = await page.locator("#biz-count").textContent();
check("业务状态词字典已随包导出", Number(biz) >= 60, `${biz} 条`);

/* ── 12. V2.10 新组件：Table / Collapse / Descriptions / 反馈族 / 生长曲线 ── */
check("表格渲染（th scope=col）", (await page.locator(".gm-tbl th[scope=col]").count()) >= 4,
  `${await page.locator(".gm-tbl th[scope=col]").count()} 列`);
check("可排列表头带 aria-sort", (await page.locator(".gm-tbl th[aria-sort]").count()) >= 1);
await page.locator(".gm-tbl__sortbtn").first().click();
const sortState = await page.locator(".gm-tbl th[aria-sort]").first().getAttribute("aria-sort");
check("排序点击切换 ascending（TB-15-02）", sortState === "ascending", String(sortState));
check("折叠面板 summary aria-expanded+controls",
  (await page.locator(".gm-fold summary[aria-expanded][aria-controls]").count()) >= 3);
check("折叠面板展开态", (await page.locator(".gm-fold[open]").count()) >= 1);
check("描述列表 dd.v 渲染", (await page.locator(".gm-desc dd.v").count()) >= 5,
  `${await page.locator(".gm-desc dd.v").count()} 项`);
check("Popconfirm 触发器 aria-haspopup=dialog + 气泡 role=dialog",
  (await page.locator('.gm-popconfirm__trg[aria-haspopup="dialog"]').count()) >= 1 &&
  (await page.locator('.gm-popconfirm__pop[role="dialog"]').count()) >= 1);
check("Popover 气泡 role=dialog", (await page.locator('.gm-popover__pop[role="dialog"]').count()) >= 1);
check("Tooltip role=tooltip", (await page.locator('.gm-tooltip__tip[role="tooltip"]').count()) >= 1);
check("生长曲线 svg role=img + aria-label",
  (await page.locator('.gm-growth__svg[role="img"][aria-label]').count()) >= 1);
check("生长曲线隐藏数据表（读屏逐点）",
  (await page.locator(".gm-growth table.gm-sr-only tbody tr").count()) >= 9,
  `${await page.locator(".gm-growth table.gm-sr-only tbody tr").count()} 行`);
check("生长曲线 P3/P97 开关 aria-pressed",
  (await page.locator('.gm-growth__toggle[aria-pressed]').count()) >= 1);
await page.locator(".gm-growth__toggle").first().click();
const warnHidden = await page.locator(".gm-growth__warns").first().getAttribute("display");
check("开关关闭后警戒线组隐藏", warnHidden === "none", String(warnHidden));

/* ── 孤儿类名（V2.9 新增）─────────────────────────────────────────────
   背景：`GmStatusTag` 的 `size="large"` 曾输出类名字面量 `" lg"`，而两库 CSS 只定义了
   `.gm-status-tag--large` —— 于是该 prop **完全无效**，且**没有任何门禁看得见**：
   `check-component-contract.py` 只比对 `gm-*` 前缀的字面量，裸类名 `lg` 不在它的视野里。
   这里补上"输出即须有样式"这一条：演示页里组件渲染出的**每一个 class token**
   都必须能匹配到至少一条 CSS 规则，否则就是死类名（无效档位 / 笔误 / 已改名的残留）。
   框架与状态类（arco-/v-/vue-/is-/js-）不参与判定 —— 它们不由本库的 CSS 定义。 */
const orphanClasses = await page.evaluate(() => {
  const known = new Set();
  const collect = (rules) => {
    for (const r of Array.from(rules || [])) {
      if (r.selectorText) for (const m of r.selectorText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) known.add(m[1]);
      if (r.cssRules) collect(r.cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try { collect(sheet.cssRules); } catch { /* 跨域表跳过 */ }
  }
  const ALLOW = [/^arco-/, /^v-/, /^vue-/, /^is-/, /^js-/, /^no-js$/];
  // 「与基态等价」的修饰类：组件按约定输出档位/状态类，而该档位**就是基态**，
  // CSS 不再重复声明一遍。每条都必须写明理由 —— 否则它会变成新死类名的藏身处，
  // 而 `" lg"` 正是这样活了很久的（一个没有任何规则的类名，让 size="large" 完全失效）。
  const BASE_EQUIVALENT = new Set([
    "gm-link--default",      // 基态：.gm-link 已定义默认色与下划线行为
    "gm-progress--default",  // 基态：轨道 6px 由 .gm-progress__track 给出（--small/--large 覆写）
    "gm-rv--table",          // 基态：三分支里 table 是默认形态（.gm-rv 已 display:block）
    "wait",                  // 步骤条等待态：色点样式由 .gm-step .gs-dot 基态给出
  ]);
  const out = new Set();
  for (const el of document.querySelectorAll("[class]")) {
    for (const c of Array.from(el.classList)) {
      if (ALLOW.some((re) => re.test(c)) || BASE_EQUIVALENT.has(c)) continue;
      if (!known.has(c)) out.add(c);
    }
  }
  return Array.from(out).sort();
});
check("无孤儿类名（输出的每个 class 都有对应 CSS 规则）",
  orphanClasses.length === 0, orphanClasses.join(", "));

check("无控制台错误 / 未捕获异常", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
srv.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} 通过`);
if (failed.length) {
  console.log("失败项：" + failed.map((f) => f.name).join("、"));
  process.exit(1);
}
