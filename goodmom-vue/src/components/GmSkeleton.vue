<script setup lang="ts">
/**
 * GmSkeleton —— 骨架屏（对应 08 · 8.2.13 / 07 加载范式）
 *
 * 口径：骨架屏用于**首屏**（结构已知、数据未知），必须与真实内容同结构同高度，
 * 否则数据到达时页面跳动（CLS）比转圈更糟。
 * widths 循环取用；行数默认 3。读屏：整体 role="status" + 文案，逐行骨架 aria-hidden。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 行数，默认 3 */
    rows?: number;
    /** 每行宽度（循环取用），如 ["100%","72%","88%"] */
    widths?: string[];
    /** 读屏文案，默认「内容加载中」 */
    label?: string;
  }>(),
  { rows: 3, widths: () => ["100%", "84%", "70%"], label: "内容加载中" }
);

const rowWidths = computed(() =>
  Array.from({ length: Math.max(0, props.rows) }, (_, i) => props.widths[i % props.widths.length] ?? "100%")
);
</script>

<template>
  <div class="gm-skeleton" role="status" :aria-label="label">
    <i v-for="(w, i) in rowWidths" :key="i" :style="{ width: w }" aria-hidden="true" />
  </div>
</template>
