import React from "react";

/**
 * GmTabBar —— 移动端底部标签栏（规范 10 · 10.3.2）
 *
 * 与 `@goodmom/vue` 同契约：items / value / safeArea，事件 `change`（React
 * `onChange` ↔ Vue `emit("change", key)`）。3–5 项；项高 56、标签 10px、激活项
 * 玫瑰渐变胶囊 + 上浮 4px 全部由组件 CSS 提供。
 *
 * 无障碍：
 * 1. 根节点 `role="tablist"` + `aria-label="底部导航"`，每项 `role="tab"` +
 *    `aria-selected`，激活态同时挂状态类供 CSS 使用。
 * 2. roving tabindex：只有激活项可 Tab 进入（无匹配时第一项兜底），方向键在
 *    标签间移动焦点并同步切换，Home / End 跳首尾 —— 键盘用户不必逐项 Tab。
 * 3. `safeArea` 默认 true，只挂状态类，底部安全区距离由 CSS 用环境变量处理。
 */
export interface GmTabBarItem {
  key: string;
  label: string;
  /** 角标：数字或短文案；空字符串 / 0 不渲染 */
  badge?: string | number;
}
export interface GmTabBarProps {
  items: GmTabBarItem[];
  /** 当前激活项 key，默认 "" */
  value?: string;
  /** 底部安全区，默认 true */
  safeArea?: boolean;
  onChange?: (key: string) => void;
}

const GmTabBar = ({ items, value = "", safeArea = true, onChange }: GmTabBarProps) => {
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
    <nav className={"gm-tabbar" + (safeArea ? " is-safe" : "")} role="tablist" aria-label="底部导航">
      {items.map((it, i) => {
        const selected = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            className={"gm-tabbar__item" + (selected ? " is-active" : "")}
            aria-selected={selected}
            tabIndex={selected || (!hasActive && i === 0) ? 0 : -1}
            data-key={it.key}
            onClick={() => onChange?.(it.key)}
            onKeyDown={handleKeyDown}
          >
            <span className="gm-tabbar__label">{it.label}</span>
            {it.badge ? <span className="gm-tabbar__badge">{it.badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
};
export default GmTabBar;
