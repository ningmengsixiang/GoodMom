import React from "react";

/**
 * GmImageViewer —— 全屏图片查看（规范 11 · 11.2.9）
 *
 * 与 `@goodmom/vue` 同契约：open / images / index，事件 change（(index)）与 close。
 * `open=false` 或 images 为空时返回 null。视觉（深幕布 + blur 32、图片 contain、
 * 44 圆钮）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. `role="dialog"` + `aria-modal` + `aria-label`；ESC 关闭；遮罩点击关闭。
 * 2. 打开时焦点进关闭钮、锁 body 滚动，关闭 / 卸载时把焦点归还触发点。
 * 3. images 多于 1 张才渲染左右切换钮，到边界按钮原生 disabled；← / → 键盘等价。
 * 4. 切换时派发 change(index)；index 受控时外部变更会同步当前项。
 */
export interface GmImageViewerProps {
  /** 是否打开，默认 false */
  open?: boolean;
  images: string[];
  /** 初始 / 受控索引，默认 0 */
  index?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
}

const GmImageViewer = ({
  open = false,
  images,
  index = 0,
  onChange,
  onClose,
}: GmImageViewerProps) => {
  const [current, setCurrent] = React.useState(index);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);
  const bodyOverflowRef = React.useRef("");

  /* 打开或外部 index 变化：同步当前项 */
  React.useEffect(() => {
    if (!open) return;
    setCurrent(clamp(index, 0, Math.max(0, images.length - 1)));
  }, [open, index, images.length]);

  /* 打开：焦点进关闭钮 + 锁滚动；关闭 / 卸载：焦点归还 + 还原滚动 */
  React.useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = bodyOverflowRef.current;
      const prev = prevFocusRef.current;
      if (prev && prev.isConnected) prev.focus();
    };
  }, [open]);

  /* 键盘：ESC 关闭，← / → 切换 */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "ArrowRight") {
        go(1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, current, images.length, onClose]);

  const go = (delta: number) => {
    if (images.length <= 1) return;
    const next = clamp(current + delta, 0, images.length - 1);
    if (next === current) return;
    setCurrent(next);
    onChange?.(next);
  };

  if (!open || images.length === 0) return null;

  return (
    <div className="gm-imgviewer" role="dialog" aria-modal="true" aria-label="图片查看">
      <div className="gm-imgviewer__mask" aria-hidden="true" onClick={onClose} />
      <img className="gm-imgviewer__img" src={images[current]} alt={"图片 " + (current + 1)} />
      <button
        type="button"
        className="gm-imgviewer__close"
        ref={closeRef}
        aria-label="关闭"
        onClick={onClose}
      >
        ×
      </button>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            className="gm-imgviewer__nav"
            aria-label="上一张"
            disabled={current <= 0}
            onClick={() => go(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="gm-imgviewer__nav"
            aria-label="下一张"
            disabled={current >= images.length - 1}
            onClick={() => go(1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </>
      ) : null}
      <span className="gm-imgviewer__count">
        {current + 1} / {images.length}
      </span>
    </div>
  );
};
export default GmImageViewer;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
