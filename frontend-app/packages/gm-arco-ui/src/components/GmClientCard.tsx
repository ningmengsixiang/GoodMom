import React, { ReactNode } from "react";
import GmAvatar from "./GmAvatar";

/**
 * GmClientCard —— 服务对象卡（对应 15.6.1 / 13 档案卡）
 * 结构：头像 + 名称 + 组合标签 + 摘要 + 操作区（PC 行内 / 移动底部操作栏由页面决定）
 */
export interface GmClientCardProps {
  name: string; sub?: string; avatar?: string; tone?: "rose" | "mint" | "purple";
  tags?: ReactNode | ReactNode[]; extra?: ReactNode; actions?: ReactNode[];
}
const GmClientCard = ({ name, sub, avatar, tone, tags = [], extra, actions = [] }: GmClientCardProps) => (
  <div className="gm-client">
    <GmAvatar text={avatar || name} size={46} tone={tone} />
    <div className="gm-client-main">
      <div className="gm-client-name">
        <b>{name}</b>
        {Array.isArray(tags) ? tags.map((t, i) => <React.Fragment key={i}>{t}</React.Fragment>) : tags}
      </div>
      {sub && <div className="gm-client-sub">{sub}</div>}
    </div>
    {extra && <div className="gm-client-extra">{extra}</div>}
    {actions.length > 0 && <div className="gm-client-ops">{actions.map((a, i) => <React.Fragment key={i}>{a}</React.Fragment>)}</div>}
  </div>
);
export default GmClientCard;
