import React from "react";

/**
 * GmErrorBlock —— 异常 / 空状态块（规范 11 · 11.6.9）
 *
 * 与 `@goodmom/vue` 同契约：status / title / description / retryText，事件 retry。
 * 视觉（56 圆形语义图标、标题/说明字阶）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. status 四态各有一套默认文案：error=加载失败、network=网络异常、
 *    permission=无访问权限、empty=暂无内容；title / description 传空时取默认。
 * 2. retryText 非空才渲染重试按钮（原生 button，44 热区由 CSS 给）。
 * 3. 图标是装饰性内联 SVG（aria-hidden），语义完全由标题/说明文字承担。
 */
export interface GmErrorBlockProps {
  /** 状态，默认 "error" */
  status?: "error" | "network" | "permission" | "empty";
  /** 标题，默认 ""（空则用状态默认文案） */
  title?: string;
  /** 说明，默认 ""（空则用状态默认文案） */
  description?: string;
  /** 重试按钮文案，默认 ""（空则不渲染按钮） */
  retryText?: string;
  onRetry?: () => void;
}

const GmErrorBlock = ({
  status = "error",
  title = "",
  description = "",
  retryText = "",
  onRetry,
}: GmErrorBlockProps) => {
  const fallback = STATUS_TEXT[status];
  return (
    <div className={"gm-errorblock is-" + status} data-status={status}>
      <span className="gm-errorblock__icon" aria-hidden="true">
        {STATUS_ICON[status]}
      </span>
      <p className="gm-errorblock__title">{title || fallback.title}</p>
      <p className="gm-errorblock__desc">{description || fallback.desc}</p>
      {retryText ? (
        <button type="button" className="gm-errorblock__retry" onClick={onRetry}>
          {retryText}
        </button>
      ) : null}
    </div>
  );
};
export default GmErrorBlock;

type ErrorStatus = "error" | "network" | "permission" | "empty";

const STATUS_TEXT: Record<ErrorStatus, { title: string; desc: string }> = {
  error: { title: "加载失败", desc: "请稍后重试" },
  network: { title: "网络异常", desc: "请检查网络连接后重试" },
  permission: { title: "无访问权限", desc: "请联系管理员开通权限" },
  empty: { title: "暂无内容", desc: "换个筛选条件试试" },
};

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  focusable: false,
};

const STATUS_ICON: Record<ErrorStatus, React.ReactNode> = {
  error: (
    <svg viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M12 3 2.8 19.2a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <path d="M5 12a10 10 0 0 1 3.5-2.4M19 12a10 10 0 0 0-3.5-2.4" />
      <path d="M12 19h.01" />
    </svg>
  ),
  permission: (
    <svg viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" />
    </svg>
  ),
};
