<script setup lang="ts">
/**
 * GmSticky —— 吸顶容器（规范 11.6.8）
 *
 * 与 React 版同契约（top / zIndex / stuck 事件逐项对应）：
 * 1. 内层是真正的 sticky 元素（CSS position:sticky + 内联 top），zIndex 挂在外层。
 * 2. 外层放一个 1px 哨兵（负 margin 抵消占位），IntersectionObserver 观察它：
 *    哨兵滚出视口上沿（boundingClientRect.top < top）即判定吸顶，挂 is-stuck。
 * 3. 吸顶状态变化才派发一次 stuck；环境无 IO 时静默降级（不挂状态、不发事件）。
 */
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 吸顶距离 px，默认 0 */
    top?: number;
    /** 层级，默认 10 */
    zIndex?: number;
  }>(),
  {
    top: 0,
    zIndex: 10,
  }
);

const emit = defineEmits(["stuck"]);

const sentinelRef = ref<HTMLElement | null>(null);
const stuck = ref(false);
let observer: IntersectionObserver | null = null;

const observe = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  const el = sentinelRef.value;
  if (!el || typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    const next = entry.boundingClientRect.top < props.top;
    if (next === stuck.value) return;
    stuck.value = next;
    emit("stuck", next);
  });
  observer.observe(el);
};

onMounted(observe);

watch(() => props.top, observe);

onUnmounted(() => {
  if (observer) observer.disconnect();
  observer = null;
});
</script>

<template>
  <div class="gm-sticky" :class="{ 'is-stuck': stuck }" :style="{ zIndex }">
    <div ref="sentinelRef" aria-hidden="true" :style="{ height: '1px', marginBottom: '-1px' }" />
    <div class="gm-sticky__inner" :style="{ top: `${top}px` }">
      <slot />
    </div>
  </div>
</template>
