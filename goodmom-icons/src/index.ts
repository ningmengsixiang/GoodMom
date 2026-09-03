import React from "react";
import { GM_ICON_GLYPH, GmIconName } from "./registry";
export * from "./registry";

/** GmIcon —— GoodMom 图标（自绘线性 · 24×24） */
export interface GmIconProps { name: GmIconName; size?: number; style?: React.CSSProperties; title?: string }
export function GmIcon({ name, size = 20, style, title }: GmIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined} aria-label={title}
      fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: GM_ICON_GLYPH[name] }} />
  );
}
