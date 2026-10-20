<script setup lang="ts">
/**
 * GmNavBar —— 顶部导航栏（规范 10.3.1）
 *
 * 与 React 版同契约（DOM / aria 逐项对应）：受控标题 / 可选返回钮 / 滚动与吸顶状态类。
 * 1. 返回钮 44×44 圆形热区 + aria-label（文案取 backLabel），点击只发 back。
 * 2. 标题 18px/600 单行省略由 CSS 承担；本组件只输出语义结构。
 * 3. scrolled 由页面在滚动 120px 后置 true；sticky 默认 true 走 position:sticky。
 */
const props = withDefaults(
  defineProps<{
    /** 标题，默认空 */
    title?: string;
    /** 是否显示返回钮，默认 false */
    back?: boolean;
    /** 返回钮无障碍文案，默认「返回」 */
    backLabel?: string;
    /** 页面已滚动（由调用方控制），默认 false */
    scrolled?: boolean;
    /** 是否吸顶，默认 true */
    sticky?: boolean;
  }>(),
  {
    title: "",
    back: false,
    backLabel: "返回",
    scrolled: false,
    sticky: true,
  }
);

const emit = defineEmits(["back"]);

const onBack = () => emit("back");
</script>

<template>
  <header class="gm-navbar" :class="{ 'is-scrolled': scrolled, 'is-sticky': sticky }">
    <button
      v-if="back"
      type="button"
      class="gm-navbar__back"
      :aria-label="backLabel"
      @click="onBack"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
    <h1 class="gm-navbar__title">{{ title }}</h1>
  </header>
</template>
