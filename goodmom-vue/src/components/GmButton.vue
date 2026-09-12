<script setup lang="ts">
/**
 * GmButton —— 按钮（对应 03 · 3.2 / 3.2.4 类型色 / 3.2.5 图标组合 / 07 · 7.3.1 四态）
 *
 * 类型：
 *  - primary  主行动：品牌粉上半段渐变 + **深字 #343A46**（D9 裁决，亮粉底白字仅 2.9:1 属违规）
 *  - secondary 次行动：玻璃底 + 白描边
 *  - outline  描边；dashed 虚线；text 文字按钮；default 中性实底
 * 状态 status：default | success | warning | danger（实底走 D5 深档，小字号白字 AA 达标）
 * 尺寸 size：mini 26 / small 32 / default 40 / large 48（圆角 16/18/22/26，对齐 02.4）
 *
 * 无障碍：原生 <button>；loading 时 aria-busy + disabled 且**保留宽度**（防布局跳动）；
 * 仅图标按钮必须传 ariaLabel（只靠图标无法被读屏识别）。
 */
import { computed } from "vue";
import { cx } from "../utils";

type GmButtonType = "primary" | "secondary" | "outline" | "dashed" | "text" | "default";
type GmButtonStatus = "default" | "success" | "warning" | "danger";
type GmButtonSize = "mini" | "small" | "default" | "large";
type GmButtonShape = "round" | "circle" | "square";

const props = withDefaults(
  defineProps<{
    /** 视觉类型，默认 primary */
    type?: GmButtonType;
    /** 语义状态色，默认 default（仅 status 相关类型着色） */
    status?: GmButtonStatus;
    /** 尺寸档，默认 default */
    size?: GmButtonSize;
    /** 形状：round 圆角 / circle 正圆（仅图标）/ square 小圆角 */
    shape?: GmButtonShape;
    /** 全宽（表单主操作、移动端底部按钮） */
    long?: boolean;
    /** 禁用（原生 disabled，键盘不可聚焦） */
    disabled?: boolean;
    /** 加载中：显示指示器、禁用点击、读屏播报 busy */
    loading?: boolean;
    /** 原生 type，默认 button（避免在 form 内意外提交） */
    nativeType?: "button" | "submit" | "reset";
    /** 仅图标按钮的可访问名（shape=circle 或 无文字槽时必须传） */
    ariaLabel?: string;
    /** 前置图标（16px 槽位） */
    icon?: unknown;
  }>(),
  {
    type: "primary",
    status: "default",
    size: "default",
    shape: "round",
    long: false,
    disabled: false,
    loading: false,
    nativeType: "button",
    ariaLabel: undefined,
    icon: undefined,
  }
);

const emit = defineEmits<{ (e: "click", ev: MouseEvent): void }>();

const slots = defineSlots<{
  default?: () => unknown;
  icon?: () => unknown;
}>();

const isDisabled = computed(() => props.disabled || props.loading);

const classes = computed(() =>
  cx(
    "gm-btn",
    `gm-btn--${props.type}`,
    props.status !== "default" && `gm-btn--${props.status}`,
    /* 尺寸类用 --sz-* 前缀：避免与 type="default" 的 .gm-btn--default 同名互相覆盖 */
    `gm-btn--sz-${props.size}`,
    props.shape === "circle" && "gm-btn--circle",
    props.shape === "square" && "gm-btn--square",
    props.long && "gm-btn--long",
    isDisabled.value && "gm-btn--disabled",
    props.loading && "gm-btn--loading",
    !slots.default && "gm-btn--icon-only"
  )
);

function onClick(ev: MouseEvent) {
  if (isDisabled.value) {
    ev.preventDefault();
    ev.stopPropagation();
    return;
  }
  emit("click", ev);
}
</script>

<template>
  <button
    :class="classes"
    :type="nativeType"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <!-- 加载中：指示器替换前置图标位（宽度由内容撑开，文案仍在，避免跳动） -->
    <span v-if="loading" class="gm-btn__spinner" aria-hidden="true" />
    <span v-else-if="slots.icon || icon" class="gm-btn__icon" aria-hidden="true">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <slot />
  </button>
</template>
