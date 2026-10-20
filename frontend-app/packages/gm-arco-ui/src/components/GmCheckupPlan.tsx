import React from "react";

/**
 * GmCheckupPlan —— 产检计划卡（规范 13 · 13.3.2）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmCheckupItem），事件 item（(key)）。
 * 竖版时间线：周数徽章 + 项目 + 日期 + 状态；整行是 button，可键盘操作。
 * 状态色只走 `data-tone`（neutral/positive/attention/risk/info/special），
 * 状态文字始终由调用方传入，不靠颜色单独传达异常。视觉由组件 CSS 提供，无色值。
 */
type GmTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmCheckupItem {
  key: string;
  week: number;
  title: string;
  date: string;
  status: string;
  tone?: GmTone;
}
export interface GmCheckupPlanProps {
  items: GmCheckupItem[];
  onItem?: (key: string) => void;
}

const GmCheckupPlan = ({ items, onItem }: GmCheckupPlanProps) => (
  <div className="gm-checkup">
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        className="gm-checkup__item"
        data-tone={item.tone ?? "neutral"}
        onClick={() => onItem?.(item.key)}
      >
        <span className="gm-checkup__week">{item.week} 周</span>
        <span className="gm-checkup__main">
          <span className="gm-checkup__title">{item.title}</span>
          <span className="gm-checkup__date">{item.date}</span>
        </span>
        <span className="gm-checkup__status">{item.status}</span>
      </button>
    ))}
  </div>
);
export default GmCheckupPlan;
