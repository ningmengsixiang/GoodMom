import React from "react";

/**
 * GmRecordFlow —— 记录流（规范 13 · 13.3.7：胎动/体重/宫高/喂养/睡眠/尿布）
 *
 * 与 `@goodmom/vue` 同契约：kind / logs（命名 interface GmRecordLog），
 * 事件 add（(kind)）与 item（(key)）。视觉（标题行、56 快捷记录圆钮、时间轴行）
 * 由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 列表按 time 倒序渲染（同一时间保持原顺序）；每行是 button，点击派发 item(key)。
 * 2. 快捷记录大圆钮派发 add(kind)，带可访问名；空列表显示「暂无记录」。
 * 3. 图标随 kind 变化，纯装饰（aria-hidden）；数值单位单独弱化，tabular-nums 由 CSS 给。
 */
type GmRecordKind = "fetal" | "weight" | "fundal" | "feed" | "sleep" | "diaper";

export interface GmRecordLog {
  key: string;
  time: string;
  value: string;
  unit?: string;
  note?: string;
}
export interface GmRecordFlowProps {
  /** 记录类型，默认 "feed" */
  kind?: GmRecordKind;
  /** 记录列表，默认 [] */
  logs?: GmRecordLog[];
  onAdd?: (kind: string) => void;
  onItem?: (key: string) => void;
}

const GmRecordFlow = ({
  kind = "feed",
  logs = [],
  onAdd,
  onItem,
}: GmRecordFlowProps) => {
  const sorted = logs.slice().sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0));

  return (
    <section className="gm-recordflow" data-kind={kind}>
      <div className="gm-recordflow__head">
        <h3 className="gm-recordflow__title">{KIND_TITLE[kind]}</h3>
        <button
          type="button"
          className="gm-recordflow__add"
          aria-label={"新增" + KIND_TITLE[kind]}
          onClick={() => onAdd?.(kind)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <div className="gm-recordflow__list">
        {sorted.length === 0 ? (
          <p className="gm-recordflow__note">暂无记录</p>
        ) : (
          sorted.map((log) => (
            <button
              key={log.key}
              type="button"
              className="gm-recordflow__item"
              onClick={() => onItem?.(log.key)}
            >
              <span className="gm-recordflow__icon" aria-hidden="true">
                {KIND_ICON[kind]}
              </span>
              <span className="gm-recordflow__time">{log.time}</span>
              <span className="gm-recordflow__value">
                {log.value}
                {log.unit ? <small>{log.unit}</small> : null}
              </span>
              {log.note ? <span className="gm-recordflow__note">{log.note}</span> : null}
            </button>
          ))
        )}
      </div>
    </section>
  );
};
export default GmRecordFlow;

const KIND_TITLE: Record<GmRecordKind, string> = {
  fetal: "胎动记录",
  weight: "体重记录",
  fundal: "宫高记录",
  feed: "喂养记录",
  sleep: "睡眠记录",
  diaper: "尿布记录",
};

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  focusable: false,
};

const KIND_ICON: Record<GmRecordKind, React.ReactNode> = {
  fetal: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="M3 12h4l2-5 3 10 2-5h5" />
    </svg>
  ),
  weight: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M8 5V4h8v1M9 10a3 3 0 0 1 6 0l-1.5 4h-3L9 10Z" />
    </svg>
  ),
  fundal: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
    </svg>
  ),
  feed: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="M9 3h6v3l2 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l2-4V3Z" />
      <path d="M7.5 13h9M9 3h6" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  ),
  diaper: (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="M12 3c4 3.5 6 7.5 6 12l-6 6-6-6c0-4.5 2-8.5 6-12Z" />
    </svg>
  ),
};
