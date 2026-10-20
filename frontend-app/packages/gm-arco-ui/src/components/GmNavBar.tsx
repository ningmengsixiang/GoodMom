import React from "react";

/**
 * GmNavBar —— 移动端顶部导航（规范 10 · 10.3.1）
 *
 * 与 `@goodmom/vue` 同契约：title / back / backLabel / scrolled / sticky 五个 prop，
 * 事件 `back`（React `onBack` ↔ Vue `emit("back")`）。DOM 与类名由契约固定，
 * 视觉（48 高、返回钮 44×44 圆形热区、标题 18/600 单行省略）全部写在组件 CSS 里，
 * 本文件不出现任何色值与尺寸样式。
 *
 * 交互约定：
 * 1. `scrolled` 由页面控制（滚动 120px 后置 true），组件只挂状态类，不自己监听滚动。
 * 2. `sticky` 默认 true → 吸顶交给 CSS 的 `position:sticky`。
 * 3. 返回钮是图标按钮，必须带可访问名（缺省「返回」），方便读屏与自动化定位。
 */
export interface GmNavBarProps {
  /** 标题，单行省略；默认 "" */
  title?: string;
  /** 是否显示返回钮，默认 false */
  back?: boolean;
  /** 返回钮可访问名，默认 "返回" */
  backLabel?: string;
  /** 滚动态：页面在滚动 120px 后置 true，默认 false */
  scrolled?: boolean;
  /** 吸顶，默认 true */
  sticky?: boolean;
  onBack?: () => void;
}

const GmNavBar = ({
  title = "",
  back = false,
  backLabel = "返回",
  scrolled = false,
  sticky = true,
  onBack,
}: GmNavBarProps) => (
  <header className={"gm-navbar" + (scrolled ? " is-scrolled" : "") + (sticky ? " is-sticky" : "")}>
    {back ? (
      <button type="button" className="gm-navbar__back" aria-label={backLabel} onClick={onBack}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
    ) : null}
    <h1 className="gm-navbar__title">{title}</h1>
  </header>
);
export default GmNavBar;
