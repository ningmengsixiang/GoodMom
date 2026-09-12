import React from "react";

/** GmSpin —— 加载指示器（规范 08 · 8.2.15） */
export interface GmSpinProps {
  text?: string;
  size?: number;
  style?: React.CSSProperties;
}

const GmSpin = ({ text = "加载中…", size = 16, style }: GmSpinProps) => (
  <span className="gm-spin" role="status" style={{ ...style, fontSize: Math.max(11, size * 0.72) }}>
    <i style={{ width: size, height: size }} aria-hidden="true" />
    {text}
  </span>
);
export default GmSpin;
