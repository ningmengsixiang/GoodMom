import React from "react";
import { Progress } from "@arco-design/web-react";

/**
 * GmProgress —— 进度条（规范 08 · 8.2.5 / 04 · 4.3）
 *
 * ## 本轮完善（V2.9「状态与加载」深化）
 *
 * **API 与 Vue 版对齐**：此前 React 只有 `percent/type/positive/text`，Vue 已有
 * `danger/size/diameter/valueText` —— 同名组件两个包两套 prop（P1-12 那类分歧）。
 * 本轮 React 直接采用 **Vue 的命名**（而不是另造 `status`/`thin-thick` 等新名），
 * 并给两侧同时补同一批新能力，避免又分叉出一套。
 *
 * 1. **高度回到 08 · 8.2.5 原文**：规范是「默认 6，细 3，粗 10」；两库此前分别是
 *    Arco 默认与 `4/8/12` —— 均不符，现统一 3/6/10。
 * 2. **轨道与圆头**：规范「轨道 rgba(58,52,84,.08) 圆角胶囊、圆头端点」，此前直接用
 *    Arco 默认轨道。现由 `.gm-progress--*` 覆写（见 theme.css），暗色档自动翻白。
 * 3. **语义色成体系**：规范「成功绿 / 危险红按语义」。原 `positive` 只覆盖薄荷，
 *    没有 warning；现补 `status` 四值并**一律走 `--lg-sem-*` alias**（原实现取
 *    `DesignTokens` primitive，绕过 02 · 2.1.5 的分层，也不随暗色档切换）。
 *    `positive` / `danger` 保留兼容，`status` 优先级更高。
 * 4. **`indeterminate`（不确定时长）**：EL-19-02 三态里只有"已知百分比"的进度条，
 *    结果条数未知等真实场景没有表达方式。补滑动条形态（只用 transform，符合 07 红线），
 *    且**不报 aria-valuenow** —— 未知进度报具体数值等于给读屏一个假数据。
 * 5. **无障碍**：`role="progressbar"` + `aria-valuemin/max/now` + `aria-label`；
 *    100% 时补 `aria-valuetext="已完成"`。
 * 6. **100% 一次白扫光**：规范「达到 100% 一次白扫光提示」—— 原实现没有，现按 `.is-done` 加。
 */
export interface GmProgressProps {
  /** 进度百分比 0–100（超界夹紧）；`indeterminate` 时可省略 */
  percent?: number;
  type?: "line" | "circle";
  /** 语义色；优先级高于 positive/danger */
  status?: "normal" | "success" | "warning" | "danger";
  /** @deprecated 兼容旧用法：正向/达标（薄荷） */
  positive?: boolean;
  /** @deprecated 兼容旧用法：超限/风险（珊瑚） */
  danger?: boolean;
  /** 是否显示百分比文字 */
  text?: boolean;
  /** 尺寸档（线性=高度 3/6/10，环形=直径） */
  size?: "small" | "default" | "large";
  /** 环形直径 px，默认按 size 推导 */
  diameter?: number;
  /** 读屏朗读文本，如「已完成 3/5 项」；强烈建议传 */
  valueText?: string;
  /** 不确定时长（未知进度）—— 滑动条形态，不报具体数值 */
  indeterminate?: boolean;
  /** 无 valueText 时的读屏名称 */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/** 语义 alias（02 · 2.1.5：语义承载走 alias，暗色档自动换浅档） */
const FILL: Record<string, string> = {
  normal: "linear-gradient(90deg,var(--mmh-rose-300,#FFC4D6),var(--mmh-rose-500,#F77FA3))",
  success: "var(--lg-sem-positive)",
  warning: "var(--lg-sem-attention)",
  danger: "var(--lg-sem-risk)",
};

const RING = { small: 56, default: 72, large: 96 } as const;

const GmProgress = ({
  percent = 0,
  type = "line",
  status,
  positive,
  danger,
  text = false,
  size = "default",
  diameter,
  valueText,
  indeterminate = false,
  ariaLabel,
  style,
}: GmProgressProps) => {
  const tone = status ?? (danger ? "danger" : positive ? "success" : "normal");
  const fill = FILL[tone] ?? FILL.normal;
  const pct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const done = !indeterminate && pct >= 100;

  if (indeterminate) {
    return (
      <div
        className={`gm-progress gm-progress--indet gm-progress--${size}`}
        role="progressbar"
        aria-label={ariaLabel || valueText || "加载中"}
        aria-valuetext="加载中"
        style={style}
      >
        <i style={{ background: fill }} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Progress
      className={`gm-progress gm-progress--${size} gm-progress--${tone}${done ? " is-done" : ""}`}
      percent={pct}
      type={type}
      size={type === "circle" ? diameter ?? RING[size] : undefined}
      showText={text || type === "circle"}
      color={fill}
      style={style}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText || (done ? "已完成" : `${pct}%`)}
    />
  );
};
export default GmProgress;
