import React from "react";

/**
 * GmNumberKeyboard —— 数字键盘（规范 11 · 11.6.10）
 *
 * 与 `@goodmom/vue` 同契约：open / value / maxLength，事件 input / delete / confirm / close。
 * `open=false` 返回 null。视觉（玻璃键盘底、键 ≥48 高、is-action 状态类）由 CSS 提供，
 * 本文件无色值。
 *
 * 行为：
 * 1. 3×4 布局：1–9、删除、0、完成；删除键与完成键挂 is-action 状态类。
 * 2. 数字键派发 input(value + digit)；maxLength>0 时到上限不再追加（0 = 不限）。
 * 3. 删除键派发 delete（无参，由父级决定如何删）；完成键派发 confirm(value)。
 * 4. role="dialog" + aria-modal；ESC 派发 close；物理键盘数字 / Backspace / Enter
 *    也走同一套事件，方便桌面端与读屏用户。
 */
export interface GmNumberKeyboardProps {
  /** 是否打开，默认 false */
  open?: boolean;
  /** 当前值，默认 "" */
  value?: string;
  /** 最大长度，0 = 不限，默认 0 */
  maxLength?: number;
  onInput?: (value: string) => void;
  onDelete?: () => void;
  onConfirm?: (value: string) => void;
  onClose?: () => void;
}

const GmNumberKeyboard = ({
  open = false,
  value = "",
  maxLength = 0,
  onInput,
  onDelete,
  onConfirm,
  onClose,
}: GmNumberKeyboardProps) => {
  const canAppend = (next: string) => maxLength <= 0 || next.length <= maxLength;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        const next = value + e.key;
        if (canAppend(next)) onInput?.(next);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onDelete?.();
      } else if (e.key === "Enter") {
        onConfirm?.(value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, value, maxLength, onInput, onDelete, onConfirm, onClose]);

  const handleKey = (digit: string) => {
    const next = value + digit;
    if (canAppend(next)) onInput?.(next);
  };

  if (!open) return null;

  return (
    <div className="gm-numkbd" role="dialog" aria-modal="true" aria-label="数字键盘">
      <div className="gm-numkbd__display" aria-live="polite">
        {value}
      </div>
      <div className="gm-numkbd__grid">
        {KEYS.map((digit) => (
          <button key={digit} type="button" className="gm-numkbd__key" onClick={() => handleKey(digit)}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="gm-numkbd__key is-action"
          aria-label="删除"
          onClick={() => onDelete?.()}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9L3 12l6-7Z" />
            <path d="m12.5 9.5 5 5m0-5-5 5" />
          </svg>
        </button>
        <button type="button" className="gm-numkbd__key" onClick={() => handleKey("0")}>
          0
        </button>
        <button
          type="button"
          className="gm-numkbd__key is-action"
          onClick={() => onConfirm?.(value)}
        >
          完成
        </button>
      </div>
    </div>
  );
};
export default GmNumberKeyboard;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
