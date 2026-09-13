<script setup lang="ts">
/**
 * GmTag —— 状态/分类标签（对应 03 · 3.6 / 15.5 / 14 · 4.4.5）
 *
 * 三种取色方式，优先级：color（显式 hex） > five（孕产妇五色） > semantic（六语义） > neutral
 * 双通道：色点 + 文字 + 淡底，满足 WCAG 1.4.1「不得仅用颜色传达信息」。
 *
 * ⚠️ 红线 R3：页面**禁止**传自定义语义色 hex 来表达业务状态；状态文案请交给
 * `<GmStatusTag>`（自动查 15 章词库），本组件的 color 仅用于「非状态类」分类着色。
 */
import { computed } from "vue";
import { FIVE_COLOR, FIVE_VAR, SEMANTIC_VAR, semTintFill, semTintBorder, type GmFive, type GmSemantic } from "../tokens/status";
import { cx } from "../utils";

const props = withDefaults(
  defineProps<{
    /** 六语义之一 */
    semantic?: GmSemantic;
    /** 孕产妇五色之一（与 semantic 二选一） */
    five?: GmFive;
    /** 显式覆盖色（非状态类分类用） */
    color?: string;
    /** 是否显示前置色点，默认 true */
    dot?: boolean;
    /** 尺寸，默认 small */
    size?: "small" | "default";
  }>(),
  { semantic: undefined, five: undefined, color: undefined, dot: true, size: "small" }
);

/**
 * 主色表达式。P1-2：优先 **CSS 变量**（`--lg-sem-*` / `--mmh-m5-*`），
 * 这样暗色档与业务侧覆盖都会生效；静态 hex 只作为变量缺失时的兜底。
 */
const resolved = computed(
  () =>
    props.color ||
    (props.five
      ? `var(${FIVE_VAR[props.five]},${FIVE_COLOR[props.five]})`
      : `var(${SEMANTIC_VAR[props.semantic ?? "neutral"]})`)
);

const style = computed(() => ({
  color: resolved.value,
  background: semTintFill(resolved.value),
  borderColor: semTintBorder(resolved.value),
}));
</script>

<template>
  <span :class="cx('gm-tag', size === 'default' && 'lg')" :style="style">
    <i v-if="dot" :style="{ background: resolved }" aria-hidden="true" />
    <slot />
  </span>
</template>
