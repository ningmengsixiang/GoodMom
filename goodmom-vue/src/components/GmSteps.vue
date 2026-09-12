<script setup lang="ts">
/**
 * GmSteps —— 步骤条（自包含实现，对应 08 · 8.2.2）
 *
 * 状态：wait 待办 / process 进行中（呼吸动画）/ finish 已完成（勾）/ error 异常（!）
 * 默认按 current 推导：i < current → finish，i === current → process，其余 wait；
 * items[i].status 显式指定时覆盖推导。
 * 无障碍：容器 <ol> 语义 + 每步 aria-current="step"（读屏可定位当前步骤）；
 * 连接线为纯装饰 ::before，不参与语义。
 * 移动端（≤767px）自动纵向排布，连接线转竖线（10 · 10.4）。
 */
import { computed } from "vue";

type GmStepStatus = "wait" | "process" | "finish" | "error";

/** 步骤项（导出给消费方做数据建模） */
export interface GmStepItem {
  /** 步骤标题（必填） */
  title: string;
  /** 补充说明 */
  description?: string;
  /** 显式状态；不传则由 current 推导 */
  status?: GmStepStatus;
}

const props = withDefaults(
  defineProps<{
    items: GmStepItem[];
    /** 当前进行到第几步（0 起），默认 0 */
    current?: number;
    size?: "default" | "small";
  }>(),
  { current: 0, size: "default" }
);

const steps = computed(() =>
  (props.items ?? []).map((it, i) => {
    const status: GmStepStatus =
      it.status ?? (i < props.current ? "finish" : i === props.current ? "process" : "wait");
    return { ...it, status, index: i };
  })
);
</script>

<template>
  <ol class="gm-steps" :class="size === 'small' && 'sm'">
    <li v-for="s in steps" :key="s.index" class="gm-step" :class="s.status" :aria-current="s.status === 'process' ? 'step' : undefined">
      <span class="gs-dot" aria-hidden="true">
        <svg v-if="s.status === 'finish'" viewBox="0 0 24 24"><path d="M5 13l5 5L20 7" /></svg>
        <template v-else-if="s.status === 'error'">!</template>
        <template v-else>{{ s.index + 1 }}</template>
      </span>
      <div class="gs-main">
        <b>{{ s.title }}</b>
        <span v-if="s.description">{{ s.description }}</span>
      </div>
    </li>
  </ol>
</template>

<style scoped>
/* 语义 ol 去默认样式，视觉完全由 components.css 的 .gm-steps 提供 */
.gm-steps {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
