import React from "react";

/** GmSteps —— 步骤条（自包含样式；对应 08 · 8.2.2 Steps） */
export interface GmStepItem { title: string; description?: string; status?: "wait" | "process" | "finish" | "error" }
export interface GmStepsProps { items: GmStepItem[]; current?: number; size?: "default" | "small" }
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 13l5 5L20 7"/></svg>';

const GmSteps = ({ items, current = 0, size = "default" }: GmStepsProps) => {
  const get = (i: number): GmStepItem["status"] => items[i].status || (i < current ? "finish" : i === current ? "process" : "wait");
  return (
    <div className={"gm-steps" + (size === "small" ? " sm" : "")}>
      {items.map((it, i) => {
        const st = get(i);
        return (
          <div className={"gm-step " + st} key={i}>
            <div className="gs-dot" dangerouslySetInnerHTML={{ __html: st === "finish" ? CHECK : st === "error" ? "!" : String(i + 1) }} />
            <div className="gs-main"><b>{it.title}</b>{it.description && <span>{it.description}</span>}</div>
          </div>
        );
      })}
    </div>
  );
};
export default GmSteps;
