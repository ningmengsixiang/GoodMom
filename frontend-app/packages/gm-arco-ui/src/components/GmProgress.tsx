import React from "react";

/**
 * GmProgress —— 进度条（自绘实现，与 Vue 版 `GmProgress.vue` 逐项同构）
 *
 * ## 为什么这一版不再基于 Arco `Progress`（双库收口）
 *
 * 同名组件在两个包里必须是**同一件东西**，而此前 React 渲染的是 `div.arco-progress*`
 * （Arco 自己的 DOM 与类名），Vue 渲染的是 `.gm-progress__track / __fill / __ring*`
 * —— 于是同一份视觉在两库各写一遍：
 *
 * 1. **CSS 无法逐字节比对**：`scripts/check-style-parity.py` 比的是两库同名的 `gm-*`
 *    选择器；React 侧那些规则实际挂在 Arco 的 DOM 上，暗色档只能各自演化。
 * 2. **`diameter` 曾形同不存在**：Arco 的 `size` 是枚举（mini/small/default/large，
 *    且只作用线性条），像素直径只能走 `width`；而"环形直径走 width"只是 React 实现
 *    里的特技，Vue 侧是自绘 SVG，两库的 API 语义从未对齐。
 * 3. **无障碍要看 Arco 的脸色**：`aria-valuenow` 等属性此前靠透传，
 *    `indeterminate`（未知进度**不得**报具体数值）根本没有表达方式。
 *
 * 进度条是纯几何件（一段轨道 + 一个圆弧），不需要第三方基座。现改为自绘：
 * 与 Vue 版**同一份** DOM 层级、类名、内联 style；颜色一律交给 `.gm-progress*`
 * 的 CSS 承载（Token 单源在 `theme.css`，两侧同选择器已逐字节一致），
 * 组件内不再出现任何 hex/rgba —— 换主题与暗色档对两库同时生效。
 *
 * ## props / 默认值 / 无障碍口径（与 Vue 侧同源）
 *
 * - `percent` **必填**（Vue 侧同为必填）：未知总数请用 `indeterminate`（此时传 0）。
 * - `status` 四值优先；`positive` / `danger` 是保留的旧口径（`@deprecated`），
 *   分别映射到 `success` / `danger` —— 与 Vue 同一映射，不再输出旧的
 *   `gm-progress--positive` 类（该选择器在 CSS 里保留，只服务更早的外部代码）。
 * - ARIA：`role="progressbar"` + `aria-valuemin=0` / `aria-valuemax=100` /
 *   `aria-valuenow` + `aria-valuetext`（`valueText` 优先，100% 时缺省「已完成」）；
 *   **`indeterminate` 时不输出 `aria-valuenow`** —— 未知进度报一个具体数值
 *   等于给读屏一个假数据。纯视觉进度条读屏完全读不到，这套属性是硬要求。
 */
export interface GmProgressProps {
  /** 进度百分比 0–100（超界会被夹紧） */
  percent: number;
  type?: "line" | "circle";
  /** @deprecated 兼容旧用法：正向/达标色调（薄荷），等价于 `status="success"` */
  positive?: boolean;
  /** @deprecated 兼容旧用法：超限/风险色调（珊瑚），等价于 `status="danger"` */
  danger?: boolean;
  /** 是否显示百分比文字，默认 false（线性）；环形默认在圆心显示 */
  text?: boolean;
  /** 尺寸档（线性=高度，环形=直径） */
  size?: "small" | "default" | "large";
  /** 环形直径 px，默认按 size 推导 */
  diameter?: number;
  /** 读屏朗读文本，如「已完成 3/5 项」；强烈建议传 */
  valueText?: string;
  /** 语义色四值；优先级高于 positive/danger（与 Vue 侧同一契约） */
  status?: "normal" | "success" | "warning" | "danger";
  /** 不确定时长（未知进度）—— 滑动条形态，不报具体数值 */
  indeterminate?: boolean;
  /** 无 valueText 时的读屏名称 */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/** 尺寸映射（对齐 02.4 与 08 · 8.2.5，与 Vue 侧同一份表） */
/* 08 · 8.2.5 原文高度：默认 6 / 细 3 / 粗 10。原为 4/8/12，与规范不符，已修正。 */
const SIZE_MAP = {
  small: { bar: 3, ring: 56, stroke: 6 },
  default: { bar: 6, ring: 72, stroke: 8 },
  large: { bar: 10, ring: 96, stroke: 10 },
} as const;

const GmProgress = ({
  percent,
  type = "line",
  positive = false,
  danger = false,
  text = false,
  size = "default",
  diameter = undefined,
  valueText = undefined,
  status = undefined,
  indeterminate = false,
  ariaLabel = undefined,
  style,
}: GmProgressProps) => {
  /* 夹紧而不四舍五入：Vue 侧同样是 `Math.max(0, Math.min(100, Number(percent) || 0))`，
     百分比只在**展示**时取整（`Math.round`），aria-valuenow 与填充宽度保留小数，
     否则两侧在小数入参下会渲出不同的 DOM。 */
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));

  /* 语义色：status 优先，旧口径 positive/danger 兜底（与 Vue 同一三元式） */
  const tone = status ?? (danger ? "danger" : positive ? "success" : "normal");
  const toneClass = tone === "normal" ? "" : `gm-progress--${tone}`;
  const isIndet = indeterminate === true;

  const barHeight = SIZE_MAP[size].bar;
  const ringSize = diameter ?? SIZE_MAP[size].ring;
  const stroke = SIZE_MAP[size].stroke;

  const R = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - clamped / 100);

  const showRingText = text || type === "circle";

  if (isIndet) {
    return (
      <div
        className={["gm-progress", "gm-progress--indet", `gm-progress--${size}`].join(" ")}
        role="progressbar"
        aria-label={ariaLabel || valueText || "加载中"}
        aria-valuetext="加载中"
        style={style}
      >
        {/* 未知进度**不报** aria-valuenow：报一个具体数值等于给读屏假数据 */}
        <i aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={[
        "gm-progress",
        /* 环形只带形态类（尺寸由 diameter/size 推出的方形盒子承载），
           档位类只给线性条加 —— 与 Vue 侧同一条件写法 */
        type === "circle" && "gm-progress--circle",
        type === "line" && `gm-progress--${size}`,
        toneClass,
        clamped >= 100 && "is-done",
      ]
        .filter(Boolean)
        .join(" ")}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      aria-valuetext={valueText || (clamped >= 100 ? "已完成" : `${clamped}%`)}
      style={style}
    >
      {type === "line" ? (
        <>
          <div className="gm-progress__track" style={{ height: barHeight + "px" }}>
            <div className="gm-progress__fill" style={{ width: clamped + "%" }} />
          </div>
          {text && <span className="gm-progress__text">{Math.round(clamped)}%</span>}
        </>
      ) : (
        <>
          <span
            className="gm-progress__ring"
            style={{ width: ringSize + "px", height: ringSize + "px" }}
          >
            {/* 自绘 SVG 环：直径=盒子宽高，不需要任何 width 特技 */}
            <svg width={ringSize} height={ringSize}>
              <circle
                className="gm-progress__ring-bg"
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={R}
                strokeWidth={stroke}
              />
              <circle
                className="gm-progress__ring-fill"
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={R}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            {showRingText && (
              <span className="gm-progress__ring-label">{Math.round(clamped)}%</span>
            )}
          </span>
          {text && valueText && <span className="gm-progress__text">{valueText}</span>}
        </>
      )}
    </div>
  );
};
export default GmProgress;
