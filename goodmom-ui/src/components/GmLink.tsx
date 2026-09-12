import React from "react";

/** GmLink —— 链接 / 文字按钮（规范 03 · 3.10）
 *  有 href 渲染 <a>，无 href 渲染 <button type="button">；外链自动带 target/rel + 尾图标 + 读屏后缀。
 *  disabled 时降级为非交互元素（aria-disabled），且不挂 href / 点击回调（不做键盘不可达的假交互）。
 *  视觉全部由 class 提供（统一写入 theme.css），组件内不出现任何色值。
 */
export type GmLinkVariant = "default" | "primary" | "muted" | "danger";
export type GmLinkUnderline = "always" | "hover" | "none";

export interface GmLinkProps {
  /** 链接文字（或图文组合） */
  children: React.ReactNode;
  /** 有 href → <a>；无 href → <button type="button"> */
  href?: string;
  /** 语义色档，默认 "default"（品牌粉） */
  variant?: GmLinkVariant;
  /** 下划线策略，默认 "hover" */
  underline?: GmLinkUnderline;
  /** 外链：target/rel + 尾部外链图标 + 读屏后缀「（新窗口打开）」 */
  external?: boolean;
  /** 禁用：渲染 aria-disabled 的非交互元素 */
  disabled?: boolean;
  /** 前置图标（16px 槽位） */
  icon?: React.ReactNode;
  /** 仅图标链接的可访问名（无文字时必须传）。与 Vue 版同名 prop */
  ariaLabel?: string;
  /** 字号 12 / 14 / 16（class 后缀 --sm / --lg） */
  size?: "small" | "default" | "large";
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
}

/** 外链尾图标：12px 方框 + 箭头，单色跟随 currentColor */
const GmLinkExternalIcon = () => (
  <span className="gm-link__ex" aria-hidden="true">
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M4.5 1.9H2.6A1.4 1.4 0 0 0 1.2 3.3v6.1a1.4 1.4 0 0 0 1.4 1.4h6.1a1.4 1.4 0 0 0 1.4-1.4V7.5" />
      <path d="M7.2 1.2h3.6v3.6" />
      <path d="M10.8 1.2 5.9 6.1" />
    </svg>
  </span>
);

const GmLink = ({
  children,
  href,
  variant = "default",
  underline = "hover",
  external = false,
  disabled = false,
  icon,
  ariaLabel,
  size = "default",
  onClick,
  className,
  style,
}: GmLinkProps) => {
  const cls = [
    "gm-link",
    "gm-link--" + variant,
    "gm-link--u-" + underline,
    size === "small" ? "gm-link--sm" : size === "large" ? "gm-link--lg" : "",
    disabled ? "is-disabled" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const isExternal = external && !disabled;

  const inner = (
    <>
      {icon ? (
        <span className="gm-link__ic" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="gm-link__t">{children}</span>
      {isExternal ? <GmLinkExternalIcon /> : null}
      {isExternal ? <span className="gm-sr-only">（新窗口打开）</span> : null}
    </>
  );

  /* 禁用态：非交互元素，tone 保持，不渲染 href / onClick */
  if (disabled) {
    return (
      <span className={cls} aria-disabled="true" aria-label={ariaLabel} style={style}>
        {inner}
      </span>
    );
  }

  if (href) {
    return (
      <a
        className={cls}
        href={href}
        style={style}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={cls} style={style} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
};

export default GmLink;
