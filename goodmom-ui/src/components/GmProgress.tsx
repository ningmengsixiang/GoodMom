import React from "react";
import { Progress } from "@arco-design/web-react";
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
    color={positive ? "#4FB59C" : { "0%": "#FFA3BE", "100%": "#E85D8F" }}
    style={style}
  />
);
export default GmProgress;
