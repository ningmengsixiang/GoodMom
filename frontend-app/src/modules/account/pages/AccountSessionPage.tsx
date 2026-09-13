/**
 * 账号与权限（19.5 · account 模块的边界与契约面）
 *
 * 三块：
 *  ① 当前机构卡 —— 名称/等级取 `@/shared/session`（会话是平台能力，放 shared），
 *     科室取本模块 `/account/session`（`Institution` 契约里没有科室字段，不为展示造字段）；
 *  ② 当前角色 + 角色切换（nurse/doctor/admin）—— 切换后 Toast 说明权限变化；
 *  ③ 权限矩阵 —— 行 = 模块（取 `@/shared/constants/nav` 的 NAV），列 = 护士/医生/管理员，
 *     数据来自 `model.PERMISSION_TABLE`（account 拥有的契约表，页面不自拼）。
 *
 * 无障碍：矩阵是真 `<table>` + 行列表头（`th scope`），单元格"✔ / —"是视觉通道，
 * 读屏另有 `sr-only` 文字（"可访问 / 不可访问"）—— 色与符号都不单独承载信息（19.7.5）。
 * 角色切换用 `FilterChips`（radiogroup + ←/→ 键盘 + 44 热区），不自造分段控件。
 */
import React, { useMemo } from "react";
import { GmCard, GmClientCard, GmTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import SectionCard from "@/shared/components/SectionCard";
import FilterChips from "@/shared/components/FilterChips";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { useAuth } from "@/shared/session";
import { NAV } from "@/shared/constants/nav";
import { endpoints } from "../api";
import {
  PERMISSION_TABLE, ROLES, ROLE_LABEL, permissionRows, type AccountSession,
} from "../model";

/** 表头/单元格共用的排版（只放布局与排版，颜色一律走 Token） */
const TH: React.CSSProperties = { padding: "10px 8px", fontSize: 13, fontWeight: 600, textAlign: "center" };
const TD: React.CSSProperties = {
  padding: "10px 8px", fontSize: 13, textAlign: "center",
  borderTop: "1px solid var(--lg-divider,rgba(58,52,84,.10))",
};

export default function AccountSessionPage() {
  const toast = useAppToast();
  const { role, institution, name, login } = useAuth();
  const state = useRequest<AccountSession>(
    endpoints.account_session,
    { path: endpoints.account_session },
    /* 空态判定对齐接口形状：对象接口看 depts（不是"整体为假"） */
    (d) => !d || d.depts.length === 0
  );
  const rows = useMemo(() => permissionRows(), []);
  const allowed = rows.filter((r) => r.can[role]).length;

  /** 角色切换：唯一的写入口是 shared/session 的 login（页面不直接改会话对象） */
  const switchRole = (label: string) => {
    const next = ROLES.find((r) => ROLE_LABEL[r] === label);
    if (!next || next === role) return;
    login(next);
    const n = NAV.filter((item) => PERMISSION_TABLE[item.module][next]).length;
    toast(`已切换为${ROLE_LABEL[next]}：可访问 ${n} / ${NAV.length} 个模块`, "info");
  };

  return (
    <>
      <SectionCard title="当前机构" desc="名称/等级取会话 · 科室取本模块接口">
        <PageState
          state={state}
          skeletonRows={2}
          emptyTitle="未取到机构科室信息"
          emptyDesc="机构与科室由 account 维护，请稍后重试"
        >
          {(d) => (
            <GmClientCard
              name={institution.name}
              sub={`等级 ${institution.level} · 登录账号 ${name} · 科室 ${d.depts.length} 个`}
              /* 科室与角色是"分类"不是 15.2 业务状态词：用 GmTag 且不指定语义（默认中性），
                 不使用 GmStatusTag —— 后者的语义必须由 15 章词库查表得出（19.3.2）。 */
              tags={d.depts.map((dept) => (
                <GmTag key={dept}>{dept}</GmTag>
              ))}
              extra={<GmTag size="default">{`当前角色 ${ROLE_LABEL[role]}`}</GmTag>}
            />
          )}
        </PageState>
      </SectionCard>

      <SectionCard title="角色切换" desc={`当前角色 ${ROLE_LABEL[role]} · 可访问 ${allowed} / ${rows.length} 个模块`}>
        <GmCard>
          <FilterChips
            label="角色切换"
            options={ROLES.map((r) => ROLE_LABEL[r])}
            value={ROLE_LABEL[role]}
            onChange={switchRole}
          />
          <p style={{ margin: 0, fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>
            权限矩阵是可见性收敛；真正的鉴权在服务端，前端守卫只保证"不该看到的入口不出现"（19.5）。
          </p>
        </GmCard>
      </SectionCard>

      <SectionCard title="权限矩阵" desc="行 = 模块 · 列 = 护士 / 医生 / 管理员">
        <GmCard>
          <table aria-label="权限矩阵：模块与角色" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th scope="col" style={{ ...TH, textAlign: "left" }}>模块</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" style={TH}>
                    {r === role ? `${ROLE_LABEL[r]}（当前）` : ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.module}>
                  <th scope="row" style={{ ...TD, textAlign: "left", fontWeight: 500 }}>{row.label}</th>
                  {ROLES.map((r) => (
                    <td key={r} style={TD}>
                      {/* 双通道：符号给视觉，sr-only 文字给读屏（✔/— 不单独承载语义） */}
                      <span aria-hidden="true">{row.can[r] ? "✔" : "—"}</span>
                      <span className="sr-only">{`${ROLE_LABEL[r]}${row.can[r] ? "可访问" : "不可访问"}`}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </GmCard>
      </SectionCard>
    </>
  );
}
