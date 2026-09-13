/**
 * 随访队列（模块参考实现 · 本模块拥有任务状态机）
 *
 * 排序口径（19.5 / 15.2.10）：风险优先 → 逾期在前 → 到期日升序。
 * 这条排序**只允许在这里实现**：workbench 的"今日待办"是它的只读聚合，
 * admin 侧报表也走同一出口，避免三处各排一次。
 */
import React, { useMemo, useState } from "react";
import { GmButton, GmStatusTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import ListRow from "@/shared/components/ListRow";
import SectionCard from "@/shared/components/SectionCard";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { dueText } from "@/shared/utils/format";
import { navigate } from "@/shared/router";
import type { FollowupTask } from "@/shared/domain/types";
import { STATUS } from "../model";

/** 状态机：本模块独占（其余模块只能读，不能改） */
const ORDER: Record<string, number> = { 已逾期: 0, 即将到期: 1, 待处理: 2, 待随访: 3, 已完成: 9 };

export default function FollowupQueuePage() {
  const toast = useAppToast();
  const [onlyOpen, setOnlyOpen] = useState(true);
  const state = useRequest<FollowupTask[]>("/followup/tasks", { path: "/followup/tasks" },
    (d) => !d || d.length === 0);

  const list = useMemo(() => {
    const all = (state.data ?? []).slice();
    const filtered = onlyOpen ? all.filter((t) => t.status !== "已完成") : all;
    return filtered.sort(
      (a, b) => (ORDER[a.status] ?? 5) - (ORDER[b.status] ?? 5) || a.dueAt.localeCompare(b.dueAt)
    );
  }, [state.data, onlyOpen]);

  return (
    <SectionCard
      title="随访队列"
      desc={`${list.length} 条 · 逾期置顶`}
      extra={
        <GmButton type={onlyOpen ? "primary" : "outline"} size="small" onClick={() => setOnlyOpen((v) => !v)}>
          {onlyOpen ? "仅未结案" : "全部"}
        </GmButton>
      }
    >
      <PageState
        state={{ ...state, data: list, empty: !state.loading && !state.error && list.length === 0 }}
        skeletonRows={5}
        emptyTitle="队列已清空"
        emptyDesc="没有未结案的随访任务，今天可以提前收工"
        emptyAction={{ text: "查看全部", onClick: () => setOnlyOpen(false) }}
      >
        {(rows) => (
          <>
            {rows.map((t) => (
              <ListRow
                key={t.id}
                title={t.title}
                desc={`${t.clientName} · ${dueText(t.dueAt)}${t.channel ? ` · ${t.channel}` : ""}`}
                trailing={<GmStatusTag semantic={STATUS[t.status]}>{t.status}</GmStatusTag>}
                onClick={() => navigate(`/archive/${t.clientId}`)}
              />
            ))}
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <GmButton type="primary" long onClick={() => toast("已按队列顺序开始随访", "success")}>
                开始随访
              </GmButton>
            </div>
          </>
        )}
      </PageState>
    </SectionCard>
  );
}
