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
  }>(),
  {
    type: "line",
    positive: false,
    danger: false,
    text: false,
    size: "default",
    diameter: undefined,
    valueText: undefined,
  }
);

const clamped = computed(() => Math.max(0, Math.min(100, Number(props.percent) || 0)));

const toneClass = computed(() =>
  props.danger ? "gm-progress--danger" : props.positive ? "gm-progress--positive" : ""
);

/** 尺寸映射（对齐 02.4 与 08 · 8.2.5） */
const sizeMap = { small: { bar: 4, ring: 56, stroke: 6 }, default: { bar: 8, ring: 72, stroke: 8 }, large: { bar: 12, ring: 96, stroke: 10 } } as const;

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
    :class="['gm-progress', type === 'circle' && 'gm-progress--circle', type === 'line' && `gm-progress--${size}`, toneClass]"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuetext="valueText"
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
