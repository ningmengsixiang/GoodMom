import React from "react";

/**
 * GmTooltip —— 文字气泡（规范 03 · 3.9 / Part 18 · MD-18-01 / 10 · 10.4）
 *
 * MD-18-01：**180ms、Y 位移 4px**（旧值 .2s / 5px 两项都不符，站点已收敛）；
 * 白玻璃小泡 + `--lg-divider` 发丝边、`pointer-events:none` 不遮挡内容。
 *
 * 触发：桌面 hover / 键盘 focus（事件冒泡自内部可聚焦子元素）/ 移动端 tap 开合
 * （10.4 禁 hover 依赖 —— 纯 CSS hover 版只是 PC 形态，库组件必须带 tap 开关）。
 * `role="tooltip"`（纯文本语义），Escape 收起。
 */
export interface GmTooltipProps {
  /** 气泡文案（必填） */
  title: string;
  children?: React.ReactNode;
}

const GmTooltip = ({ title, children }: GmTooltipProps) => {
  const [on, setOn] = React.useState(false);
  const tipId = React.useId();
  const show = () => setOn(true);
  const hide = () => setOn(false);

  return (
    <span
      className="gm-tooltip"
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={() => setOn((v) => !v)} /* 移动端 tap 开合（10.4） */
      onFocus={show} /* 键盘路径：内部可聚焦子元素聚焦时冒泡到本容器 */
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
    >
      {children}
      <span className={"gm-tooltip__tip" + (on ? " is-on" : "")} role="tooltip" id={tipId}>
        {title}
      </span>
    </span>
  );
};
export default GmTooltip;
