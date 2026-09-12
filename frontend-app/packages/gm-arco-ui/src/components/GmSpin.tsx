import React from "react";

/** 08 · 8.2.15 规定细环尺寸落在 18–40px（环宽 2px）；越界一律夹回该区间。 */
const SIZE_PRESET = { sm: 18, md: 24, lg: 32, xl: 40 } as const;
const SIZE_MIN = 18;
const SIZE_MAX = 40;

/**
 * GmSpin —— 加载指示器（规范 08 · 8.2.15 / Part 19 · EL-19-02）
 *
 * ## 本轮完善（V2.9「状态与加载」深化）
 *
 * 1. **尺寸回到规范区间**：原默认 `size = 16` **低于 08 · 8.2.15 的下限 18**。
 *    现支持档位 `sm|md|lg|xl` = 18/24/32/40，数字入参也夹到 [18,40]。
 * 2. **补 `delay`（默认 300ms）防"闪一下"**：EL-19-06 要求「loading 与内容不得闪切」。
 *    200–300ms 就返回的请求若立刻起显指示器会出现一帧闪烁；延迟起显即可消除。
 *    组件自持定时器并在卸载时清理，不留悬挂计时器。
 * 3. **补 `tone="inverse"`**：08 · 8.2.15 原文「深底/按钮内为白/浅色」。此前只有一个
 *    玫瑰环，落在深实底按钮（`--mmh-solid-*`）上几乎不可见。
 * 4. **无障碍**：`role="status"` + `aria-live="polite"`；**无文案时**补 `aria-label`
 *    —— 否则读屏只拿到一个空的 status 容器。有文案时不加 label，避免重复播报。
 */
export interface GmSpinProps {
  text?: string;
  /** 尺寸档位或像素值（像素值会夹到 18–40，符合 08 · 8.2.15） */
  size?: keyof typeof SIZE_PRESET | number;
  /** 延迟起显毫秒数，默认 300（传 0 表示立即显示） */
  delay?: number;
  /** 色相：品牌玫（默认）/ 深底与实底按钮内用 inverse（白/浅色环） */
  tone?: "brand" | "inverse";
  /** 无文案时给读屏的名称 */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

const resolveSize = (size: GmSpinProps["size"]): number => {
  if (typeof size === "number") return Math.min(SIZE_MAX, Math.max(SIZE_MIN, size));
  return SIZE_PRESET[size ?? "md"] ?? SIZE_PRESET.md;
};

const GmSpin = ({
  text = "加载中…",
  size = "md",
  delay = 300,
  tone = "brand",
  ariaLabel,
  style,
}: GmSpinProps) => {
  const px = resolveSize(size);
  const [shown, setShown] = React.useState(delay <= 0);

  React.useEffect(() => {
    if (delay <= 0) {
      setShown(true);
      return;
    }
    setShown(false);
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!shown) return null;

  return (
    <span
      className={["gm-spin", tone === "inverse" && "gm-spin--inverse"].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-label={text ? undefined : ariaLabel || "加载中"}
      style={{ ...style, fontSize: Math.max(11, px * 0.62) }}
    >
      <i style={{ width: px, height: px }} aria-hidden="true" />
      {text}
    </span>
  );
};
export default GmSpin;
