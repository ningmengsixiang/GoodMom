<script setup lang="ts">
/**
 * GmTabBar —— 底部导航栏（规范 10.3.2）
 *
 * 与 React 版同契约（受控选中 / role 语义 / 键盘切换逐项对应）：
 * 1. nav 为 tablist；每项 button role=tab + aria-selected，roving tabindex（选中项可 Tab，
 *    无选中时第一项兜底）。
 * 2. ←/→ 循环移动焦点，Home / End 跳首尾，焦点落定后同步发 change。
 * 3. safeArea 默认 true → 根加 is-safe 状态类（由 CSS 用 env() 补安全区）。
 */
import { computed } from "vue";

export interface GmTabBarItem {
  key: string;
  label: string;
  badge?: string | number;
}

const props = withDefaults(
  defineProps<{
    /** 导航项，3–5 项（必填） */
    items: GmTabBarItem[];
    /** 受控选中 key，默认空 */
    value?: string;
    /** 底部安全区，默认 true */
    safeArea?: boolean;
  }>(),
  {
    value: "",
    safeArea: true,
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
  <nav class="gm-tabbar" :class="{ 'is-safe': safeArea }" role="tablist" aria-label="底部导航">
    <button
      v-for="(it, i) in items"
      :key="it.key"
      type="button"
      role="tab"
      class="gm-tabbar__item"
      :class="{ 'is-active': value === it.key }"
      :aria-selected="value === it.key"
      :tabindex="value === it.key || (!hasActive && i === 0) ? 0 : -1"
      :data-key="it.key"
      @click="onSelect(it.key)"
      @keydown="onKeydown"
    >
      <span class="gm-tabbar__label">{{ it.label }}</span>
      <span v-if="it.badge" class="gm-tabbar__badge">{{ it.badge }}</span>
    </button>
  </nav>
</template>
