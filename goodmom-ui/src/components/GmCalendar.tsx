import React from "react";

/**
 * GmCalendar —— 月历（规范 11 · 11.6.5）
 *
 * 与 `@goodmom/vue` 同契约：value（YYYY-MM-DD）/ month（YYYY-MM）/ events（日期串），
 * 事件 change / monthChange。类名与三种状态类（is-today / is-active / has-event）由契约固定，
 * 视觉（日期 36 芯片 + ≥44 热区、事件点）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. 周日到周六表头；月视图由 month 推导（空则取 value 所在月，再空取当月），
 *    左右箭头切月并派发 monthChange(YYYY-MM)。
 * 2. 点日期派发 change(YYYY-MM-DD)；value 命中日期挂 is-active，今天挂 is-today。
 * 3. events 是日期串集合，命中的格子挂 has-event（事件点由 CSS 绘制）。
 * 4. 日期格是真 button，键盘可 Tab + Enter 选择；补位空格 aria-hidden 不参与读屏。
 */
export interface GmCalendarProps {
  /** 选中日期 YYYY-MM-DD，默认 "" */
  value?: string;
  /** 展示月份 YYYY-MM，默认 ""（空则取 value 所在月或当月） */
  month?: string;
  /** 有事件的日期串集合，默认 [] */
  events?: string[];
  onChange?: (date: string) => void;
  onMonthChange?: (month: string) => void;
}

const GmCalendar = ({
  value = "",
  month = "",
  events = [],
  onChange,
  onMonthChange,
}: GmCalendarProps) => {
  const [view, setView] = React.useState<string>(() => month || monthOf(value) || currentMonth());

  /* month / value 变化时跟随（切月是内部状态，不会因 props 未变而被重置） */
  React.useEffect(() => {
    const next = month || monthOf(value);
    if (next) setView(next);
  }, [month, value]);

  const [year, mon] = parseMonth(view);
  const today = todayKey();
  const eventSet = React.useMemo(() => new Set(events), [events]);

  const cells: Array<number | null> = [];
  const firstWeekday = new Date(year, mon - 1, 1).getDay();
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  const daysInMonth = new Date(year, mon, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (delta: number) => {
    const next = shiftMonth(view, delta);
    setView(next);
    onMonthChange?.(next);
  };

  return (
    <div className="gm-calendar">
      <div className="gm-calendar__head">
        <button type="button" className="gm-calendar__nav" aria-label="上个月" onClick={() => shift(-1)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <span className="gm-calendar__title">
          {year} 年 {mon} 月
        </span>
        <button type="button" className="gm-calendar__nav" aria-label="下个月" onClick={() => shift(1)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="gm-calendar__week">
        {WEEK_LABELS.map((label) => (
          <span key={label} aria-hidden="true">
            {label}
          </span>
        ))}
      </div>
      <div className="gm-calendar__grid">
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={"pad-" + i} className="gm-calendar__day is-empty" aria-hidden="true" />;
          }
          const date = formatDate(year, mon, day);
          const active = value === date;
          const isToday = date === today;
          return (
            <button
              key={date}
              type="button"
              className={
                "gm-calendar__day" +
                (active ? " is-active" : "") +
                (isToday ? " is-today" : "") +
                (eventSet.has(date) ? " has-event" : "")
              }
              aria-pressed={active}
              aria-current={isToday ? "date" : undefined}
              aria-label={date}
              onClick={() => onChange?.(date)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default GmCalendar;

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function currentMonth(): string {
  const d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}

function todayKey(): string {
  const d = new Date();
  return currentMonth() + "-" + pad2(d.getDate());
}

/** 从 YYYY-MM-DD 取 YYYY-MM；非法值返回 "" */
function monthOf(value: string): string {
  return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : "";
}

function parseMonth(month: string): [number, number] {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1];
  }
  return [Number(m[1]), Number(m[2])];
}

function formatDate(year: number, mon: number, day: number): string {
  return year + "-" + pad2(mon) + "-" + pad2(day);
}

function shiftMonth(month: string, delta: number): string {
  const [year, mon] = parseMonth(month);
  const d = new Date(year, mon - 1 + delta, 1);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}
