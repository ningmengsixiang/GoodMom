<script setup lang="ts">
/**
 * GmStatusTag —— 业务状态标签（对应 14 · 4.4.5 六语义 / 15.2 业务词库 / 02.10 五色）
 *
 * 与 GmTag 的分工（D3 裁决，Vue 版延续）：
 *  - GmStatusTag：**业务状态**专用。只传文案，组件自己查 15 章词库定语义色，页面不写色。
 *  - GmTag：**分类/标记**用。需要显式指定语义或自定义色的场景。
 *
 * 用法：`<GmStatusTag>待随访</GmStatusTag>` → 自动渲染为 attention 琥珀色。
 * 未登记文案回落 neutral 灰，不抛错（列表页遇到新状态不会白屏）。
 *
 * 实现说明（不要改回"直接遍历插槽 vnode"）：
 * Vue 3.5 会把插槽子节点包进 Fragment vnode（`{ type: Symbol(Fragment), children: [...] }`），
 * 遍历时若只看 `children` 而不识别 Fragment，会取到空串 → 语义推导静默失败、全部回落灰色。
 * 因此双重兜底：① 渲染期用 vnode 遍历（SSR 也生效，且能识别 Fragment）；
 * ② 挂载后用 DOM textContent 校正（覆盖任意自定义插槽结构，最可靠）。
 */
import { computed, onMounted, ref, Fragment, Text, type VNode } from "vue";
import { FIVE_COLOR, FIVE_VAR, SEMANTIC_VAR, type GmFive, type GmSemantic } from "../tokens/status";
import { semanticOf } from "../tokens/business";
import { cx } from "../utils";

const props = withDefaults(
  defineProps<{
    /** 六语义之一；不传则由默认插槽文案自动推导（推荐） */
    semantic?: GmSemantic;
    /** 孕产妇五色之一（优先级高于 semantic） */
    five?: GmFive;
    /** 显式覆盖色 hex */
    color?: string;
    size?: "small" | "default" | "large";
    /** 可关闭：显示关闭按钮并触发 close 事件 */
    closable?: boolean;
    /** 关闭按钮的可访问名，默认「移除」 */
    closeLabel?: string;
  }>(),
  {
    semantic: undefined,
    five: undefined,
    color: undefined,
    size: "default",
    closable: false,
    closeLabel: "移除",
  }
);

const emit = defineEmits<{ (e: "close", ev: MouseEvent): void }>();

const slots = defineSlots<{ default?: () => unknown }>();

/** 从 vnode 树提取纯文本；必须识别 Fragment/Text，否则取不到值（见文件头说明） */
function textOfVNode(vnode: unknown): string {
  if (vnode == null || typeof vnode === "boolean") return "";
  if (typeof vnode === "string" || typeof vnode === "number") return String(vnode);
  if (Array.isArray(vnode)) return vnode.map(textOfVNode).join("");
  const v = vnode as VNode & { type?: unknown; children?: unknown };
  if (typeof v !== "object") return "";
  if (v.type === Fragment || v.type === Text) return textOfVNode(v.children);
  return textOfVNode(v.children);
}

/** 挂载后用真实 DOM 文本校正（覆盖自定义插槽结构，最可靠） */
const textRef = ref<HTMLElement | null>(null);
const domText = ref("");

onMounted(() => {
  domText.value = textRef.value?.textContent?.trim() ?? "";
});

const effectiveText = computed(() => domText.value || textOfVNode(slots.default?.()));

/** 文案 → 语义：仅当调用方未显式指定 semantic/five/color 时才推导 */
const derived = computed<GmSemantic>(() => {
  if (props.semantic) return props.semantic;
  return semanticOf(effectiveText.value);
});

/**
 * 主色表达式。P1-2：优先使用 **CSS 变量**而不是 tokens 里的静态浅色 hex ——
 * 变量在 `[data-theme="dark"]` 下会被切换为暗色档，静态 hex 不会。
 * 历史表现：暗色下组件仍渲染浅色档语义色，实测只有 2.56–3.30:1（规范承诺 ≥5.37:1）。
 * 显式传 `color` 时仍原样使用（调用方自行负责其对比度）。
 */
const resolved = computed(
  () =>
    props.color ||
    (props.five
      ? `var(${FIVE_VAR[props.five]},${FIVE_COLOR[props.five]})`
      : `var(${SEMANTIC_VAR[derived.value]})`)
);

/**
 * 淡底与描边用 `color-mix` **从同一个变量派生**，因此自动跟随暗色档与业务覆盖。
 * （旧实现 `tint(hex, .13)` 在 JS 里算 rgba，只能得到静态浅色档。）
 */
const style = computed(() => ({
  color: resolved.value,
  background: `color-mix(in srgb, ${resolved.value} 13%, transparent)`,
  borderColor: `color-mix(in srgb, ${resolved.value} 32%, transparent)`,
}));

/** small 复用 default 档视觉（12px / padding 3 10） */
const sizeClass = computed(() => `gm-status-tag--${props.size === "small" ? "default" : props.size}`);
</script>

<template>
  <span :class="cx('gm-status-tag', sizeClass)" :style="style">
    <span class="gm-status-dot" :style="{ background: resolved }" aria-hidden="true" />
    <span ref="textRef" data-gm-text><slot /></span>
    <button v-if="closable" type="button" class="gm-status-tag__close" :aria-label="closeLabel" @click="emit('close', $event)">
      ✕
    </button>
  </span>
</template>
