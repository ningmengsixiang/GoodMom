import React from "react";
import { GmSemantic, SEMANTIC_COLOR } from "../tokens/status";

/** GmTag —— 状态/分类标签（自包含样式，基于主题 token；对应 03 · 3.6 / 15.5） */
export interface GmTagProps {
  children: React.ReactNode;
  semantic?: GmSemantic;
  color?: string;      // 显式 hex 优先
  dot?: boolean;
  size?: "small" | "default";
}
function tint(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(n, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}
const GmTag = ({ children, semantic, color, dot = true, size = "small" }: GmTagProps) => {
  const c = color || (semantic ? SEMANTIC_COLOR[semantic] : "#757e8e");
  return (
    <span className={"gm-tag" + (size === "default" ? " lg" : "")} style={{ color: c, background: tint(c, 0.13), borderColor: tint(c, 0.32) }}>
      {dot && <i style={{ background: c }} />}
      {children}
    </span>
  );
};
export default GmTag;
