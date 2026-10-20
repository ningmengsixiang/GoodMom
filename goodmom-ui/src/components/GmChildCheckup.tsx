import React from "react";

/**
 * GmChildCheckup —— 儿保体检卡（规范 13 · 13.3.4）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmChildCheckupItem），事件 item（(key)）。
 * 月龄节点轴：徽章 + 标题 + 摘要（身高/体重/头围由调用方拼好）+ 状态；整行是 button。
 * 异常节点只走 `data-tone` + 文案，不以颜色单独传达。视觉由组件 CSS 提供，无色值。
 */
type GmTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmChildCheckupItem {
  key: string;
  monthAge: number;
  date: string;
  status: string;
  tone?: GmTone;
  summary?: string;
}
export interface GmChildCheckupProps {
  items: GmChildCheckupItem[];
  onItem?: (key: string) => void;
}

const GmChildCheckup = ({ items, onItem }: GmChildCheckupProps) => (
  <div className="gm-childcheckup">
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        className="gm-childcheckup__item"
        data-tone={item.tone ?? "neutral"}
        onClick={() => onItem?.(item.key)}
      >
        <span className="gm-childcheckup__badge">{item.monthAge} 月</span>
        <span className="gm-childcheckup__main">
          <span className="gm-childcheckup__title">{item.monthAge} 月龄体检</span>
          <span className="gm-childcheckup__summary">
            {item.summary ? item.summary + " · " + item.date : item.date}
          </span>
        </span>
        <span className="gm-childcheckup__status">{item.status}</span>
      </button>
    ))}
  </div>
);
export default GmChildCheckup;
