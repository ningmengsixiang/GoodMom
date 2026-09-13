/**
 * 儿童保健 · 儿保体检与保健清单（13.3.4 + 13.3.8）
 *
 * 页面只做三件事：把月龄节点轴画出来、把六项保健清单列出来、把异常项的去向说清楚。
 * 口径（严格照 13 章，不自造字段）：
 *  · 节点轴 = 1/3/6/8/12/18/24/36 月龄；已完成节点显示 身高/体重/头围 + 百分位 chip；
 *    异常节点圆点转 amber/danger，气泡给「本次随访建议复查」→ 13.3.4。
 *  · 六项 = 生长发育 / 营养喂养 / 心理行为发育 / 视力保健 / 听力保健 / 口腔保健，
 *    行 = 图标 44 底 + 项目名 + 口径说明 + 状态标签 → 13.3.8（图标与口径见 09 章 H 类）。
 *  · 异常项自动进入高危儿 / 重点随访队列 → 13.3.8（页面只展示数据源给的结果位，不自行判定）。
 *  · 医学数值 ≥13px + tabular-nums、单位与标准来源小字标注、异常不单靠颜色 → 13.5.1 / 13.5.2 / 13.5.3。
 *
 * 状态词：全部取自 15.2.3 已登记词（正常 / 异常 / 待补检 / 待复查 / 待转诊），
 * 经 `model.STATUS` 查表定色 —— 页面不写语义、不写色值。未到月龄的节点**不挂状态标签**，
 * 只用灰字说明（该节点尚无业务状态可言）。
 */
import React from "react";
import { GmButton, GmCard, GmClientCard, GmStatusTag, GmTag } from "@goodmom/gm-arco-ui";
import PageState from "@/shared/components/PageState";
import SectionCard from "@/shared/components/SectionCard";
import LgIcon from "@/shared/components/LgIcon";
import { useRequest } from "@/shared/api/useRequest";
import { useAppToast } from "@/shared/feedback";
import { monthAge } from "@/shared/utils/format";
import { endpoints } from "../api";
import { STATUS, type ChildcareVisit, type GrowthNode } from "../model";

/**
 * 节点圆点颜色：异常 → 危险档，已完成 → 正向档，未到月龄 → 进度槽中性档。
 * 只读 Token，不写色值；⚠️ 中性档用 `--lg-track`（颜色）而不是 `--lg-border-3`
 * —— 后者是**描边宽度**（2px），当底色用会被浏览器静默丢弃（圆点直接看不见）。
 */
function dotBg(n: GrowthNode, childMonth: number): string {
  if (n.abnormal) return "var(--lg-sem-risk,#B72F42)";
  if (n.done) return "var(--lg-sem-positive,#25715D)";
  if (n.month > childMonth) return "var(--lg-track,rgba(58,52,84,.08))";
  return "var(--lg-sem-attention,#8D5A15)";
}

