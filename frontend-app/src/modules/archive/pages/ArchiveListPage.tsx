/**
 * 健康档案 · 列表（模块参考实现）
 *
 * 演示 10.5.3「表格 → 卡片列表」的降级口径：
 *   ≥1024 玻璃表格（03 · 3.7）· ≤1023 行卡片（同一份数据，两种形态）
 *   降级由断点统一决定，页面不得自定阈值；排序/筛选状态由页面持有，切形态不丢。
 */
import React, { useMemo, useState } from "react";
import { GmStatusTag, GmButton } from "@goodmom/gm-arco-ui";
import { Table } from "@arco-design/web-react";
import PageState from "@/shared/components/PageState";
import ListRow from "@/shared/components/ListRow";
import SectionCard from "@/shared/components/SectionCard";
import FilterChips from "@/shared/components/FilterChips";
import { useRequest } from "@/shared/api/useRequest";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { MQ } from "@/shared/constants/breakpoints";
import { gestWeek, monthAge } from "@/shared/utils/format";
import { navigate } from "@/shared/router";
import type { Client } from "@/shared/domain/types";

const FILTERS = ["全部", "管理中", "高危", "已建档"] as const;

export default function ArchiveListPage() {
  const isDesktop = useMediaQuery(MQ.desktop);
  const [filter, setFilter] = useState<string>("全部");
  const state = useRequest<Client[]>("/archive/clients", { path: "/archive/clients" },
    (d) => !d || d.length === 0);

  const rows = useMemo(() => {
    const list = state.data ?? [];
    if (filter === "全部") return list;
    return list.filter((c) => c.status === filter || (filter === "高危" && c.risk === "m4"));
  }, [state.data, filter]);

  return (
    <SectionCard
      title="服务对象"
      desc={isDesktop ? "玻璃表格 · 可排序" : "行卡片 · 上滑加载更多"}
      extra={<GmButton type="primary" size="small" onClick={() => navigate("/archive/a1")}>新建档案</GmButton>}
    >
      <FilterChips label="档案筛选" options={FILTERS} value={filter} onChange={setFilter} />

      <PageState
        state={{ ...state, data: rows, empty: !state.loading && !state.error && rows.length === 0 }}
        skeletonRows={4}
        emptyTitle="没有符合条件的档案"
        emptyDesc="换个筛选条件，或新建一份档案"
      >
        {(list) =>
          isDesktop ? (
            <Table
              data={list}
              rowKey="id"
              pagination={false}
              columns={[
                { title: "姓名", dataIndex: "name" },
                { title: "档案号", dataIndex: "archiveNo" },
                { title: "阶段", render: (_: unknown, r: Client) => r.kind === "pregnant" ? gestWeek(r.stage.week, r.stage.day) : monthAge(r.stage.month) },
                { title: "状态", render: (_: unknown, r: Client) => <GmStatusTag>{r.status}</GmStatusTag> },
                { title: "管理医生", dataIndex: "manager" },
              ]}
            />
          ) : (
            list.map((c) => (
              <ListRow
                key={c.id}
                title={c.name}
                desc={`${c.archiveNo} · ${c.kind === "pregnant" ? gestWeek(c.stage.week, c.stage.day) : monthAge(c.stage.month)}`}
                trailing={<GmStatusTag five={c.risk}>{c.status}</GmStatusTag>}
                onClick={() => navigate(`/archive/${c.id}`)}
              />
            ))
          )
        }
      </PageState>
    </SectionCard>
  );
}
