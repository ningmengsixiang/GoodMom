import React from "react";

/**
 * GmSkeleton —— 骨架屏（规范 08 · 8.2.15 / 07 加载范式 / Part 19 · EL-19-02）
 *
 * ## 本轮完善（V2.9「状态与加载」深化）
 *
 * 1. **补 `rowHeight`**：EL-19-02 要求「骨架**高度近似终态**」，否则数据到达时页面跳动
 *    （CLS）比转圈更糟。原来每行写死 12px，无法贴合"文本行 / 标题 / 卡片块"等终态高度。
 * 2. **补 `aria-busy`**：`role="status"` 只表示"这里是状态播报区"，`aria-busy="true"`
 *    才表达"该区域正在更新"，两者语义不同、应同时给。
 * 3. 动画与形状不在本文件 —— 见 theme.css：08 · 8.2.15 规定**圆角胶囊 + 1.6s 上下微透明
 *    呼吸**，并**明文禁止左右扫光马赛克**（旧实现恰是扫光，已修）。
 */
export interface GmSkeletonProps {
  rows?: number;
  /** 每行宽度（循环取用），如 ["100%", "72%", "88%"] */
  widths?: string[];
  /** 读屏文案，默认「内容加载中」 */
  label?: string;
  /** 每行高度 px，默认 12。**应贴近终态高度**（标题 20 / 正文 12 / 卡片块 64 等） */
  rowHeight?: number;
  style?: React.CSSProperties;
}

const GmSkeleton = ({
  rows = 3,
  widths = ["100%", "84%", "70%"],
  label = "内容加载中",
  rowHeight = 12,
  style,
}: GmSkeletonProps) => (
  <div className="gm-skeleton" role="status" aria-busy="true" aria-label={label} style={style}>
    {Array.from({ length: rows }, (_, i) => (
      <i key={i} style={{ width: widths[i % widths.length], height: rowHeight }} aria-hidden="true" />
    ))}
  </div>
);
export default GmSkeleton;
