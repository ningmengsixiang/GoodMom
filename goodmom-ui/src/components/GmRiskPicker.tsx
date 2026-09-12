import React from "react";
import { FIVE_COLOR, FIVE_VAR, GmFive } from "../tokens/status";

/** GmRiskPicker —— 妊娠风险五色单选（对应 02.10 / 15.2.10）
 *  可访问性（D 审查 P0-2）：radiogroup 语义 + 键盘方向键/Home/End 切换，焦点可见 */
export interface GmRiskPickerProps {
  value?: GmFive; onChange?: (v: GmFive) => void; disabled?: boolean;
}
const LABEL: Record<GmFive, string> = { m1: "绿 · 低风险", m2: "黄 · 一般风险", m3: "橙 · 较高风险", m4: "红 · 高风险", m5: "紫 · 合并传染病" };
const ORDER: GmFive[] = ["m1", "m2", "m3", "m4", "m5"];

const GmRiskPicker = ({ value, onChange, disabled }: GmRiskPickerProps) => {
  /* P1-12：原实现手拼 "var(--mmh-m5-" + k + ",…)"，因为 React 侧没有 FIVE_VAR 常量
     （Vue 有、React 无 —— 两个库的 Token 引用能力不对等）。现统一走 FIVE_VAR。 */
  const cssColor = (k: GmFive) => `var(${FIVE_VAR[k]},${FIVE_COLOR[k]})`; /* 业务侧可覆盖 */
  const select = (k: GmFive) => { if (!disabled && onChange) onChange(k); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    if (!target || target.tagName !== "BUTTON") return;
    const btns = Array.prototype.slice.call(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]')
    ) as HTMLButtonElement[];
    const i = btns.indexOf(target as HTMLButtonElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = btns.length - 1;
    else return;
    e.preventDefault();
    if (next < 0 || next >= btns.length) return;
    if (onChange) onChange(ORDER[next]);
    btns[next].focus();
  };

  return (
    <div className="gm-risk" role="radiogroup" aria-label="妊娠风险等级" onKeyDown={onKeyDown}>
      {ORDER.map((k) => (
        <button
          type="button"
          role="radio"
          key={k}
          className={"gm-risk-it" + (value === k ? " on" : "")}
          style={{ color: cssColor(k), borderColor: cssColor(k), cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
          aria-checked={value === k}
          /* P1-11：roving tabindex 必须在"无选中"时也有一个可聚焦项，
             否则 Tab 完全进不来（旧实现 value 为 undefined 时全部 -1）。
             Story 全部传了受控 value，所以这个漏洞一直没被测出来。 */
          tabIndex={disabled ? -1 : value === undefined ? (k === ORDER[0] ? 0 : -1) : value === k ? 0 : -1}
          disabled={disabled}
          onClick={() => select(k)}
        >
          <i style={{ background: cssColor(k) }} />{LABEL[k]}
        </button>
      ))}
    </div>
  );
};
export default GmRiskPicker;
