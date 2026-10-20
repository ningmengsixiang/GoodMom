<script setup lang="ts">
/**
 * GmBirthPrep —— 分娩准备 / 产后待处理清单（规范 00 #88）
 *
 * 与 React 版同契约（原生 checkbox 语义 / done 状态 / toggle）：
 * 1. 原生 <input type="checkbox"> + label 包裹：天然支持键盘 Space、读屏 checked 状态、
 *    点击整行切换，不需要伪造 aria-checked。
 * 2. done 行挂 is-done 状态类与 data-done，note 作为次要说明；≤3 行不折叠。
 * 3. 切换派发 toggle(key, next)，是否受控由父级决定。
 */
export interface GmBirthPrepItem {
  key: string;
  label: string;
  done?: boolean;
  note?: string;
}

const props = defineProps<{
  /** 准备事项（必填） */
  items: GmBirthPrepItem[];
}>();

const emit = defineEmits(["toggle"]);

const onToggle = (item: GmBirthPrepItem, e: Event) => {
  const target = e.target as HTMLInputElement | null;
  emit("toggle", item.key, target ? target.checked : !item.done);
};
</script>

<template>
  <div class="gm-birthprep">
    <label
      v-for="item in items"
      :key="item.key"
      class="gm-birthprep__item"
      :class="{ 'is-done': item.done }"
      :data-done="item.done ? 'true' : undefined"
    >
      <input
        type="checkbox"
        class="gm-birthprep__check"
        :checked="!!item.done"
        @change="onToggle(item, $event)"
      />
      <span class="gm-birthprep__label">{{ item.label }}</span>
      <span v-if="item.note" class="gm-birthprep__note">{{ item.note }}</span>
    </label>
  </div>
</template>
