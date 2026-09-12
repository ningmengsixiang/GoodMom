<script setup lang="ts">
/**
 * GmSpin —— 加载指示器（对应 08 · 8.2.15 / 07 加载范式）
 *
 * 口径：≤300ms 的请求不显示 loading（闪烁比等待更糟）；>300ms 才挂载本组件。
 * 无障碍：role="status" 让读屏在有内容变化时播报；spinner 本身 aria-hidden，文字承担语义。
 * 局部加载用 GmSpin，首屏骨架用 GmSkeleton（08 章三态分工）。
 */
withDefaults(
  defineProps<{
    /** 提示文字，默认「加载中…」；传空字符串则只显示指示器 */
    text?: string;
    /** 指示器直径 px，默认 16 */
    size?: number;
  }>(),
  { text: "加载中…", size: 16 }
);
</script>

<template>
  <span class="gm-spin" role="status">
    <i :style="{ width: size + 'px', height: size + 'px' }" aria-hidden="true" />
    <span v-if="text">{{ text }}</span>
  </span>
</template>
