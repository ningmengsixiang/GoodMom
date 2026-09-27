import React, { ReactNode } from "react";

/**
 * GmCard —— 玻璃卡片（对应 03 · 3.3 / 13）
 *
 * 契约与 `@goodmom/vue` 的 GmCard **逐项一致**（守门：`scripts/check-component-contract.py`）：
 * props 名（title/extra/footer/radius/hoverable/bodyless）、默认值（radius 22 /
 * hoverable false / bodyless false）、契约类名（.gm-card、.gm-card-head、.gm-card-foot、
 * .gm-card--hover、.gm-card--bodyless）两侧相同。
 * 两库渲染模型不同（React 具名 props ↔ Vue props + 同名具名插槽），能力一致：
 * 同一份内容在 Vue 侧既可走 prop 也可走插槽（插槽优先），React 侧统一走 props。
 * 组件内不写色值；玻璃底与圆角档由 token/主题 CSS 给出（暗色模式自动降亮度）。
 */
export interface GmCardProps {
  /** 卡片标题（与 extra 任一存在时才渲染头部）；可传节点 */
  title?: ReactNode;
  /** 头部右侧（操作/时间/链接） */
  extra?: ReactNode;
  /** 底部操作区（右对齐 + 分隔线） */
  footer?: ReactNode;
  /** 圆角 px，默认 22（02.4 常规卡片档）；0 = 方角（表格包裹等场景） */
  radius?: number;
  /** 是否抬起（hover 上浮 + 阴影加强），用于可点击卡片 */
  hoverable?: boolean;
  /** 是否去除内边距（表格/图片贴边场景） */
  bodyless?: boolean;
  children?: ReactNode;
  style?: React.CSSProperties;
}
const GmCard = ({ title, extra, footer, children, radius = 22, hoverable = false, bodyless = false, style }: GmCardProps) => (
  <div
    className={["gm-card", hoverable && "gm-card--hover", bodyless && "gm-card--bodyless"].filter(Boolean).join(" ")}
    style={{ borderRadius: radius, ...style }}
  >
    {(title || extra) && (
      <div className="gm-card-head">
        <b>{title}</b><span>{extra}</span>
      </div>
    )}
    {children}
    {footer && <div className="gm-card-foot">{footer}</div>}
  </div>
);
export default GmCard;
