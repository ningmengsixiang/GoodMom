import React from "react";

/**
 * GmCell —— 移动端列表行（规范 11 · 11.2.4）
 *
 * 与 `@goodmom/vue` 同契约：title / desc / value / chevron / danger / disabled /
 * href，事件 `click`（React `onClick` ↔ Vue `emit("click")`）。
 *
 * 语义分派：
 * 1. 有 href → `<a href>`（真链接，可新窗口 / 可复制）；否则 `<button type="button">`，
 *    不用 div 假装可点，保证键盘可达。
 * 2. disabled 时按钮走原生 disabled；链接态摘掉 href 并挂 `aria-disabled` +
 *    `tabIndex={-1}`，不挂点击回调 —— 不做"键盘能聚焦却点不动"的假交互。
 * 3. `chevron` 是纯装饰（aria-hidden），行高 ≥52 / 字号 / danger 色全部由 CSS 提供。
 */
export interface GmCellProps {
  /** 主标题，必填 */
  title: string;
  /** 副标题，默认 "" */
  desc?: string;
  /** 右侧值，默认 "" */
  value?: string;
  /** 右侧箭头，默认 false */
  chevron?: boolean;
  /** 破坏性语义色，默认 false */
  danger?: boolean;
  /** 禁用，默认 false */
  disabled?: boolean;
  /** 传了渲染 `<a>`，否则渲染 `<button type="button">`；默认 "" */
  href?: string;
  onClick?: () => void;
}

const GmCell = ({
  title,
  desc = "",
  value = "",
  chevron = false,
  danger = false,
  disabled = false,
  href = "",
  onClick,
}: GmCellProps) => {
  const cls = "gm-cell" + (danger ? " is-danger" : "") + (disabled ? " is-disabled" : "");
  const inner = (
    <>
      <span className="gm-cell__main">
        <span className="gm-cell__title">{title}</span>
        {desc ? <span className="gm-cell__desc">{desc}</span> : null}
      </span>
      {value ? <span className="gm-cell__value">{value}</span> : null}
      {chevron ? (
        <svg
          className="gm-cell__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      ) : null}
    </>
  );

  if (href) {
    if (disabled) {
      return (
        <a className={cls} role="link" aria-disabled="true" tabIndex={-1}>
          {inner}
        </a>
      );
    }
    return (
      <a className={cls} href={href} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={cls} disabled={disabled} onClick={disabled ? undefined : onClick}>
      {inner}
    </button>
  );
};
export default GmCell;
