import React from "react";

/** GmEmpty —— 空状态（规范 08 · 8.2.12；移动端加大图标 48 由外层 size 控制） */
export interface GmEmptyProps {
  /** 自定义图标（默认玻璃圆环空态图标）。两侧同一契约：都按**节点**接收，不是「组件名/组件定义」 */
  icon?: React.ReactNode;
  /** 标题，默认「暂无数据」 */
  title?: React.ReactNode;
  desc?: React.ReactNode;
  /** 图标位尺寸：default 24 / large 48（移动端与整页空态用 large）。与 Vue 版同名 prop */
  iconSize?: "default" | "large";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const GmEmpty = ({ icon, title = "暂无数据", desc, iconSize = "default", children, style }: GmEmptyProps) => {
  /* role="status"：空态是「内容加载完但为空」的状态播报，读屏需要被告知
     （与 Vue 版同一契约；此前 React 版没有任何 role，纯视觉空态对读屏是静默的）。
     title 默认「暂无数据」：此前只有 Vue 有默认值，同一个 <GmEmpty/> 一边有标题一边空白（P1-12）。
     `{title && …}` 与 Vue 的 `v-if="title"` 同判定；显式传 null/"" 两侧同样不渲染。 */
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
