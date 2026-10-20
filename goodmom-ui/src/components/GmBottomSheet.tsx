import React from "react";

/**
 * GmBottomSheet —— 移动端底部面板（规范 10 · 10.4.1 / 11 · 11.6.6）
 *
 * 与 `@goodmom/vue` 同契约：open / title / closable / maskClosable，事件 `close`；
 * 内容 React 用 `children` ↔ Vue 默认插槽。`open=false` 直接 return null（两侧一致）。
 *
 * 浮层行为（不依赖 portal，直接渲染在组件树里）：
 * 1. **焦点**：打开时记住 `document.activeElement`，焦点移入面板；关闭 / 卸载时把焦点
 *    归还触发点（触发点已从 DOM 移除则跳过）。面板 `tabIndex={-1}` 以承接编程式聚焦。
 * 2. **ESC**：打开期间监听 document keydown，ESC 走 onClose；关闭即移除监听。
 * 3. **遮罩**：`maskClosable` 为 true 时点击遮罩关闭。
 * 4. **滚动锁**：打开期间锁 body 滚动，关闭还原原值（与其他浮层一致）。
 * 5. 打开/关闭动效（上滑 320ms、遮罩淡入 250ms、reduced-motion 归零）由 CSS 承担。
 */
export interface GmBottomSheetProps {
  /** 是否打开，默认 false */
  open?: boolean;
  /** 标题，默认 ""；空标题时对话框可访问名回退为「面板」 */
  title?: string;
  /** 右上角关闭钮，默认 true */
  closable?: boolean;
  /** 点击遮罩关闭，默认 true */
  maskClosable?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const GmBottomSheet = ({
  open = false,
  title = "",
  closable = true,
  maskClosable = true,
  onClose,
  children,
}: GmBottomSheetProps) => {
  const panelRef = React.useRef<HTMLElement>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);
  const bodyOverflowRef = React.useRef("");

  /* 打开：记住触发点 + 焦点进面板 + 锁滚动；关闭 / 卸载：聚焦归还 + 还原滚动 */
  React.useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = bodyOverflowRef.current;
      const prev = prevFocusRef.current;
      if (prev && prev.isConnected) prev.focus();
    };
  }, [open]);

  /* ESC 关闭：只在打开期间挂监听，避免多个浮层同时响应 */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="gm-sheet">
      <div
        className="gm-sheet__mask"
        aria-hidden="true"
        onClick={() => {
          if (maskClosable) onClose?.();
        }}
      />
      <section
        className="gm-sheet__panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title || "面板"}
      >
        <header className="gm-sheet__head">
          <h2 className="gm-sheet__title">{title}</h2>
          {closable ? (
            <button type="button" className="gm-sheet__close" aria-label="关闭" onClick={onClose}>
              ×
            </button>
          ) : null}
        </header>
        <div className="gm-sheet__body">{children}</div>
      </section>
    </div>
  );
};
export default GmBottomSheet;
