/**
 * 合并保真度校验：把 site/index.html 的每个模块与**其原页面**逐项对比。
 *
 * 用法（需先在仓库根起静态服务）：
 *   python3 -m http.server 5288
 *   node scripts/site-parity.mjs
 *
 * 思路：不猜选择器，而是枚举每个页面/模块内的**全部元素类名与 id**并求差集。
 * 合并只会因为"作用域改写 bug"丢元素或丢 id，所以差集应当为空。
 * 同时对比关键计算样式（模块根的文字色/字体），确认样式隔离没把主题改错。
 */
import { chromium } from "playwright";

const BASE = process.env.SITE_BASE || "http://localhost:5288";
const MERGED = `${BASE}/site/index.html`;

/** 模块 → **基线页面**（与 scripts/build-site.py 的 SOURCES 一致）
 *
 * 基线放在 site/.baseline/：合并后原页面已改写为重定向，若直接拿它们对比，
 * 拿到的是重定向页（甚至已跳到合并页），比对本就失去意义。
 * 基线是"合并前的原页面快照"，只用于本校验，不参与交付。
 * 相对路径说明：基线在 site/ 下、原预览页在 preview/ 下，两者深度相同，
 * 因此页面里的 ../logo.png 等相对路径在基线位置同样可解析。
 *
 * srcSel：基线里对应"模块内容"的根选择器。site-index 的产物是 *.wrap
 * （外壳导航取代了原 <nav>），整页对比会把外壳元素算成"多出来的"。
 */
const BASE_DIR = "site/.baseline";
const MODULES = {
  "site-index": { src: `${BASE_DIR}/site-index.html`, srcSel: ".wrap" },
  "preview-index": { src: `${BASE_DIR}/preview-index.html`, srcSel: "body" },
  "preview-examples": { src: `${BASE_DIR}/preview-examples.html`, srcSel: "body" },
  "preview-mobile": { src: `${BASE_DIR}/preview-mobile.html`, srcSel: "body" },
  "preview-patterns": { src: `${BASE_DIR}/preview-patterns.html`, srcSel: "body" },
  "site-spec": { src: `${BASE_DIR}/site-spec.html`, srcSel: "body" },
  "site-manual": { src: `${BASE_DIR}/site-manual.html`, srcSel: "body" },
  "site-docs": { src: `${BASE_DIR}/site-docs.html`, srcSel: "body" },
};

/** 合并时**有意移除**的类名（外壳统一导航取代了各页自建导航、旧页面返回链接已删）。
 *  只登记这一类，其余缺失都算回归。 */
const INTENTIONAL = new Set([
  // 各页自建顶栏/导航（外壳 .sh-top 取代）
  "topnav", "brand", "navgroups", "ng", "ngt", "ngdrop", "navr", "ext",
  // 顶栏内的直达按钮（"复制 Token" / "全屏示例"），随顶栏一并移除
  "direct", "primary",
  // 旧页面返回链接容器
  "r",
  // 依托 JS 渲染、初始 DOM 不存在（对比时会被误判为缺失）
  "hub", "on", "dir",
  // V2.9 有意移除：各页私有的常驻 Toast 节点（.copied / .mtoast）。
  // 它们原本以静态元素常驻 DOM，靠 class 切换显隐；现在统一由外壳的 window.gmToast()
  // **按需创建**（这样才拿得到"顶部偏上 + 避让吸顶导航"的统一位置，也不会在加载时闪一下）。
  "copied", "mtoast",
]);

/** 有意移除的 **id**（同上一类，节点整体不再常驻 DOM） */
const INTENTIONAL_IDS = new Set(["copied", "mtoast"]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

/** 收集某个根节点下所有元素的 class 计数与 id 集合 */
const COLLECT = (rootSel) => {
  const root = document.querySelector(rootSel);
  if (!root) return null;
  const classes = {};
  const ids = [];
  root.querySelectorAll("*").forEach((el) => {
    el.classList.forEach((c) => { classes[c] = (classes[c] || 0) + 1; });
    if (el.id) ids.push(el.id);
  });
  // 含根自身
  root.classList.forEach((c) => { classes[c] = (classes[c] || 0) + 1; });
  return { classes, ids, count: root.querySelectorAll("*").length };
};

let failed = 0;
const rows = [];

for (const [mod, cfg] of Object.entries(MODULES)) {
  // 原页面
  await page.goto(`${BASE}/${cfg.src}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const orig = await page.evaluate(COLLECT, cfg.srcSel);

  // 合并页中的模块
  await page.goto(MERGED, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate((m) => {
    document.querySelectorAll(".gm-mod").forEach((x) => x.classList.toggle("is-on", x.id === "gm-mod-" + m));
  }, mod);
  await page.waitForTimeout(300);
  const merged = await page.evaluate(COLLECT, `#gm-mod-${mod}`);

  if (!orig || !merged) { rows.push([mod, "FAIL", "未找到根节点"]); failed++; continue; }

  // 类名差集：合并后**缺失**的类（真正的回归信号），排除有意移除项
  const missingClasses = Object.keys(orig.classes)
    .filter((c) => !merged.classes[c] && !INTENTIONAL.has(c) && !c.startsWith("sh-"));
  // id 差集：原页面 id 去掉模块前缀后应仍存在
  const origIds = new Set(orig.ids);
  const mergedIds = new Set(merged.ids.map((i) => i.replace(`${mod}--`, "")));
  const missingIds = [...origIds].filter((i) =>
    !mergedIds.has(i) && !mergedIds.has(i.replace(/^.*?--/, "")) && !INTENTIONAL_IDS.has(i));

  const ok = missingClasses.length === 0 && missingIds.length === 0;
  if (!ok) failed++;
  rows.push([
    mod,
    ok ? "PASS" : "FAIL",
    `元素 ${orig.count}→${merged.count}  类名缺失 ${missingClasses.length}  id 缺失 ${missingIds.length}` +
      (missingClasses.length ? `\n      缺类: ${missingClasses.slice(0, 12).join(", ")}` : "") +
      (missingIds.length ? `\n      缺 id: ${missingIds.slice(0, 8).join(", ")}` : ""),
  ]);
}

/* 主题保真：模块根的文字色应与原页面 body 一致 */
await page.goto(MERGED, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
for (const [mod, cfg] of Object.entries(MODULES)) {
  if (mod === "site-index") continue;
  await page.goto(`${BASE}/${cfg.src}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const o = await page.evaluate(() => getComputedStyle(document.body).color);
  await page.goto(MERGED, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.evaluate((m) => {
    document.querySelectorAll(".gm-mod").forEach((x) => x.classList.toggle("is-on", x.id === "gm-mod-" + m));
  }, mod);
  await page.waitForTimeout(250);
  const m2 = await page.evaluate((m) => {
    const el = document.getElementById("gm-mod-" + m);
    return el ? getComputedStyle(el).color : null;
  }, mod);
  const ok = o === m2;
  if (!ok) failed++;
  rows.push([`${mod} · 文字色`, ok ? "PASS" : "FAIL", `原 ${o} → 合并 ${m2}`]);
}

await browser.close();

console.log("\n合并保真度校验\n" + "─".repeat(72));
for (const [a, b, c] of rows) console.log(`${b.padEnd(5)} ${a.padEnd(26)} ${c}`);
const total = rows.length;
console.log("─".repeat(72));
console.log(`${total - failed}/${total} 通过`);
if (failed) process.exit(1);
