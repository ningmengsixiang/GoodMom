/**
 * 疫苗接种（13.3.3 疫苗计划卡 · 双端）
 *
 * 三块，全部照 13.3.3 的原文形态：
 *  ① 到期前 3 天提醒条 —— 13.3.3 原文要求 NoticeBar(M)/Banner(PC)；本工程不自造 NoticeBar
 *     （19.3.3：页面不得自建第二套组件），用 `GmCard` + `GmTag` 承载同一句话。
 *  ② 按月龄时间线 —— 节点 = 疫苗徽章（`lg-icon-vaccine` + 玻璃底，09 章）+ 疫苗名
 *     + 应种月龄 + 状态标签。
 *  ③ 机构端视图 —— 覆盖率统计条（薄荷 = GmProgress status="success"）+ 到期未种名单
 *     （红字行 + 每行「一键随访」）。
 *
 * 状态词映射（**这一步不能省**）：13.3.3 写的是「未到 / 可接种 / 已预约 / 已完成 / 延后」，
 * 而 `未到 / 可接种 / 延后` 在 15.2 词库里**没有登记**。按 skill R4「新词先登记再使用」，
 * 页面只允许用已登记的三个词 + 任务级过期：
 *   可接种 → 待预约（15.2.6）· 已预约 → 已预约（15.2.6）· 已完成 → 已完成（15.2.6）
 *   逾期未种 → 已过期（15.2.6 任务级）
 *   未到月龄 → **不挂状态标签**（无登记词可用），只用灰字说明
 * 映射表与依据同时写在 `model.ts` 文件头，便于评审逐条核对。
 */
import React, { useMemo, useState } from "react";
import { GmButton, GmCard, GmProgress, GmStatusTag, GmTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import ListRow from "@/shared/components/ListRow";
import SectionCard from "@/shared/components/SectionCard";
import FilterChips from "@/shared/components/FilterChips";
import LgIcon from "@/shared/components/LgIcon";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { MQ } from "@/shared/constants/breakpoints";
import { date, dueText, monthAge, num } from "@/shared/utils/format";
import { endpoints } from "../api";
import { STATUS, type VaccinePlan } from "../model";

/** 时间线视图过滤：词取自 15.2.6 已登记状态词（「全部」是控件标签，不是业务状态） */
const FILTERS = ["全部", "待预约", "已预约", "已完成", "已过期"] as const;

export default function VaccinePlanPage() {
  const toast = useAppToast();
  const isMobile = useMediaQuery(MQ.mobile);
  const [filter, setFilter] = useState<string>("全部");
  const state = useRequest<VaccinePlan>(
    endpoints.vaccine_plan,
    { path: endpoints.vaccine_plan },
    /* 空态判定对齐接口形状（对象接口看 items，不判"整体为假"） */
    (d) => !d || d.items.length === 0
  );

  const items = useMemo(() => {
    const all = state.data?.items ?? [];
    return filter === "全部" ? all : all.filter((i) => i.status === filter);
  }, [state.data, filter]);

  return (
    <PageState
      state={state}
      skeletonRows={6}
      emptyTitle="该儿童暂无疫苗计划"
      emptyDesc="建档后按国家免疫规划生成按月龄接种时间线（13.3.3）"
    >
      {(d) => (
        <>
          {d.reminder ? (
            <SectionCard title="接种提醒" desc="到期前 3 天 · 13.3.3">
              <GmCard>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <GmTag semantic="attention" size="default">到期前 3 天提醒</GmTag>
                  <span style={{ fontSize: 14 }}>
                    {`${d.reminder.vaccine} ${d.reminder.dose} · 应种 ${monthAge(d.reminder.month)} · ${dueText(d.reminder.dueAt)}（${date(d.reminder.dueAt)}）`}
                  </span>
                </div>
              </GmCard>
            </SectionCard>
          ) : null}

          <SectionCard
            title="按月龄时间线"
            desc={`${d.childName} · ${monthAge(d.month)} · 档案 ${d.archiveNo}`}
          >
            <FilterChips label="疫苗状态筛选" options={FILTERS} value={filter} onChange={setFilter} />
            <PageState
              state={{ ...state, data: items, empty: !state.loading && !state.error && items.length === 0 }}
              skeletonRows={6}
              emptyTitle="该状态下没有疫苗节点"
              emptyDesc="换个状态筛选试试"
              emptyAction={{ text: "查看全部", onClick: () => setFilter("全部") }}
            >
              {(rows) => (
                <GmCard>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="按月龄疫苗时间线">
                    {rows.map((it) => (
                      <li key={it.id} className="gm-listrow">
                        {/* 疫苗徽章：白玻璃底 + lg-icon-vaccine（13.3.3 / 09 章） */}
                        <LgIcon name="lg-icon-vaccine" size={22} plate={44} />
                        <span className="gm-listrow__body">
                          <b className="gm-listrow__title">{`${it.vaccine} · ${it.dose}`}</b>
                          <span className="gm-listrow__desc">
                            {`应种 ${monthAge(it.month)}`}
                            {it.doneAt ? ` · 接种 ${date(it.doneAt)}` : ""}
                            {!it.doneAt && it.dueAt ? ` · 应种日期 ${date(it.dueAt)}` : ""}
                          </span>
                        </span>
                        {it.status ? (
                          <GmStatusTag semantic={STATUS[it.status]}>{it.status}</GmStatusTag>
                        ) : (
                          /* 未到月龄：15.2 无此状态词 → 只给灰字，不挂标签 */
                          <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>未到月龄</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </GmCard>
              )}
            </PageState>
          </SectionCard>

          <SectionCard title="机构端视图" desc="覆盖率 · 到期未种名单（13.3.3）">
            <GmCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <b style={{ fontSize: 14 }}>疫苗应种率</b>
                <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)", fontVariantNumeric: "tabular-nums" }}>
                  {`已接种 ${num(d.coverage.done)} 剂次 / 应种 ${num(d.coverage.should)} 剂次`}
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                {/* 覆盖率统计条：薄荷色 = 正向语义，由组件定色，页面不自选色值 */}
                <GmProgress
                  percent={d.coverage.rate}
                  status="success"
                  text
                  valueText={`疫苗应种率 ${d.coverage.rate}%`}
                />
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>到期未种名单</h3>
              {d.overdue.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--lg-text-secondary,#4F5B6E)" }}>
                  本机构当前没有到期未种对象
                </p>
              ) : (
                d.overdue.map((o) => (
                  <ListRow
                    key={o.id}
                    title={`${o.childName} · ${o.vaccine} ${o.dose}`}
                    /* 红字行（13.3.3）；颜色之外还有「已过期」标签，双通道不缺（13.5.3 / 19.7.5） */
                    desc={
                      <span style={{ color: "var(--lg-sem-risk,#B72F42)", fontVariantNumeric: "tabular-nums" }}>
                        {`应种 ${monthAge(o.month)} · ${dueText(o.dueAt)}`}
                      </span>
                    }
                    trailing={
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <GmStatusTag semantic={STATUS[o.status]}>{o.status}</GmStatusTag>
                        {/* 移动端热区 ≥44（19.7.4）：小屏取 large=48，桌面取 default=40 */}
                        <GmButton
                          type="outline"
                          size={isMobile ? "large" : "default"}
                          onClick={() => toast(`已发起随访：${o.childName} · ${o.vaccine}`, "success")}
                        >
                          一键随访
                        </GmButton>
                      </span>
                    }
                  />
                ))
              )}
            </GmCard>
          </SectionCard>
        </>
      )}
    </PageState>
  );
}
