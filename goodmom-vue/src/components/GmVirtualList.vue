<script setup lang="ts" generic="T = unknown">
/**
 * GmVirtualList —— 虚拟长列表（对应 10 · 10.11.2）
 *
 * 固定行高窗口计算：只渲染窗口内 + overscan 项；inner 撑满总高并用 translateY 偏移。
 * 适用上限：**固定行高**列表（>500 行才值得上虚拟滚动；<200 行直接 v-for，见 skill R7）。
 * 动态行高（图片撑开、异步测量）不支持——请改用分页或定高卡片。
 *
 * 无障碍与键盘：viewport role="list" + aria-label + tabIndex=0；
 * 每项 role="listitem" + aria-posinset / aria-setsize（读屏才能说出「第 12 项，共 3000 项」）；
 * PageDown/PageUp 翻一屏、Home/End 到首尾、↑/↓ 逐行。
 *
 * 触底：onEndReached 只在**跨过**阈值时触发一次（内部 ref 记录），回滚后再到底可再触发，
 * 避免滚动过程中重复请求同一页（列表重复数据的经典成因）。
 */
import { computed, onMounted, ref, watch } from "vue";

export interface GmVirtualListProps<T> {
  items: T[];
  /** 固定行高 px（不支持动态高） */
  itemHeight: number;
  /** 视口高 px */
  height: number;
  /** 上下额外渲染项数，默认 4 */
  overscan?: number;
  /** 距底 endThreshold 项时触发一次 */
  onEndReached?: () => void;
  /** 默认 4 */
  endThreshold?: number;
  /** 默认「长列表」 */
  ariaLabel?: string;
  /** 行 key 生成器（与 React 版同名 prop）。不传则用下标 —— 排序/筛选后会复用错行 */
  itemKey?: (item: T, index: number) => string | number;
}

const props = withDefaults(defineProps<GmVirtualListProps<T>>(), {
  overscan: 4,
  onEndReached: undefined,
  endThreshold: 4,
  ariaLabel: "长列表",
  itemKey: undefined,
});

const slots = defineSlots<{
  /** 单行内容：{ item, index } */
  default?: (props: { item: T; index: number }) => unknown;
  /** 可选吸顶内容 */
  sticky?: () => unknown;
}>();

const scrollTop = ref(0);
const viewportRef = ref<HTMLDivElement | null>(null);
/** 触底闸门：true 表示本段已触发过，回滚后复位 */
const endFired = ref(false);

const total = computed(() => props.items?.length ?? 0);
const totalHeight = computed(() => total.value * props.itemHeight);
const maxScroll = computed(() => Math.max(0, totalHeight.value - props.height));

const start = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan));
const windowCount = computed(() => Math.ceil(props.height / props.itemHeight) + props.overscan * 2);
const end = computed(() => Math.min(total.value, start.value + windowCount.value));
const visible = computed(() => props.items.slice(start.value, end.value));

function syncEndReached(st: number) {
  if (!props.onEndReached) return;
  const remaining = total.value - Math.ceil((st + props.height) / props.itemHeight);
  if (remaining <= props.endThreshold) {
    if (!endFired.value) {
      endFired.value = true;
      props.onEndReached();
    }
  } else {
    endFired.value = false;
  }
}

function onScroll(e: Event) {
  const el = e.currentTarget as HTMLDivElement;
  scrollTop.value = el.scrollTop;
  syncEndReached(el.scrollTop);
}

/* 行数/视口高/阈值变化时重算一次触底态（如筛选后列表变短，应立即判定已到底） */
watch(
  () => [total.value, props.height, props.endThreshold] as const,
  () => {
    const el = viewportRef.value;
    if (el) syncEndReached(el.scrollTop);
  }
);
onMounted(() => {
  const el = viewportRef.value;
  if (el) syncEndReached(el.scrollTop);
});

function onKeydown(e: KeyboardEvent) {
  const el = viewportRef.value;
  if (!el) return;
  const page = props.height * 0.9;
  let next = -1;
  if (e.key === "PageDown") next = el.scrollTop + page;
  else if (e.key === "PageUp") next = el.scrollTop - page;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = totalHeight.value;
  else if (e.key === "ArrowDown") next = el.scrollTop + props.itemHeight;
  else if (e.key === "ArrowUp") next = el.scrollTop - props.itemHeight;
  else return;

  e.preventDefault();
  const clamped = Math.max(0, Math.min(next, maxScroll.value));
  el.scrollTop = clamped;
  scrollTop.value = clamped;
  syncEndReached(clamped);
}

defineExpose({
  /** 滚到指定下标（定位到某条客户/记录用） */
  scrollToIndex(index: number) {
    const el = viewportRef.value;
    if (!el) return;
    const target = Math.max(0, Math.min(index * props.itemHeight, maxScroll.value));
    el.scrollTop = target;
    scrollTop.value = target;
  },
});
</script>

<template>
  <div class="gm-vlist">
    <div v-if="slots.sticky" class="gm-vlist__sticky"><slot name="sticky" /></div>
    <div
      ref="viewportRef"
      class="gm-vlist__viewport"
      role="list"
      :aria-label="ariaLabel"
      :tabindex="0"
      :style="{ height: height + 'px' }"
      @scroll="onScroll"
      @keydown="onKeydown"
    >
      <div class="gm-vlist__inner" :style="{ height: totalHeight + 'px', transform: `translateY(${start * itemHeight}px)` }">
        <div
          v-for="(item, i) in visible"
          :key="itemKey ? itemKey(item, start + i) : start + i"
          class="gm-vlist__item"
          role="listitem"
          :aria-posinset="start + i + 1"
          :aria-setsize="total"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="start + i" />
        </div>
      </div>
    </div>
  </div>
</template>
