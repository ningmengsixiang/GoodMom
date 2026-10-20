<script setup lang="ts">
/**
 * GmSafeArea —— 安全区占位（规范 11.6.7）
 *
 * 与 React 版同契约：纯布局件，position 控制补哪一侧；
 * 高度来自 CSS 的 env(safe-area-inset-*)；对读屏完全隐藏（aria-hidden）。
 */
const props = withDefaults(
  defineProps<{
    /** 补哪一侧安全区，默认 "bottom" */
    position?: "top" | "bottom" | "both";
  }>(),
  {
    position: "bottom",
  }
);
</script>

<template>
  <div
    class="gm-safearea"
    :class="`is-${position}`"
    :data-position="position"
    aria-hidden="true"
  />
</template>
