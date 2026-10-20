<script setup lang="ts">
/**
 * GmTable —— 玻璃表格（规范 03 · 3.7 / Part 15 · TB-15-01~04）
 *
 * 与 React 版同契约：表头 body-sm 600 次级色 + `scope="col"`；行高 44–52；
 * hairline 分隔；整表 tabular-nums；宽表横滑由 .gm-tbl-wrap 承担。
 * 排序语义（TB-15-02）：可排序列表头是 button，组件维护
 * `aria-sort="ascending|descending|none"`。省略（TB-15-02）+ 空态（TB-15-03）。
 * 加载骨架 / 卡片流 / 窗口化分别组合 GmSkeleton / GmResponsiveView / GmVirtualList。
 */
import { computed, defineComponent, type PropType } from "vue";
import GmEmpty from "./GmEmpty.vue";

export interface GmTableColumn {
  key: string;
  title: string;
  /** right = 操作列（表头与单元格都会挂 col-ops，整格右对齐） */
  align?: "left" | "right";
  /** 可排序：表头渲染为 button 并维护 aria-sort（TB-15-02） */
  sortable?: boolean;
  /** 长文本单行省略 + title 全文（TB-15-02） */
  ellipsis?: boolean;
  /** 单元格自定义渲染（返回 VNode/字符串/数字）；不传则取 row[key] */
  render?: (row: Record<string, unknown>, rowIndex: number) => unknown;
}

export interface GmTableProps {
  columns: GmTableColumn[];
  data: Record<string, unknown>[];
  /** 行 key 取值字段，默认 "key"；取不到回落到行下标 */
  rowKey?: string;
  caption?: string;
  /** 受控排序列 key；不传则排序纯展示（只切 aria-sort） */
  sortKey?: string;
  /** 受控排序方向；asc → desc → null 循环 */
  sortOrder?: "asc" | "desc" | null;
  onSortChange?: (key: string, order: "asc" | "desc" | null) => void;
}

const props = withDefaults(
  defineProps<GmTableProps>(),
  { rowKey: "key", sortOrder: null }
);

const emit = defineEmits<{
  (e: "sortChange", key: string, order: "asc" | "desc" | null): void;
}>();

defineSlots<{
  /** 空态（TB-15-03）；默认 GmEmpty */
  empty?: () => unknown;
}>();

/** 单元格渲染载体：模板里无法直接渲染函数返回的 VNode，用函数组件包一层 */
const GmCell = defineComponent({
  name: "GmCell",
  props: {
    col: { type: Object as PropType<GmTableColumn>, required: true },
    row: { type: Object as PropType<Record<string, unknown>>, required: true },
    index: { type: Number, required: true },
  },
  setup(p) {
    return () => {
      const col = p.col as GmTableColumn;
      const out = col.render
        ? col.render(p.row as Record<string, unknown>, p.index)
        : (p.row as Record<string, unknown>)[col.key];
      return out == null ? null : out;
    };
  },
});

function ariaSortOf(c: GmTableColumn): "ascending" | "descending" | "none" | undefined {
  if (!c.sortable) return undefined;
  if (props.sortKey === c.key && props.sortOrder) {
    return props.sortOrder === "asc" ? "ascending" : "descending";
  }
  return "none";
}

function toggle(c: GmTableColumn) {
  const next: "asc" | "desc" | null =
    props.sortKey === c.key
      ? props.sortOrder === "asc"
        ? "desc"
        : props.sortOrder === "desc"
          ? null
          : "asc"
      : "asc";
  if (props.onSortChange) props.onSortChange(c.key, next);
  emit("sortChange", c.key, next);
}

function rowKeyOf(row: Record<string, unknown>, ri: number): string | number {
  const k = row[props.rowKey];
  return typeof k === "string" || typeof k === "number" ? k : ri;
}

function cellText(c: GmTableColumn, row: Record<string, unknown>): string | undefined {
  if (!c.ellipsis) return undefined;
  const v = row[c.key];
  return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
}

const colCount = computed(() => props.columns.length);
</script>

<template>
  <div class="gm-tbl-wrap">
    <table class="gm-tbl">
      <caption v-if="caption">{{ caption }}</caption>
      <thead>
        <tr>
          <th
            v-for="c in columns"
            :key="c.key"
            scope="col"
            :class="[c.align === 'right' ? 'col-ops' : '', c.sortable ? 'gm-tbl__sortable' : '']"
            :aria-sort="ariaSortOf(c)"
          >
            <button v-if="c.sortable" type="button" class="gm-tbl__sortbtn" @click="toggle(c)">
              {{ c.title }}
              <span class="gm-tbl__sortic">
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                  <path d="M6 2.5 10.5 8h-9L6 2.5Z" />
                </svg>
              </span>
            </button>
            <template v-else>{{ c.title }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td :colspan="colCount">
            <slot name="empty"><GmEmpty title="暂无数据" /></slot>
          </td>
        </tr>
        <tr v-for="(row, ri) in data" :key="rowKeyOf(row, ri)">
          <td v-for="c in columns" :key="c.key" :class="c.align === 'right' ? 'col-ops' : ''">
            <span v-if="c.ellipsis" class="gm-tbl__ell" :title="cellText(c, row)">
              <GmCell :col="c" :row="row" :index="ri" />
            </span>
            <GmCell v-else :col="c" :row="row" :index="ri" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
