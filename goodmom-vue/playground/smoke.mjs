/**
 * 组件库真机冒烟（不随包发布）
 * 用法：node playground/smoke.mjs
 * 前置：dev server 已在 5273 运行
 *
 * 检查项（对齐 skill 的验收红线）：
 *  - 无控制台报错 / 未捕获异常
 *  - 各组件区块真实渲染出预期节点数
 *  - primary 按钮底色不透明、文字为深字（不出现白字粉底）
 *  - 键盘可达：RiskPicker 方向键切换、Cascader Escape 归还焦点
 */
import { chromium } from "playwright";

const URL = "http://localhost:5273/";
const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".gm-btn", { timeout: 15000 });

/* ── 1. 渲染计数 ─────────────────────────────────────────────────── */
check("按钮渲染", (await page.locator(".gm-btn").count()) >= 13, `${await page.locator(".gm-btn").count()} 个`);
check("标签渲染", (await page.locator(".gm-tag").count()) >= 6);
check("状态标签渲染", (await page.locator(".gm-status-tag").count()) >= 6);
check("头像渲染", (await page.locator(".gm-avatar").count()) >= 3);
check("卡片渲染", (await page.locator(".gm-card").count()) >= 3);
check("服务对象卡渲染", (await page.locator(".gm-client").count()) >= 1);
check("空状态渲染", (await page.locator(".gm-empty").count()) >= 1);
check("骨架屏渲染", (await page.locator(".gm-skeleton i").count()) >= 3);
check("步骤条渲染", (await page.locator(".gm-step").count()) === 4, `${await page.locator(".gm-step").count()} 步`);
check("风险五色渲染", (await page.locator('.gm-risk-it[role="radio"]').count()) === 5)
check("级联触发点渲染", (await page.locator(".gm-cascader__trigger").count()) >= 3);

/* V2.9 视觉契约（与 React 侧同一口径）：五色**只承载装饰**，文字走主文字色。
   亮色当文字实测 1.57–2.19:1；依据站点五色图例与手册 D6「亮渐变=装饰，文字承载=深档」。 */
const fiveContract = await page.evaluate(() => {
  const chip = document.querySelector(".gm-risk-it[role=radio]");
  const avatar = document.querySelector(".gm-avatar");
  return {
    chipText: chip ? getComputedStyle(chip).color : null,
    chipDot: chip?.querySelector("i") ? getComputedStyle(chip.querySelector("i")).backgroundColor : null,
    avBg: avatar ? getComputedStyle(avatar).backgroundImage : "",
    avInk: avatar ? getComputedStyle(avatar).color : null,
  };
});
check("风险 chip 文字不用五色亮值（色点承载颜色）",
  fiveContract.chipText === "rgb(52, 58, 70)" && fiveContract.chipDot === "rgb(76, 185, 138)",
  `文字 ${fiveContract.chipText} · 色点 ${fiveContract.chipDot}`);
check("头像为浅底渐变 + 深墨字（非白字压亮粉）",
  /rgb\(255, 222, 232\)/.test(fiveContract.avBg) && fiveContract.avInk === "rgb(178, 58, 99)",
  `${fiveContract.avInk} on ${fiveContract.avBg.slice(0, 60)}`);
check("级联 inline 面板常驻", (await page.locator(".gm-cascader--inline .gm-cascader__panel").count()) === 1);
check("虚拟列表窗口化（只渲染窗口内项）",
  (await page.locator(".gm-vlist__item").count()) > 0 && (await page.locator(".gm-vlist__item").count()) < 40,
  `${await page.locator(".gm-vlist__item").count()} 项 / 共 2000`);

/* ── 2. 状态标签语义取色（15 章词库自动映射） ────────────────────── */
/* ⚠️ 期望值是**实现值**（theme.css 的 --lg-sem-* 浅底档），不是 02 章旧表里的值：
   本组断言曾长期为红 —— 它照抄了 V2.8「语义色板达 AA」之前的旧值（#B9771C 等），
   深档化后没人同步，而它不在 CI 里所以一直没人发现（V2.9 修复并纳入 CI）。
   现行口径由 `scripts/audit.py --only semantic-parity` 与 02 · 2.1.9 共同守住。 */
