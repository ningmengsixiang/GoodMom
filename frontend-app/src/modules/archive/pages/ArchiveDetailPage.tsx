/**
 * 健康档案 · 详情（模块参考实现）
 *
 * 演示：路由参数（`/archive/:id`）→ 详情数据；GmClientCard 承载对象身份；
 * 字段用「键 caption + 值 body」两列版式（08 · 8.2.11 描述列表口径）。
 */
import React from "react";
import { GmButton, GmCard, GmClientCard, GmStatusTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import SectionCard from "@/shared/components/SectionCard";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { gestWeek, monthAge } from "@/shared/utils/format";
import { navigate } from "@/shared/router";
import type { Client } from "@/shared/domain/types";

export default function ArchiveDetailPage({ id }: { id: string }) {
  const toast = useAppToast();
  const state = useRequest<Client[]>(`/archive/clients#${id}`, { path: "/archive/clients" });
  const client = (state.data ?? []).find((c) => c.id === id);

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <GmButton type="text" size="small" onClick={() => navigate("/archive")}>← 返回档案列表</GmButton>
      </div>
      <PageState
        state={{ ...state, empty: !state.loading && !state.error && !client }}
        skeletonRows={3}
        emptyTitle="档案不存在或已迁出"
        emptyDesc="请从档案列表重新进入"
      >
        {() =>
          client ? (
            <>
              <GmClientCard
                name={`${client.name} · ${client.kind === "pregnant" ? gestWeek(client.stage.week, client.stage.day) : monthAge(client.stage.month)}`}
                sub={`档案号 ${client.archiveNo} · 管理医生 ${client.manager ?? "—"}`}
                tags={<GmStatusTag five={client.risk}>{client.status}</GmStatusTag>}
                actions={
                  <GmButton type="primary" size="small" onClick={() => toast("已创建随访任务", "success")}>
                    发起随访
                  </GmButton>
                }
              />
              <div style={{ height: 16 }} />
              <SectionCard title="基本信息" desc="键 caption + 值 body（08 · 8.2.11）">
                <GmCard>
                  <Desc k="姓名" v={client.name} />
                  <Desc k="档案号" v={client.archiveNo} />
                  <Desc k="阶段" v={client.kind === "pregnant" ? gestWeek(client.stage.week, client.stage.day) : monthAge(client.stage.month)} />
                  <Desc k="管理医生" v={client.manager ?? "—"} />
                </GmCard>
              </SectionCard>
            </>
          ) : null
        }
      </PageState>
    </>
  );
}

function Desc({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>{k}</span>
      <span style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
    </div>
  );
}
