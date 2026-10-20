import React from "react";

/**
 * GmSticky —— 吸顶容器（规范 11 · 11.6.8）
 *
 * 与 `@goodmom/vue` 同契约：top / zIndex，事件 stuck（(stuck:boolean)），内容 children。
 * 贴顶定位与阴影由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 内层是真正的 sticky 元素（CSS `position:sticky` + 内联 top/zIndex）。
 * 2. 外层放一个 1px 哨兵（margin 负值抵消占位），IntersectionObserver 观察它：
 *    哨兵滚出视口上沿（`boundingClientRect.top < top`）即判定吸顶，挂 is-stuck。
 * 3. 吸顶状态变化才派发一次 stuck；环境无 IO 时静默降级（不挂状态、不发事件）。
 */
export interface GmStickyProps {
  /** 吸顶距离 px，默认 0 */
  top?: number;
  /** 层级，默认 10 */
  zIndex?: number;
  onStuck?: (stuck: boolean) => void;
  children?: React.ReactNode;
}

const GmSticky = ({
  top = 0,
  zIndex = 10,
  onStuck,
  children,
}: GmStickyProps) => {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = React.useState(false);
  const stuckRef = React.useRef(false);
  const onStuckRef = React.useRef(onStuck);

  React.useEffect(() => {
    onStuckRef.current = onStuck;
  }, [onStuck]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      const next = entry.boundingClientRect.top < top;
      if (next === stuckRef.current) return;
      stuckRef.current = next;
      setStuck(next);
      onStuckRef.current?.(next);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [top]);

  return (
    <div className={"gm-sticky" + (stuck ? " is-stuck" : "")} style={{ zIndex }}>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, marginBottom: -1 }} />
      <div className="gm-sticky__inner" style={{ top }}>
        {children}
      </div>
    </div>
  );
};
export default GmSticky;
