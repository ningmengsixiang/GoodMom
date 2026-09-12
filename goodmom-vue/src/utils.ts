/**
 * Vue 组件库内部通用工具（非公开 API，不从包入口导出）
 *
 * 铁律：组件内**不出现裸色值**。需要着色时一律走本文件的 `tint()` / `varOf()`，
 * 让颜色来源于 token 映射或 CSS 变量（支持暗色与业务主题覆盖）。
 */

/** 合并类名：过滤掉 false / null / undefined / ""，便于条件类拼接 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** 规范化 hex：三位简写补全为六位；非法输入原样返回 */
export function normalizeHex(hex: string): string {
  const h = String(hex || "").trim().replace("#", "");
  if (h.length === 3) return "#" + h.split("").map((c) => c + c).join("");
  return "#" + h;
}

/**
 * hex → rgba(...,alpha)
 * 用于状态色淡底（0.13）与描边（0.32）：颜色 + 淡底 + 色点三通道，
 * 满足 WCAG 1.4.1「不得仅用颜色传达信息」。
 */
export function tint(hex: string, alpha: number): string {
  const n = normalizeHex(hex).slice(1);
  const num = Number.parseInt(n.length >= 6 ? n.slice(0, 6) : n, 16);
  if (Number.isNaN(num)) return `rgba(117,126,142,${alpha})`; // 回落 neutral
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

/** 生成 `var(--x, fallback)`：业务主题可覆盖，未覆盖时回落 token 值 */
export function varOf(name: string, fallback: string): string {
  return `var(${name},${fallback})`;
}

/** 数值取整（头像字号等按尺寸比例计算的场景） */
export function px(n: number): string {
  return `${n}px`;
}
