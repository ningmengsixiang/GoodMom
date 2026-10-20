import React from "react";

/**
 * GmPopover —— 气泡面板（规范 03 · 3.5.4 / 3.9 / Part 18 · MD-18-01）
 *
 * 3.5.4：面板材质 `--lg-glass-popover`（更实 + 高模糊）、圆角 20；
 * MD-18-01：**240ms 指向触发点**；MD-18-02 触发器语义：`aria-haspopup="dialog"`
 * + `aria-expanded`。ESC / 外点关闭，焦点归还触发点。
 *
 * 触发器内容**只能是图标/文字**（整块就是按钮，别再放 GmButton —— 会按钮套按钮）。
 * 移动端（10.4）禁 hover 依赖：本组件点击开合，触屏直接可用。
 */
export interface GmPopoverProps {
  title?: React.ReactNode;
  /** 气泡内容（必填）：文本或任意节点 */
  content: React.ReactNode;
  children?: React.ReactNode;
}

const GmPopover = ({ title, content, children }: GmPopoverProps) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const trgRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);

  const openPop = () => {
    setOpen(true);
    window.setTimeout(() => {
      popRef.current && popRef.current.focus();
    }, 0);
  };
  const closePop = () => {
    setOpen(false);
    trgRef.current && trgRef.current.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closePop();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePop();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = typeof title === "string" ? title : "帮助信息";

  return (
    <span className="gm-popover" ref={rootRef}>
      <button
        type="button"
        className="gm-popover__trg"
        ref={trgRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? closePop() : openPop())}
      >
        {children}
      </button>
      <div
        className={"gm-popover__pop" + (open ? " is-on" : "")}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        ref={popRef}
      >
        {title && <div className="gm-popover__t">{title}</div>}
        <div className="gm-popover__body">{content}</div>
      </div>
    </span>
  );
};
export default GmPopover;
