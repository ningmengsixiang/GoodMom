<script setup lang="ts">
/**
 * GmImageViewer —— 全屏图片查看（规范 11.2.9）
 *
 * 与 React 版同契约（DOM / aria / 行为逐项对应）：
 * 1. open=false 或 images 为空时不渲染；role=dialog + aria-modal + aria-label「图片查看」。
 * 2. 打开时焦点进关闭钮、锁 body 滚动；关闭 / 卸载归还焦点并还原滚动。
 * 3. images 多于 1 张才渲染左右切换钮，到边界原生 disabled；←/→ 键盘等价；ESC 关闭。
 * 4. 切换派发 change(index)；index 受控变化时同步当前项。
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否打开（受控），默认 false */
    open?: boolean;
    /** 图片地址列表（必填） */
    images: string[];
    /** 初始 / 受控索引，默认 0 */
    index?: number;
  }>(),
  {
    open: false,
    index: 0,
  }
);

const emit = defineEmits(["change", "close"]);

const current = ref(props.index);
const closeRef = ref<HTMLButtonElement | null>(null);
let prevFocus: HTMLElement | null = null;
let bodyOverflow = "";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const focusClose = () => {
  nextTick(() => {
    if (closeRef.value) closeRef.value.focus();
  });
};

const restoreFocus = () => {
  if (prevFocus && prevFocus.isConnected) prevFocus.focus();
  prevFocus = null;
};

const go = (delta: number) => {
  if (props.images.length <= 1) return;
  const next = clamp(current.value + delta, 0, props.images.length - 1);
  if (next === current.value) return;
  current.value = next;
  emit("change", next);
};

const onClose = () => emit("close");

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
  } else if (e.key === "ArrowLeft") {
    go(-1);
  } else if (e.key === "ArrowRight") {
    go(1);
  }
};

/* 打开或外部 index / 图片数变化：同步当前项 */
watch(
  [() => props.open, () => props.index, () => props.images.length],
  () => {
    if (!props.open) return;
    current.value = clamp(props.index, 0, Math.max(0, props.images.length - 1));
  },
  { immediate: true }
);

/* 打开：焦点进关闭钮 + 锁滚动；关闭 / 卸载：焦点归还 + 还原滚动 */
watch(
  () => props.open,
  (open) => {
    if (open) {
      prevFocus = document.activeElement as HTMLElement | null;
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      focusClose();
    } else {
      document.body.style.overflow = bodyOverflow;
      restoreFocus();
    }
  }
);

onMounted(() => {
  if (props.open) {
    prevFocus = document.activeElement as HTMLElement | null;
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    focusClose();
  }
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  if (props.open) {
    document.body.style.overflow = bodyOverflow;
    restoreFocus();
  }
});
</script>

<template>
  <div
    v-if="open && images.length"
    class="gm-imgviewer"
    role="dialog"
    aria-modal="true"
    aria-label="图片查看"
  >
    <div class="gm-imgviewer__mask" aria-hidden="true" @click="onClose" />
    <img
      class="gm-imgviewer__img"
      :src="images[current]"
      :alt="`图片 ${current + 1}`"
    />
    <button
      ref="closeRef"
      type="button"
      class="gm-imgviewer__close"
      aria-label="关闭"
      @click="onClose"
    >
      ×
    </button>
    <template v-if="images.length > 1">
      <button
        type="button"
        class="gm-imgviewer__nav"
        aria-label="上一张"
        :disabled="current <= 0"
        @click="go(-1)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
      <button
        type="button"
        class="gm-imgviewer__nav"
        aria-label="下一张"
        :disabled="current >= images.length - 1"
        @click="go(1)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </template>
    <span class="gm-imgviewer__count">{{ current + 1 }} / {{ images.length }}</span>
  </div>
</template>
