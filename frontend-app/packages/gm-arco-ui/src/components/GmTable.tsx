import React from "react";
import GmEmpty from "./GmEmpty";

/**
 * GmTable —— 玻璃表格（规范 03 · 3.7 / Part 15 · TB-15-01~04）
 *
 * ## 为什么补它
 *
 * 站点已统一为 `.gm-tbl`（V2.9），但**库组件一直缺位** —— 页面要么手写 table
 * 逐条复刻配方，要么漏掉表头 `scope="col"`、`tabular-nums`、排序语义等硬约定。
 * 本组件把这些一次钉死：
 *
 * 1. **视觉契约**（03 · 3.7）：表头 body-sm 14/20 600 次级色；行高 44–52
 *    （td padding 12×14 + 行高 20 + 分隔 1 = 45）；hairline 分隔；hover 淡白底；
 *    整表 `tabular-nums`（17 · 17.2.2）；宽表横滑由外层 `.gm-tbl-wrap` 承担。
 * 2. **排序语义**（TB-15-02）：可排序列表头是 `<button>`，组件维护
 *    `aria-sort="ascending|descending|none"` —— 站点从未实现，库组件带头做。
 * 3. **省略**（TB-15-02）：`column.ellipsis` → 单行省略 + `title` 全文。
 * 4. **空态**（TB-15-03）：默认渲染 GmEmpty（图标 48），可用 `empty` 覆盖。
 *
 * 加载骨架 / 卡片流 / 窗口化不在本组件内做：分别由 GmSkeleton、
 * GmResponsiveView（TB-15-07 三形态按容器宽度切）与 GmVirtualList（TB-15-08
 * >200 行窗口化）组合承担，排序/筛选状态由页面持有、切形态不重置。
 */
export interface GmTableColumn {
  key: string;
  title: React.ReactNode;
  /** right = 操作列（表头与单元格都会挂 col-ops，整格右对齐） */
  align?: "left" | "right";
  /** 可排序：表头渲染为 button 并维护 aria-sort（TB-15-02） */
  sortable?: boolean;
  /** 长文本单行省略 + title 全文（TB-15-02） */
  ellipsis?: boolean;
  /** 单元格自定义渲染；不传则取 row[key] */
  render?: (row: Record<string, unknown>, rowIndex: number) => React.ReactNode;
}
export interface GmTableProps {
  columns: GmTableColumn[];
  data: Record<string, unknown>[];
  /** 行 key 取值字段，默认 "key"；取不到回落到行下标 */
  rowKey?: string;
  caption?: React.ReactNode;
  /** 受控排序列 key；不传则排序纯展示（只切 aria-sort） */
  sortKey?: string;
  /** 受控排序方向；asc → desc → null 循环 */
  sortOrder?: "asc" | "desc" | null;
  onSortChange?: (key: string, order: "asc" | "desc" | null) => void;
  /** 空态（TB-15-03）；默认 <GmEmpty title="暂无数据" /> */
  empty?: React.ReactNode;
}

const SORT_ICON = (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <path d="M6 2.5 10.5 8h-9L6 2.5Z" />
  </svg>
);

const GmTable = ({
  columns,
  data,
  rowKey = "key",
  caption,
  sortKey,
  sortOrder = null,
  onSortChange,
  empty,
}: GmTableProps) => {
  const handleSort = (col: GmTableColumn) => {
    if (!onSortChange) return;
    const next: "asc" | "desc" | null =
      sortKey === col.key
        ? sortOrder === "asc"
          ? "desc"
          : sortOrder === "desc"
            ? null
            : "asc"
        : "asc";
    onSortChange(col.key, next);
  };

  const emptyNode = empty !== undefined ? empty : <GmEmpty title="暂无数据" />;

  return (
    <div className="gm-tbl-wrap">
      <table className="gm-tbl">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => {
              const ariaSort = c.sortable
                ? sortKey === c.key && sortOrder
                  ? sortOrder === "asc"
                    ? ("ascending" as const)
                    : ("descending" as const)
                  : ("none" as const)
                : undefined;
              const cls = [
                c.align === "right" ? "col-ops" : "",
                c.sortable ? "gm-tbl__sortable" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <th key={c.key} scope="col" className={cls || undefined} aria-sort={ariaSort}>
                  {c.sortable ? (
                    <button type="button" className="gm-tbl__sortbtn" onClick={() => handleSort(c)}>
                      {c.title}
                      <span className="gm-tbl__sortic">{SORT_ICON}</span>
                    </button>
                  ) : (
                    c.title
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyNode}</td>
            </tr>
          ) : (
            data.map((row, ri) => {
              const k = row[rowKey];
              const key = (typeof k === "string" || typeof k === "number" ? k : ri) as React.Key;
              return (
                <tr key={key}>
                  {columns.map((c) => {
                    const cell = c.render ? c.render(row, ri) : (row[c.key] as React.ReactNode);
                    const text =
                      c.ellipsis && (typeof cell === "string" || typeof cell === "number")
                        ? String(cell)
                        : undefined;
                    return (
                      <td key={c.key} className={c.align === "right" ? "col-ops" : undefined}>
                        {c.ellipsis ? (
                          <span className="gm-tbl__ell" title={text}>
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default GmTable;
