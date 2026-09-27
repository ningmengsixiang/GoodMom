import React from "react";
import { GmFive, FIVE_COLOR, FIVE_VAR, GmSemantic, SEMANTIC_VAR, semTintFill, semTintBorder } from "../tokens/status";

/** GmTag —— 状态/分类标签（自包含样式，基于主题 token；对应 03 · 3.6 / 15.5）
 *
 * 说明（D3 裁决）：与 components/GmStatusTag 共享同一映射源（tokens/status.ts）；
 * 本组件无 Arco 依赖（轻量）；两组件现为**同一视觉契约**。
 *
 * P1-2：取色一律走 CSS 变量（`var(--lg-sem-x)`），而不是 tokens 里的静态浅色 hex，
 * 否则暗色模式下颜色不会切换（"变量对、组件错"）。
 * P1-12：与 Vue 版 `<GmTag>` 保持同一 props 面（含 `five`）。
 *  · `size="default"` 追加的类名字面量是 **`lg`**（不是 `gm-tag--default`）：两个库的 CSS
 *    （`theme.css` / `components.css`）里只有 `.gm-tag.lg`，改名就与样式脱节 —— 命名看着是反的，
 *    但这是既有 CSS 契约，两侧必须一同保留（要改成 `--default` 得先改 CSS，属另一件事）。
 *  · `data-semantic` 只在**纯 semantic** 取色时挂载（color/five 覆盖时不挂），与 Vue 版同一条件。
 *  · `.gm-tag:focus-visible` 是死规则：`<span>` 不是可聚焦元素、组件也不给 tabindex，
 *    两侧都不加 tabindex 才是对齐的；该规则应从 CSS 删除（组件侧不改）。
 */
export interface GmTagProps {
  children: React.ReactNode;
  semantic?: GmSemantic;
  /** 孕产妇五色之一（02.10） */
  five?: GmFive;
  color?: string;      // 显式 hex / CSS 变量表达式优先
  dot?: boolean;
  size?: "small" | "default";
}

const GmTag = ({ children, semantic, five, color, dot = true, size = "small" }: GmTagProps) => {
  const base = color
    ? color
    : five
      ? `var(${FIVE_VAR[five]},${FIVE_COLOR[five]})`
      : `var(${SEMANTIC_VAR[semantic || "neutral"]})`;
  return (
    <span
      className={"gm-tag" + (size === "default" ? " lg" : "")}
      style={{
        color: base,
        background: semTintFill(base),
        borderColor: semTintBorder(base),
      }}
      data-semantic={color || five ? undefined : (semantic || "neutral")}
    >
      {dot && <i style={{ background: base }} aria-hidden="true" />}
      {children}
    </span>
  );
};
export default GmTag;
