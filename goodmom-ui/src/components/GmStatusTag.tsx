import React from "react";
import Tag from "@arco-design/web-react/es/Tag";
import { FIVE_COLOR, GmFive, GmSemantic, SEMANTIC_COLOR } from "../tokens/status";

/**
 * GmStatusTag —— 状态标签（六语义 + 孕产妇五色 + 业务字典）
 * 对应规范：14 · 4.4.5（六语义）、15.2（业务状态文案）、15.2.10 / 02.10（五色）
 * 视觉：色点 + 文字（颜色+文字双通道）；传 hex 由 Arco Tag color 支持自定义色。
 */
export interface GmStatusTagProps {
  children: React.ReactNode;
  /** 六语义之一 */
  semantic?: GmSemantic;
  /** 孕产妇五色之一（与 semantic 二选一） */
  five?: GmFive;
  /** 显式覆盖颜色 */
  color?: string;
  size?: "small" | "default" | "large";
  closable?: boolean;
}

const GmStatusTag = ({ children, semantic, five, color, size = "small", closable }: GmStatusTagProps) => {
  const c = color || (five ? FIVE_COLOR[five] : semantic ? SEMANTIC_COLOR[semantic] : "#757e8e");
  return (
    <Tag color={c} size={size} closable={closable}>
      <span className="gm-status-dot" style={{ background: c }} aria-hidden="true" />
      {children}
    </Tag>
  );
};
export default GmStatusTag;
