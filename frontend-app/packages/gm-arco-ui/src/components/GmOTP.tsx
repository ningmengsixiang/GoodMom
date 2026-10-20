import React from "react";

/**
 * GmOTP —— 验证码输入（规范 11 · 11.2.14）
 *
 * 与 `@goodmom/vue` 同契约：length / value / disabled，事件 change / complete。
 * 视觉（每格 44×52、聚焦描边）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 每格一个真 input；输入数字自动跳下一格，退格（当前格为空时）回上一格并清空。
 * 2. 整串粘贴按起始格自动分发；系统短信验证码自动填充（autocomplete=one-time-code）
 *    产生的多字符输入同样分发。
 * 3. 填满且与旧值不同时派发 complete；← / → 在格间移动焦点。
 * 4. 容器 role="group" + aria-label="验证码"；每格 inputmode=numeric 并带序号可访问名。
 */
export interface GmOTPProps {
  /** 验证码位数，默认 6 */
  length?: number;
  /** 受控值，默认 "" */
  value?: string;
  /** 禁用，默认 false */
  disabled?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

const GmOTP = ({
  length = 6,
  value = "",
  disabled = false,
  onChange,
  onComplete,
}: GmOTPProps) => {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const chars = React.useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < length; i++) out.push(value.charAt(i));
    return out;
  }, [length, value]);

  const focusCell = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  };

  const commit = (nextChars: string[]) => {
    const next = nextChars.join("").slice(0, length);
    onChange?.(next);
    if (next.length === length && next !== value) onComplete?.(next);
  };

  const handleInput = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const next = chars.slice();
    if (digits.length > 1) {
      /* 自动填充 / 一次输入多位：从当前格起逐格分发 */
      for (let i = 0; i < digits.length && index + i < length; i++) next[index + i] = digits.charAt(i);
      commit(next);
      focusCell(index + digits.length);
      return;
    }
    next[index] = digits;
    commit(next);
    if (digits) focusCell(index + 1);
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = chars.slice();
      if (next[index]) {
        next[index] = "";
        commit(next);
        return;
      }
      if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusCell(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    const next = chars.slice();
    for (let i = 0; i < digits.length && index + i < length; i++) next[index + i] = digits.charAt(i);
    commit(next);
    focusCell(index + digits.length);
  };

  return (
    <div className="gm-otp" role="group" aria-label="验证码">
      {chars.map((char, index) => (
        <span key={index} className="gm-otp__cell">
          <input
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            className="gm-otp__input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={char}
            disabled={disabled}
            aria-label={"验证码第 " + (index + 1) + " 位"}
            onChange={handleInput(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            onFocus={(e) => e.target.select()}
          />
        </span>
      ))}
    </div>
  );
};
export default GmOTP;
