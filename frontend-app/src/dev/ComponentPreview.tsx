/**
 * 组件演示页（开发期页面 · 19.4）
 *
 * 定位：`dev/` 只放**开发期验收页面**（组件全谱、Token 对照、四态演示），
 * 不属于任何业务模块、不进生产导航、不得被 modules/* 引用（边界门禁会拦）。
 * 内容即原 `src/App.tsx` 的组件演示，用于人工对照 03/10/11 章。
 */
import React, { useState } from "react";
import {
  GmButton, GmStatusTag, GmCard, GmAvatar, GmProgress, GmRiskPicker, GmClientCard,
  GmEmpty, GmSpin, GmSkeleton, GmResult, GmTag, GmSteps, GmLink, semanticOf, GmFive,
} from "@goodmom/gm-arco-ui";
import { Card } from "@arco-design/web-react";
import SectionCard from "@/shared/components/SectionCard";

export default function ComponentPreview() {
  const [risk, setRisk] = useState<GmFive>("m2");
  return (
    <>
      <SectionCard title="GmButton · 按钮全谱" desc="03 · 3.2.4（亮粉底必配深字）">
        <GmCard>
          <div style={ROW}>
            <GmButton type="primary">Primary 随访</GmButton>
            <GmButton type="secondary">Secondary 已预约</GmButton>
            <GmButton type="outline">Outline 导出</GmButton>
            <GmButton type="dashed">Dashed 添加入口</GmButton>
            <GmButton type="text">Text 查看</GmButton>
          </div>
          <div style={ROW}>
            <GmButton type="primary" status="success">Success 已完成</GmButton>
            <GmButton type="primary" status="danger">Danger 停用</GmButton>
            <GmButton type="primary" loading>提交中</GmButton>
            <GmButton type="primary" disabled>禁用（不可聚焦）</GmButton>
          </div>
        </GmCard>
      </SectionCard>

      <SectionCard title="GmStatusTag · 状态标签" desc="语义与业务字典（15 章）">
        <GmCard>
          <div style={ROW}>
            <GmStatusTag semantic="positive">已完成</GmStatusTag>
            <GmStatusTag semantic="attention">待随访</GmStatusTag>
            <GmStatusTag semantic="risk">高风险</GmStatusTag>
            <GmStatusTag semantic={semanticOf("已转诊")}>已转诊</GmStatusTag>
            <GmStatusTag semantic={semanticOf("无法联系")}>无法联系</GmStatusTag>
          </div>
          <div style={ROW}>
            <GmStatusTag five="m1">绿 · 正常</GmStatusTag>
            <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>
            <GmStatusTag five="m3">橙 · 较高风险</GmStatusTag>
            <GmStatusTag five="m4">红 · 高风险</GmStatusTag>
            <GmStatusTag five="m5">紫 · 合并传染病</GmStatusTag>
          </div>
        </GmCard>
      </SectionCard>

      <SectionCard title="GmProgress · 进度与环形" desc="08 · 8.2.5（高度 3/6/10；环形直径走 width）">
        <GmCard>
          <div style={ROW}>
            <GmProgress percent={72} text style={{ flex: 1 }} />
            <GmProgress percent={96} positive text style={{ flex: 1 }} />
            <GmProgress percent={100} status="success" text style={{ flex: 1 }} />
          </div>
          <div style={{ ...ROW, alignItems: "center" }}>
            {/* 直径由 diameter 指定：Arco 的 size 只有四档枚举，像素直径必须走 width */}
            <GmProgress type="circle" percent={64} diameter={88} valueText="环形·直径 88" />
            <GmProgress type="circle" percent={40} size="small" valueText="环形·small 档" />
            <GmProgress percent={0} indeterminate valueText="不确定进度" style={{ flex: 1 }} />
          </div>
        </GmCard>
      </SectionCard>

      <SectionCard title="状态与加载族" desc="08 · 8.2.12 / 8.2.15（骨架=胶囊+呼吸，禁扫光）">
        <GmCard>
          <div style={ROW}>
            <GmSpin />
            <GmSpin text="加载中" />
          </div>
          <div style={{ maxWidth: 320, marginTop: 12 }}>
            <GmSkeleton rows={3} />
          </div>
          <div style={{ marginTop: 12 }}>
            <GmEmpty iconSize="large" title="暂无数据" desc="换个条件试试" />
          </div>
        </GmCard>
      </SectionCard>

      <SectionCard title="GmResult · 结果页" desc="11 · 11.2.10（三通道 + 可执行动作）">
        <GmCard>
          <GmResult status="error" title="提交失败" desc="网络不稳定，请稍后重试；已填写内容保留在本机" actionText="重新提交" onAction={() => {}} />
        </GmCard>
      </SectionCard>

      <SectionCard title="领域组件" desc="13 章 · 15.6.1 / 02.10">
        <GmClientCard
          name="张敏 · 孕 28 周"
          sub="档案号 MMH-2025-0102 · 管理医生 王医生"
          tags={<GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>}
          ops={
            <>
              <GmButton size="small" type="primary">随访</GmButton>
              <GmButton size="small" type="outline">转诊</GmButton>
            </>
          }
        />
        <div style={{ height: 12 }} />
        <GmRiskPicker value={risk} onChange={setRisk} />
        <div style={{ height: 12 }} />
        <GmSteps current={1} items={[{ title: "建档" }, { title: "首访" }, { title: "评估" }, { title: "随访" }]} />
        <div style={{ height: 12 }} />
        <div style={ROW}>
          <GmAvatar text="朵" size={40} tone="rose" />
          <GmAvatar text="安" size={40} tone="purple" />
          <GmAvatar text="米" size={40} tone="mint" />
          <GmTag semantic="special">AI 协作</GmTag>
          <GmLink href="#/dev/preview">GmLink 行内链接</GmLink>
        </div>
      </SectionCard>

      <Card style={{ borderRadius: 22 }} title="下一步（00 总目录推进）">
        <ul style={{ lineHeight: 2, color: "var(--lg-text-secondary,#4F5B6E)" }}>
          <li>GmTag 业务字典表格 / 随访队列表格（07 / 13）· Form 包装</li>
          <li>领域组件：筛查流程 Steps、转诊状态链、生命周期轴、生长曲线卡（13）</li>
          <li>验收：<code>npm run gm:typecheck</code> + <code>npx tsc --noEmit</code> + <code>npm run build</code> + 边界门禁</li>
        </ul>
      </Card>
    </>
  );
}

const ROW: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", margin: "8px 0" };
