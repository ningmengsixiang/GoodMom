<script setup lang="ts">
/**
 * GmPullRefresh —— 下拉刷新容器（规范 10.4.1）
 *
 * 与 React 版同契约（指针事件 / 阻尼 / 阈值 / 回弹逐项对应）：
 * 1. 指针按下时仅当容器最近的可滚动祖先 scrollTop<=0（或页面在顶部）才开始跟踪。
 * 2. 下拉位移跟手：dy * 0.5，上限 96px；松手位移 ≥64px 派发一次 refresh。
 * 3. 触发后回弹到 0；refreshing=true 时指示器保持 56px 展示 spinner + refreshingText。
 * 4. 松手 / 取消监听挂在 window 上，指针移出容器再松开也能正确结束手势。
 * 5. 内容用默认插槽；圆角、过渡时长等视觉由 CSS 承担，组件不写样式。
 */
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 刷新中（受控），默认 false */
    refreshing?: boolean;
    /** 禁用下拉，默认 false */
    disabled?: boolean;
    /** 待刷新文案，默认「下拉刷新」 */
    text?: string;
    /** 刷新中文案，默认「刷新中…」 */
    refreshingText?: string;
  }>(),
  {
    refreshing: false,
    disabled: false,
    text: "下拉刷新",
    refreshingText: "刷新中…",
  }
);

const emit = defineEmits(["refresh"]);

/** 最大跟手位移 */
const PULL_MAX = 96;
/** 触发阈值 */
const PULL_THRESHOLD = 64;
/** 跟手阻尼 */
const PULL_RATE = 0.5;
/** 刷新中指示器保持高度 */
const HOLD_PULL = 56;

const rootRef = ref<HTMLElement | null>(null);
const offset = ref(0);
let start: { y: number; active: boolean } | null = null;

const updateOffset = (next: number) => {
  offset.value = next;
};

/** 受控刷新态：置 true 时指示器保持展开，置回 false 时回弹收起 */
watch(
  () => props.refreshing,
  (refreshing) => {
    updateOffset(refreshing ? HOLD_PULL : 0);
  },
  { immediate: true }
);

/** 从容器向上找最近的可滚动祖先；找不到则取页面滚动位置 */
const getScrollTop = (el: HTMLElement | null): number => {
  let node: HTMLElement | null = el ? el.parentElement : null;
  while (node) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY)) return node.scrollTop;
    node = node.parentElement;
  }
  return window.scrollY || document.documentElement.scrollTop || 0;
};

/** 松手 / 取消：window 级监听保证指针移出容器后也能结束手势 */
const finish = () => {
  if (!start || !start.active) return;
  start.active = false;
  if (offset.value >= PULL_THRESHOLD) emit("refresh");
  updateOffset(props.refreshing ? HOLD_PULL : 0);
};

const onPointerDown = (e: PointerEvent) => {
  if (props.disabled || props.refreshing) return;
  if (getScrollTop(rootRef.value) > 0) return;
  start = { y: e.clientY, active: true };
};

const onPointerMove = (e: PointerEvent) => {
  if (!start || !start.active) return;
  const dy = e.clientY - start.y;
  if (dy <= 0) {
    updateOffset(0);
    return;
  }
  updateOffset(Math.min(PULL_MAX, dy * PULL_RATE));
};

const indicatorStyle = computed(() => ({ height: `${offset.value}px` }));
const bodyStyle = computed(() => ({ transform: `translateY(${offset.value}px)` }));

onMounted(() => {
  window.addEventListener("pointerup", finish);
  window.addEventListener("pointercancel", finish);
});

onUnmounted(() => {
  window.removeEventListener("pointerup", finish);
  window.removeEventListener("pointercancel", finish);
});
</script>

<template>
  <div
    ref="rootRef"
    class="gm-pullrefresh"
    :class="{
      'is-disabled': disabled,
      'is-refreshing': refreshing,
      'is-pulling': offset > 0,
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
  >
    <div
      class="gm-pullrefresh__indicator"
      :style="indicatorStyle"
      role="status"
      :aria-live="refreshing ? 'polite' : 'off'"
    >
      <span class="gm-pullrefresh__spinner" aria-hidden="true" />
      <span class="gm-pullrefresh__text">{{ refreshing ? refreshingText : text }}</span>
    </div>
    <div class="gm-pullrefresh__body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>
