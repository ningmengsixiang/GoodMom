import React, { ReactNode } from "react";
/** GmCard —— 玻璃卡片（对应 03 · 3.3 / 13） */
export interface GmCardProps { title?: ReactNode; extra?: ReactNode; children?: ReactNode; radius?: number; style?: React.CSSProperties }
const GmCard = ({ title, extra, children, radius = 22, // 02.4 常规卡片 22 style }: GmCardProps) => (
  <div className="gm-card" style={{ borderRadius: radius, ...style }}>
    {(title || extra) && (
      <div className="gm-card-head">
        <b>{title}</b><span>{extra}</span>
      </div>
    )}
    {children}
  </div>
);
export default GmCard;
