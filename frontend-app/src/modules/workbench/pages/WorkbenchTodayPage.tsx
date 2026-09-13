/**
 * 医护工作台 · 今日待办（模块参考实现）
 *
 * 演示的架构要点：
 *  · 数据经 `useRequest` + `PageState` 走完四态（骨架/空/错/有数据），页面不写加载逻辑；
 *  · 状态一律 `<GmStatusTag>`，颜色由 15 章词库查得，页面零色值；
 *  · 列表在 ≤767 用行卡片（10.5.3 降级），不做横向压缩表格；
 *  · 反馈走 `useAppToast()`（全应用唯一 Toast 实例）。
 */
import React from "react";
import { GmButton, GmCard, GmProgress, GmStatusTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import ListRow from "@/shared/components/ListRow";
import SectionCard from "@/shared/components/SectionCard";
import { useAppToast } from "@/shared/feedback";
import { useRequest } from "@/shared/api/useRequest";
import { semanticOf } from "@/shared/domain/status";
import { dueText, num } from "@/shared/utils/format";
import { navigate } from "@/shared/router";
import { STATUS } from "../model";

interface Task {
  id: string; clientId: string; clientName: string; title: string;
  status: string; dueAt: string; channel?: string;
}
interface Today { pending: number; overdue: number; done: number; tasks: Task[] }

export default function WorkbenchTodayPage() {
  const toast = useAppToast();
  const state = useRequest<Today>("/workbench/today", { path: "/workbench/today" },
    (d) => !d || (d.tasks ?? []).length === 0);

  return (
    <>
      <SectionCard title="今日概览" desc="实时同步 · 只读聚合">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {state.data ? (
            <>
              <Kpi label="待处理" value={state.data.pending} tone="var(--lg-sem-attention,#B9771C)" />
              <Kpi label="已逾期" value={state.data.overdue} tone="var(--lg-sem-risk,#B72F42)" />
            </>
          ) : (
            <>
              <Kpi label="待处理" value={0} tone="var(--lg-sem-attention,#B9771C)" loading />
              <Kpi label="已逾期" value={0} tone="var(--lg-sem-risk,#B72F42)" loading />
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard title="今日待办" desc="风险优先 · 逾期置顶">
        <PageState
          state={state}
          skeletonRows={4}
          emptyTitle="今天没有待办"
          emptyDesc="已完成的任务会保留在随访队列里"
          emptyAction={{ text: "去随访队列", onClick: () => navigate("/followup") }}
        >
          {(d) => (
            <>
              {d.tasks.map((t) => (
                <ListRow
                  key={t.id}
                  title={t.title}
                  desc={`${t.clientName} · ${dueText(t.dueAt)}${t.channel ? ` · ${t.channel}` : ""}`}
                  trailing={<GmStatusTag semantic={STATUS[t.status] ?? semanticOf(t.status)}>{t.status}</GmStatusTag>}
                  onClick={() => { navigate(`/archive/${t.clientId}`); }}
                />
              ))}
              <div style={{ marginTop: 14 }}>
                <GmButton type="primary" long onClick={() => toast("已进入批量随访模式（示例）", "success")}>
                  开始批量随访
                </GmButton>
              </div>
            </>
          )}
        </PageState>
      </SectionCard>

      <SectionCard title="本周完成率" desc="示例数据 · 单图单卡">
        <GmCard>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <b style={{ fontSize: 28, fontWeight: 700 }} className="num">68%</b>
            <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>高危随访闭环</span>
          </div>
          <GmProgress percent={68} status="warning" text valueText="高危随访闭环 68%" />
        </GmCard>
      </SectionCard>
    </>
  );
}

/** KPI 卡：玻璃配方来自组件库 GmCard，页面只放数字（19.7 禁内联配方） */
function Kpi({ label, value, tone, loading }: { label: string; value: number; tone: string; loading?: boolean }) {
  return (
    <GmCard>
      <div style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)", marginBottom: 6 }}>{label}</div>
      <div
        className="num"
        style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, color: loading ? "var(--lg-text-tertiary,#5E6673)" : tone }}
      >
        {loading ? "—" : num(value)}
      </div>
    </GmCard>
  );
}
