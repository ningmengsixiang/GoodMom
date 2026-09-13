/**
 * 孕期管理（模块参考实现）
 *
 * 演示：领域组件组合（孕周卡 + 产检计划 Steps + 妊娠风险五色选择），
 * 以及"结果类信息不做庆祝动效"的医疗克制（13.5）。
 */
import React from "react";
import { GmButton, GmCard, GmProgress, GmRiskPicker, GmSteps, GmTag } from "@goodmom/gm-arco-ui";
import type { GmFive } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import SectionCard from "@/shared/components/SectionCard";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { gestWeek } from "@/shared/utils/format";
import { RISK_SLA } from "@/shared/domain/status";
import { useState } from "react";

interface Home { clientId: string; week: number; day: number; risk: GmFive; plan: { name: string; done: boolean }[] }

export default function PregnancyHomePage() {
  const toast = useAppToast();
  const [risk, setRisk] = useState<GmFive>("m2");
  const state = useRequest<Home>("/pregnancy/home", { path: "/pregnancy/home" });

  return (
    <>
      <SectionCard title="孕周" desc="预产期与产检计划的换算基准（13.1）">
        <PageState state={state} skeletonRows={2}>
          {(d) => (
            <GmCard>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <b className="num" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{gestWeek(d.week, d.day)}</b>
                <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>距预产期约 {40 - d.week} 周</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <GmProgress percent={Math.round((d.week / 40) * 100)} text valueText={`孕期进度 ${d.week}/40 周`} />
              </div>
            </GmCard>
          )}
        </PageState>
      </SectionCard>

      <SectionCard title="产检计划" desc="已完成 / 待完成">
        <PageState state={state} skeletonRows={3}>
          {(d) => (
            <GmCard>
              <GmSteps
                current={d.plan.filter((p) => p.done).length}
                items={d.plan.map((p) => ({ title: p.name }))}
              />
            </GmCard>
          )}
        </PageState>
      </SectionCard>

      <SectionCard title="妊娠风险分级" desc="五色专项（02.10 / 15.2.10）">
        <GmCard>
          <GmRiskPicker value={risk} onChange={(v: GmFive) => { setRisk(v); toast(`风险等级已更新为 ${RISK_SLA[v] ?? "常规随访"}`, "warning"); }} />
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <GmTag semantic="attention">处置时限</GmTag>
            <span style={{ fontSize: 14 }}>{RISK_SLA[risk]}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <GmButton type="outline" size="small" onClick={() => toast("已记录本次分级（示例）")}>记录分级</GmButton>
          </div>
        </GmCard>
      </SectionCard>
    </>
  );
}
