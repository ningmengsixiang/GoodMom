<script setup lang="ts">
/**
 * GmProgress —— 进度条（自包含实现，对应 08 · 8.2.5）
 *
 * 类型：line 线性（默认）/ circle 环形
 * 色调：默认品牌粉渐变；positive 薄荷（达标/正向）；danger 珊瑚（超限/风险）
 *
 * 无障碍（关键）：外层 role="progressbar" + aria-valuenow/min/max + aria-valuetext。
 * 纯视觉进度条读屏完全读不到，必须带 ARIA；aria-valuetext 给「已完成 3/5 项」这类人话。
 * 百分比仅用于展示，不做动画数字滚动（07 章：进度不做夸张动效）。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 进度百分比 0–100（超界会被夹紧） */
    percent: number;
    type?: "line" | "circle";
    /** 正向/达标色调（薄荷） */
    positive?: boolean;
    /** 超限/风险色调（珊瑚） */
    danger?: boolean;
    /** 是否显示百分比文字，默认 false（线性）；环形默认在圆心显示 */
    text?: boolean;
    /** 尺寸档（线性=高度，环形=直径） */
    size?: "small" | "default" | "large";
    /** 环形直径 px，默认按 size 推导 */
    diameter?: number;
    /** 读屏朗读文本，如「已完成 3/5 项」；强烈建议传 */
    valueText?: string;
    /** 语义色四值；优先级高于 positive/danger（与 React 侧同一契约） */
    status?: "normal" | "success" | "warning" | "danger";
    /** 不确定时长（未知进度）—— 滑动条形态，不报具体数值 */
    indeterminate?: boolean;
    /** 无 valueText 时的读屏名称 */
    ariaLabel?: string;
  }>(),
  {
    type: "line",
    positive: false,
    danger: false,
    text: false,
    size: "default",
    diameter: undefined,
    valueText: undefined,
    status: undefined,
    indeterminate: false,
    ariaLabel: undefined,
  }
);

const clamped = computed(() => Math.max(0, Math.min(100, Number(props.percent) || 0)));

const toneClass = computed(() => {
  const t = props.status ?? (props.danger ? "danger" : props.positive ? "success" : "normal");
  return t === "normal" ? "" : `gm-progress--${t}`;
});
const isIndet = computed(() => props.indeterminate === true);

/** 尺寸映射（对齐 02.4 与 08 · 8.2.5） */
/* 08 · 8.2.5 原文高度：默认 6 / 细 3 / 粗 10。原为 4/8/12，与规范不符，本轮修正。 */
const sizeMap = { small: { bar: 3, ring: 56, stroke: 6 }, default: { bar: 6, ring: 72, stroke: 8 }, large: { bar: 10, ring: 96, stroke: 10 } } as const;

const barHeight = computed(() => sizeMap[props.size].bar);
const ringSize = computed(() => props.diameter ?? sizeMap[props.size].ring);
const stroke = computed(() => sizeMap[props.size].stroke);

const R = computed(() => (ringSize.value - stroke.value) / 2);
const circumference = computed(() => 2 * Math.PI * R.value);
const dashOffset = computed(() => circumference.value * (1 - clamped.value / 100));

const showRingText = computed(() => props.text || props.type === "circle");
</script>

<template>
  <div
    v-if="isIndet"
    :class="['gm-progress', 'gm-progress--indet', `gm-progress--${size}`]"
    role="progressbar"
    :aria-label="ariaLabel || valueText || '加载中'"
    aria-valuetext="加载中"
  >
    <!-- 未知进度**不报** aria-valuenow：报一个具体数值等于给读屏假数据 -->
    <i aria-hidden="true" />
  </div>
  <div
    v-else
    :class="['gm-progress', type === 'circle' && 'gm-progress--circle', type === 'line' && `gm-progress--${size}`, toneClass, clamped >= 100 && 'is-done']"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaLabel"
    :aria-valuetext="valueText || (clamped >= 100 ? '已完成' : `${clamped}%`)"
  >
    <template v-if="type === 'line'">
      <div class="gm-progress__track" :style="{ height: barHeight + 'px' }">
        <div class="gm-progress__fill" :style="{ width: clamped + '%' }" />
      </div>
      <span v-if="text" class="gm-progress__text">{{ Math.round(clamped) }}%</span>
    </template>

    <template v-else>
      <span class="gm-progress__ring" :style="{ width: ringSize + 'px', height: ringSize + 'px' }">
        <svg :width="ringSize" :height="ringSize">
          <circle class="gm-progress__ring-bg" :cx="ringSize / 2" :cy="ringSize / 2" :r="R" :stroke-width="stroke" />
          <circle
            class="gm-progress__ring-fill"
            :cx="ringSize / 2"
            :cy="ringSize / 2"
            :r="R"
            :stroke-width="stroke"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <span v-if="showRingText" class="gm-progress__ring-label">{{ Math.round(clamped) }}%</span>
      </span>
      <span v-if="text && valueText" class="gm-progress__text">{{ valueText }}</span>
    </template>
  </div>
</template>
