/**
 * 机构运营（仅 admin；15.3.1 / 15.3.2 / 15.3.4 + 19.5.3）
 *
 * 三块：
 *  ① 科室与人员 —— 称谓词只用 15.3.2 档案词（管理医生 / 建档机构）与 15.3.1（管理对象）；
 *  ② 医生排班 —— 行 = 医生名 + 班次 + 状态标签（已签到 / 服务中 / 已取消 / 已关闭，15.2.6/15.2.7）；
 *  ③ 服务量统计 —— 指标名逐字取自 15.3.4 指标词表；率类指标走 GmProgress（不自绘）。
 *
 * 边界（19.5.3 第 2 条）：机构侧**只看聚合**，本页不含任何个体健康数据；
 * 个体数据属医护侧模块，跨侧展示必须走聚合接口。页面底部把这句纪律写进界面，
 * 免得下一个人"顺手"把个体名单拉进来。
 */
import React from "react";
import { GmCard, GmProgress, GmStatusTag, GmTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import ListRow from "@/shared/components/ListRow";
import SectionCard from "@/shared/components/SectionCard";
import { useRequest } from "@/shared/api/useRequest";
import { num } from "@/shared/utils/format";
import { endpoints } from "../api";
import { STATUS, type InstitutionOverview } from "../model";

export default function InstitutionOverviewPage() {
  const state = useRequest<InstitutionOverview>(
    endpoints.institution_overview,
    { path: endpoints.institution_overview },
    /* 空态判定对齐接口形状：对象接口看 depts（不是"整体为假"） */
    (d) => !d || d.depts.length === 0
  );

  return (
    <PageState
      state={state}
      skeletonRows={6}
      emptyTitle="该机构暂无科室数据"
      emptyDesc="科室与排班由机构管理员维护（19.5 机构侧数据域）"
    >
      {(d) => (
        <>
          <SectionCard title="科室与人员" desc={`${d.org.name} · ${d.org.level}`}>
            <GmCard>
              {d.depts.map((dept) => (
                <ListRow
                  key={dept.id}
                  title={dept.name}
                  /* 称谓词只用 15.3.2 已登记词：管理医生 / 建档机构 */
                  desc={`管理医生 ${dept.manager} · 建档机构 ${dept.archiveOrg}`}
                  trailing={<GmTag semantic="info">{`管理对象 ${num(dept.managed)}`}</GmTag>}
                />
              ))}
            </GmCard>
          </SectionCard>

          <SectionCard title="医生排班" desc="班次与在岗状态（15.2.6 / 15.2.7）">
            <GmCard>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="医生排班">
                {d.shifts.map((s) => (
                  <li key={s.id}>
                    <ListRow
                      title={`${s.doctor} · ${s.dept}`}
                      desc={s.shift}
                      trailing={<GmStatusTag semantic={STATUS[s.status]}>{s.status}</GmStatusTag>}
                    />
                  </li>
                ))}
              </ul>
            </GmCard>
          </SectionCard>

          <SectionCard title="服务量统计" desc="指标名取 15.3.4 · 机构维度聚合">
            <GmCard>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                {d.metrics
                  .filter((m) => m.kind === "count")
                  .map((m) => (
                    <div key={m.name}>
                      <div style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)", marginBottom: 6 }}>
                        {m.name}
                      </div>
                      <div
                        style={{
                          fontSize: 26, fontWeight: 700, lineHeight: 1.1,
                          fontVariantNumeric: "tabular-nums",
                          color: "var(--lg-text-primary,#343A46)",
                        }}
                      >
                        {num(m.value)}
                        <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4 }}>{m.unit}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {d.metrics
                  .filter((m) => m.kind === "rate")
                  .map((m) => (
                    <div key={m.name}>
                      {/* 率类指标也必须把 15.3.4 的指标名写出来 —— 只画一根进度条等于没给口径 */}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>{m.name}</span>
                        <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                          {`${m.value}${m.unit}`}
                        </span>
                      </div>
                      <GmProgress
                        percent={m.value}
                        status="success"
                        valueText={`${m.name} ${m.value}%`}
                        ariaLabel={m.name}
                      />
                    </div>
                  ))}
              </div>
            </GmCard>
          </SectionCard>

          <p style={{ margin: "0 2px", fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>
            机构侧只看聚合口径，本页不含个体健康数据（19.5.3）；个体数据请到医护侧的档案 / 随访队列查看。
          </p>
        </>
      )}
    </PageState>
  );
}
