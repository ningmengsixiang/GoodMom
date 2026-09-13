/**
 * 数据中心（模块参考实现 · 只对 admin/doctor 开放）
 *
 * 演示：KPI 卡 + 环形进度（**直径走 width** —— 见 GmProgress 的 V2.9 修复）
 *      + 语义色只表状态、数据序列走 12.3.3 色序（本页用品牌主序列）。
 */
import React from "react";
import { GmCard, GmProgress } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import SectionCard from "@/shared/components/SectionCard";
import { useRequest } from "@/shared/api/useRequest";
import { num } from "@/shared/utils/format";

interface Summary { manage: number; high: number; vaccineRate: number; followupRate: number; archiveRate: number }

export default function DashboardPage() {
  const state = useRequest<Summary>("/dashboard/summary", { path: "/dashboard/summary" });

  return (
    <PageState state={state} skeletonRows={4} emptyTitle="暂无统计数据">
      {(d) => (
        <>
          <SectionCard title="机构概览" desc="示例数据 · 口径见 15 章">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
              <Mini label="在管对象" value={num(d.manage)} />
              <Mini label="高危在管" value={num(d.high)} tone="var(--lg-sem-risk,#B72F42)" />
              <Mini label="疫苗应种率" value={`${d.vaccineRate}%`} />
            </div>
          </SectionCard>

          <SectionCard title="关键完成率" desc="环形进度 · 直径由 diameter 指定">
            <GmCard>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                <GmProgress type="circle" percent={d.vaccineRate} diameter={96} valueText={`疫苗全程率 ${d.vaccineRate}%`} />
                <GmProgress type="circle" percent={d.archiveRate} size="small" diameter={72} valueText={`儿童建档率 ${d.archiveRate}%`} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <GmProgress percent={d.followupRate} status="warning" text valueText={`高危随访闭环 ${d.followupRate}%`} />
                </div>
              </div>
            </GmCard>
          </SectionCard>
        </>
      )}
    </PageState>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <GmCard>
      <div style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)", marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: tone ?? "var(--lg-text-primary,#343A46)" }}>{value}</div>
    </GmCard>
  );
}
