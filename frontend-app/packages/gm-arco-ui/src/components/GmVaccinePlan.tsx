import React from "react";

/**
 * GmVaccinePlan —— 疫苗计划卡（规范 13 · 13.3.3）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmVaccineItem），事件 item（(key)）。
 * 按月龄时间线：徽章 + 名称/剂次 + 月龄·日期 + 状态；整行是 button。
 * 状态色只走 `data-tone`；状态文案（未到/可接种/已预约/已完成/延后）由调用方传入，
 * 异常不靠颜色单独传达。视觉由组件 CSS 提供，无色值。
 */
type GmTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmVaccineItem {
  key: string;
  name: string;
  dose: string;
  monthAge: number;
  dueDate: string;
  status: string;
  tone?: GmTone;
}
export interface GmVaccinePlanProps {
  items: GmVaccineItem[];
  onItem?: (key: string) => void;
}

const GmVaccinePlan = ({ items, onItem }: GmVaccinePlanProps) => (
  <div className="gm-vaccine">
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        className="gm-vaccine__item"
        data-tone={item.tone ?? "neutral"}
        onClick={() => onItem?.(item.key)}
      >
        <span className="gm-vaccine__badge">{item.monthAge} 月</span>
        <span className="gm-vaccine__main">
          <span className="gm-vaccine__name">{item.name}</span>
          <span className="gm-vaccine__meta">
            {item.dose} · {item.monthAge} 月龄 · {item.dueDate}
          </span>
        </span>
        <span className="gm-vaccine__status">{item.status}</span>
      </button>
    ))}
  </div>
);
export default GmVaccinePlan;
