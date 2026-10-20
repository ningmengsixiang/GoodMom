<script setup lang="ts">
/**
 * GmSwipeAction —— 列表行左滑操作（规范 11.2.5）
 *
 * 与 React 版同契约（指针手势 / 方向判定 / 贴靠 / 外部收起逐项对应）：
 * 1. 方向判定：位移 >8px 且横向大于纵向才进入拖拽，否则放弃（纵向滚动交给页面）。
 * 2. 拖拽跟手，位移夹在 [-操作区宽, 0]；松手超过一半贴靠展开，否则回弹收起。
 * 3. 最多渲染前 3 个操作项；点操作项先收起再派发 action。
 * 4. 展开时点行内空白收起（不触发内容点击）；点组件外 / ESC 同样收起。
 * 5. 收起态操作钮 tabindex=-1 + aria-hidden，不进入 Tab 序列；展开后才可键盘操作。
 */
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

export interface GmSwipeActionItem {
  key: string;
  label: string;
  /** 破坏性操作，默认 false */
  danger?: boolean;
}

const props = defineProps<{
  /** 操作项（必填，最多渲染前 3 个） */
  actions: GmSwipeActionItem[];
}>();

const emit = defineEmits(["action"]);

/** 方向判定阈值 */
const SWIPE_AXIS = 8;

const visibleActions = computed(() => props.actions.slice(0, 3));

const rootRef = ref<HTMLElement | null>(null);
const actionsRef = ref<HTMLElement | null>(null);
const open = ref(false);
const dragX = ref<number | null>(null);
const actionsWidth = ref(0);

let width = 0;
let start: { x: number; y: number; open: boolean } | null = null;
let axis: "" | "x" | "y" = "";
let moved = false;
let ro: ResizeObserver | null = null;

const measureActions = () => {
  const el = actionsRef.value;
  if (!el) return;
  width = el.offsetWidth;
  actionsWidth.value = el.offsetWidth;
};

/** 操作区实际宽度（由 CSS 决定 64+），用于夹取拖拽位移与贴靠判定 */
onMounted(() => {
  measureActions();
  if (typeof ResizeObserver === "undefined" || !actionsRef.value) return;
  ro = new ResizeObserver(measureActions);
  ro.observe(actionsRef.value);
});

onUnmounted(() => {
  if (ro) ro.disconnect();
  ro = null;
  document.removeEventListener("pointerdown", onDocDown);
  document.removeEventListener("keydown", onKey);
});

watch(() => visibleActions.value.length, measureActions);

const onDocDown = (e: PointerEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false;
};

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") open.value = false;
};

/* 展开时点组件外部 / ESC 收起 */
watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("pointerdown", onDocDown);
    document.addEventListener("keydown", onKey);
  } else {
    document.removeEventListener("pointerdown", onDocDown);
    document.removeEventListener("keydown", onKey);
  }
});

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  start = { x: e.clientX, y: e.clientY, open: open.value };
  axis = "";
  moved = false;
};

const onPointerMove = (e: PointerEvent) => {
  if (!start) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  if (axis === "") {
    if (Math.abs(dx) > SWIPE_AXIS && Math.abs(dx) > Math.abs(dy)) {
      axis = "x";
    } else if (Math.abs(dy) > SWIPE_AXIS) {
      axis = "y";
    }
  }
  if (axis !== "x") return;
  moved = true;
  const base = start.open ? -width : 0;
  const raw = base + dx;
  dragX.value = Math.max(-width, Math.min(0, raw));
};

const finishDrag = () => {
  if (!start) return;
  if (axis === "x") {
    const base = start.open ? -width : 0;
    const finalX = dragX.value === null ? base : dragX.value;
    open.value = finalX <= -width / 2;
  }
  start = null;
  axis = "";
  dragX.value = null;
};

const onBodyClickCapture = (e: MouseEvent) => {
  if (moved) {
    /* 刚结束拖拽的那次 click 是手势尾巴，拦掉以免误触内容 */
    e.preventDefault();
    e.stopPropagation();
    moved = false;
    return;
  }
  if (open.value) {
    e.preventDefault();
    e.stopPropagation();
    open.value = false;
  }
};

const onAction = (key: string) => {
  open.value = false;
  emit("action", key);
};

const translate = computed(() =>
  dragX.value === null ? (open.value ? -actionsWidth.value : 0) : dragX.value
);

const bodyStyle = computed(() => ({ transform: `translateX(${translate.value}px)` }));
</script>

<template>
  <div ref="rootRef" class="gm-swipe">
    <div
      class="gm-swipe__body"
      :style="bodyStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="finishDrag"
      @pointercancel="finishDrag"
      @click.capture="onBodyClickCapture"
    >
      <slot />
    </div>
    <div ref="actionsRef" class="gm-swipe__actions" :aria-hidden="!open">
      <button
        v-for="it in visibleActions"
        :key="it.key"
        type="button"
        class="gm-swipe__action"
        :class="{ 'is-danger': it.danger }"
        :tabindex="open ? 0 : -1"
        @click="onAction(it.key)"
      >
        {{ it.label }}
      </button>
    </div>
  </div>
</template>
