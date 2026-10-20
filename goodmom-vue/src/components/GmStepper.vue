<script setup lang="ts">
/**
 * GmStepper —— 数量步进器（规范 11.2.11）
 *
 * 与 React 版同契约（受控 value / 边界 / 长按连发 / 键盘逐项对应）：
 * 1. 值夹在 [min, max]，到边界时对应按钮原生 disabled。
 * 2. 长按连发：按下立即步进一次，200ms 后每 60ms 连续步进；抬起 / 移出 / 取消 /
 *    失去指针捕获 / 卸载都会清掉计时器。
 * 3. 键盘等价路径：焦点在纽上时 ↑ / ↓ 增减（attach 在根节点，事件从按钮冒泡）。
 * 4. 左右钮 44×44、tabular-nums 由 CSS 承担，图标为装饰性 SVG。
 */
import { onUnmounted, watch } from "vue";

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    value: 0,
    min: 0,
    max: 99,
    step: 1,
    disabled: false,
  }
);

const emit = defineEmits(["change"]);

/** 长按首次连发延迟 */
const HOLD_DELAY = 200;
/** 连发间隔 */
const HOLD_INTERVAL = 60;

/** 最新值镜像：受控父级尚未回写时也能连续步进 */
let latest = props.value;
let holdDelay: number | null = null;
let holdTimer: number | null = null;

watch(
  () => props.value,
  (value) => {
    latest = value;
  }
);

const stopHold = () => {
  if (holdDelay !== null) {
    window.clearTimeout(holdDelay);
    holdDelay = null;
  }
  if (holdTimer !== null) {
    window.clearInterval(holdTimer);
    holdTimer = null;
  }
};

onUnmounted(stopHold);

const apply = (next: number) => {
  const clamped = Math.min(props.max, Math.max(props.min, next));
  if (clamped === latest) return;
  latest = clamped;
  emit("change", clamped);
};

const changeBy = (dir: 1 | -1) => apply(latest + dir * props.step);

const startHold = (dir: 1 | -1, e: PointerEvent) => {
  if (props.disabled) return;
  const target = e.currentTarget as HTMLButtonElement | null;
  if (target && target.setPointerCapture) {
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* 某些宿主不支持指针捕获，退化为普通点击 + pointerleave 结束 */
    }
  }
  stopHold();
  changeBy(dir);
  holdDelay = window.setTimeout(() => {
    holdTimer = window.setInterval(() => changeBy(dir), HOLD_INTERVAL);
  }, HOLD_DELAY);
};

const onKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  if (e.key === "ArrowUp") {
    e.preventDefault();
    changeBy(1);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    changeBy(-1);
  }
};
</script>

<template>
  <div
    class="gm-stepper"
    :class="{ 'is-disabled': disabled }"
    role="group"
    aria-label="步进器"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="gm-stepper__btn"
      aria-label="减少"
      :disabled="disabled || value <= min"
      @pointerdown="startHold(-1, $event)"
      @pointerup="stopHold"
      @pointercancel="stopHold"
      @pointerleave="stopHold"
      @lostpointercapture="stopHold"
      @contextmenu.prevent
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12h14" />
      </svg>
    </button>
    <span class="gm-stepper__value" aria-live="polite">{{ value }}</span>
    <button
      type="button"
      class="gm-stepper__btn"
      aria-label="增加"
      :disabled="disabled || value >= max"
      @pointerdown="startHold(1, $event)"
      @pointerup="stopHold"
      @pointercancel="stopHold"
      @pointerleave="stopHold"
      @lostpointercapture="stopHold"
      @contextmenu.prevent
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>
