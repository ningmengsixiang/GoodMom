import React from "react";

/**
 * GmDescriptions —— 描述列表（规范 08 · 8.2.11 / 8.2.13）
 *
 * 站点已落地 `.gm-desc`（V2.9），本组件把结构契约收进库：
 *
 * 1. **键值语义**：`<dl>` + `<dt class="k">` / `<dd class="v">`（TB-15 口径）。
 * 2. **key 用次级色**：8.2.11 字面写「三级色」，但 #9AA2B0 在 12px 上约 2.6:1，
 *    与 02 · 2.1.1「三级色只可用于 ≥24px」冲突 —— D19 裁决 key 走
 *    `--lg-text-secondary`（组件 CSS 已按裁决写死，勿改回三级色）。
 * 3. **省略 + title 全文**（8.2.13）：value 单行省略，`title` 缺省取 value 原文。
 * 4. **分栏自适应**：`columns` 默认 3（`--gm-desc-cols`），`columnsSm` 默认 1；
 *    断点 1023/767 内建（与站点同一套变量）。
 */
export interface GmDescItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** 省略态的 title 全文；缺省取 value 的字符串形态 */
  title?: string;
  /** 数字类：挂 tabular-nums（17 · 17.2.2） */
  num?: boolean;
}
export interface GmDescriptionsProps {
  items: GmDescItem[];
  /** PC 分栏数（2–4），默认 3 */
  columns?: number;
  /** 移动端（≤767px）分栏数，默认 1 */
  columnsSm?: number;
}

const GmDescriptions = ({ items, columns = 3, columnsSm = 1 }: GmDescriptionsProps) => (
  <dl
    className="gm-desc"
    style={
      {
        "--gm-desc-cols": String(columns),
        "--gm-desc-cols-sm": String(columnsSm),
      } as React.CSSProperties
    }
  >
    {items.map((it, i) => {
      const t =
        it.title ??
        (typeof it.value === "string" || typeof it.value === "number" ? String(it.value) : undefined);
      return (
        <div key={i}>
          <dt className="k">{it.label}</dt>
          <dd className={"v" + (it.num ? " num" : "")} title={t}>
            {it.value}
          </dd>
        </div>
      );
    })}
  </dl>
);
export default GmDescriptions;
