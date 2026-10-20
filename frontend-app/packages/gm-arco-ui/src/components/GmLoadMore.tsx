import React from "react";

/**
 * GmLoadMore —— 上拉加载更多（规范 10 · 10.4.1）
 *
 * 与 `@goodmom/vue` 同契约：status / loadingText / doneText / idleText，事件 load。
 * 视觉（细环 spinner、文本色）全部由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. `role="status"` + `aria-live="polite"`：状态文案变化会被读屏播报。
 * 2. IntersectionObserver 监听根节点：进入视口且 status 为 idle 时派发一次 load；
 *    每次进入 idle 只派发一次，离开 idle 后重置；环境不支持时静默降级为纯点击。
 * 3. idle 文案本身是 button —— 点击 / 键盘回车是触底自动加载之外的无障碍等价路径。
 */
export interface GmLoadMoreProps {
  /** 加载状态，默认 "idle" */
  status?: "idle" | "loading" | "done";
  /** 加载中文案，默认 "加载中…" */
  loadingText?: string;
  /** 加载完文案，默认 "没有更多了" */
  doneText?: string;
  /** 待加载文案，默认 ""（为空时不渲染可点文本） */
  idleText?: string;
  onLoad?: () => void;
}

const GmLoadMore = ({
  status = "idle",
  loadingText = "加载中…",
  doneText = "没有更多了",
  idleText = "",
  onLoad,
}: GmLoadMoreProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (status !== "idle") {
      firedRef.current = false;
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          onLoad?.();
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [status, onLoad]);

  const label = status === "loading" ? loadingText : status === "done" ? doneText : idleText;

  return (
    <div ref={rootRef} className="gm-loadmore" role="status" aria-live="polite">
      {status === "loading" ? <span className="gm-loadmore__spinner" aria-hidden="true" /> : null}
      {status === "idle" && idleText ? (
        <button type="button" className="gm-loadmore__text" onClick={() => onLoad?.()}>
          {label}
        </button>
      ) : label ? (
        <span className="gm-loadmore__text">{label}</span>
      ) : null}
    </div>
  );
};
export default GmLoadMore;
