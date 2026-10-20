import React from "react";

/**
 * GmPullRefresh —— 下拉刷新容器（规范 10 · 10.4.1）
 *
 * 与 `@goodmom/vue` 同契约：refreshing / disabled / text / refreshingText，事件 refresh，
 * 内容 React `children` ↔ Vue 默认插槽。视觉全部由组件 CSS 提供，本文件无色值。
 *
 * 手势实现（指针事件，两库同行为）：
 * 1. 指针按下时仅当容器最近的可滚动祖先 `scrollTop<=0`（或页面在顶部）才开始跟踪，
 *    避免在列表中间误触发。
 * 2. 下拉位移跟手：`dy * 0.5`，上限 96px；松手位移 ≥64px 触发一次 `refresh`。
 * 3. 触发后回弹到 0；`refreshing=true` 时指示器保持 56px 展示 spinner + refreshingText，
 *    由父级把 refreshing 置回 false 后再回弹收起到 0（回弹 260ms 由 CSS 过渡承担）。
 * 4. 松手监听挂在 window 上，指针移出容器再松开也能正确结束手势。
 */
export interface GmPullRefreshProps {
  /** 刷新中（受控），默认 false */
  refreshing?: boolean;
  /** 禁用下拉，默认 false */
  disabled?: boolean;
  /** 待刷新文案，默认 "下拉刷新" */
  text?: string;
  /** 刷新中文案，默认 "刷新中…" */
  refreshingText?: string;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

const GmPullRefresh = ({
  refreshing = false,
  disabled = false,
  text = "下拉刷新",
  refreshingText = "刷新中…",
  onRefresh,
  children,
}: GmPullRefreshProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);
  const startRef = React.useRef<{ y: number; active: boolean } | null>(null);
  const offsetRef = React.useRef(0);
  const refreshingRef = React.useRef(refreshing);
  const onRefreshRef = React.useRef(onRefresh);

  const updateOffset = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };

  /* 最新 props 镜像：手势结束回调在 window 监听里执行，避免闭包读到旧值 */
  React.useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);
  React.useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  /* 受控刷新态：置 true 时指示器保持展开，置回 false 时回弹收起 */
  React.useEffect(() => {
    updateOffset(refreshing ? HOLD_PULL : 0);
  }, [refreshing]);

  /* 松手 / 取消：window 级监听保证指针移出容器后也能结束手势 */
  React.useEffect(() => {
    const finish = () => {
      const start = startRef.current;
      if (!start || !start.active) return;
      start.active = false;
      if (offsetRef.current >= PULL_THRESHOLD) onRefreshRef.current?.();
      updateOffset(refreshingRef.current ? HOLD_PULL : 0);
    };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || refreshing) return;
    if (getScrollTop(rootRef.current) > 0) return;
    startRef.current = { y: e.clientY, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || !start.active) return;
    const dy = e.clientY - start.y;
    if (dy <= 0) {
      updateOffset(0);
      return;
    }
    updateOffset(Math.min(PULL_MAX, dy * PULL_RATE));
  };

  return (
    <div
      ref={rootRef}
      className={
        "gm-pullrefresh" +
        (disabled ? " is-disabled" : "") +
        (refreshing ? " is-refreshing" : "") +
        (offset > 0 ? " is-pulling" : "")
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div
        className="gm-pullrefresh__indicator"
        style={{ height: offset }}
        role="status"
        aria-live={refreshing ? "polite" : "off"}
      >
        <span className="gm-pullrefresh__spinner" aria-hidden="true" />
        <span className="gm-pullrefresh__text">{refreshing ? refreshingText : text}</span>
      </div>
      <div className="gm-pullrefresh__body" style={{ transform: "translateY(" + offset + "px)" }}>
        {children}
      </div>
    </div>
  );
};
export default GmPullRefresh;

const PULL_MAX = 96; /* 最大跟手位移 */
const PULL_THRESHOLD = 64; /* 触发阈值 */
const PULL_RATE = 0.5; /* 跟手阻尼 */
const HOLD_PULL = 56; /* 刷新中指示器保持高度 */

/** 从容器向上找最近的可滚动祖先；找不到则取页面滚动位置 */
function getScrollTop(el: HTMLElement | null): number {
  let node: HTMLElement | null = el ? el.parentElement : null;
  while (node) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY)) return node.scrollTop;
    node = node.parentElement;
  }
  return window.scrollY || document.documentElement.scrollTop || 0;
}
