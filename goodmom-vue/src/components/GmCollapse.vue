<script setup lang="ts">
/**
 * GmCollapse —— 折叠面板（规范 11 · 11.2.6）
 *
 * 与 React 版同契约（动画驱动、aria、一屏 ≤3 全部内建）：
 * 1. 拦截 summary 点击驱动动画：展开 = 先 open 再 0fr→1fr；收起 = 先推 0fr
 *    等 **300ms** 再摘 open（原生 details 收起时内容立刻被隐藏，transition 播不出来）。
 * 2. 代理层 .gm-fold__body>div 不得带 padding（0fr 轨道含 padding 不可压缩）。
 * 3. summary 补 aria-expanded + aria-controls；键盘 Enter/Space 由原生 summary 承担。
 * 4. 同组展开超过 maxOpen（默认 3）自动收最早展开的（11 · 11.2.6 一屏 ≤3）。
 */
import { reactive, ref, useId } from "vue";

export interface GmFoldItem {
  key: string;
  title: unknown;
  content: unknown;
  /** 状态点五色（14 · 4.4.5）；缺省 neutral 灰点 */
  tone?: "neutral" | "positive" | "attention" | "risk" | "info";
}

const props = withDefaults(
  defineProps<{
    items: GmFoldItem[];
    /** 初始展开的 key 列表，默认 [] */
    defaultOpenKeys?: string[];
    /** 手风琴：同一时刻只展开一项，默认 false */
    accordion?: boolean;
    /** 同组同时展开上限（11 · 11.2.6 一屏 ≤3），默认 3 */
    maxOpen?: number;
  }>(),
  { defaultOpenKeys: () => [], accordion: false, maxOpen: 3 }
);

const DUR = 300; /* 07 M3：高度过渡 300ms（与 CSS grid-template-rows 300ms 同源） */

const openKeys = ref<string[]>([...props.defaultOpenKeys]);
const closing = reactive<Record<string, boolean>>({});
const baseId = useId();

const isOpen = (key: string) => openKeys.value.includes(key);

function toggle(item: GmFoldItem) {
  if (closing[item.key]) return;
  if (isOpen(item.key)) {
    closing[item.key] = true;
    window.setTimeout(() => {
      openKeys.value = openKeys.value.filter((k) => k !== item.key);
      delete closing[item.key];
    }, DUR);
  } else {
    let next = props.accordion ? [item.key] : [...openKeys.value, item.key];
    if (next.length > props.maxOpen) next = next.slice(next.length - props.maxOpen);
    openKeys.value = next;
  }
}
</script>

<template>
  <details
    v-for="(it, i) in items"
    :key="it.key"
    class="gm-fold"
    :class="{ 'is-closing': closing[it.key] }"
    :open="isOpen(it.key)"
    :data-tone="it.tone && it.tone !== 'neutral' ? it.tone : undefined"
  >
    <summary
      :id="`${baseId}-sum-${i}`"
      :aria-expanded="isOpen(it.key)"
      :aria-controls="`${baseId}-body-${i}`"
      @click.prevent="toggle(it)"
    >
      <span class="gm-fold__dot" aria-hidden="true" />
      {{ it.title }}
      <svg
        class="gm-fold__arr"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </summary>
    <div class="gm-fold__body" :id="`${baseId}-body-${i}`">
      <div>
        <div>{{ it.content }}</div>
      </div>
    </div>
  </details>
</template>
