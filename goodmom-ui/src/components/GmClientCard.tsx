import React, { ReactNode } from "react";
import GmAvatar from "./GmAvatar";

/**
 * GmClientCard —— 服务对象卡（对应 15.6.1 / 13 档案卡）
 *
 * 契约与 `@goodmom/vue` 的 GmClientCard **逐项一致**（守门：`scripts/check-component-contract.py`）：
 * props 名（name/sub/avatar/tone/tags/extra/ops）、tone 默认 "rose"（此前 React 不透传 →
 * 实际靠 GmAvatar 兜底）、契约类名（.gm-client、.gm-client-main、.gm-client-name、
 * .gm-client-sub、.gm-client-extra、.gm-client-ops）与 DOM 结构两侧相同。
 * 口径变更（V2.10）：**`actions` → `ops`** —— 此前 React 叫 actions、Vue 是 #ops 槽，同名组件两套名字。
 * 渲染模型差异：React 走 props，Vue 侧 props / 同名具名插槽都可（插槽优先），能力等价。
 * 形态：PC 行内排布；≤767px 操作区换行到底部（10 · 10.6，热区 ≥44 由按钮自身保证）。
 */
export interface GmClientCardProps {
  name: string; sub?: string; avatar?: string; tone?: "rose" | "mint" | "purple";
  /** 姓名右侧标签（建议放 GmStatusTag/GmTag）；单个节点或数组都接受 */
  tags?: ReactNode | ReactNode[];
  /** 右侧附加信息（如最后随访时间） */
  extra?: ReactNode;
  /** 操作区（按钮/链接）；单个节点或数组都接受 */
  ops?: ReactNode | ReactNode[];
}
/** 节点实参归一成数组：单个节点、数组、空值都接受（与 Vue 侧同口径） */
function nodesOf(value: ReactNode | ReactNode[]): ReactNode[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === false || value === "" ? [] : [value];
}
const GmClientCard = ({ name, sub, avatar, tone = "rose", tags, extra, ops }: GmClientCardProps) => {
  const tagNodes = nodesOf(tags);
  const opNodes = nodesOf(ops);
  return (
    <div className="gm-client">
      <GmAvatar text={avatar || name} size={46} tone={tone} />
      <div className="gm-client-main">
        <div className="gm-client-name">
          <b>{name}</b>
          {tagNodes.map((t, i) => <React.Fragment key={i}>{t}</React.Fragment>)}
        </div>
        {sub && <div className="gm-client-sub">{sub}</div>}
      </div>
      {extra && <div className="gm-client-extra">{extra}</div>}
      {opNodes.length > 0 && (
        <div className="gm-client-ops">
          {opNodes.map((a, i) => <React.Fragment key={i}>{a}</React.Fragment>)}
        </div>
      )}
    </div>
  );
};
export default GmClientCard;
