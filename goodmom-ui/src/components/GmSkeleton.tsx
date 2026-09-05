import React from "react";

/** GmSkeleton —— 骨架屏（规范 08 · 8.2.13 / 07 加载范式） */
export interface GmSkeletonProps {
  rows?: number;
  /** 每行宽度（循环取用），如 ["100%", "72%", "88%"] */
  widths?: string[];
  style?: React.CSSProperties;
}

const GmSkeleton = ({ rows = 3, widths = ["100%", "84%", "70%"], style }: GmSkeletonProps) => (
  <div className="gm-skeleton" role="status" aria-label="内容加载中" style={style}>
    {Array.from({ length: rows }, (_, i) => (
      <i key={i} style={{ width: widths[i % widths.length] }} />
    ))}
  </div>
);
export default GmSkeleton;
