<script setup lang="ts">
/**
 * GmCard —— 玻璃卡片（对应 03 · 3.3 / 13）
 *
 * 结构：head（title + extra） → 默认插槽（内容） → foot 插槽（操作区）
 * 圆角默认 22（02.4 常规卡片档）；radius=0 时输出方角（表格包裹等场景）。
 * 玻璃底由 CSS 变量给出，暗色模式自动降亮度（[data-theme="dark"]），组件内不写色值。
 */
withDefaults(
  defineProps<{
    /** 卡片标题（有 title 或 extra 时才渲染头部） */
    title?: string;
    /** 圆角 px，默认 22（02.4） */
    radius?: number;
    /** 是否抬起（hover 上浮 + 阴影加强），用于可点击卡片 */
    hoverable?: boolean;
    /** 是否去除内边距（表格/图片贴边场景） */
    bodyless?: boolean;
  }>(),
  { title: undefined, radius: 22, hoverable: false, bodyless: false }
);

defineSlots<{
  default?: () => unknown;
  /** 头部右侧（操作/时间/链接） */
  extra?: () => unknown;
  /** 底部操作区 */
  footer?: () => unknown;
}>();
</script>

<template>
  <div
    class="gm-card"
    :class="[hoverable && 'gm-card--hover', bodyless && 'gm-card--bodyless']"
    :style="{ borderRadius: radius + 'px' }"
  >
    <div v-if="title || $slots.extra" class="gm-card-head">
      <b>{{ title }}</b>
      <span><slot name="extra" /></span>
    </div>
    <slot />
    <div v-if="$slots.footer" class="gm-card-foot">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.gm-card--hover {
  transition: transform var(--lg-t-base) var(--lg-ease-spring), box-shadow var(--lg-t-base) ease;
}
.gm-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px var(--lg-shadow-sm);
}
.gm-card--bodyless {
  padding: 0;
}
.gm-card-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: var(--lg-border-hairline) solid var(--lg-divider);
}
</style>
