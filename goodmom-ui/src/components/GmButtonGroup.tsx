import React, { useCallback, useEffect, useRef } from "react";

/**
 * GmButtonGroup —— 按钮组（对应 03 · 3.2.7）
 *
 * 三种形态：
 *  - `attached`（默认）兄弟按钮相连：首左 / 末右保留外圆角，中间直角共享边；
 *  - `round`    同上但两端全圆角（胶囊组）；
 *  - `segmented` 分段控件：组内**有且只有一个**选中项。
 *
 * ## 语义与键盘（与 Vue 版一致）
 *
 * | shape | role | 子项要求 | 键盘 |
 * | --- | --- | --- | --- |
 * | attached / round | `group` | 普通 `<GmButton>` | 各自 Tab 可达 |
 * | segmented | `radiogroup` | `<GmButton role="radio" aria-checked>` | ←/→/Home/End 移动并激活，roving tabindex |
 *
 * 分段控件用 **radio 语义**而不是 toggle 语义：它的本质是"多选一"，
 * 读屏需要播报"第 2 项，共 4 项，已选中"。这也与 `GmRiskPicker` 的既有做法一致。
 *
 * 开发期自检（不静默通过）：`segmented` 必须给 `ariaLabel`，且组内必须恰好有一个
 * `aria-checked="true"` —— 这两条都是在生产环境最难发现、且只影响读屏用户的缺陷。
 */
export type GmButtonGroupShape = "attached" | "round" | "segmented";

export interface GmButtonGroupProps {
  children?: React.ReactNode;
  /** 形态，默认 attached */
  shape?: GmButtonGroupShape;
  /** 组的可访问名（segmented 必填） */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const GmButtonGroup = ({
  children,
  shape = "attached",
  ariaLabel,
  className,
  style,
}: GmButtonGroupProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const segmented = shape === "segmented";

  /* 开发期自检放在 effect 里：渲染期 ref 尚未挂载，统计不到子项。 */
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !segmented) return;
    if (!ariaLabel) {
      console.warn("[@goodmom/ui] GmButtonGroup(segmented)：必须传 ariaLabel —— 读屏需要知道这是哪个分段组。");
    }
    const root = rootRef.current;
    if (!root) return;
    const checked = root.querySelectorAll('[role="radio"][aria-checked="true"]').length;
    if (checked !== 1) {
      console.warn(
        `[@goodmom/ui] GmButtonGroup(segmented)：组内 aria-checked="true" 的项应为 1 个，实际 ${checked} 个。`
      );
    }
  }, [segmented, ariaLabel, children]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!segmented) return;
      const root = e.currentTarget;
      const items = Array.prototype.slice.call(
        root.querySelectorAll<HTMLElement>('[role="radio"]')
      ) as HTMLElement[];
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i < 0 ? 0 : (i + 1) % items.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i <= 0 ? items.length - 1 : i - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;
      e.preventDefault();
      const el = items[next];
      el.focus();
      /* 移动焦点同时激活（原生 radio 组的既有心智模型）；选中态仍由消费方受控 */
      el.click();
    },
    [segmented]
  );

  const classes = ["gm-btn-group", shape !== "attached" && `gm-btn-group--${shape}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      role={segmented ? "radiogroup" : "group"}
      aria-label={ariaLabel}
      className={classes}
      style={style}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};

export default GmButtonGroup;
