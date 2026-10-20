import React from "react";

/**
 * GmPicker —— 底部选择器（规范 10 · 10.6.3）
 *
 * 与 `@goodmom/vue` 同契约：open / title / columns / value，事件 confirm / close。
 * `open=false` 返回 null。类名与面板结构由契约固定，视觉（底部面板、44 项高、
 * scroll-snap、玻璃底）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 每列 `scroll-snap-type:y mandatory`（CSS），项高 44；打开时滚到 value 对应项，
 *    无值 / 值不在列里则选该列第一项。
 * 2. 滚动结束按 `scrollTop / 44` 取整更新选中项；点某一项则选中并滚到位。
 * 3. 确定派发 confirm(selected) 并 close；取消 / 遮罩 / ESC 只派发 close。
 * 4. 焦点入面板、关闭归还触发点；ESC 关闭；遮罩点击关闭。
 */
export interface GmPickerProps {
  /** 是否打开，默认 false */
  open?: boolean;
  /** 标题，默认 "" */
  title?: string;
  columns: string[][];
  /** 已选值（每列一项），默认 [] */
  value?: string[];
  onConfirm?: (value: string[]) => void;
  onClose?: () => void;
}

const GmPicker = ({
  open = false,
  title = "",
  columns,
  value = [],
  onConfirm,
  onClose,
}: GmPickerProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);
  const bodyOverflowRef = React.useRef("");
  const colRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [selected, setSelected] = React.useState<string[]>([]);

  /* 打开：焦点入面板 + 锁滚动；关闭 / 卸载：焦点归还 + 还原滚动 */
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

  /* ESC 关闭 */
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

  /* 打开 / 列内容或初始值变化：按 value 初始化选中项，并把每列滚到位。
     依赖用内容 key 而不是数组引用 —— 父级每次渲染传新数组（含默认 []）时不能把
     滚动位置重置，否则滚动选择会被自身 setState 触发的 effect 反复打断。 */
  const columnsKey = columns.map((col) => col.join("\u0001")).join("\u0002");
  const valueKey = value.join("\u0001");
  React.useEffect(() => {
    if (!open) return;
    const next = columns.map((col, i) => {
      const wanted = value[i];
      return wanted !== undefined && col.indexOf(wanted) >= 0 ? wanted : (col[0] ?? "");
    });
    setSelected(next);
    const raf = window.requestAnimationFrame(() => {
      next.forEach((v, i) => {
        const el = colRefs.current[i];
        const idx = columns[i].indexOf(v);
        if (el && idx >= 0) el.scrollTop = idx * PICKER_ITEM_H;
      });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open, columnsKey, valueKey]);

  const handleScroll = (colIndex: number) => (e: React.UIEvent<HTMLDivElement>) => {
    const col = columns[colIndex] ?? [];
    if (col.length === 0) return;
    const idx = Math.min(col.length - 1, Math.max(0, Math.round(e.currentTarget.scrollTop / PICKER_ITEM_H)));
    const next = col[idx];
    setSelected((prev) => {
      if (prev[colIndex] === next) return prev;
      const merged = prev.slice();
      merged[colIndex] = next;
      return merged;
    });
  };

  const selectItem = (colIndex: number, item: string) => {
    setSelected((prev) => {
      const merged = prev.slice();
      merged[colIndex] = item;
      return merged;
    });
    const el = colRefs.current[colIndex];
    const idx = (columns[colIndex] ?? []).indexOf(item);
    if (el && idx >= 0) el.scrollTop = idx * PICKER_ITEM_H;
  };

  const handleConfirm = () => {
    onConfirm?.(selected);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="gm-picker">
      <div className="gm-picker__mask" aria-hidden="true" onClick={onClose} />
      <div
        className="gm-picker__panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title || "选择器"}
      >
        <div className="gm-picker__head">
          <button type="button" className="gm-picker__cancel" onClick={onClose}>
            取消
          </button>
          <h2 className="gm-picker__title">{title}</h2>
          <button type="button" className="gm-picker__confirm" onClick={handleConfirm}>
            确定
          </button>
        </div>
        <div className="gm-picker__body">
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              className="gm-picker__column"
              ref={(el) => {
                colRefs.current[colIndex] = el;
              }}
              role="group"
              aria-label={"第 " + (colIndex + 1) + " 列"}
              onScroll={handleScroll(colIndex)}
            >
              {col.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={"gm-picker__item" + (selected[colIndex] === item ? " is-active" : "")}
                  aria-pressed={selected[colIndex] === item}
                  onClick={() => selectItem(colIndex, item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default GmPicker;

const PICKER_ITEM_H = 44; /* 项高，与 CSS 同源 */
