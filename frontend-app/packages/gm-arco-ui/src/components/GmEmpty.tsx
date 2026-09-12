import React from "react";

/** GmEmpty —— 空状态（规范 08 · 8.2.12；移动端加大图标 48 由外层 size 控制） */
export interface GmEmptyProps {
  /** 自定义图标（默认玻璃圆环空态图标） */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** 图标位尺寸：default 24 / large 48（移动端与整页空态用 large）。与 Vue 版同名 prop */
  iconSize?: "default" | "large";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const GmEmpty = ({ icon, title, desc, iconSize = "default", children, style }: GmEmptyProps) => {
  /* role="status"：空态是「内容加载完但为空」的状态播报，读屏需要被告知
     （与 Vue 版同一契约；此前 React 版没有任何 role，纯视觉空态对读屏是静默的）。 */
  const px = iconSize === "large" ? 48 : 24;
  return (
  <div className="gm-empty" role="status" style={style}>
    <span className={"gm-empty-ic" + (iconSize === "large" ? " is-lg" : "")} aria-hidden="true">
      {icon || (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
};
export default GmEmpty;
