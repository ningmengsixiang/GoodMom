import React from "react";

/**
 * GmCapsuleTabs —— 胶囊标签页（规范 11 · 11.6.3）
 *
 * 与 `@goodmom/vue` 同契约：items（命名 interface GmCapsuleTabItem）/ value，
 * 事件 change（(key)）。视觉（激活白玻璃胶囊 + 玫瑰描边 + 上浮 2px）由 CSS 提供，
 * 本文件无色值。
 *
 * 无障碍：
 * 1. 容器 `role="tablist"`，项 `role="tab"` + `aria-selected`；激活态另挂状态类供 CSS 使用。
 * 2. roving tabindex：只有激活项可 Tab 进入（无匹配时第一项兜底）；
 *    ← / → / Home / End 移动焦点并同步切换。横滑滚动由 CSS 负责。
 */
export interface GmCapsuleTabItem {
  key: string;
  label: string;
  /** 角标：数字或短文案；空字符串 / 0 不渲染 */
  badge?: string | number;
}
export interface GmCapsuleTabsProps {
  items: GmCapsuleTabItem[];
  /** 当前激活项 key，默认 "" */
  value?: string;
  onChange?: (key: string) => void;
}

const GmCapsuleTabs = ({ items, value = "", onChange }: GmCapsuleTabsProps) => {
  const hasActive = items.some((it) => it.key === value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") {
      return;
    }
    const tabs = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    );
    if (tabs.length === 0) return;
    const idx = tabs.indexOf(e.currentTarget);
    const next =
      e.key === "ArrowLeft"
        ? (idx - 1 + tabs.length) % tabs.length
        : e.key === "ArrowRight"
          ? (idx + 1) % tabs.length
          : e.key === "Home"
            ? 0
            : tabs.length - 1;
    e.preventDefault();
    const target = tabs[next];
    target.focus();
    const key = target.getAttribute("data-key");
    if (key !== null && key !== value) onChange?.(key);
  };

  return (
    <div className="gm-capsule-tabs" role="tablist" aria-label="标签页">
      {items.map((it, i) => {
        const selected = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            className={"gm-capsule-tabs__item" + (selected ? " is-active" : "")}
            aria-selected={selected}
            tabIndex={selected || (!hasActive && i === 0) ? 0 : -1}
            data-key={it.key}
            onClick={() => onChange?.(it.key)}
            onKeyDown={handleKeyDown}
          >
            <span className="gm-capsule-tabs__label">{it.label}</span>
            {it.badge ? <span className="gm-capsule-tabs__badge">{it.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
};
export default GmCapsuleTabs;
