<script setup lang="ts">
/**
 * GmNumberKeyboard —— 数字键盘（规范 11.6.10）
 *
 * 与 React 版同契约（受控 value / maxLength / 四个事件逐项对应）：
 * 1. 3×4 布局：1–9、删除、0、完成；删除键与完成键挂 is-action 状态类。
 * 2. 数字键派发 input(value + digit)；maxLength>0 时到上限不再追加（0 = 不限）。
 * 3. 删除键派发 delete（无参，由父级决定如何删）；完成键派发 confirm(value)。
 * 4. role=dialog + aria-modal；ESC 派发 close；物理键盘数字 / Backspace / Enter
 *    也走同一套事件，方便桌面端与读屏用户。open=false 时不渲染。
 */
import { onUnmounted, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否打开（受控），默认 false */
    open?: boolean;
    /** 当前值，默认空 */
    value?: string;
    /** 最大长度，0 = 不限，默认 0 */
    maxLength?: number;
  }>(),
  {
    open: false,
    value: "",
    maxLength: 0,
  }
);

const emit = defineEmits(["input", "delete", "confirm", "close"]);

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const canAppend = (next: string) => props.maxLength <= 0 || next.length <= props.maxLength;

const handleKey = (digit: string) => {
  const next = props.value + digit;
  if (canAppend(next)) emit("input", next);
};

const onDelete = () => emit("delete");

const onConfirm = () => emit("confirm", props.value);

/** 物理键盘：数字 / Backspace / Enter / ESC 走同一套事件 */
const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
    return;
  }
  if (/^[0-9]$/.test(e.key)) {
    const next = props.value + e.key;
    if (canAppend(next)) emit("input", next);
  } else if (e.key === "Backspace") {
    e.preventDefault();
    emit("delete");
  } else if (e.key === "Enter") {
    emit("confirm", props.value);
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) document.addEventListener("keydown", onKeydown);
    else document.removeEventListener("keydown", onKeydown);
  },
  { immediate: true }
);

onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div v-if="open" class="gm-numkbd" role="dialog" aria-modal="true" aria-label="数字键盘">
    <div class="gm-numkbd__display" aria-live="polite">{{ value }}</div>
    <div class="gm-numkbd__grid">
      <button
        v-for="digit in KEYS"
        :key="digit"
        type="button"
        class="gm-numkbd__key"
        @click="handleKey(digit)"
      >
        {{ digit }}
      </button>
      <button
        type="button"
        class="gm-numkbd__key is-action"
        aria-label="删除"
        @click="onDelete"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9L3 12l6-7Z" />
          <path d="m12.5 9.5 5 5m0-5-5 5" />
        </svg>
      </button>
      <button type="button" class="gm-numkbd__key" @click="handleKey('0')">0</button>
      <button type="button" class="gm-numkbd__key is-action" @click="onConfirm">完成</button>
    </div>
  </div>
</template>
