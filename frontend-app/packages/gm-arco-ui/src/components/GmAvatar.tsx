import React from "react";
import { DesignTokens } from "../tokens/design";
/** GmAvatar —— 服务对象首字头像（渐变玻璃圆，对应 03 · 3.4.2） */
export interface GmAvatarProps {
  text: string; size?: number; tone?: "rose" | "mint" | "purple";
  style?: React.CSSProperties;
}
const TONE = {
  rose: DesignTokens.gradRose,
  mint: DesignTokens.gradMint,
  purple: DesignTokens.gradPurple,
};
const GmAvatar = ({ text, size = 36, tone = "rose", style }: GmAvatarProps) => (
  <span className="gm-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: TONE[tone], ...style }}>
    {String(text).slice(0, 1)}
  </span>
);
export default GmAvatar;
