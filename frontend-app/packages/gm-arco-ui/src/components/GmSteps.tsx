import React from "react";

/** GmSteps —— 步骤条（自包含样式；对应 08 · 8.2.2 Steps） */
export interface GmStepItem { title: string; description?: string; status?: "wait" | "process" | "finish" | "error" }
export interface GmStepsProps { items: GmStepItem[]; current?: number; size?: "default" | "small" }
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 13l5 5L20 7"/></svg>';

/**
 * 语义契约（P1-11）：`<ol>` + `<li>` 有序列表 + 当前步 `aria-current="step"`。
 *
 * 历史缺陷：React 版用 `<div>` 堆叠，`grep -rn "aria-current|<ol|<li" goodmom-ui/src/`
 * **0 命中** —— 读屏拿不到"共几步 / 现在第几步"。而 Vue 版（GmSteps.vue）一直有
 * `<ol>` + `:aria-current`，于是 CHANGELOG 声称"无障碍契约在 Vue 版逐条保持"，
 * 实际是"Vue 已达标、React 未达标"，两包却对外都叫 @goodmom/* 的同名组件。
 */
const GmSteps = ({ items, current = 0, size = "default" }: GmStepsProps) => {
  const get = (i: number): GmStepItem["status"] => items[i].status || (i < current ? "finish" : i === current ? "process" : "wait");
  return (
    <ol className={"gm-steps" + (size === "small" ? " sm" : "")}>
      {items.map((it, i) => {
        const st = get(i);
        return (
          <li
            className={"gm-step " + st}
            key={i}
            aria-current={i === current ? "step" : undefined}
          >
            <div
              className="gs-dot"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: st === "finish" ? CHECK : st === "error" ? "!" : String(i + 1) }}
            />
            <div className="gs-main"><b>{it.title}</b>{it.description && <span>{it.description}</span>}</div>
          </li>
        );
      })}
    </ol>
  );
};
export default GmSteps;
