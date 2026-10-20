import React from "react";

/**
 * GmSafeArea —— 安全区占位（规范 11 · 11.6.7）
 *
 * 与 `@goodmom/vue` 同契约：仅 position 一个 prop，无事件。
 * 纯布局件：高度来自 CSS 的 `env(safe-area-inset-*)`，position 控制补哪一侧；
 * 对读屏完全隐藏（aria-hidden），不承载任何语义内容。
 */
export interface GmSafeAreaProps {
  /** 补哪一侧安全区，默认 "bottom" */
  position?: "top" | "bottom" | "both";
}

const GmSafeArea = ({
  position = "bottom",
}: GmSafeAreaProps) => (
  <div
    className={"gm-safearea is-" + position}
    data-position={position}
    aria-hidden="true"
  />
);
export default GmSafeArea;
