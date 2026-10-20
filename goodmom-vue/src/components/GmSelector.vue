<script setup lang="ts">
/**
 * GmSelector —— 选择卡（规范 11.6.4）
 *
 * 与 React 版同契约（单选 / 多选 / 禁用 / 语义逐项对应）：
 * 1. 单选：容器 role=radiogroup，每项 role=radio + aria-checked；多选：group + checkbox。
 * 2. 项是真 button：键盘 Tab + Enter/Space 可操作；disabled 走原生 disabled。
 * 3. 单选 value 取数组首项；多选 toggle 增删；变更派发完整数组。
 * 4. 勾徽是装饰性 SVG（aria-hidden），只在选中项渲染。
 */
export interface GmSelectorItem {
  key: string;
  label: string;
  desc?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** 选项（必填） */
    items: GmSelectorItem[];
    /** 已选 key 数组（单选取首项），默认空数组 */
    value?: string[];
    /** 多选，默认 false */
    multiple?: boolean;
  }>(),
  {
    value: () => [],
    multiple: false,
  }
);

const emit = defineEmits(["change"]);

const isSelected = (key: string) => {
  if (props.multiple) return props.value.includes(key);
  const singleKey = props.value.length > 0 ? props.value[0] : "";
  return singleKey === key;
};

const handleSelect = (item: GmSelectorItem) => {
  if (item.disabled) return;
  if (props.multiple) {
    const next = props.value.includes(item.key)
      ? props.value.filter((key) => key !== item.key)
      : props.value.concat(item.key);
    emit("change", next);
  } else {
    emit("change", [item.key]);
  }
};
</script>

<template>
  <div
    class="gm-selector"
    :class="{ 'is-multiple': multiple }"
    :role="multiple ? 'group' : 'radiogroup'"
    aria-label="选择器"
  >
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="gm-selector__item"
      :class="{ 'is-active': isSelected(it.key), 'is-disabled': it.disabled }"
      :role="multiple ? 'checkbox' : 'radio'"
      :aria-checked="isSelected(it.key)"
      :disabled="it.disabled"
      @click="handleSelect(it)"
    >
      <span class="gm-selector__label">{{ it.label }}</span>
      <span v-if="it.desc" class="gm-selector__desc">{{ it.desc }}</span>
      <span v-if="isSelected(it.key)" class="gm-selector__check" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          focusable="false"
        >
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
    </button>
  </div>
</template>
