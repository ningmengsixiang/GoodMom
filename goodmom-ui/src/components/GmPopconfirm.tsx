import React from "react";

/**
 * GmPopconfirm —— 气泡确认（规范 08 · 8.2.17 / Part 18 · MD-18-01/03）
 *
 * 站点演示气泡已达标（V2.9：role=dialog + aria-expanded），本组件收进库：
 *
 * 1. **非模态 dialog**（Part 18 裁决口径）：气泡带交互内容 → `role="dialog"`，
 *    标题区 id 供 `aria-labelledby`；触发器 `aria-haspopup="dialog"` +
 *    `aria-expanded`（读屏必须能听到展开态）。
 * 2. **焦点**：打开焦点进气泡首按钮，ESC / 外点关闭后**归还触发点**。
 * 3. **动效**：进出 180ms / Y 4px（Part 18 对 Popconfirm 的落地值；08.2.17
 *    的 240ms 微回弹档由 popover 承担）。
 * 4. **danger**：确认钮走 D5 深档 danger 实底（白字 AA 达标），避免页面出现
 *    两个红色实底（03 · 3.2.4.1 裁决：入口红字 + 气泡内深档实底）。
 * 5. **移动端**（10.4 约定）：Popconfirm 由底部操作表 ActionSheet 承担 ——
 *    调用方在 ≤767 时改走底部弹层，本组件不内置第二套形态。
 *
 * 触发器内容**只能是图标/文字**（整块就是按钮，别再放 GmButton —— 会按钮套按钮）。
 */
export interface GmPopconfirmProps {
  /** 确认问题文案（13px 600） */
  title?: React.ReactNode;
  /** 补充说明（12px 次级色），如「注销后不可恢复」 */
  description?: React.ReactNode;
  /** 确认钮文案，默认「确定」 */
  okText?: string;
  /** 取消钮文案，默认「取消」 */
  cancelText?: string;
  /** 危险操作：确认钮转 danger 深档实底（D5），默认 false */
  danger?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

const GmPopconfirm = ({
  title,
  description,
  okText = "确定",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
  children,
}: GmPopconfirmProps) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const trgRef = React.useRef<HTMLButtonElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();

  const openPop = () => {
    setOpen(true);
    window.setTimeout(() => {
      btnRef.current && btnRef.current.focus();
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

  const confirm = () => {
    closePop();
    if (onConfirm) onConfirm();
  };
  const cancel = () => {
    closePop();
    if (onCancel) onCancel();
  };

  return (
    <span className="gm-popconfirm" ref={rootRef}>
      <button
        type="button"
        className="gm-popconfirm__trg"
        ref={trgRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? closePop() : openPop())}
      >
        {children}
      </button>
      <div
        className={"gm-popconfirm__pop" + (open ? " is-on" : "")}
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className="gm-popconfirm__t" id={titleId}>
          {title}
        </div>
        {description && <div className="gm-popconfirm__d">{description}</div>}
        <div className="gm-popconfirm__btns">
          <button type="button" className="gm-popconfirm__btn" onClick={cancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={
              "gm-popconfirm__btn " +
              (danger ? "gm-popconfirm__btn--danger" : "gm-popconfirm__btn--primary")
            }
            ref={btnRef}
            onClick={confirm}
          >
            {okText}
          </button>
        </div>
      </div>
    </span>
  );
};
export default GmPopconfirm;
