<script setup lang="ts">
/**
 * GmCell —— 设置项 / 列表行（规范 11 · 11.2.4）
 *
 * 与 React 版同契约（有 href 走链接、否则按钮，三个渲染分支逐项对应）：
 * 1. href 非空 → <a>；禁用链接摘掉 href，改挂 role=link + aria-disabled + tabindex=-1。
 * 2. 无 href → <button type="button">，禁用走原生 disabled。
 * 3. danger / disabled 只挂状态类；行高、字号、:active 反馈、风险色全部由 CSS 承担。
 * 4. chevron 为纯装饰（aria-hidden + focusable=false），点击只发一次 click。
 */
const props = withDefaults(
  defineProps<{
    /** 主标题（必填） */
    title: string;
    /** 副标题，默认空 */
    desc?: string;
    /** 右侧值文案，默认空 */
    value?: string;
    /** 是否显示右箭头，默认 false */
    chevron?: boolean;
    /** 破坏性操作（风险色），默认 false */
    danger?: boolean;
    /** 禁用，默认 false */
    disabled?: boolean;
    /** 有值则渲染为链接，默认空（渲染按钮） */
    href?: string;
  }>(),
  {
    desc: "",
    value: "",
    chevron: false,
    danger: false,
    disabled: false,
    href: "",
  }
);

const emit = defineEmits(["click"]);

const onClick = () => emit("click");
</script>

<template>
  <!-- 链接态 · 禁用：无 href、无点击，role=link + aria-disabled + 不可 Tab -->
  <a
    v-if="href && disabled"
    class="gm-cell"
    :class="{ 'is-danger': danger, 'is-disabled': disabled }"
    role="link"
    aria-disabled="true"
    tabindex="-1"
  >
    <span class="gm-cell__main">
      <span class="gm-cell__title">{{ title }}</span>
      <span v-if="desc" class="gm-cell__desc">{{ desc }}</span>
    </span>
    <span v-if="value" class="gm-cell__value">{{ value }}</span>
    <svg
      v-if="chevron"
      class="gm-cell__chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  </a>

  <!-- 链接态 -->
  <a v-else-if="href" class="gm-cell" :class="{ 'is-danger': danger, 'is-disabled': disabled }" :href="href" @click="onClick">
    <span class="gm-cell__main">
      <span class="gm-cell__title">{{ title }}</span>
      <span v-if="desc" class="gm-cell__desc">{{ desc }}</span>
    </span>
    <span v-if="value" class="gm-cell__value">{{ value }}</span>
    <svg
      v-if="chevron"
      class="gm-cell__chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  </a>

  <!-- 按钮态 -->
  <button
    v-else
    type="button"
    class="gm-cell"
    :class="{ 'is-danger': danger, 'is-disabled': disabled }"
    :disabled="disabled"
    @click="onClick"
  >
    <span class="gm-cell__main">
      <span class="gm-cell__title">{{ title }}</span>
      <span v-if="desc" class="gm-cell__desc">{{ desc }}</span>
    </span>
    <span v-if="value" class="gm-cell__value">{{ value }}</span>
    <svg
      v-if="chevron"
      class="gm-cell__chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  </button>
</template>
