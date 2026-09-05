import React from "react";

/** GmEmpty —— 空状态（规范 08 · 8.2.12；移动端加大图标 48 由外层 size 控制） */
export interface GmEmptyProps {
  /** 自定义图标（默认玻璃圆环空态图标） */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const GmEmpty = ({ icon, title, desc, children, style }: GmEmptyProps) => (
  <div className="gm-empty" style={style}>
    <span className="gm-empty-ic" aria-hidden="true">
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10.5" r="5.5" />
          <path d="M5.5 18.5c.8-3 3.4-4.4 6.5-4.4s5.7 1.4 6.5 4.4" />
        </svg>
      )}
    </span>
    {title && <div className="t">{title}</div>}
    {desc && <div className="d">{desc}</div>}
    {children}
  </div>
);
export default GmEmpty;
