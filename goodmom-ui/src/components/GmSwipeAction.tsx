import React from "react";

/**
 * GmSwipeAction —— 列表行左滑操作（规范 11 · 11.2.5）
 *
 * 与 `@goodmom/vue` 同契约：actions（命名 interface GmSwipeActionItem）+ 事件 action，
 * 内容 React `children` ↔ Vue 默认插槽。视觉（按钮 ≥64、danger 风险色、300ms 贴靠）
 * 由组件 CSS 提供，本文件无色值。
 *
 * 手势（指针事件，两库同行为）：
 * 1. 方向判定：位移 >8px 且横向大于纵向才进入拖拽，否则视为纵向滚动直接放弃。
 * 2. 拖拽跟手，位移夹在 [-操作区宽, 0]；松手超过一半即贴靠展开，否则回弹收起。
 * 3. 最多渲染前 3 个操作项；点操作项先收起再派发 action。
 * 4. 展开时点行内空白收起（且不触发内容点击）；点组件外区域 / ESC 同样收起。
 * 5. 收起态操作钮 `tabIndex=-1` + aria-hidden，不进入 Tab 序列；展开后才可键盘操作。
 */
export interface GmSwipeActionItem {
  key: string;
  label: string;
  /** 破坏性操作，默认 false */
  danger?: boolean;
}
export interface GmSwipeActionProps {
  actions: GmSwipeActionItem[];
  onAction?: (key: string) => void;
  children?: React.ReactNode;
}

const GmSwipeAction = ({ actions, onAction, children }: GmSwipeActionProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [dragX, setDragX] = React.useState<number | null>(null);
  const [actionsWidth, setActionsWidth] = React.useState(0);
  const startRef = React.useRef<{ x: number; y: number; open: boolean } | null>(null);
  const axisRef = React.useRef<"" | "x" | "y">("");
  const movedRef = React.useRef(false);
  const widthRef = React.useRef(0);

  const visibleActions = actions.slice(0, 3);

  /* 操作区实际宽度（由 CSS 决定 64+），用于夹取拖拽位移与贴靠判定 */
  React.useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const measure = () => {
      widthRef.current = el.offsetWidth;
      setActionsWidth(el.offsetWidth);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visibleActions.length]);

  /* 展开时点组件外部收起 */
  React.useEffect(() => {
    if (!open) return;
    const onDocDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [open]);

  /* 展开时 ESC 收起 */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, open };
    axisRef.current = "";
    movedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (axisRef.current === "") {
      if (Math.abs(dx) > SWIPE_AXIS && Math.abs(dx) > Math.abs(dy)) {
        axisRef.current = "x";
      } else if (Math.abs(dy) > SWIPE_AXIS) {
        axisRef.current = "y";
      }
    }
    if (axisRef.current !== "x") return;
    movedRef.current = true;
    const base = start.open ? -widthRef.current : 0;
    const raw = base + dx;
    setDragX(Math.max(-widthRef.current, Math.min(0, raw)));
  };

  const finishDrag = () => {
    const start = startRef.current;
    if (!start) return;
    if (axisRef.current === "x") {
      const base = start.open ? -widthRef.current : 0;
      const finalX = dragX === null ? base : dragX;
      setOpen(finalX <= -widthRef.current / 2);
    }
    startRef.current = null;
    axisRef.current = "";
    setDragX(null);
  };

  const handleBodyClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      /* 刚结束拖拽的那次 click 是手势尾巴，拦掉以免误触内容 */
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
      return;
    }
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  const handleAction = (key: string) => {
    setOpen(false);
    onAction?.(key);
  };

  const translate = dragX === null ? (open ? -actionsWidth : 0) : dragX;

  return (
    <div className="gm-swipe" ref={rootRef}>
      <div
        className="gm-swipe__body"
        style={{ transform: "translateX(" + translate + "px)" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleBodyClickCapture}
      >
        {children}
      </div>
      <div className="gm-swipe__actions" ref={actionsRef} aria-hidden={!open}>
        {visibleActions.map((it) => (
          <button
            key={it.key}
            type="button"
            className={"gm-swipe__action" + (it.danger ? " is-danger" : "")}
            tabIndex={open ? 0 : -1}
            onClick={() => handleAction(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
};
export default GmSwipeAction;

const SWIPE_AXIS = 8; /* 方向判定阈值 */
