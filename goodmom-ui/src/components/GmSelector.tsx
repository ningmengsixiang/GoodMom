import React from "react";

/**
 * GmSelector —— 选择卡（规范 11 · 11.6.4）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmSelectorItem）/ value / multiple，
 * 事件 change（(value: string[])）。视觉（chip 56 高、选中玫瑰渐变 + 深字 + 勾徽）
 * 由 CSS 提供，本文件无色值。
 *
 * 语义与交互：
 * 1. 单选：容器 `role="radiogroup"`，每项 `role="radio"` + `aria-checked`；
 *    多选：容器 `role="group"`，每项 `role="checkbox"` + `aria-checked`。
 * 2. 项是真 button：键盘 Tab + Enter/Space 可操作；disabled 走原生 disabled。
 * 3. 单选 value 取数组首项；多选 toggle 增删；变更派发完整数组。
 * 4. 勾徽是装饰性 SVG（aria-hidden），只在选中项渲染。
 */
export interface GmSelectorItem {
  key: string;
  label: string;
  desc?: string;
  disabled?: boolean;
}
export interface GmSelectorProps {
  items: GmSelectorItem[];
  /** 已选 key 数组（单选取首项），默认 [] */
  value?: string[];
  /** 多选，默认 false */
  multiple?: boolean;
  onChange?: (value: string[]) => void;
}

const GmSelector = ({ items, value = [], multiple = false, onChange }: GmSelectorProps) => {
  const singleKey = value.length > 0 ? value[0] : "";

  const isSelected = (key: string) => (multiple ? value.includes(key) : singleKey === key);

  const handleSelect = (item: GmSelectorItem) => {
    if (item.disabled) return;
    if (multiple) {
      const next = value.includes(item.key)
        ? value.filter((key) => key !== item.key)
        : value.concat(item.key);
      onChange?.(next);
    } else {
      onChange?.([item.key]);
    }
  };

  return (
    <div
      className={"gm-selector" + (multiple ? " is-multiple" : "")}
      role={multiple ? "group" : "radiogroup"}
      aria-label="选择器"
    >
      {items.map((item) => {
        const selected = isSelected(item.key);
        return (
          <button
            key={item.key}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            className={
              "gm-selector__item" +
              (selected ? " is-active" : "") +
              (item.disabled ? " is-disabled" : "")
            }
            aria-checked={selected}
            disabled={item.disabled}
            onClick={() => handleSelect(item)}
          >
            <span className="gm-selector__label">{item.label}</span>
            {item.desc ? <span className="gm-selector__desc">{item.desc}</span> : null}
            {selected ? (
              <span className="gm-selector__check" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  <path d="m5 12 5 5 9-10" />
                </svg>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
export default GmSelector;
