import React from "react";

/**
 * GmNoticeBar —— 通知栏（规范 11 · 11.2.8）
 *
 * 与 `@goodmom/vue` 同契约：text / icon / closable / tone，事件 close、click。
 * 视觉（单行玻璃胶囊、关闭键 44 热区、tone 语义色）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. `role="status"`：读屏把通知文本当状态消息播报；text 单行省略由 CSS 处理。
 * 2. tone 只控制语义色（info / warning / danger / positive），同时挂状态类与 data-tone，
 *    CSS 任选一种选择器都能命中。
 * 3. 关闭钮是 44 热区图标按钮（aria-label「关闭」），点击只派发 close，不冒泡成整条 click。
 */
export interface GmNoticeBarProps {
  text: string;
  /** 左侧语义图标，默认 true */
  icon?: boolean;
  /** 右侧关闭钮，默认 true */
  closable?: boolean;
  /** 语义色调，默认 "info" */
  tone?: "info" | "warning" | "danger" | "positive";
  onClose?: () => void;
  onClick?: () => void;
}

const GmNoticeBar = ({
  text,
  icon = true,
  closable = true,
  tone = "info",
  onClose,
  onClick,
}: GmNoticeBarProps) => (
  <div
    className={"gm-noticebar is-" + tone}
    data-tone={tone}
    role="status"
    onClick={onClick}
  >
    {icon ? (
      <span className="gm-noticebar__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      </span>
    ) : null}
    <span className="gm-noticebar__text">{text}</span>
    {closable ? (
      <button
        type="button"
        className="gm-noticebar__close"
        aria-label="关闭"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      >
        ×
      </button>
    ) : null}
  </div>
);
export default GmNoticeBar;
