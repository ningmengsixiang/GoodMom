<script setup lang="ts" generic="T = unknown">
/**
 * GmResponsiveView —— 响应式适配容器（对应 10 · 10.11.1）
 *
 * 核心口径：按**容器宽度**（ResizeObserver）而非视口判断形态——同一页面里
 * 「主区表格 + 侧栏卡片」两个容器宽度不同，用视口断点必然有一个是错的。
 * 不支持 ResizeObserver 时回落 window.resize + innerWidth。
 *
 * SSR/首帧：先用 breakpoints.condensed 乐观值按 table 渲染，onMounted 后校正，避免闪错。
 * mode !== "auto" 时锁定形态且不做观测（截图/测试/强制形态场景）。
 *
 * 硬性约定：同一时刻**只渲染一个分支**，不做「CSS 双渲染后隐藏」——
 * 双渲染会让读屏读到重复内容、且移动端白白多渲染一份 DOM。
 * 页面持有的排序/筛选/分页状态留在页面层，切换形态**不得重置**。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import GmEmpty from "./GmEmpty.vue";
import GmSpin from "./GmSpin.vue";

export type GmResponsiveMode = "auto" | "table" | "condensed" | "card";
export type GmResolvedMode = "table" | "condensed" | "card";

const props = withDefaults(
  defineProps<{
    /** 数据源（为空且未传 empty 时渲染默认空态） */
    data: T[];
    /** 默认 auto：按容器宽度自动解析 */
    mode?: GmResponsiveMode;
    /** 阈值，默认 { condensed: 1024, card: 767 } */
    breakpoints?: { condensed: number; card: number };
    /** 加载中：显示 GmSpin */
    loading?: boolean;
    /** 形态变化回调（含首次解析结果） */
    onModeChange?: (mode: GmResolvedMode) => void;
  }>(),
  {
    mode: "auto",
    breakpoints: undefined,
    loading: false,
    onModeChange: undefined,
  }
);

const slots = defineSlots<{
  /** ≥ condensed 时渲染（通常为表格） */
  table?: (props: { rows: T[] }) => unknown;
  /** card < 宽度 < condensed 时渲染；未提供则回落 table */
  condensed?: (props: { rows: T[] }) => unknown;
  /** ≤ card 时渲染（通常为卡片列表） */
  card?: (props: { rows: T[] }) => unknown;
  /** 数据为空时渲染；不传则用默认 GmEmpty */
  empty?: (props: { rows: T[] }) => unknown;
}>();

const DEFAULT_BP = { condensed: 1024, card: 767 };

const bpCondensed = computed(() => props.breakpoints?.condensed ?? DEFAULT_BP.condensed);
const bpCard = computed(() => props.breakpoints?.card ?? DEFAULT_BP.card);

const rootRef = ref<HTMLDivElement | null>(null);
/** 首帧乐观值 = condensed，故宽 ≥ condensed → table（SSR 安全） */
const width = ref(bpCondensed.value);

let ro: ResizeObserver | null = null;
let rafId = 0;

/** 同步读取容器宽度（无 ResizeObserver 时回落视口宽） */
function readWidth() {
  if (typeof window === "undefined") return;
  const el = rootRef.value;
  if (typeof ResizeObserver === "undefined") {
    width.value = window.innerWidth;
    return;
  }
  if (el) width.value = el.getBoundingClientRect().width;
}

/** 直连 window.resize / 首帧测量 */
function measure() {
  readWidth();
}

/**
 * ResizeObserver 回调必须**延迟到下一帧**再读写布局。
 * 否则在回调里同步改样式 → 触发新一轮尺寸变化 → Chrome 抛
 * "ResizeObserver loop completed with undelivered notifications"（未捕获错误，污染控制台，
 * 也会让「无控制台错误」的冒烟断言失败）。延迟一帧即可打断这个循环，且不损失体验。
 */
function onResize() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    readWidth();
  });
}

onMounted(() => {
  if (props.mode !== "auto" || typeof window === "undefined") return;
  measure();
  if (typeof ResizeObserver === "undefined") {
    window.addEventListener("resize", measure);
    return;
  }
  ro = new ResizeObserver(onResize);
  if (rootRef.value) ro.observe(rootRef.value);
});

onBeforeUnmount(() => {
  if (ro) {
    ro.disconnect();
    ro = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (typeof window !== "undefined" && typeof ResizeObserver === "undefined") {
    window.removeEventListener("resize", measure);
  }
});

const resolved = computed<GmResolvedMode>(() => {
  if (props.mode !== "auto") return props.mode;
  if (width.value >= bpCondensed.value) return "table";
  if (width.value > bpCard.value) return "condensed";
  return "card";
});

let lastMode: GmResolvedMode | null = null;
watch(
  resolved,
  (m) => {
    if (lastMode === m) return;
    lastMode = m;
    props.onModeChange?.(m);
  },
  { immediate: true }
);

const rows = computed(() => props.data ?? []);

/** 单一分支：同一时刻只渲染一个（不做双渲染后隐藏） */
const activeBranch = computed<"loading" | "empty" | "card" | "condensed" | "table">(() => {
  if (props.loading) return "loading";
  if (rows.value.length === 0) return "empty";
  if (resolved.value === "card") return "card";
  if (resolved.value === "condensed") return slots.condensed ? "condensed" : "table";
  return "table";
});
</script>

<template>
  <div ref="rootRef" class="gm-rv" :class="`gm-rv--${resolved}`" :data-mode="resolved">
    <div v-if="activeBranch === 'loading'" class="gm-rv__loading"><GmSpin /></div>

    <div v-else-if="activeBranch === 'empty'" class="gm-rv__empty">
      <slot v-if="slots.empty" name="empty" :rows="rows" />
      <!-- 默认空态必须与 React 侧**同参**（React: `<GmEmpty title="暂无数据" />`）：
           多传一个 desc 会让两库同一份数据渲染出不同 DOM -->
      <GmEmpty v-else title="暂无数据" />
    </div>

    <slot v-else-if="activeBranch === 'card'" name="card" :rows="rows" />
    <slot v-else-if="activeBranch === 'condensed'" name="condensed" :rows="rows" />
    <slot v-else name="table" :rows="rows" />
  </div>
</template>
