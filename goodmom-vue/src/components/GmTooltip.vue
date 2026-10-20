<script setup lang="ts">
/**
 * GmTooltip —— 文字气泡（规范 03 · 3.9 / Part 18 · MD-18-01 / 10 · 10.4）
 *
 * 与 React 版同契约：180ms / Y4px；白玻璃小泡 + 发丝边、pointer-events:none。
 * 触发：桌面 hover / 键盘 focus（事件冒泡自内部可聚焦子元素）/ 移动端 tap 开合
 * （10.4 禁 hover 依赖）。role="tooltip"（纯文本），Escape 收起。
 */
import { ref, useId } from "vue";

const props = defineProps<{
  /** 气泡文案（必填） */
  title: string;
}>();

const on = ref(false);
const tipId = useId();
const show = () => (on.value = true);
const hide = () => (on.value = false);
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") hide();
};
</script>

<template>
  <span
    class="gm-tooltip"
    @pointerenter="show"
    @pointerleave="hide"
    @pointerdown="on = !on"
    @focus="show"
    @blur="hide"
    @keydown="onKey"
  >
    <slot />
    <span class="gm-tooltip__tip" :class="{ 'is-on': on }" role="tooltip" :id="tipId">
      {{ title }}
    </span>
  </span>
</template>
