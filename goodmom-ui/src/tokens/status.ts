/**
 * 状态语义 / 五色字典（对应规范：14 · 4.4.5、15.5、15.2.10）
 *
 * ⚠️ 单一映射源：本文件是 React 侧语义色唯一出处。任何组件（Tag / StatusTag / 图表 / 卡片）
 * 都只能从这里取色，禁止本地再写一份色表。
 *
 * 口径对齐（P1-12）：本文件的导出面与 `goodmom-vue/src/tokens/status.ts` **一致**
 * （SEMANTIC_COLOR / SEMANTIC_VAR / FIVE_COLOR / FIVE_VAR / SEMANTIC_LABEL / SEMANTIC_CSS_SUFFIX）。
 * 历史缺陷：Vue 有 `SEMANTIC_VAR` / `FIVE_VAR` / `SEMANTIC_LABEL` / `SEMANTIC_CSS_SUFFIX`，
 * React 全无 —— 于是 React 组件只能手拼 `"var(--mmh-m5-" + k + ",…)"`。
 */
export type GmSemantic = "positive" | "info" | "attention" | "risk" | "neutral" | "special";

/**
 * 六语义色（浅底文字/色点/描边）。
 *
 * P1-1：原值在近白底上 5/6 不达 WCAG AA（3.67–4.38:1）。
 * 现取"保持色相、压暗"至实测：近白 ≥5.79:1 ／ 13% 淡色片 ≥4.85:1 ／ 18% 淡色片 ≥4.50:1。
 * 该组值同时定义在 `theme.css` / `gm.css` / `base.css` 的 `--lg-sem-*`，四处必须同号。
 * 注意：**白字压在实底**上请改用 `SEMANTIC_SOLID`（D5 达标档），不要拿本表的色做填充底色。
 */
export const SEMANTIC_COLOR: Record<GmSemantic, string> = {
  positive: "#25715D",  // 正常/正向（绿）
  info: "#3261C1",      // 信息/进行（蓝）
  attention: "#8D5A15", // 注意/待办（琥珀）
  risk: "#B72F42",      // 风险/异常（珊瑚）
  neutral: "#5E6673",   // 中性/未动（灰）
  special: "#6A48DC",   // 特殊/协作（紫）
};

/**
 * 语义 → CSS 变量名。
 * 组件**应优先引用变量**：`theme.css` 在 `[data-theme="dark"]` 下会把它切换为暗色档，
 * 而静态 hex 不会跟随 —— 这是 P1-2 的根因（变量对、组件错、门禁绿、报告 ✅ 同时成立）。
 */
export const SEMANTIC_VAR: Record<GmSemantic, string> = {
  positive: "--lg-sem-positive",
  info: "--lg-sem-info",
  attention: "--lg-sem-attention",
  risk: "--lg-sem-risk",
  neutral: "--lg-sem-neutral",
  special: "--lg-sem-special",
};

/**
 * 语义 → 实底填充色（D5：小字号**白字**压在这些实底上 ≥4.5:1）。
 * 与 `--mmh-solid-*` 同源；仅在"必须用实底承载白字"的场景使用。
 */
export const SEMANTIC_SOLID: Record<GmSemantic, string> = {
  positive: "#1E6B52",
  info: "#385CB3",
  attention: "#9A5A0E",
  risk: "#B04052",
  neutral: "#4F5B6E",
  special: "#6242B8",
};

/** 孕产妇五色（02.10） */
export type GmFive = "m1" | "m2" | "m3" | "m4" | "m5";
export const FIVE_COLOR: Record<GmFive, string> = {
  m1: "#4CB98A", // 绿 · 低风险
  m2: "#F2C14E", // 黄 · 一般风险
  m3: "#F0954A", // 橙 · 较高风险
  m4: "#EE5C70", // 红 · 高风险
  m5: "#8F6AE0", // 紫 · 合并传染病
};

/** 五色 → CSS 变量名（业务侧可通过 --mmh-m5-* 覆盖，如区域配色） */
export const FIVE_VAR: Record<GmFive, string> = {
  m1: "--mmh-m5-m1",
  m2: "--mmh-m5-m2",
  m3: "--mmh-m5-m3",
  m4: "--mmh-m5-m4",
  m5: "--mmh-m5-m5",
};

/** 语义中文名（读屏与图例用，颜色之外的第二通道） */
export const SEMANTIC_LABEL: Record<GmSemantic, string> = {
  positive: "正常",
  info: "信息",
  attention: "注意",
  risk: "风险",
  neutral: "中性",
  special: "特殊",
};

/** 「颜色 + 文字」双通道：任何状态展示都必须带文字，不得仅靠色点区分（WCAG 1.4.1） */
export const SEMANTIC_CSS_SUFFIX = "gm-sem";

/** 生成 `var(--x,fallback)`：业务主题可覆盖，未覆盖时回落 token 值 */
export const varOf = (name: string, fallback: string): string => `var(${name},${fallback})`;

/**
 * 语义色淡底/描边。用 `color-mix` **从 CSS 变量派生**，因此天然跟随
 * 暗色档与业务侧覆盖；旧实现用"hex → rgba"在 JS 里算，只能得到静态浅色档。
 */
export const semTint = (sem: GmSemantic, pct: number): string =>
  `color-mix(in srgb, var(${SEMANTIC_VAR[sem]}) ${pct}%, transparent)`;
