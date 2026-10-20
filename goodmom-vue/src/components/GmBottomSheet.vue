<script setup lang="ts">
/**
 * GmBottomSheet —— 底部面板（规范 10.4.1 / 11.6.6）
 *
 * 与 React 版同契约（受控 open / 焦点 / ESC / 遮罩 / 滚动锁逐项对应）：
 * 1. open=false 时不渲染（v-if）；内容走默认插槽。
 * 2. 打开时记录触发点、锁 body 滚动、焦点移入面板；关闭（× / ESC / 点遮罩）或卸载时
 *    还原滚动并把焦点归还触发点。
 * 3. role=dialog + aria-modal + aria-label（无标题时兜底「面板」）；closable / maskClosable 可配。
 * 4. 圆角、max-height、遮罩模糊、上滑动效由 CSS 承担，组件不写样式。
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否打开（受控），默认 false */
    open?: boolean;
    /** 标题，默认空 */
    title?: string;
    /** 是否显示右上角关闭钮，默认 true */
    closable?: boolean;
    /** 点击遮罩关闭，默认 true */
    maskClosable?: boolean;
  }>(),
  {
    open: false,
    title: "",
    closable: true,
    maskClosable: true,
  }
);

const emit = defineEmits(["close"]);

defineSlots<{
  /** 面板内容 */
  default?: () => unknown;
}>();

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

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
  }
};

const onMask = () => {
  if (props.maskClosable) emit("close");
};

const onClose = () => emit("close");

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
  <div v-if="open" class="gm-sheet">
    <div class="gm-sheet__mask" aria-hidden="true" @click="onMask" />
    <section
      ref="panelRef"
      class="gm-sheet__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="title || '面板'"
    >
      <header class="gm-sheet__head">
        <h2 class="gm-sheet__title">{{ title }}</h2>
        <button
          v-if="closable"
          type="button"
          class="gm-sheet__close"
          aria-label="关闭"
          @click="onClose"
        >
          ×
        </button>
      </header>
      <div class="gm-sheet__body"><slot /></div>
    </section>
  </div>
</template>
