<script setup lang="ts">
/**
 * GmEmpty —— 空状态（对应 08 · 8.2.12）
 *
 * 结构：玻璃圆环图标 + 标题 + 描述 + 行动槽（推荐主操作）。
 * 08 章口径：空状态**必须**给出下一步动作（空数据页只有插画和「暂无数据」= 用户死路）。
 * 图标默认内联 SVG（不依赖图标库，保证零基座）；移动端可用 size=lg 加大图标。
 *
 * 与 React 版 @goodmom/ui 的 GmEmpty **同一契约**（P1-12）：
 *  - title 默认「暂无数据」且两侧都渲染（React 此前无默认值 → 同一个空状态一边有字一边空白）
 *  - icon 两侧都按**节点**接收（不是组件名/组件定义），判定同为 truthy 才覆盖默认 SVG
 *  - iconSize 默认 default；SVG 像素 large ? 48 : 24；默认 SVG 与 role="status" 逐字一致
 */
import { computed, type VNodeChild } from "vue";

const props = withDefaults(
  defineProps<{
    /** 标题，默认「暂无数据」 */
    title?: string;
    /** 描述：说明为什么空 + 怎么才能有数据 */
    desc?: string;
    /** 图标尺寸档，默认 default(24)；lg 用于移动端整页空态 */
    iconSize?: "default" | "large";
    /** 自定义图标（按节点接收：VNode / 字符串 / 数字 / 数组，与 React 的 ReactNode 同能力） */
    icon?: unknown;
  }>(),
  { title: "暂无数据", desc: undefined, iconSize: "default", icon: undefined }
);

/** 与 React `{icon || 默认 SVG}` 同一判定：只有 truthy 才覆盖默认图标 */
const hasIcon = computed(() => Boolean(props.icon));

/**
 * 把 icon **当节点渲染**。不能写成 `<component :is="icon">`：
 * `:is` 会把 VNode 对象当成组件定义、把字符串当成组件名去解析，与 React 的 `{icon}` 语义不同。
 * 这里包一层无参函数式组件，交给 Vue 的 vnode 归一化处理（字符串 → 文本节点，VNode → 原样）。
 */
const renderIcon = () => props.icon as VNodeChild;
</script>

<template>
  <div class="gm-empty" role="status">
    <span class="gm-empty-ic" :class="iconSize === 'large' && 'is-lg'" aria-hidden="true">
      <slot name="icon">
        <component :is="renderIcon" v-if="hasIcon" />
        <svg v-else :width="iconSize === 'large' ? 48 : 24" :height="iconSize === 'large' ? 48 : 24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="10.5" r="5.5" />
          <path d="M5.5 18.5c.8-3 3.4-4.4 6.5-4.4s5.7 1.4 6.5 4.4" />
        </svg>
      </slot>
    </span>
    <div v-if="title" class="t">{{ title }}</div>
    <div v-if="desc" class="d">{{ desc }}</div>
    <slot />
  </div>
</template>

<style scoped>
.gm-empty-ic.is-lg {
  width: 80px;
  height: 80px;
}
</style>
