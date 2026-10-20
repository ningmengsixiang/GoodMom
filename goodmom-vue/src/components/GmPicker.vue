<script setup lang="ts">
/**
 * GmPicker —— 底部选择器（规范 10.6.3）
 *
 * 与 React 版同契约（受控 open / value / columns + 两个事件逐项对应）：
 * 1. 每列 scroll-snap（项高 44）；打开时滚到 value 对应项，无值 / 值不在列里选第一项。
 * 2. 滚动结束按 scrollTop / 44 取整更新选中项；点某一项则选中并滚到位。
 * 3. 确定派发 confirm(selected) 并 close；取消 / 遮罩 / ESC 只派发 close。
 * 4. 焦点入面板、关闭归还触发点；打开期间锁 body 滚动。
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否打开，默认 false */
    open?: boolean;
    /** 标题，默认空 */
    title?: string;
    /** 列数据（必填） */
    columns: string[][];
    /** 已选值（每列一项），默认空数组 */
    value?: string[];
  }>(),
  {
    open: false,
    title: "",
    value: () => [],
  }
);

const emit = defineEmits(["confirm", "close"]);

/** 项高，与 CSS 同源 */
const PICKER_ITEM_H = 44;

const panelRef = ref<HTMLElement | null>(null);
const columnRefs = ref<HTMLElement[]>([]);
const selected = ref<string[]>([]);
let prevFocus: HTMLElement | null = null;
let bodyOverflow = "";

const setColumnRef = (el: unknown, i: number) => {
  if (el instanceof HTMLElement) columnRefs.value[i] = el;
};

const lockScroll = () => {
  bodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
};

const unlockScroll = () => {
  document.body.style.overflow = bodyOverflow;
};

const focusPanel = () => {
  nextTick(() => {
    if (panelRef.value) panelRef.value.focus();
  });
};

const restoreFocus = () => {
  if (prevFocus && prevFocus.isConnected) prevFocus.focus();
  prevFocus = null;
};

/* 打开：焦点入面板 + 锁滚动；关闭 / 卸载：焦点归还 + 还原滚动 */
watch(
  () => props.open,
  (open) => {
    if (open) {
      prevFocus = document.activeElement as HTMLElement | null;
      lockScroll();
      focusPanel();
    } else {
      unlockScroll();
      restoreFocus();
    }
  }
);

onMounted(() => {
  if (props.open) {
    prevFocus = document.activeElement as HTMLElement | null;
    lockScroll();
    focusPanel();
  }
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  if (props.open) {
    unlockScroll();
    restoreFocus();
  }
});

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
  }
};

/* 打开 / 列变化：按 value 初始化选中项，并把每列滚到位 */
const resetSelected = () => {
  if (!props.open) return;
  const next = props.columns.map((col, i) => {
    const wanted = props.value[i];
    return wanted !== undefined && col.indexOf(wanted) >= 0 ? wanted : (col[0] ?? "");
  });
  selected.value = next;
  nextTick(() => {
    next.forEach((v, i) => {
      const el = columnRefs.value[i];
      const col = props.columns[i] ?? [];
      const idx = col.indexOf(v);
      if (el && idx >= 0) el.scrollTop = idx * PICKER_ITEM_H;
    });
  });
};

watch([() => props.open, () => props.columns, () => props.value], resetSelected, { immediate: true });

const onScroll = (colIndex: number, e: Event) => {
  const col = props.columns[colIndex] ?? [];
  if (col.length === 0) return;
  const el = e.currentTarget as HTMLElement | null;
  if (!el) return;
  const idx = Math.min(col.length - 1, Math.max(0, Math.round(el.scrollTop / PICKER_ITEM_H)));
  const next = col[idx];
  if (selected.value[colIndex] === next) return;
  selected.value[colIndex] = next;
};

const selectItem = (colIndex: number, item: string) => {
  selected.value[colIndex] = item;
  const el = columnRefs.value[colIndex];
  const idx = (props.columns[colIndex] ?? []).indexOf(item);
  if (el && idx >= 0) el.scrollTop = idx * PICKER_ITEM_H;
};

const onConfirm = () => {
  const value = selected.value.slice();
  emit("confirm", value);
  emit("close");
};

const onClose = () => emit("close");
</script>

<template>
  <div v-if="open" class="gm-picker">
    <div class="gm-picker__mask" aria-hidden="true" @click="onClose" />
    <div
      ref="panelRef"
      class="gm-picker__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="title || '选择器'"
    >
      <div class="gm-picker__head">
        <button type="button" class="gm-picker__cancel" @click="onClose">取消</button>
        <h2 class="gm-picker__title">{{ title }}</h2>
        <button type="button" class="gm-picker__confirm" @click="onConfirm">确定</button>
      </div>
      <div class="gm-picker__body">
        <div
          v-for="(col, colIndex) in columns"
          :key="colIndex"
          :ref="(el) => setColumnRef(el, colIndex)"
          class="gm-picker__column"
          role="group"
          :aria-label="`第 ${colIndex + 1} 列`"
          @scroll="onScroll(colIndex, $event)"
        >
          <button
            v-for="item in col"
            :key="item"
            type="button"
            class="gm-picker__item"
            :class="{ 'is-active': selected[colIndex] === item }"
            :aria-pressed="selected[colIndex] === item"
            @click="selectItem(colIndex, item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
