/**
 * 筛选芯片（单选 · 10.6.1 / Part 23）
 *
 * 为什么抽出来：archive / followup / vaccine 三个模块都要"一组筛选 chip"，
 * 各写一遍必然出现"这页热区 36、那页 44，这页选中是亮粉底白字"的漂移。
 * 热区 ≥44、选中态用品牌亮粉 + **深字**（D9）、键盘 ←/→ 可切换 —— 一次写对。
 */
import React from "react";

export interface FilterChipsProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div className="gm-chips" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            className={on ? "gm-chip is-on" : "gm-chip"}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