export default function ChildcareVisitPage() {
  const toast = useAppToast();
  const state = useRequest<ChildcareVisit>(
    endpoints.childcare_visits,
    { path: endpoints.childcare_visits },
    /* 空态判定与接口形状对齐：对象接口看 nodes/checklist，而不是"整体为假" */
    (d) => !d || d.nodes.length === 0
  );
  const highRisk = (state.data?.checklist ?? []).filter((c) => c.highRisk).length;

  return (
    <>
      <PageState
        state={state}
        skeletonRows={2}
        emptyTitle="该儿童暂无儿保体检记录"
        emptyDesc="建档后按 1/3/6/8/12/18/24/36 月龄节点生成体检计划（13.3.4）"
      >
        {(d) => (
          <GmClientCard
            name={d.childName}
            sub={`儿童健康档案 ${d.archiveNo} · 当前 ${monthAge(d.month)}`}
            tags={<GmTag semantic="info">管理对象</GmTag>}
          />
        )}
      </PageState>

      <div style={{ height: 18 }} />

      <SectionCard title="月龄节点轴" desc="1/3/6/8/12/18/24/36 月龄 · 13.3.4">
        <PageState state={state} skeletonRows={5} emptyTitle="暂无月龄节点">
          {(d) => (
            <GmCard>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {d.nodes.map((n, i) => (
                  <li
                    key={n.month}
                    style={{ display: "flex", gap: 12, paddingBottom: i === d.nodes.length - 1 ? 0 : 16 }}
                  >
                    {/* 轴：圆点 + 连接线；异常节点的语义由"色 + 气泡文字"双通道表达（13.5.3） */}
                    <span
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 14 }}
                      aria-hidden="true"
                    >
                      <span
                        style={{
                          width: 12, height: 12, borderRadius: "50%", marginTop: 6,
                          background: dotBg(n, d.month),
                        }}
                      />
                      {i < d.nodes.length - 1 ? (
                        <span style={{ flex: 1, width: 1, marginTop: 4, background: "var(--lg-divider-hairline,#E8E2DC)" }} />
                      ) : null}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <b style={{ fontSize: 15 }}>{monthAge(n.month)}</b>
                        {n.done && n.result ? <GmTag>{n.result.percentile}</GmTag> : null}
                        {!n.done && n.month <= d.month ? (
                          /* 已到月龄但未完成 —— 15.2.3 的「待补检」是登记词里唯一对得上的口径 */
                          <GmStatusTag semantic={STATUS.待补检}>待补检</GmStatusTag>
                        ) : null}
                        {!n.done && n.month > d.month ? (
                          /* 未到月龄：不挂状态标签，只用灰字说明（不新造状态词） */
                          <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>未到月龄</span>
                        ) : null}
                      </div>

                      {n.done && n.result ? (
                        <div
                          style={{
                            marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap",
                            fontSize: 13, fontVariantNumeric: "tabular-nums",
                            color: "var(--lg-text-secondary,#4F5B6E)",
                          }}
                        >
                          <span>身高 {n.result.heightCm} cm</span>
                          <span>体重 {n.result.weightKg} kg</span>
                          <span>头围 {n.result.headCm} cm</span>
                        </div>
                      ) : null}

                      {n.abnormal && n.advice ? (
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <GmTag semantic="risk" size="default">{n.advice}</GmTag>
                          <GmButton
                            type="outline"
                            size="small"
                            onClick={() => toast(`${monthAge(n.month)}节点评估详情（示例）`)}
                          >
                            进入评估详情
                          </GmButton>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
              {/* 13.5.1 / 13.5.2：单位与标准来源以小字标注，不靠图例猜 */}
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>
                单位：身高 cm · 体重 kg · 头围 cm；百分位数据源：WHO 0–5 岁儿童生长标准
              </div>
            </GmCard>
          )}
        </PageState>
      </SectionCard>

      <SectionCard title="健康保健清单" desc="六项 · 13.3.8">
        <PageState state={state} skeletonRows={6} emptyTitle="暂无保健记录">
          {(d) => (
            <GmCard>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="儿童健康保健清单">
                {d.checklist.map((it) => (
                  /* 行配方复用 styles/layout.css 的 .gm-listrow*（19.7.2：跨模块配方不内联、不重写）；
                     唯独图标底按 13.3.8 要求为 44，而 ListRow 的图标槽是 40 —— 故此处用同一配方
                     的类名自持这一格，而不是把 44 硬塞进 40 的槽里。 */
                  <li key={it.key} className="gm-listrow">
                    {/* 图标底 44（13.3.8）由共享件 LgIcon 的 plate 提供 —— 同一格在 vaccine 的
                        疫苗徽章上复用，配方只在 shared/components/LgIcon 里写一次（19.6.3）。 */}
                    <LgIcon name={it.icon} size={22} plate={44} />
                    <span className="gm-listrow__body">
                      <b className="gm-listrow__title">{it.name}</b>
                      <span className="gm-listrow__desc">{it.scope}</span>
                    </span>
                    <GmStatusTag semantic={STATUS[it.status]}>{it.status}</GmStatusTag>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>
                异常项自动进入高危儿 / 重点随访队列（13.3.8）· 本档案当前 {highRisk} 项
              </div>
            </GmCard>
          )}
        </PageState>
      </SectionCard>
    </>
  );
}
