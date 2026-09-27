<script setup lang="ts">
/**
 * GmCard —— 玻璃卡片（对应 03 · 3.3 / 13）
 *
 * 契约与 `@goodmom/ui` 的 GmCard 逐项一致（守门：`scripts/check-component-contract.py`）：
 * props 名（title/extra/footer/radius/hoverable/bodyless）、默认值（radius 22 /
 * hoverable false / bodyless false）、契约类名（.gm-card、.gm-card-head、.gm-card-foot、
 * .gm-card--hover、.gm-card--bodyless）两侧相同。
 * 同一份内容两种写法都支持：**prop**（与 React 侧逐字对应）或 **同名具名插槽**
 * （title/extra/footer，Vue 惯用写法，提供插槽时插槽优先）。两侧能力等价，只是渲染模型不同。
 * 圆角默认 22（02.4 常规卡片档）；radius=0 时输出方角（表格包裹等场景）。
 * 玻璃底由 CSS 变量给出，暗色模式自动降亮度（[data-theme="dark"]），组件内不写色值。
 */
import type { VNode } from "vue";

/** 节点实参：字符串 / VNode / 两者数组（对应 React 侧的 ReactNode） */
type GmCardNode = string | VNode | Array<string | VNode>;

withDefaults(
  defineProps<{
    /** 卡片标题（与 extra 任一存在时才渲染头部） */
    title?: GmCardNode;
    /** 头部右侧（操作/时间/链接） */
    extra?: GmCardNode;
    /** 底部操作区（右对齐 + 分隔线） */
    footer?: GmCardNode;
    /** 圆角 px，默认 22（02.4） */
    radius?: number;
    /** 是否抬起（hover 上浮 + 阴影加强），用于可点击卡片 */
    hoverable?: boolean;
    /** 是否去除内边距（表格/图片贴边场景） */
    bodyless?: boolean;
  }>(),
  { title: undefined, extra: undefined, footer: undefined, radius: 22, hoverable: false, bodyless: false }
);

defineSlots<{
  /** 卡片内容 */
  default?: () => unknown;
  /** 标题（优先于 title prop） */
  title?: () => unknown;
  /** 头部右侧（优先于 extra prop） */
  extra?: () => unknown;
  /** 底部操作区（优先于 footer prop） */
  footer?: () => unknown;
}>();
</script>

<template>
  <div
    class="gm-card"
    :class="[hoverable && 'gm-card--hover', bodyless && 'gm-card--bodyless']"
    :style="{ borderRadius: radius + 'px' }"
  >
    <div v-if="title || extra || $slots.title || $slots.extra" class="gm-card-head">
      <b><slot name="title">{{ title }}</slot></b>
      <span><slot name="extra">{{ extra }}</slot></span>
    </div>
    <slot />
    <div v-if="footer || $slots.footer" class="gm-card-foot">
      <slot name="footer">{{ footer }}</slot>
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
