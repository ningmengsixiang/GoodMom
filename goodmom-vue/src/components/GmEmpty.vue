<script setup lang="ts">
/**
 * GmEmpty —— 空状态（对应 08 · 8.2.12）
 *
 * 结构：玻璃圆环图标 + 标题 + 描述 + 行动槽（推荐主操作）。
 * 08 章口径：空状态**必须**给出下一步动作（空数据页只有插画和「暂无数据」= 用户死路）。
 * 图标默认内联 SVG（不依赖图标库，保证零基座）；移动端可用 size=lg 加大图标。
 */
withDefaults(
  defineProps<{
    /** 标题，默认「暂无数据」 */
    title?: string;
    /** 描述：说明为什么空 + 怎么才能有数据 */
    desc?: string;
    /** 图标尺寸档，默认 default(24)；lg 用于移动端整页空态 */
    iconSize?: "default" | "large";
    /** 自定义图标（传入则覆盖默认 SVG） */
    icon?: unknown;
  }>(),
  { title: "暂无数据", desc: undefined, iconSize: "default", icon: undefined }
);
</script>

<template>
  <div class="gm-empty" role="status">
    <span class="gm-empty-ic" :class="iconSize === 'large' && 'is-lg'" aria-hidden="true">
      <slot name="icon">
        <svg v-if="!icon" :width="iconSize === 'large' ? 48 : 24" :height="iconSize === 'large' ? 48 : 24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="10.5" r="5.5" />
          <path d="M5.5 18.5c.8-3 3.4-4.4 6.5-4.4s5.7 1.4 6.5 4.4" />
        </svg>
        <component :is="icon" v-else />
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
