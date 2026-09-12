import React from "react";
import { DesignTokens } from "../tokens/design";
/** GmAvatar —— 服务对象首字头像（渐变玻璃圆，对应 03 · 3.4.2） */
export interface GmAvatarProps {
  text: string; size?: number; tone?: "rose" | "mint" | "purple";
  /** 独立承载信息时传完整可访问名（如「张女士」）；不传则视为装饰性（aria-hidden） */
  label?: string;
  style?: React.CSSProperties;
}
const TONE = {
  rose: DesignTokens.gradRose,
  mint: DesignTokens.gradMint,
  purple: DesignTokens.gradPurple,
};
const GmAvatar = ({ text, size = 36, tone = "rose", label, style }: GmAvatarProps) => (
  /* 有 label → 作为图片的等价物播报；无 label → 纯装饰（aria-hidden），
     否则读屏会把「张」当成孤立文字念出来。与 Vue 版同一契约。 */
  <span className="gm-avatar" role={label ? "img" : undefined} aria-label={label}
    aria-hidden={label ? undefined : true}
    style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: TONE[tone], ...style }}>
    {String(text).slice(0, 1)}
  </span>
);
export default GmAvatar;
