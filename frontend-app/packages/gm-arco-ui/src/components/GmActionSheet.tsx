import React from "react";

/**
 * GmActionSheet —— 底部操作表（规范 10 · 10.4.1）
 *
 * 与 `@goodmom/vue` 同契约：open / title / items / cancelText / maskClosable，
 * 事件 `select`（React `onSelect` ↔ Vue `emit("select", key)`）与 `close`。
 * `open=false` 直接 return null。选择项只派发 `select`，是否关闭由调用方决定
 * （与契约模板一致：操作行触发 select，取消行触发 close）。
 *
 * 无障碍与浮层行为：
 * 1. 面板 `role="dialog"` + `aria-modal="true"` + `aria-label`（标题空时回退「操作」）。
 * 2. 打开时焦点移入面板，关闭 / 卸载归还触发点；ESC 与遮罩点击（maskClosable）关闭。
 * 3. 操作行是原生 `<button type="button">`，行高 56 / 16 号字由 CSS 提供；
 *    `disabled` 走原生 disabled 语义（不可聚焦、不可触发），`danger` 只挂状态类。
 * 4. 取消行独立一块，始终渲染，关闭语义等价于 ESC。
 */
export interface GmActionSheetItem {
  key: string;
  label: string;
  /** 破坏性操作：红色语义，默认 false */
  danger?: boolean;
  /** 禁用：原生 disabled，默认 false */
  disabled?: boolean;
}
export interface GmActionSheetProps {
  /** 是否打开，默认 false */
  open?: boolean;
  /** 标题，默认 ""；空标题时对话框可访问名回退为「操作」 */
  title?: string;
  items: GmActionSheetItem[];
  /** 取消行文案，默认 "取消" */
  cancelText?: string;
  /** 点击遮罩关闭，默认 true */
  maskClosable?: boolean;
  onSelect?: (key: string) => void;
  onClose?: () => void;
}

const GmActionSheet = ({
  open = false,
  title = "",
  items,
  cancelText = "取消",
  maskClosable = true,
  onSelect,
  onClose,
}: GmActionSheetProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
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

  /* ESC 关闭：只在打开期间挂监听 */
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
    <div className="gm-actionsheet">
      <div
        className="gm-actionsheet__mask"
        aria-hidden="true"
        onClick={() => {
          if (maskClosable) onClose?.();
        }}
      />
      <div
        className="gm-actionsheet__panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title || "操作"}
      >
        {title ? <p className="gm-actionsheet__title">{title}</p> : null}
        <div className="gm-actionsheet__list">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              className={"gm-actionsheet__item" + (it.danger ? " is-danger" : "")}
              disabled={it.disabled}
              onClick={() => onSelect?.(it.key)}
            >
              {it.label}
            </button>
          ))}
        </div>
        <button type="button" className="gm-actionsheet__cancel" onClick={onClose}>
          {cancelText}
        </button>
      </div>
    </div>
  );
};
export default GmActionSheet;
