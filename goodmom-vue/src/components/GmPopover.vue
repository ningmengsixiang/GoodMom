<script setup lang="ts">
/**
 * GmPopover —— 气泡面板（规范 03 · 3.5.4 / 3.9 / Part 18 · MD-18-01）
 *
 * 与 React 版同契约：面板材质 --lg-glass-popover、圆角 20；**240ms 指向触发点**；
 * 触发器 aria-haspopup="dialog" + aria-expanded；ESC / 外点关闭归还焦点。
 * 移动端（10.4）禁 hover：点击开合，触屏直接可用。
 * 触发器内容**只能是图标/文字**（整块就是按钮，别再放 GmButton）。
 */
import { onUnmounted, ref, useId } from "vue";

const props = defineProps<{
  title?: string;
  /** 气泡内容（必填） */
  content?: unknown;
}>();

defineSlots<{
  default?: () => unknown;
  /** 气泡内容（与 React 的 content prop 同一能力） */
  content?: () => unknown;
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const trgRef = ref<HTMLButtonElement | null>(null);
const popRef = ref<HTMLElement | null>(null);

const openPop = () => {
  open.value = true;
  window.setTimeout(() => popRef.value && popRef.value.focus(), 0);
};
const closePop = () => {
  open.value = false;
  trgRef.value && trgRef.value.focus();
};

const onDoc = (e: MouseEvent) => {
  if (!open.value) return;
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) closePop();
};
const onKey = (e: KeyboardEvent) => {
  if (!open.value) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    closePop();
  }
};
document.addEventListener("mousedown", onDoc);
document.addEventListener("keydown", onKey);
onUnmounted(() => {
  document.removeEventListener("mousedown", onDoc);
  document.removeEventListener("keydown", onKey);
});

const label = typeof props.title === "string" ? props.title : "帮助信息";
const titleId = useId();
</script>

<template>
  <span ref="rootRef" class="gm-popover">
    <button
      ref="trgRef"
      type="button"
      class="gm-popover__trg"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open ? closePop() : openPop()"
    >
      <slot />
    </button>
    <div
      ref="popRef"
      class="gm-popover__pop"
      :class="{ 'is-on': open }"
      role="dialog"
      :aria-label="label"
      tabindex="-1"
    >
      <div v-if="title" class="gm-popover__t" :id="titleId">{{ title }}</div>
      <div class="gm-popover__body">
        <slot name="content">{{ content }}</slot>
      </div>
    </div>
  </span>
</template>
