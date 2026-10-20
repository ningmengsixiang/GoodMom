<script setup lang="ts">
/**
 * GmSearchBar —— 搜索栏（规范 11 · 11.2.1）
 *
 * 与 React 版同契约（受控 value / 三个事件逐项对应）：
 * 1. form role=search，提交（回车）发 search(value)；输入发 change(value)，清空发 change("")。
 * 2. 清空后焦点送回输入框；清空钮随 value 出现/消失，disabled 同步输入禁用态。
 * 3. 输入字号 16px 防 iOS 聚焦缩放、胶囊高 44、图标 22 均由 CSS 承担。
 */
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    /** 受控输入值，默认空 */
    value?: string;
    /** 占位文案，默认「搜索」 */
    placeholder?: string;
    /** 取消钮文案，默认「取消」 */
    cancelText?: string;
    /** 是否显示取消钮，默认 false */
    showCancel?: boolean;
    /** 禁用输入，默认 false */
    disabled?: boolean;
  }>(),
  {
    value: "",
    placeholder: "搜索",
    cancelText: "取消",
    showCancel: false,
    disabled: false,
  }
);

const emit = defineEmits(["change", "search", "cancel"]);

const inputRef = ref<HTMLInputElement | null>(null);

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) emit("change", target.value);
};

const onClear = () => {
  emit("change", "");
  if (inputRef.value) inputRef.value.focus();
};

const onSubmit = () => emit("search", props.value);

const onCancel = () => emit("cancel");
</script>

<template>
  <form class="gm-searchbar" role="search" @submit.prevent="onSubmit">
    <span class="gm-searchbar__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16.4 16.4 3.6 3.6" />
      </svg>
    </span>
    <input
      ref="inputRef"
      class="gm-searchbar__input"
      type="search"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="placeholder"
      @input="onInput"
    />
    <button
      v-if="value"
      type="button"
      class="gm-searchbar__clear"
      aria-label="清空"
      :disabled="disabled"
      @click="onClear"
    >
      ×
    </button>
    <button v-if="showCancel" type="button" class="gm-searchbar__cancel" @click="onCancel">
      {{ cancelText }}
    </button>
  </form>
</template>
