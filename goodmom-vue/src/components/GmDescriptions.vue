<script setup lang="ts">
/**
 * GmDescriptions —— 描述列表（规范 08 · 8.2.11 / 8.2.13）
 *
 * 与 React 版同契约：<dl> + <dt class="k"> / <dd class="v">；key caption 12/16
 * **次级色**（三级色 12px 上约 2.6:1，D19 裁决）；value body-sm 14/20 600 主色；
 * 单行省略 + title 全文；分栏 --gm-desc-cols 默认 3 / --gm-desc-cols-sm 默认 1，
 * 断点 1023/767 内建（与站点同一套变量）。
 */
export interface GmDescItem {
  label: unknown;
  value: unknown;
  /** 省略态的 title 全文；缺省取 value 的字符串形态 */
  title?: string;
  /** 数字类：挂 tabular-nums（17 · 17.2.2） */
  num?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: GmDescItem[];
    /** PC 分栏数（2–4），默认 3 */
    columns?: number;
    /** 移动端（≤767px）分栏数，默认 1 */
    columnsSm?: number;
  }>(),
  { columns: 3, columnsSm: 1 }
);

function titleOf(it: GmDescItem): string | undefined {
  if (it.title !== undefined) return it.title;
  const v = it.value;
  return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
}
</script>

<template>
  <dl
    class="gm-desc"
    :style="{ '--gm-desc-cols': String(columns), '--gm-desc-cols-sm': String(columnsSm) }"
  >
    <div v-for="(it, i) in items" :key="i">
      <dt class="k">{{ it.label }}</dt>
      <dd class="v" :class="{ num: it.num }" :title="titleOf(it)">{{ it.value }}</dd>
    </div>
  </dl>
</template>
