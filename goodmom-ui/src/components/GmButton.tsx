import React, { forwardRef } from "react";

/**
 * GmButton —— 按钮（对应 03 · 3.2 / 3.2.4 类型色 / 3.2.5 图标组合 / 07 · 7.3.1 四态）
 *
 * ## 双库契约（03 · 3.2.10）
 *
 * 本组件与 `@goodmom/vue` 的 `<GmButton>` **同契约**：同名 props、同默认值、
 * 同 className、同 ARIA、同 DOM 结构。两者共用同一份 CSS
 * （`theme.css` ↔ `components.css` 的 `.gm-btn--*` 段逐字节一致，
 * 由 `scripts/check-style-parity.py` 守门），props/默认值由
 * `scripts/check-component-contract.py` 比对。
 *
 * 历史缺陷（勿回退）：React 版曾只是 Arco `<Button>` 的薄包装 —— 输出
 * `.arco-btn-*` 类、默认 `type` 落到 Arco 的 default、没有 `status`/`size`/`shape`/
 * `long`/`ariaLabel`/`nativeType` 归一化、loading 无 `aria-busy`。于是同名组件在
 * 两个库里**默认外观相反**（React 中性方角 vs Vue 粉色胶囊）；更麻烦的是两套类名
 * 交集为空 —— 双库样式比对永远比不到按钮一眼，漂移可以无限积累而门禁全绿。
 *
 * 需要 Arco 原生能力时请直接用 `import { ArcoButton } from "@goodmom/ui"`。
 */
export type GmButtonType = "primary" | "secondary" | "outline" | "dashed" | "text" | "default";
export type GmButtonStatus = "default" | "success" | "warning" | "danger";
export type GmButtonSize = "mini" | "small" | "default" | "large";
export type GmButtonShape = "round" | "circle" | "square";

export interface GmButtonProps {
  children?: React.ReactNode;
  /** 视觉类型，默认 primary */
  type?: GmButtonType;
  /** 语义状态色，默认 default（仅 status 相关类型着色） */
  status?: GmButtonStatus;
  /** 尺寸档，默认 default */
  size?: GmButtonSize;
  /** 形状：round 圆角 / circle 正圆（仅图标）/ square 小圆角 */
  shape?: GmButtonShape;
  /** 全宽（表单主操作、移动端底部按钮） */
  long?: boolean;
  /** 禁用（原生 disabled，键盘不可聚焦） */
  disabled?: boolean;
  /** 加载中：显示指示器、禁用点击、读屏播报 busy、**保留原宽度** */
  loading?: boolean;
  /** 原生 type，默认 button（避免在 form 内意外提交） */
  nativeType?: "button" | "submit" | "reset";
  /** 仅图标按钮的可访问名（无文字时必须传，否则读屏只念"按钮"） */
  ariaLabel?: string;
  /** 前置图标（16px 槽位） */
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const cx = (...xs: Array<string | false | undefined>) => xs.filter(Boolean).join(" ");

const GmButton = forwardRef<HTMLButtonElement, GmButtonProps>(
  (
    {
      children,
      type = "primary",
      status = "default",
      size = "default",
      shape = "round",
      long = false,
      disabled = false,
      loading = false,
      nativeType = "button",
      ariaLabel,
      icon,
      className,
      style,
      onClick,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const iconOnly = React.Children.count(children) === 0;

    /* 03 · 3.2.10：仅图标按钮**必须**有可访问名。开发期显式告警而不是静默通过 ——
       只靠图标无法被读屏识别，这是最容易漏、又最难在生产环境发现的一类缺陷。 */
    if (process.env.NODE_ENV !== "production" && iconOnly && !ariaLabel) {
      console.warn("[@goodmom/ui] GmButton：无文字内容时必须传 ariaLabel（仅图标按钮的可访问名）。");
    }

    const classes = cx(
      "gm-btn",
      `gm-btn--${type}`,
      status !== "default" && `gm-btn--${status}`,
      /* 尺寸类用 --sz-* 前缀：避免与 type="default" 的 .gm-btn--default 同名互相覆盖 */
      `gm-btn--sz-${size}`,
      shape === "circle" && "gm-btn--circle",
      shape === "square" && "gm-btn--square",
      long && "gm-btn--long",
      isDisabled && "gm-btn--disabled",
      loading && "gm-btn--loading",
      iconOnly && "gm-btn--icon-only",
      className
    );

    const handleClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      onClick?.(ev);
    };

    return (
      <button
        ref={ref}
        type={nativeType}
        className={classes}
        style={style}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        onClick={handleClick}
      >
        {/* 加载中：指示器替换前置图标位（文案仍在，宽度由内容撑开，避免布局跳动） */}
        {loading ? (
          <span className="gm-btn__spinner" aria-hidden="true" />
        ) : icon ? (
          <span className="gm-btn__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);
GmButton.displayName = "GmButton";
export default GmButton;
