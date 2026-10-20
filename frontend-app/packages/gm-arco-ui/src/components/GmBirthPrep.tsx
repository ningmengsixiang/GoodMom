import React from "react";

/**
 * GmBirthPrep —— 分娩准备 / 产后待处理清单（00 #88）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmBirthPrepItem），
 * 事件 toggle（(key, next)）。视觉（22 勾选钮、44 热区、done 删除线）由组件 CSS
 * 提供，本文件无色值。
 *
 * 行为：
 * 1. 用原生 `<input type="checkbox">` + label 包裹：天然支持键盘 Space、读屏
 *    checked 状态、点击整行切换，不需要伪造 aria-checked。
 * 2. done 行挂 is-done 状态类与 data-done，note 作为次要说明；≤3 行不折叠。
 * 3. 切换派发 toggle(key, next)，是否受控由父级决定。
 */
export interface GmBirthPrepItem {
  key: string;
  label: string;
  done?: boolean;
  note?: string;
}
export interface GmBirthPrepProps {
  items: GmBirthPrepItem[];
  onToggle?: (key: string, next: boolean) => void;
}

const GmBirthPrep = ({ items, onToggle }: GmBirthPrepProps) => (
  <div className="gm-birthprep">
    {items.map((item) => (
      <label
        key={item.key}
        className={"gm-birthprep__item" + (item.done ? " is-done" : "")}
        data-done={item.done ? "true" : undefined}
      >
        <input
          type="checkbox"
          className="gm-birthprep__check"
          checked={!!item.done}
          onChange={(e) => onToggle?.(item.key, e.target.checked)}
        />
        <span className="gm-birthprep__label">{item.label}</span>
        {item.note ? <span className="gm-birthprep__note">{item.note}</span> : null}
      </label>
    ))}
  </div>
);
export default GmBirthPrep;
