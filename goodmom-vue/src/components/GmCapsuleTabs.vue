<script setup lang="ts">
/**
 * GmCapsuleTabs —— 胶囊标签页（规范 11.6.3）
 *
 * 与 React 版同契约（受控 value / tablist 语义 / 键盘切换）：
 * 1. 横滑容器 role=tablist，项 role=tab + aria-selected；激活项白玻璃胶囊 + 玫瑰描边（CSS）。
 * 2. ←/→ 循环移动焦点，Home / End 跳首尾，焦点落定后同步发 change。
 * 3. roving tabindex：选中项可 Tab；无选中时第一项兜底。
 */
import { computed } from "vue";

export interface GmCapsuleTabItem {
  key: string;
  label: string;
  badge?: string | number;
}

const props = withDefaults(
  defineProps<{
    /** 标签项（必填） */
    items: GmCapsuleTabItem[];
    /** 受控选中 key，默认空 */
    value?: string;
  }>(),
  {
    value: "",
  }
);

const emit = defineEmits(["change"]);

const hasActive = computed(() => props.items.some((it) => it.key === props.value));

const onSelect = (key: string) => emit("change", key);

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") {
    return;
  }
  const el = e.currentTarget as HTMLButtonElement | null;
  const tabs = Array.from(
    el?.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
  );
  if (tabs.length === 0) return;
  const idx = tabs.indexOf(el as HTMLButtonElement);
  const next =
    e.key === "ArrowLeft"
      ? (idx - 1 + tabs.length) % tabs.length
      : e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : e.key === "Home"
          ? 0
          : tabs.length - 1;
  e.preventDefault();
  const target = tabs[next];
  target.focus();
  const key = target.getAttribute("data-key");
  if (key !== null && key !== props.value) emit("change", key);
};
</script>

<template>
  <div class="gm-capsule-tabs" role="tablist" aria-label="标签页">
    <button
      v-for="(it, i) in items"
      :key="it.key"
      type="button"
      role="tab"
      class="gm-capsule-tabs__item"
      :class="{ 'is-active': value === it.key }"
      :aria-selected="value === it.key"
      :tabindex="value === it.key || (!hasActive && i === 0) ? 0 : -1"
      :data-key="it.key"
      @click="onSelect(it.key)"
      @keydown="onKeydown"
    >
      <span class="gm-capsule-tabs__label">{{ it.label }}</span>
      <span v-if="it.badge" class="gm-capsule-tabs__badge">{{ it.badge }}</span>
    </button>
  </div>
</template>
