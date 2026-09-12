<script setup lang="ts">
/**
 * GmLink —— 链接 / 文字按钮（对应 03 · 3.10）
 *
 * 语义选择（关键无障碍契约）：
 *  - 有 `href` → 渲染 `<a>`（导航语义，可中键新窗口打开）
 *  - 无 `href` → 渲染 `<button type="button">`（动作语义，可被键盘空格/回车触发）
 *  不要用 `<a href="#">` 做动作——读屏会播报为链接，且右键菜单出现「在新标签页打开」。
 *
 * 外链：自动 target=_blank + rel="noopener noreferrer" + 尾图标 + 读屏后缀「（新窗口打开）」。
 * 禁用：降级为非交互 span（aria-disabled），**不挂 href / onClick**，避免键盘可达的假交互。
 * 视觉全部来自 class（components.css），组件内不出现任何色值。
 */
import { computed } from "vue";
import { cx } from "../utils";

type GmLinkVariant = "default" | "primary" | "muted" | "danger";
type GmLinkUnderline = "always" | "hover" | "none";
type GmLinkSize = "small" | "default" | "large";

const props = withDefaults(
  defineProps<{
    /** 有 href → <a>；无 href → <button type="button"> */
    href?: string;
    /** 语义色档，默认 default（品牌粉） */
    variant?: GmLinkVariant;
    /** 下划线策略，默认 hover */
    underline?: GmLinkUnderline;
    /** 外链：target/rel + 尾图标 + 读屏后缀 */
    external?: boolean;
    /** 禁用：渲染 aria-disabled 的非交互元素 */
    disabled?: boolean;
    /** 字号 12 / 14 / 16 */
    size?: GmLinkSize;
    /** 读屏补充说明（如「查看张三档案」）；无可见文字时必传 */
    ariaLabel?: string;
  }>(),
  {
    href: undefined,
    variant: "default",
    underline: "hover",
    external: false,
    disabled: false,
    size: "default",
    ariaLabel: undefined,
  }
);

const emit = defineEmits<{ (e: "click", ev: MouseEvent): void }>();

const isExternal = computed(() => props.external && !props.disabled);
const isAnchor = computed(() => !!props.href && !props.disabled);

const classes = computed(() =>
  cx(
    "gm-link",
    `gm-link--${props.variant}`,
    `gm-link--u-${props.underline}`,
    props.size === "small" && "gm-link--sm",
    props.size === "large" && "gm-link--lg",
    props.disabled && "is-disabled"
  )
);

function onClick(ev: MouseEvent) {
  if (props.disabled) {
    ev.preventDefault();
    return;
  }
  emit("click", ev);
}
</script>

<template>
  <!-- 禁用态：非交互元素，tone 保留，不渲染 href / 事件 -->
  <span v-if="disabled" :class="classes" aria-disabled="true">
    <span v-if="$slots.icon" class="gm-link__ic" aria-hidden="true"><slot name="icon" /></span>
    <span class="gm-link__t"><slot /></span>
  </span>

  <a
    v-else-if="isAnchor"
    :class="classes"
    :href="href"
    :aria-label="ariaLabel"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    @click="onClick"
  >
    <span v-if="$slots.icon" class="gm-link__ic" aria-hidden="true"><slot name="icon" /></span>
    <span class="gm-link__t"><slot /></span>
    <span v-if="isExternal" class="gm-link__ex" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" focusable="false">
        <path d="M4.5 1.9H2.6A1.4 1.4 0 0 0 1.2 3.3v6.1a1.4 1.4 0 0 0 1.4 1.4h6.1a1.4 1.4 0 0 0 1.4-1.4V7.5" />
        <path d="M7.2 1.2h3.6v3.6" />
        <path d="M10.8 1.2 5.9 6.1" />
      </svg>
    </span>
    <span v-if="isExternal" class="gm-sr-only">（新窗口打开）</span>
  </a>

  <button v-else type="button" :class="classes" :aria-label="ariaLabel" @click="onClick">
    <span v-if="$slots.icon" class="gm-link__ic" aria-hidden="true"><slot name="icon" /></span>
    <span class="gm-link__t"><slot /></span>
  </button>
</template>
