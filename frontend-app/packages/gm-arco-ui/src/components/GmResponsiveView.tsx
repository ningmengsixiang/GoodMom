import React, { useEffect, useRef, useState } from "react";
import GmEmpty from "./GmEmpty";
import GmSpin from "./GmSpin";

/** GmResponsiveView —— 响应式适配容器（规范 10 · 10.11.1）
 *  按「容器宽度」而非视口判断形态：ResizeObserver 观测根 div；不支持时回落 window.resize + innerWidth。
 *  SSR 首帧用 breakpoints.condensed 乐观值（先按 table 渲染），useEffect 后校正，避免闪错。
 *  mode !== "auto" 时锁定形态且不做观测。
 *  硬性约定：同一时刻只渲染一个分支（不做 CSS 双渲染后隐藏）；页面持有的排序/筛选/分页状态在页面层，
 *  切换形态不重置。视觉全部由 class 提供（统一写入 theme.css），组件内不出现任何色值。
 */
export type GmResponsiveMode = "auto" | "table" | "condensed" | "card";
export type GmResolvedMode = "table" | "condensed" | "card";

export interface GmResponsiveViewProps<T = unknown> {
  data: T[];
  /** 默认 "auto"：按容器宽度自动解析形态 */
  mode?: GmResponsiveMode;
  /** 阈值，默认 { condensed: 1024, card: 767 } */
  breakpoints?: { condensed: number; card: number };
  /** ≥ condensed 时渲染 */
  table: (rows: T[]) => React.ReactNode;
  /** card < 宽度 < condensed 时渲染；未提供则回落 table */
  condensed?: (rows: T[]) => React.ReactNode;
  /** ≤ card 时渲染 */
  card: (rows: T[]) => React.ReactNode;
  /** 加载中：用 GmSpin 渲染 gm-rv__loading */
  loading?: boolean;
  /** data 为空时渲染；包在 gm-rv__empty（默认 GmEmpty「暂无数据」） */
  empty?: React.ReactNode;
  /** 形态变化回调（含首次解析结果） */
  onModeChange?: (mode: GmResolvedMode) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_BP = { condensed: 1024, card: 767 };

function resolveMode(width: number, condensed: number, card: number): GmResolvedMode {
  if (width >= condensed) return "table";
  if (width > card) return "condensed";
  return "card";
}

const GmResponsiveView = <T,>({
  data,
  mode = "auto",
  breakpoints,
  table,
  condensed,
  card,
  loading = false,
  empty,
  onModeChange,
  className,
  style,
}: GmResponsiveViewProps<T>): React.ReactElement => {
  const bpCondensed = breakpoints && breakpoints.condensed !== undefined ? breakpoints.condensed : DEFAULT_BP.condensed;
  const bpCard = breakpoints && breakpoints.card !== undefined ? breakpoints.card : DEFAULT_BP.card;

  const rootRef = useRef<HTMLDivElement | null>(null);
  /* SSR / 首帧乐观值：先按 condensed 解析为 table，effect 后校正 */
  const [width, setWidth] = useState<number>(bpCondensed);

  useEffect(() => {
    if (mode !== "auto") return;
    if (typeof window === "undefined") return;
    const el = rootRef.current;
    const hasRO = typeof ResizeObserver !== "undefined";
    const measure = () => {
      if (!hasRO) {
        setWidth(window.innerWidth);
        return;
      }
      if (el) setWidth(el.getBoundingClientRect().width);
    };
    measure();
    if (!hasRO) {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    /* P1-12：回调里**同步**改样式会触发新一轮尺寸变化 →
       "ResizeObserver loop completed with undelivered notifications"（Chrome 抛错）。
       Vue 版 (GmResponsiveView.vue) 已用 rAF 规避并留了注释，React 版却重演了同一个错误。
       这里对齐 Vue：把测量结果推迟到下一帧提交。 */
    let raf = 0;
    const measureAsync = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { raf = 0; measure(); });
    };
    const ro = new ResizeObserver(measureAsync);
    if (el) ro.observe(el);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, bpCondensed, bpCard]);

  const resolved: GmResolvedMode = mode === "auto" ? resolveMode(width, bpCondensed, bpCard) : mode;

  const lastModeRef = useRef<GmResolvedMode | null>(null);
  useEffect(() => {
    if (lastModeRef.current === resolved) return;
    lastModeRef.current = resolved;
    if (onModeChange) onModeChange(resolved);
  }, [resolved, onModeChange]);

  const rows = data || [];
  const emptyNode = empty === undefined || empty === null ? <GmEmpty title="暂无数据" /> : empty;

  /* 只渲染一个分支：不做 CSS 双渲染后隐藏 */
  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="gm-rv__loading">
        <GmSpin />
      </div>
    );
  } else if (rows.length === 0) {
    body = <div className="gm-rv__empty">{emptyNode}</div>;
  } else if (resolved === "card") {
    body = card(rows);
  } else if (resolved === "condensed") {
    body = condensed ? condensed(rows) : table(rows);
  } else {
    body = table(rows);
  }

  const cls = ["gm-rv", "gm-rv--" + resolved, className || ""].filter(Boolean).join(" ");

  return (
    <div ref={rootRef} className={cls} data-mode={resolved} style={style}>
      {body}
    </div>
  );
};

export default GmResponsiveView;
