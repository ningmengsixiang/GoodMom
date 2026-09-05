import React from "react";
import { Progress } from "@arco-design/web-react";
import { DesignTokens } from "../tokens/design";
/** GmProgress —— 进度条（品牌色/薄荷正向，对应 08 · 8.2.5） */
export interface GmProgressProps {
  percent: number; type?: "line" | "circle"; positive?: boolean; text?: boolean;
  style?: React.CSSProperties;
}
const GmProgress = ({ percent, type = "line", positive, text = false, style }: GmProgressProps) => (
  <Progress
    percent={percent}
    type={type}
    showText={text}
    color={positive ? DesignTokens.mint["600"] : { "0%": DesignTokens.rose["400"], "100%": DesignTokens.rose["600"] }}
    style={style}
  />
);
export default GmProgress;
