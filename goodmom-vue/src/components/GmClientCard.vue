<script setup lang="ts">
/**
 * GmClientCard —— 服务对象卡（对应 15.6.1 / 13 档案卡）
 *
 * 契约与 `@goodmom/ui` 的 GmClientCard 逐项一致（守门：`scripts/check-component-contract.py`）：
 * props 名（name/sub/avatar/tone/tags/extra/ops）、tone 默认 "rose"、契约类名
 * （.gm-client、.gm-client-main、.gm-client-name、.gm-client-sub、.gm-client-extra、
 * .gm-client-ops）与 DOM 结构两侧相同。
 * 同一份内容两种写法都支持：**prop**（与 React 侧逐字对应，V2.10 补齐）
 * 或 **同名具名插槽** tags/extra/ops（Vue 惯用写法，提供插槽时插槽优先）。
 * 形态：PC 行内排布；≤767px 时操作区换行到底部（10 · 10.6，保证热区 ≥44）。
 * 页面级状态（排序/筛选/分页）留在页面层，本组件不持有业务状态。
 */
import type { VNode } from "vue";
import GmAvatar from "./GmAvatar.vue";

/** 节点实参：字符串 / VNode / 两者数组（对应 React 侧的 ReactNode | ReactNode[]） */
type GmClientNode = string | VNode | Array<string | VNode>;

withDefaults(
  defineProps<{
    /** 姓名（必填，同时作为头像首字来源） */
    name: string;
    /** 摘要行，如「32岁 · 孕 24 周 · 第 2 胎」 */
    sub?: string;
    /** 头像文字，默认取 name */
    avatar?: string;
    /** 头像色调，默认 rose（与 React 侧同默认，两侧都显式声明） */
    tone?: "rose" | "mint" | "purple";
    /** 姓名右侧标签位（建议放 GmStatusTag/GmTag）；也可用 #tags 插槽 */
    tags?: GmClientNode;
    /** 右侧附加信息（如最后随访时间）；也可用 #extra 插槽 */
    extra?: GmClientNode;
    /** 操作区（按钮/链接）；也可用 #ops 插槽 */
    ops?: GmClientNode;
  }>(),
  { sub: undefined, avatar: undefined, tone: "rose", tags: undefined, extra: undefined, ops: undefined }
);

defineSlots<{
  /** 姓名右侧标签位（优先于 tags prop） */
  tags?: () => unknown;
  /** 右侧附加信息（优先于 extra prop） */
  extra?: () => unknown;
  /** 操作区（优先于 ops prop） */
  ops?: () => unknown;
}>();

/** 节点实参是否有内容：与 React 侧 nodesOf(...).length > 0 同口径（空数组 = 不渲染容器） */
function hasNode(value: GmClientNode | undefined): boolean {
  return Array.isArray(value) ? value.length > 0 : !!value;
}
</script>

<template>
  <div class="gm-client">
    <GmAvatar :text="avatar || name" :size="46" :tone="tone" />
    <div class="gm-client-main">
      <div class="gm-client-name">
        <b>{{ name }}</b>
        <slot name="tags">{{ tags }}</slot>
      </div>
      <div v-if="sub" class="gm-client-sub">{{ sub }}</div>
    </div>
    <div v-if="hasNode(extra) || $slots.extra" class="gm-client-extra">
      <slot name="extra">{{ extra }}</slot>
    </div>
    <div v-if="hasNode(ops) || $slots.ops" class="gm-client-ops">
      <slot name="ops">{{ ops }}</slot>
    </div>
  </div>
</template>

<style scoped>
.gm-client-extra {
  flex: none;
  font-size: 12px;
  color: var(--lg-text-secondary);
  text-align: right;
}
</style>