/* 注意：只取 .gm-status-tag 且取 [data-gm-text] 的文本——
   两者混在一个选择器里会把 GmTag 的色误当成 GmStatusTag 的自动映射结果；
   取整个元素 textContent 会把 closable 的关闭按钮文案混进状态文案。 */
const tagColors = await page.$$eval(".gm-status-tag", (els) =>
  els.map((e) => ({
    text: (e.querySelector("[data-gm-text]")?.textContent ?? "").trim(),
    color: getComputedStyle(e).color,
  }))
);
const fu = tagColors.find((t) => t.text === "待随访");
const gao = tagColors.find((t) => t.text === "高危");
const yang = tagColors.find((t) => t.text === "阳性");
const yijian = tagColors.find((t) => t.text === "已建档");
check("待随访 → attention 琥珀 #8D5A15", fu?.color === "rgb(141, 90, 21)", fu?.color);
check("高危 → risk 珊瑚 #B72F42", gao?.color === "rgb(183, 47, 66)", gao?.color);
check("阳性 → risk 珊瑚 #B72F42", yang?.color === "rgb(183, 47, 66)", yang?.color);
check("已建档 → info 蓝 #3261C1", yijian?.color === "rgb(50, 97, 193)", yijian?.color);
const unknown = tagColors.find((t) => t.text.includes("未登记"));
check("未登记文案回落 neutral 灰 #5E6673", unknown?.color === "rgb(94, 102, 115)", unknown?.color);

/* ── 3. 主行动按钮配色契约（D9：亮粉底必须深字） ─────────────────── */
/* 只取 status=default 的 primary —— 主行动渐变是「类型默认档」，
   status 会刻意覆盖底色（success/warning/danger 走 D5 深档实底）。 */
const btn = await page.locator(".gm-btn--primary:not(.gm-btn--success):not(.gm-btn--warning):not(.gm-btn--danger)").first()
  .evaluate((e) => {
    const s = getComputedStyle(e);
    return { text: e.textContent.trim(), color: s.color, bg: s.backgroundImage || s.backgroundColor };
  });
check("primary 文字为深字 #343A46", btn.color === "rgb(52, 58, 70)", `${btn.text}: ${btn.color}`);
check("primary 底色为品牌粉渐变", btn.bg.includes("gradient"), `${btn.text}: ${btn.bg.slice(0, 70)}`);
/* D9 反例守卫：品牌粉底 + 白字 = 2.9:1，属规范违规，必须拦住 */
const whiteOnPink = await page.$$eval(".gm-btn--primary", (els) =>
  els.filter((e) => {
    const s = getComputedStyle(e);
    return s.color === "rgb(255, 255, 255)" && s.backgroundImage.includes("gradient");
  }).length
);
check("无「粉底白字」违规按钮", whiteOnPink === 0, `${whiteOnPink} 个`);
/* 尺寸类不得吃掉类型底色（曾因 .gm-btn--default 同名冲突导致 primary 变灰底） */
const sizeNotOverriding = await page.$$eval(".gm-btn--primary", (els) =>
  els.filter((e) => getComputedStyle(e).backgroundColor === "rgb(244, 240, 236)").length
);
check("尺寸类未覆盖 primary 底色", sizeNotOverriding === 0, `${sizeNotOverriding} 个被覆盖`);

/* ── 4. 进度条 ARIA ─────────────────────────────────────────────── */
const pb = await page.locator('[role="progressbar"]').first().evaluate((e) => ({
  now: e.getAttribute("aria-valuenow"), text: e.getAttribute("aria-valuetext"),
}));
check("进度条 aria-valuenow", pb.now === "45", pb.now);
check("进度条 aria-valuetext 人话", pb.text === "已完成 45%", pb.text);

/* ── 5. RiskPicker 键盘（roving tabindex + 方向键） ─────────────── */
const checkedBefore = await page.locator('.gm-risk-it[aria-checked="true"]').textContent();
await page.locator('.gm-risk-it[aria-checked="true"]').focus();
await page.keyboard.press("ArrowRight");
const checkedAfter = await page.locator('.gm-risk-it[aria-checked="true"]').textContent();
check("RiskPicker 方向键切换", checkedBefore !== checkedAfter, `${checkedBefore?.trim()} → ${checkedAfter?.trim()}`);
const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute("role"));
check("RiskPicker 焦点跟随选中项", focusedRole === "radio", `activeElement role=${focusedRole}`);

