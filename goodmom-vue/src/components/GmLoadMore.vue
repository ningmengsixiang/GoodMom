<script setup lang="ts">
/**
 * GmLoadMore —— 上拉加载更多（规范 10.4.1）
 *
 * 与 React 版同契约（状态机 / IntersectionObserver / 点击兜底逐项对应）：
 * 1. role=status + aria-live=polite：状态文案变化会被读屏播报。
 * 2. 进入视口且 status=idle 时派发一次 load；每次进入 idle 只派发一次，
 *    离开 idle 后重置；环境不支持 IO 时静默降级为纯点击。
 * 3. idle 文案本身是 button —— 点击 / 键盘回车是触底自动加载之外的无障碍等价路径。
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

type GmLoadMoreStatus = "idle" | "loading" | "done";

const props = withDefaults(
  defineProps<{
    /** 加载状态，默认 "idle" */
    status?: GmLoadMoreStatus;
    /** 加载中文案，默认「加载中…」 */
    loadingText?: string;
    /** 加载完文案，默认「没有更多了」 */
    doneText?: string;
    /** 待加载文案，默认空（为空时不渲染可点文本） */
    idleText?: string;
  }>(),
  {
    status: "idle",
    loadingText: "加载中…",
    doneText: "没有更多了",
    idleText: "",
  }
);

const emit = defineEmits(["load"]);

const rootRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let fired = false;

const label = computed(() => {
  if (props.status === "loading") return props.loadingText;
  if (props.status === "done") return props.doneText;
  return props.idleText;
});

const onLoad = () => emit("load");

const disconnect = () => {
  if (observer) observer.disconnect();
  observer = null;
};

const observe = () => {
  disconnect();
  if (props.status !== "idle") {
    fired = false;
    return;
  }
  const el = rootRef.value;
  if (!el || typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        emit("load");
      }
    });
  });
  observer.observe(el);
};

watch(
  () => props.status,
  () => {
    nextTick(observe);
  }
);

onMounted(observe);

onUnmounted(disconnect);
</script>

<template>
  <div ref="rootRef" class="gm-loadmore" role="status" aria-live="polite">
    <span v-if="status === 'loading'" class="gm-loadmore__spinner" aria-hidden="true" />
    <button
      v-if="status === 'idle' && idleText"
      type="button"
      class="gm-loadmore__text"
      @click="onLoad"
    >
      {{ label }}
    </button>
    <span v-else-if="label" class="gm-loadmore__text">{{ label }}</span>
  </div>
</template>
