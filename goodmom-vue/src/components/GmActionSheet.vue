<script setup lang="ts">
/**
 * GmActionSheet —— 操作面板（规范 10.4.1）
 *
 * 与 React 版同契约（受控 open / 选项列表 / 取消行逐项对应）：
 * 1. open=false 时不渲染（v-if）；选项点击发 select(key)，取消 / ESC / 遮罩发 close。
 *    选择项只派发 select，是否关闭由调用方决定。
 * 2. role=dialog + aria-modal + aria-label（无标题时兜底「操作」）；打开时锁 body 滚动、
 *    焦点移入面板，关闭 / 卸载时还原滚动并把焦点归还触发点。
 * 3. danger / disabled 为状态类与原生 disabled；行高、破坏色、上滑动效由 CSS 承担。
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export interface GmActionSheetItem {
  key: string;
  label: string;
  /** 破坏性操作（风险色），默认 false */
  danger?: boolean;
  /** 禁用，默认 false */
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** 是否打开（受控），默认 false */
    open?: boolean;
    /** 标题，默认空 */
    title?: string;
    /** 操作项（必填） */
    items: GmActionSheetItem[];
    /** 取消行文案，默认「取消」 */
    cancelText?: string;
    /** 点击遮罩关闭，默认 true */
    maskClosable?: boolean;
  }>(),
  {
    open: false,
    title: "",
    cancelText: "取消",
    maskClosable: true,
  }
);

const emit = defineEmits(["select", "close"]);

const panelRef = ref<HTMLElement | null>(null);
let prevFocus: HTMLElement | null = null;
let bodyOverflow = "";

const focusPanel = () => {
  nextTick(() => {
    if (panelRef.value) panelRef.value.focus();
  });
};

const restoreFocus = () => {
  if (prevFocus && prevFocus.isConnected) prevFocus.focus();
  prevFocus = null;
};

const lockScroll = () => {
  bodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
};

const unlockScroll = () => {
  document.body.style.overflow = bodyOverflow;
};

const onSelect = (key: string) => emit("select", key);

const onClose = () => emit("close");

const onMask = () => {
  if (props.maskClosable) emit("close");
};

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
  }
};

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
</script>

<template>
  <div v-if="open" class="gm-actionsheet">
    <div class="gm-actionsheet__mask" aria-hidden="true" @click="onMask" />
    <div
      ref="panelRef"
      class="gm-actionsheet__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="title || '操作'"
    >
      <p v-if="title" class="gm-actionsheet__title">{{ title }}</p>
      <div class="gm-actionsheet__list">
        <button
          v-for="it in items"
          :key="it.key"
          type="button"
          class="gm-actionsheet__item"
          :class="{ 'is-danger': it.danger }"
          :disabled="it.disabled"
          @click="onSelect(it.key)"
        >
          {{ it.label }}
        </button>
      </div>
      <button type="button" class="gm-actionsheet__cancel" @click="onClose">
        {{ cancelText }}
      </button>
    </div>
  </div>
</template>
