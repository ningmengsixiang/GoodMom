import React from "react";

/**
 * GmSearchBar —— 移动端搜索框（规范 11 · 11.2.1）
 *
 * 与 `@goodmom/vue` 同契约：value / placeholder / cancelText / showCancel / disabled，
 * 事件 `change` / `search` / `cancel`（React `onChange` / `onSearch` / `onCancel`）。
 *
 * 交互与无障碍：
 * 1. 根节点 `<form role="search">`，回车提交走 `search`（preventDefault，不刷新页面）。
 * 2. 输入 16px 由 CSS 钉死 —— 小于 16px 时 iOS 聚焦会自动放大页面。
 * 3. 清空键视觉 ≤24 但热区 44（CSS 扩展），`aria-label="清空"`；清空后焦点送回输入框，
 *    避免按钮消失后焦点掉到 body。
 * 4. 取消键 44 热区，仅在 showCancel 时出现；input 的 `disabled` 同步到清空键。
 */
export interface GmSearchBarProps {
  /** 受控值，默认 "" */
  value?: string;
  /** 占位文案，默认 "搜索" */
  placeholder?: string;
  /** 取消文案，默认 "取消" */
  cancelText?: string;
  /** 是否显示取消键，默认 false */
  showCancel?: boolean;
  /** 禁用输入，默认 false */
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onCancel?: () => void;
}

const GmSearchBar = ({
  value = "",
  placeholder = "搜索",
  cancelText = "取消",
  showCancel = false,
  disabled = false,
  onChange,
  onSearch,
  onCancel,
}: GmSearchBarProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <form
      className="gm-searchbar"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.(value);
      }}
    >
      <span className="gm-searchbar__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.4 16.4 3.6 3.6" />
        </svg>
      </span>
      <input
        ref={inputRef}
        className="gm-searchbar__input"
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="gm-searchbar__clear"
          aria-label="清空"
          disabled={disabled}
          onClick={handleClear}
        >
          ×
        </button>
      ) : null}
      {showCancel ? (
        <button type="button" className="gm-searchbar__cancel" onClick={onCancel}>
          {cancelText}
        </button>
      ) : null}
    </form>
  );
};
export default GmSearchBar;
