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
/* 立刻还原：此前这里切换后没还原，B/C/D 段全都在暗色下跑，
   "浅色档"的对比度断言实际量的是暗色 —— 断言看着绿，其实测错了对象 */
await page.locator(".app-top button.gm-btn", { hasText: "浅色" }).click();
await page.waitForTimeout(350);
check("切回浅色不残留（后续断言在浅色下进行）",
  await page.evaluate(() => document.documentElement.getAttribute("data-theme") === null));

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

/* ── D. 4 个领域模块页面（13 章字段 / 15 章词库）─────────────────────── */
const PAGES = [
  ["#/childcare", "儿童保健", ["生长发育", "营养喂养", "心理行为发育", "视力保健", "听力保健", "口腔保健"]],
  ["#/vaccine", "疫苗接种", ["疫苗应种率", "到期未种"]],
  ["#/account", "账号与权限", ["权限矩阵"]],
];
for (const [hash, title, musts] of PAGES) {
  await page.goto(`${BASE}${hash}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1100);
  const got = await page.evaluate(() => document.body.innerText);
  check(`${hash} 渲染（标题=${title}）`, got.includes(title), got.slice(0, 40).replace(/\n/g, " "));
  const missing = musts.filter((m) => !got.includes(m));
  check(`${hash} 具备 13/15 章字段`, missing.length === 0, missing.length ? "缺 " + missing.join("、") : musts.length + " 项齐备");
}
/* institution 仅 admin：默认角色（doctor）应看到权限提示，切到 admin 后应看到真实页面 */
await page.goto(`${BASE}#/institution`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
check("#/institution 对非管理员显示权限提示", (await page.locator("[class*=gm-result]").count()) > 0);

/* ── E. 文字对比度：**对真实渲染底采样** ──────────────────────────────
   为什么不用"沿着祖先链合成背景"的模型：本探针第一版就是那么写的，出来 1.14:1 这种
   荒唐读数 —— 应用的底是 `body` 上一串 **三段式渐变**（两个光斑 + 一条线性），
   模型把三层 `background-image` 拍平成一个 stop、再兜底到白底，
   于是暗色档的浅色文字被算成"压在白底上"，成了假失败。
   既然底是渲染出来的，就直接量它：把候选文字的字形改成透明（`color:transparent`，元素自身的底纹留着，
   布局与底纹像素不变）→ 截屏 → 在页内用 canvas 解码 → 取该文字矩形内的像素亮度
   的 5/95 分位作两侧上界（避免边框线之类的零星像素造成假失败）。
   只有当**两侧上界都不达标**时才判失败 —— 与站点 `page-qa.mjs` 同口径。
   探针自带自证：注入一行不可读文字，必须被报出来（否则这条门禁就是摆设）。 */
const PAGE_COLOR_HELPERS = [
  "const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };",
  "const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);",
  "/* 两种序列化都要认：rgba(...) 与新版 color(srgb r g b / a)（标签色就是后者，漏了会错判） */",
  "const parse = (t) => {",
  "  let m = String(t).match(/rgba?\\(([^)]*)\\)/);",
  "  if (m) { const q = m[1].split(/[,\\s\\/]+/).filter(Boolean).map(Number); return [q[0], q[1], q[2], q.length > 3 ? q[3] : 1]; }",
  "  m = String(t).match(/color\\(srgb\\s+([^)]*)\\)/);",
  "  if (m) { const q = m[1].split(/[\\s\\/]+/).filter(Boolean).map(Number); return [q[0] * 255, q[1] * 255, q[2] * 255, q.length > 3 ? q[3] : 1]; }",
  "  return null;",
  "};",
].join("\n");

/* 注意：page.evaluate 只序列化传入的函数本身，闭包变量不会跟过去 ——
   所以辅助函数必须以源码字符串进页面、在页内 new Function 编译。 */
const runInPage = (src, arg) => page.evaluate(([s, a]) => new Function(s)()(a), [src, arg]);

const SRC_COLLECT = PAGE_COLOR_HELPERS + "\nreturn () => {" + [
  "const vw = innerWidth, vh = innerHeight, out = [];",
  "document.querySelectorAll('[data-pmc]').forEach((e) => e.removeAttribute('data-pmc'));",
  "document.querySelectorAll('main.app-page *, header.app-top *').forEach((el) => {",
  "  if (el.closest('.sr-only')) return;",
  "  const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');",
  "  if (!txt) return;",
  "  const cs = getComputedStyle(el);",
  "  if (cs.display === 'none' || cs.visibility !== 'visible' || parseFloat(cs.opacity) === 0) return;",
  "  if (parseFloat(cs.fontSize) < 10) return;",
  "  const r = el.getBoundingClientRect();",
  "  if (r.width < 2 || r.height < 2) return;",
  "  const visX = Math.min(r.right, vw) - Math.max(r.left, 0), visY = Math.min(r.bottom, vh) - Math.max(r.top, 0);",
  "  if (visX * visY < r.width * r.height * 0.6) return;",                       /* 被视口裁掉一半以上就不量 */
  "  const hit = document.elementFromPoint(Math.max(0, Math.min(vw - 1, r.left + r.width / 2)),",
  "                                        Math.max(0, Math.min(vh - 1, r.top + r.height / 2)));",
  "  if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) return;", /* 被别的层盖住：跳过而不是错量 */
  "  const fg = parse(cs.color);",
  "  if (!fg || fg[3] === 0) return;",
  "  const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight || '400', 10) >= 700;",
  "  const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;",
  "  el.setAttribute('data-pmc', '1');",
  "  out.push({ x: r.left, y: r.top, w: r.width, h: r.height, fg: fg, need: need,",
  "    label: (el.tagName + '.' + String(el.className).split(' ')[0]).slice(0, 24) + '「' + txt.slice(0, 10) + '」' });",
  "});",
  "return out;",
].join("\n") + "\n};";

const SRC_SAMPLE = PAGE_COLOR_HELPERS + "\nreturn (arg) => new Promise((resolve) => {" + [
  "const img = new Image();",
  "img.onload = () => {",
  "  const cv = document.createElement('canvas');",
  "  cv.width = img.width; cv.height = img.height;",
  "  const ctx = cv.getContext('2d', { willReadFrequently: true });",
  "  ctx.drawImage(img, 0, 0);",
  "  const bad = [];",
  "  for (const it of arg.items) {",
  /* 内缩 20%：元素自身的描边/圆角外的底色不该算进"文字底"（头像那圈 3px 白边就在矩形里） */
  "    const inx = Math.max(1, Math.round(it.w * 0.2)), iny = Math.max(1, Math.round(it.h * 0.2));",
  "    const x = Math.max(0, Math.round(it.x) + inx), y = Math.max(0, Math.round(it.y) + iny);",
  "    const w = Math.min(cv.width - x, Math.round(it.w) - inx * 2), h = Math.min(cv.height - y, Math.round(it.h) - iny * 2);",
  "    if (w < 2 || h < 2) continue;",
  "    const d = ctx.getImageData(x, y, w, h).data, ls = [];",
  "    for (let i = 0; i < d.length; i += 4) ls.push(d[i + 3] === 0 ? 1 : lum([d[i], d[i + 1], d[i + 2]]));",
  "    ls.sort((a, b) => a - b);",
  "    const at = (q) => ls[Math.min(ls.length - 1, Math.floor(q * (ls.length - 1)))];",
  "    const dark = at(0.05), light = at(0.95), fgL = lum(it.fg);",
  "    const ct = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);",
  "    const best = Math.max(ct(fgL, dark), ct(fgL, light));",
  "    if (best < it.need) bad.push(it.label + ' ' + best.toFixed(2) + ':1 < ' + it.need",
  "      + '（前景 rgb(' + it.fg.slice(0, 3).map(Math.round).join(',') + ') 底 ' + dark.toFixed(2) + '–' + light.toFixed(2) + '）');",
  "  }",
  "  resolve(bad);",
  "};",
  "img.src = 'data:image/png;base64,' + arg.b64;",
].join("\n") + "\n});";

/* 一页 = 若干滚动步，每步：收集可见文字 → 藏字形 → 截屏 → 页内采样 → 还原 */
const contrastOf = async (route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1100);
  const bad = [], sampled = [];
  for (let step = 0; step < 4; step++) {
    const items = await runInPage(SRC_COLLECT);
    if (items.length) {
      /* 只让**字形**透明：`visibility:hidden` 会把元素自己的背景一起藏掉，
         于是"文字底"变成了元素背后的卡片（头像渐变、标签底色全被抹掉）——踩过。 */
      await page.evaluate(() => document.querySelectorAll("[data-pmc]").forEach((e) => {
        e.dataset.pmcColor = e.style.color;
        e.style.color = "transparent";
      }));
      const shot = await page.screenshot();
      bad.push(...(await runInPage(SRC_SAMPLE, { b64: shot.toString("base64"), items })));
      await page.evaluate(() => document.querySelectorAll("[data-pmc]").forEach((e) => {
        e.style.color = e.dataset.pmcColor || "";
        delete e.dataset.pmcColor;
        e.removeAttribute("data-pmc");
      }));
      sampled.push(items.length);
    }
    const moved = await page.evaluate((d) => {
      const before = scrollY;
      scrollBy(0, d);
      return scrollY !== before;
    }, Math.round(844 * 0.8));
    if (!moved) break;
    await page.waitForTimeout(320);
  }
  await page.evaluate(() => scrollTo(0, 0));
  return { bad, measured: sampled.reduce((a, b) => a + b, 0) };
};

const L = await contrastOf("#/childcare");
check(`浅色档：无不可读文字（实底采样 ${L.measured} 处）`, L.bad.length === 0, L.bad.slice(0, 3).join(" | "));

/* 探针自证：注入必然不可读的文字，探针必须报出来（否则这条门禁等于没写） */
await page.evaluate(() => {
  const el = document.querySelector("header.app-top h1");
  el.dataset.pmcWas = el.style.color;
  el.style.color = "rgba(252,250,248,0.92)";
});
const proof = await contrastOf("#/childcare");
await page.evaluate(() => {
  const el = document.querySelector("header.app-top h1");
  el.style.color = el.dataset.pmcWas || "";
  delete el.dataset.pmcWas;
});
check("探针自证：注入不可读文字（浅底浅字）必须被报出", proof.bad.length > 0, proof.bad.slice(0, 2).join(" | "));

/* 暗色档：走应用自己的开关（只换 Token），并确认切回浅色不残留 */
await page.locator(".app-top button.gm-btn", { hasText: "暗色" }).click();
await page.waitForTimeout(450);
const D = await contrastOf("#/childcare");
check(`暗色档：无不可读文字（实底采样 ${D.measured} 处）`, D.bad.length === 0, D.bad.slice(0, 3).join(" | "));

await page.waitForTimeout(200);

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
