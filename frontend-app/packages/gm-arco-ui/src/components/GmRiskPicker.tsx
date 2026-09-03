import React from "react";
import { FIVE_COLOR, GmFive } from "../tokens/status";

/** GmRiskPicker —— 妊娠风险五色单选（对应 02.10 / 15.2.10） */
export interface GmRiskPickerProps {
  value?: GmFive; onChange?: (v: GmFive) => void; disabled?: boolean;
}
const LABEL: Record<GmFive, string> = { m1: "绿 · 低风险", m2: "黄 · 一般风险", m3: "橙 · 较高风险", m4: "红 · 高风险", m5: "紫 · 合并传染病" };
const ORDER: GmFive[] = ["m1", "m2", "m3", "m4", "m5"];

const GmRiskPicker = ({ value, onChange, disabled }: GmRiskPickerProps) => (
  <div className="gm-risk">
    {ORDER.map((k) => (
      <span
        key={k}
        className={"gm-risk-it" + (value === k ? " on" : "")}
        style={{ color: FIVE_COLOR[k], borderColor: FIVE_COLOR[k], cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1 }}
        onClick={() => !disabled && onChange && onChange(k)}
      >
        <i style={{ background: FIVE_COLOR[k] }} />{LABEL[k]}
      </span>
    ))}
  </div>
);
export default GmRiskPicker;
