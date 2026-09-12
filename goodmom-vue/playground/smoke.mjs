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
check("级联 inline 面板常驻", (await page.locator(".gm-cascader--inline .gm-cascader__panel").count()) === 1);
check("虚拟列表窗口化（只渲染窗口内项）",
  (await page.locator(".gm-vlist__item").count()) > 0 && (await page.locator(".gm-vlist__item").count()) < 40,
  `${await page.locator(".gm-vlist__item").count()} 项 / 共 2000`);

/* ── 2. 状态标签语义取色（15 章词库自动映射） ────────────────────── */
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
check("待随访 → attention 琥珀", fu?.color === "rgb(185, 119, 28)", fu?.color);
check("高危 → risk 珊瑚", gao?.color === "rgb(211, 84, 102)", gao?.color);
check("阳性 → risk 珊瑚", yang?.color === "rgb(211, 84, 102)", yang?.color);
check("已建档 → info 蓝", yijian?.color === "rgb(74, 118, 208)", yijian?.color);
const unknown = tagColors.find((t) => t.text.includes("未登记"));
check("未登记文案回落 neutral 灰", unknown?.color === "rgb(117, 126, 142)", unknown?.color);

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
