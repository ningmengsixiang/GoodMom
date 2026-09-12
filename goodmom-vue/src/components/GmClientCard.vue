<script setup lang="ts">
/**
 * GmClientCard —— 服务对象卡（对应 15.6.1 / 13 档案卡）
 *
 * 结构：头像 + 姓名 + 组合标签（tags 插槽）+ 摘要（sub）+ 额外信息（extra）+ 操作区（ops 插槽）
 * 形态：PC 行内排布；≤767px 时操作区换行到底部（10 · 10.6，保证热区 ≥44）。
 * 页面级状态（排序/筛选/分页）留在页面层，本组件不持有业务状态。
 */
import GmAvatar from "./GmAvatar.vue";

withDefaults(
  defineProps<{
    /** 姓名（必填，同时作为头像首字来源） */
    name: string;
    /** 摘要行，如「32岁 · 孕 24 周 · 第 2 胎」 */
    sub?: string;
    /** 头像文字，默认取 name */
    avatar?: string;
    /** 头像色调 */
    tone?: "rose" | "mint" | "purple";
  }>(),
  { sub: undefined, avatar: undefined, tone: "rose" }
);

defineSlots<{
  /** 姓名右侧标签位（建议放 GmStatusTag/GmTag） */
  tags?: () => unknown;
  /** 右侧附加信息（如最后随访时间） */
  extra?: () => unknown;
  /** 操作区（按钮/链接） */
  ops?: () => unknown;
}>();
</script>

<template>
  <div class="gm-client">
    <GmAvatar :text="avatar || name" :size="46" :tone="tone" />
    <div class="gm-client-main">
      <div class="gm-client-name">
        <b>{{ name }}</b>
        <slot name="tags" />
      </div>
      <div v-if="sub" class="gm-client-sub">{{ sub }}</div>
    </div>
    <div v-if="$slots.extra" class="gm-client-extra">
      <slot name="extra" />
    </div>
    <div v-if="$slots.ops" class="gm-client-ops">
      <slot name="ops" />
    </div>
  </div>
</template>

<style scoped>
.gm-client-extra {
  flex: none;
  font-size: 12px;
  color: var(--lg-text-tertiary);
  text-align: right;
}
</style>