/* ── 6. Cascader 键盘 + Escape 归还焦点 ─────────────────────────── */
/* 用 data-probe 的隔离实例：v-model 是双向绑定，共享 ref 的三个实例会互相污染 */
const cascader = page.locator('.gm-cascader[data-probe="cascader"]');
const trigger = cascader.locator(".gm-cascader__trigger");
await trigger.click();
await page.waitForSelector('.gm-cascader[data-probe="cascader"].is-open .gm-cascader__col', { timeout: 5000 });
/* 初始只有第 1 级列（path 为空） */
const colCount1 = await cascader.locator(".gm-cascader__col").count();
check("Cascader 展开面板（初始 1 级列）", colCount1 === 1, `${colCount1} 列`);
/* 选中一个带子级的项 → 展开第 2 级列 */
await cascader.locator(".gm-cascader__col").first().locator('button[role="option"]').first().click();
await page.waitForTimeout(250);
const colCount2 = await cascader.locator(".gm-cascader__col").count();
check("Cascader 选父级后展开下一列", colCount2 === 2, `${colCount2} 列`);
const rovingOk = await cascader.locator(".gm-cascader__col").first()
  .locator('button[role="option"][tabindex="0"]').count();
check("Cascader 列内 roving tabindex（仅 1 项可 Tab 停靠）", rovingOk === 1, `${rovingOk} 项`);
await page.keyboard.press("Escape");
await page.waitForTimeout(250);
const focusReturned = await page.evaluate(() => document.activeElement?.classList.contains("gm-cascader__trigger"));
check("Cascader Escape 后焦点归还触发点", focusReturned === true);

/* ── 7. 暗色模式切换 ───────────────────────────────────────────── */
await page.locator(".gm-btn").first().click();
await page.waitForTimeout(250);
const darkVars = await page.evaluate(() => {
  const root = document.querySelector("[data-theme='dark']");
  if (!root) return null;
  const s = getComputedStyle(root);
  return { text: s.getPropertyValue("--lg-text-primary").trim(), sem: s.getPropertyValue("--lg-sem-risk").trim() };
});
check("暗色模式变量生效", darkVars?.text === "#F3EFEC", JSON.stringify(darkVars));

/* ── 8. 截图留证 ──────────────────────────────────────────────── */
await page.locator(".gm-btn").first().click(); // 切回亮色
await page.waitForTimeout(250);
await page.screenshot({ path: "playground/smoke-light.png", fullPage: true });
await page.locator(".gm-btn").first().click();
await page.waitForTimeout(250);
await page.screenshot({ path: "playground/smoke-dark.png", fullPage: true });
check("截图产出", true, "playground/smoke-light.png / smoke-dark.png");

/* ── 9. 移动端断点 ────────────────────────────────────────────── */
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
const rvMode = await page.locator(".gm-rv").getAttribute("data-mode");
check("ResponsiveView 窄容器解析为 card", rvMode === "card", `data-mode=${rvMode}`);
const stepsDirection = await page.locator(".gm-steps").first().evaluate((e) => getComputedStyle(e).flexDirection);
check("步骤条移动端纵向", stepsDirection === "column", stepsDirection);
await page.screenshot({ path: "playground/smoke-mobile.png", fullPage: true });

/* ── 9b. 反复改尺寸不得触发 ResizeObserver 循环报错 ──────────────
   Chrome 在 RO 回调里同步改布局会抛 "ResizeObserver loop completed with undelivered
   notifications"（未捕获错误）。GmResponsiveView 用 rAF 延迟规避，这里主动压测守门。 */
for (const w of [1200, 900, 700, 390, 1280]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(320);
}
const roErrors = errors.filter((e) => e.includes("ResizeObserver"));
check("反复改尺寸无 ResizeObserver 循环报错", roErrors.length === 0, roErrors.slice(0, 2).join(" | "));
const modesSeen = await page.locator(".gm-rv").getAttribute("data-mode");
check("改尺寸后形态仍可解析", ["table", "condensed", "card"].includes(modesSeen), `data-mode=${modesSeen}`);

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

/* ── 10. 控制台干净 ───────────────────────────────────────────── */
const realErrors = errors.filter((e) => !e.includes("favicon"));
check("无控制台错误 / 未捕获异常", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} 通过`);
if (failed.length) {
  console.log("失败项：" + failed.map((f) => f.name).join("、"));
  process.exit(1);
}
