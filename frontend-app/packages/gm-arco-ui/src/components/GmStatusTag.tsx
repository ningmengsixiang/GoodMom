import React from "react";
import { GmFive, GmSemantic, SEMANTIC_LABEL, SEMANTIC_VAR, FIVE_COLOR, FIVE_VAR } from "../tokens/status";

/**
 * GmStatusTag —— 状态标签（六语义 + 孕产妇五色）
 * 对应规范：14 · 4.4.5（六语义）、15.2（业务状态文案）、15.2.10 / 02.10（五色）
 *
 * ## 视觉契约（P1-1 / P1-2 / P1-12，与 Vue 版 `<GmStatusTag>` **完全一致**）
 *
 * 「浅底 + 加深档文字 + 色点」三通道：
 *   color: var(--lg-sem-x) ｜ background: color-mix(… 13% …) ｜ 色点同色。
 *
 * 历史缺陷（勿回退）：
 *  · React 版曾用 `<Tag color={hex}>`：Arco 对自定义色的处理是**实底 + 白字**
 *    （`colorStyle.backgroundColor = color` + `.arco-tag-custom-color{color:var(--color-white)}`）。
 *    六项里 5 项"白字压实底"只有 3.67–4.38:1，不达 AA；而 Vue 版是 13% 淡底 + 语义字，
 *    于是**同名组件在两库里视觉不可互换**。
 *  · 取色曾读 `SEMANTIC_COLOR` 里的**静态浅色 hex**，暗色模式下不切换
 *    （变量对、组件错、门禁绿、报告 ✅ 同时成立）。现改为引用 CSS 变量。
 *
 * 需要"实底 + 白字"形态时请显式使用 `SEMANTIC_SOLID`（D5 达标档），
 * 不要再让 Arco 用自定义色自行铺底。
 */
export interface GmStatusTagProps {
  children: React.ReactNode;
  /** 六语义之一 */
  semantic?: GmSemantic;
  /** 孕产妇五色之一（与 semantic 二选一） */
  five?: GmFive;
  /** 显式覆盖颜色（hex 或 CSS 变量表达式）；传入后不再走语义通道 */
  color?: string;
  size?: "small" | "default" | "large";
  closable?: boolean;
}

const TINT_PCT = 13;
const BORDER_PCT = 32;

const GmStatusTag = ({ children, semantic = "neutral", five, color, size = "small", closable }: GmStatusTagProps) => {
  /* 取色优先级：显式 color > 五色 > 语义。
     语义/五色走 CSS 变量（可随暗色档与业务覆盖切换），显式 color 则原样使用。 */
  const base = color
    ? color
    : five
      ? `var(${FIVE_VAR[five]},${FIVE_COLOR[five]})`
      : `var(${SEMANTIC_VAR[semantic]})`;

  const style: React.CSSProperties = {
    color: base,
    background: `color-mix(in srgb, ${base} ${TINT_PCT}%, transparent)`,
    borderColor: `color-mix(in srgb, ${base} ${BORDER_PCT}%, transparent)`,
  };

  const sizeCls = size === "large" ? " lg" : "";
  /* 「颜色 + 文字」双通道（WCAG 1.4.1）：色点旁始终有文字；
     色点自身 aria-hidden，语义名通过 sr-only 供给读屏（颜色之外的第二通道）。 */
  const srLabel = color || five ? "" : SEMANTIC_LABEL[semantic];

  return (
    <span
      className={"gm-tag gm-status-tag" + sizeCls}
      style={style}
      data-semantic={color || five ? undefined : semantic}
    >
      <span className="gm-status-dot" style={{ background: base }} aria-hidden="true" />
      {srLabel && <span className="gm-sr-only">{srLabel}：</span>}
      {children}
      {closable && (
        <button type="button" className="gm-status-tag__close" aria-label="移除">
          ✕
        </button>
      )}
    </span>
  );
};
export default GmStatusTag;
