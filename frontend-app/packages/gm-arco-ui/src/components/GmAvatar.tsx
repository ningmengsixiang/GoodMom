import React from "react";
/** GmAvatar —— 服务对象首字头像（渐变玻璃圆，对应 03 · 3.4.2） */
export interface GmAvatarProps {
  text: string; size?: number; tone?: "rose" | "mint" | "purple";
  style?: React.CSSProperties;
}
const TONE = {
  rose: "linear-gradient(150deg,#FFA9C2,#E85D8F)",
  mint: "linear-gradient(150deg,#7FD8C2,#4FB59C)",
  purple: "linear-gradient(150deg,#B9A0FF,#8066F0)",
};
const GmAvatar = ({ text, size = 36, tone = "rose", style }: GmAvatarProps) => (
  <span className="gm-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: TONE[tone], ...style }}>
    {String(text).slice(0, 1)}
  </span>
);
export default GmAvatar;
