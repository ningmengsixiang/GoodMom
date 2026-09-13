/**
 * 列表行（10.5.3 移动端降级口径：行卡片 = 左图标 + 主信息两行 + 右关键值）
 *
 * 配方定义在 `styles/layout.css` 的 `.gm-listrow*`，本组件只负责结构与语义 ——
 * 页面不得再内联一份玻璃配方（19.7 门禁会拦）。行主体是 **button**：
 * 手势/点击之外必须有键盘与读屏路径（Part 23）。
 */
import React from "react";

export interface ListRowProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
}

export function ListRow({ icon, title, desc, trailing, onClick }: ListRowProps) {
  const inner = (
    <>
      {icon ? <span className="gm-listrow__icon">{icon}</span> : null}
      <span className="gm-listrow__body">
        <b className="gm-listrow__title">{title}</b>
        {desc ? <span className="gm-listrow__desc">{desc}</span> : null}
      </span>
      {trailing}
    </>
  );
  if (!onClick) return <div className="gm-listrow">{inner}</div>;
  return (
    <button type="button" className="gm-listrow" onClick={onClick}>{inner}</button>
  );
}

export default ListRow;
