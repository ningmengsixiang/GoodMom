import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/** GmVirtualList —— 虚拟长列表（规范 10 · 10.11.2）
 *  固定行高窗口计算：只渲染窗口内 + overscan 项，gm-vlist__inner 撑满总高并用 translateY 偏移。
 *  语义与键盘：viewport 为 role="list" + aria-label + tabIndex=0；每项 role="listitem" +
 *  aria-posinset / aria-setsize；PageDown/PageUp 翻一屏、Home/End 到首尾（直接赋值 scrollTop）。
 *  onEndReached 只在跨过阈值时触发一次（ref 记录状态，回滚后再次到底可再触发）。
 *  视觉全部由 class 提供（will-change: transform 由 CSS 给出），组件内不出现任何色值。
 *
 *  ## 双库契约（P1-12）
 *  React 用 `renderItem` / `stickyTop`（render prop），Vue 用默认插槽 / `sticky` 插槽 ——
 *  同一能力的两种宿主惯用写法，能力等价（sticky 都是"给了才渲染 gm-vlist__sticky"）。
 *  `onEndReached` 两侧都是 **prop**（不是事件）。实例方法 `scrollToIndex(index)` 两侧同名同签名：
 *  React 用 forwardRef + useImperativeHandle 暴露，Vue 用 defineExpose。
 */
export interface GmVirtualListProps<T = unknown> {
  items: T[];
  /** 固定行高 px（暂不支持动态高：异步测量/图片撑高场景请改用分页或定高卡片） */
  itemHeight: number;
  /** 视口高 px */
  height: number;
  /** 上下额外渲染项数，默认 4 */
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey?: (item: T, index: number) => React.Key;
  /** 距底 endThreshold 项时触发一次 */
  onEndReached?: () => void;
  /** 默认 4 */
  endThreshold?: number;
  /** 可选吸顶（gm-vlist__sticky） */
  stickyTop?: React.ReactNode;
  /** 默认 "长列表" */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** 实例方法：与 Vue 版 `defineExpose({ scrollToIndex })` 逐项同形 */
export interface GmVirtualListHandle {
  /** 滚到指定下标（定位到某条记录用）；越界自动夹到 [0, maxScroll] */
  scrollToIndex: (index: number) => void;
}

const GmVirtualListInner = <T,>(
  {
    items,
    itemHeight,
    height,
    overscan = 4,
    renderItem,
    itemKey,
    onEndReached,
    endThreshold = 4,
    stickyTop,
    ariaLabel = "长列表",
    className,
    style,
  }: GmVirtualListProps<T>,
  ref: React.Ref<GmVirtualListHandle>
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endFiredRef = useRef(false);

  const total = items.length;
  const totalHeight = total * itemHeight;
  const maxScroll = Math.max(0, totalHeight - height);

  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const windowCount = Math.ceil(height / itemHeight) + overscan * 2;
  const end = Math.min(total, start + windowCount);
  const visible = items.slice(start, end);

  const syncEndReached = (st: number) => {
    if (!onEndReached) return;
    const remaining = total - Math.ceil((st + height) / itemHeight);
    if (remaining <= endThreshold) {
      if (!endFiredRef.current) {
        endFiredRef.current = true;
        onEndReached();
      }
    } else {
      endFiredRef.current = false;
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop;
    setScrollTop(st);
    syncEndReached(st);
  };

  /* 视口高度变化时重算一次触底状态 */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    syncEndReached(el.scrollTop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, height, endThreshold]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    const page = height * 0.9;
    let next = -1;
    if (e.key === "PageDown") next = el.scrollTop + page;
    else if (e.key === "PageUp") next = el.scrollTop - page;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = totalHeight;
    else if (e.key === "ArrowDown") next = el.scrollTop + itemHeight;
    else if (e.key === "ArrowUp") next = el.scrollTop - itemHeight;
    else return;
    e.preventDefault();
    const clamped = Math.max(0, Math.min(next, maxScroll));
    el.scrollTop = clamped;
    setScrollTop(clamped);
    syncEndReached(clamped);
  };

  /* 实例方法：与 Vue 侧 `defineExpose({ scrollToIndex })` 同名、同签名、同语义 ——
     目标位置 = index * itemHeight 夹到 [0, maxScroll]，直接赋值 scrollTop 并同步窗口起点。
     浏览器随后会派发 scroll 事件，走 onScroll 重算窗口与触底判定（与 Vue 侧同一路径）。
     不给依赖数组：每次渲染都用最新的 itemHeight / maxScroll 重建句柄，避免闭包取到旧值。 */
  useImperativeHandle(ref, () => ({
    scrollToIndex(index: number) {
      const el = viewportRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(index * itemHeight, maxScroll));
      el.scrollTop = target;
      setScrollTop(target);
    },
  }));

  const cls = ["gm-vlist", className || ""].filter(Boolean).join(" ");

  return (
    <div className={cls} style={style}>
      {stickyTop !== undefined && stickyTop !== null ? <div className="gm-vlist__sticky">{stickyTop}</div> : null}
      <div
        className="gm-vlist__viewport"
        ref={viewportRef}
        role="list"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{ height }}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        <div
          className="gm-vlist__inner"
          style={{ height: totalHeight, transform: "translateY(" + start * itemHeight + "px)" }}
        >
          {visible.map((item, i) => {
            const index = start + i;
            return (
              <div
                className="gm-vlist__item"
                key={itemKey ? itemKey(item, index) : index}
                role="listitem"
                aria-posinset={index + 1}
                aria-setsize={total}
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* forwardRef 包装：具名导出保持泛型调用签名（`<GmVirtualList<Row> … />` 仍可推导），
   同时把 `GmVirtualListHandle` 暴露到 ref 上 —— 与 Vue 的 defineExpose 对齐。 */
const GmVirtualList = forwardRef(GmVirtualListInner) as <T>(
  props: GmVirtualListProps<T> & React.RefAttributes<GmVirtualListHandle>
) => React.ReactElement;

export default GmVirtualList;
