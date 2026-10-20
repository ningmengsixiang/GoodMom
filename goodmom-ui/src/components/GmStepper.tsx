import React from "react";

/**
 * GmStepper —— 数量步进器（规范 11 · 11.2.11）
 *
 * 与 `@goodmom/vue` 同契约：value / min / max / step / disabled，事件 change。
 * 视觉（左右钮 44×44、tabular-nums）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 值夹在 [min, max]，到边界时对应按钮原生 disabled。
 * 2. 长按连发：按下立即步进一次，200ms 后每 60ms 连续步进；抬起 / 移出 / 失焦 /
 *    指针取消 / 卸载都会清掉计时器。用 latestRef 兜住受控父级尚未回写的场景。
 * 3. 键盘等价路径：聚焦后 ↑ / ↓ 增减（attach 在根节点，事件从按钮冒泡）。
 */
export interface GmStepperProps {
  /** 当前值，默认 0 */
  value?: number;
  /** 下限，默认 0 */
  min?: number;
  /** 上限，默认 99 */
  max?: number;
  /** 步长，默认 1 */
  step?: number;
  /** 禁用，默认 false */
  disabled?: boolean;
  onChange?: (value: number) => void;
}

const GmStepper = ({
  value = 0,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  onChange,
}: GmStepperProps) => {
  const latestRef = React.useRef(value);
  const holdRef = React.useRef<{ delay: number | null; timer: number | null }>({
    delay: null,
    timer: null,
  });

  React.useEffect(() => {
    latestRef.current = value;
  }, [value]);

  const stopHold = () => {
    const hold = holdRef.current;
    if (hold.delay !== null) {
      window.clearTimeout(hold.delay);
      hold.delay = null;
    }
    if (hold.timer !== null) {
      window.clearInterval(hold.timer);
      hold.timer = null;
    }
  };

  React.useEffect(() => stopHold, []);

  const apply = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped === latestRef.current) return;
    latestRef.current = clamped;
    onChange?.(clamped);
  };

  const changeBy = (dir: 1 | -1) => apply(latestRef.current + dir * step);

  const startHold = (dir: 1 | -1) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const target = e.currentTarget;
    if (target.setPointerCapture) {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        /* 某些宿主不支持指针捕获，退化为普通点击 + pointerleave 结束 */
      }
    }
    stopHold();
    changeBy(dir);
    holdRef.current.delay = window.setTimeout(() => {
      holdRef.current.timer = window.setInterval(() => changeBy(dir), HOLD_INTERVAL);
    }, HOLD_DELAY);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      changeBy(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      changeBy(-1);
    }
  };

  return (
    <div
      className={"gm-stepper" + (disabled ? " is-disabled" : "")}
      role="group"
      aria-label="步进器"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="gm-stepper__btn"
        aria-label="减少"
        disabled={disabled || value <= min}
        onPointerDown={startHold(-1)}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onPointerLeave={stopHold}
        onLostPointerCapture={stopHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="gm-stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="gm-stepper__btn"
        aria-label="增加"
        disabled={disabled || value >= max}
        onPointerDown={startHold(1)}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onPointerLeave={stopHold}
        onLostPointerCapture={stopHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
};
export default GmStepper;

const HOLD_DELAY = 200; /* 长按首次连发延迟 */
const HOLD_INTERVAL = 60; /* 连发间隔 */
