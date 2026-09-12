<script setup lang="ts">
/**
 * GmSpin —— 加载指示器（对应 08 · 8.2.15 / Part 19 · EL-19-02）
 *
 * ## 本轮完善（V2.9「状态与加载」深化）—— 与 React 版同一契约
 *
 * 1. **尺寸回到规范区间**：原默认 `size = 16` 低于 08 · 8.2.15 的下限 18。
 *    现支持档位 `sm|md|lg|xl` = 18/24/32/40，数字入参夹到 [18,40]。
 * 2. **`delay` 从"口头约定"变成组件能力**：本文件原注释写着「≤300ms 的请求不显示
 *    loading」，但组件并没有这个能力，全靠调用方自觉 —— 现补 `delay`（默认 300ms）
 *    并在卸载时清理定时器。
 * 3. **补 `tone="inverse"`**：08 · 8.2.15 原文「深底/按钮内为白/浅色」。
 * 4. **无障碍**：`role="status"` + `aria-live="polite"`；**无文案时**补 `aria-label`，
 *    否则读屏只拿到一个空的 status 容器。
 *
 * 局部加载用 GmSpin，首屏骨架用 GmSkeleton（08 章三态分工）。
 */
import { computed, onUnmounted, ref, watch } from "vue";

const SIZE_PRESET = { sm: 18, md: 24, lg: 32, xl: 40 } as const;
const SIZE_MIN = 18;
const SIZE_MAX = 40;

const props = withDefaults(
  defineProps<{
    /** 提示文字，默认「加载中…」；传空字符串则只显示指示器 */
    text?: string;
    /** 尺寸档位或像素值（像素值夹到 18–40，符合 08 · 8.2.15） */
    size?: keyof typeof SIZE_PRESET | number;
    /** 延迟起显毫秒数，默认 300（0 = 立即显示） */
    delay?: number;
    /** 色相：品牌玫（默认）/ 深底与实底按钮内用 inverse（白/浅色环） */
    tone?: "brand" | "inverse";
    /** 无文案时给读屏的名称 */
    ariaLabel?: string;
  }>(),
  { text: "加载中…", size: "md", delay: 300, tone: "brand" }
);

const px = computed(() => {
  const s = props.size;
  if (typeof s === "number") return Math.min(SIZE_MAX, Math.max(SIZE_MIN, s));
  return SIZE_PRESET[s ?? "md"] ?? SIZE_PRESET.md;
});

const shown = ref(props.delay <= 0);
let timer: ReturnType<typeof setTimeout> | undefined;

const restart = () => {
  if (timer) clearTimeout(timer);
  if (props.delay <= 0) {
    shown.value = true;
    return;
  }
  shown.value = false;
  timer = setTimeout(() => (shown.value = true), props.delay);
};

watch(() => props.delay, restart, { immediate: true });
onUnmounted(() => timer && clearTimeout(timer));
</script>

<template>
  <span
    v-if="shown"
    :class="['gm-spin', tone === 'inverse' && 'gm-spin--inverse']"
    role="status"
    aria-live="polite"
    :aria-label="text ? undefined : ariaLabel || '加载中'"
  >
    <i :style="{ width: px + 'px', height: px + 'px' }" aria-hidden="true" />
    <span v-if="text">{{ text }}</span>
  </span>
</template>
