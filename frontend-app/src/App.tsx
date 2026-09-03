import { useState } from "react";
import {
  GmButton, GmStatusTag, GmCard, GmAvatar, GmProgress, GmRiskPicker, GmClientCard,
  semanticOf, GmFive,
} from "@goodmom/gm-arco-ui";
import { Card } from "@arco-design/web-react";

export default function App() {
  const [risk, setRisk] = useState<GmFive>("m2");
  return (
    <div className="demo-wrap">
      <h1 style={{ fontSize: 24, margin: 0 }}>
        妈咪好 GoodMom <small>× Arco Design · 自有组件库演示（gm-arco-ui）</small>
      </h1>

      <div className="demo-card">
        <h2>GmButton · 按钮全谱（03 · 3.2.4）</h2>
        <div className="demo-row">
          <GmButton type="primary">Primary 随访</GmButton>
          <GmButton type="secondary">Secondary 已预约</GmButton>
          <GmButton type="outline">Outline 导出</GmButton>
          <GmButton type="dashed">Dashed 添加入口</GmButton>
          <GmButton type="text">Text 查看</GmButton>
        </div>
        <div className="demo-row">
          <GmButton type="primary" status="success">Success 已完成</GmButton>
          <GmButton type="primary" status="danger">Danger 停用</GmButton>
        </div>
      </div>

      <div className="demo-card">
        <h2>GmStatusTag · 状态标签（语义 + 业务字典）</h2>
        <div className="demo-row">
          <GmStatusTag semantic="positive">已完成</GmStatusTag>
          <GmStatusTag semantic="attention">待随访</GmStatusTag>
          <GmStatusTag semantic="risk">高风险</GmStatusTag>
          <GmStatusTag semantic={semanticOf("已转诊")}>已转诊</GmStatusTag>
          <GmStatusTag semantic={semanticOf("无法联系")}>无法联系</GmStatusTag>
        </div>
        <div className="demo-row">
          <GmStatusTag five="m1">绿 · 低风险</GmStatusTag>
          <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>
          <GmStatusTag five="m3">橙 · 较高风险</GmStatusTag>
          <GmStatusTag five="m4">红 · 高风险</GmStatusTag>
          <GmStatusTag five="m5">紫 · 合并传染病</GmStatusTag>
        </div>
      </div>

      <div className="demo-card">
        <h2>领域组件（15.6.1 / 02.10）</h2>
        <GmClientCard
          name="张敏 · 孕 28 周" sub="档案号 MMH-2025-0102 · 管理医生 王医生"
          tags={<>
            <GmStatusTag semantic="info">已建档</GmStatusTag>
            <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>
          </>}
          actions={<><GmButton size="small" type="primary">随访</GmButton><GmButton size="small" type="outline">转诊</GmButton></>}
        />
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 13, color: "#586273", marginBottom: 8 }}>妊娠风险五色单选（受控）</div>
        <GmRiskPicker value={risk} onChange={setRisk} />
        <div style={{ height: 12 }} />
        <div className="demo-row"><GmProgress percent={72} text style={{ flex: 1 }} /><GmProgress percent={96} positive style={{ flex: 1 }} /></div>
        <div className="demo-row">
          <GmAvatar text="朵" size={40} tone="rose" /> <GmAvatar text="安" size={40} tone="purple" /> <GmAvatar text="米" size={40} tone="mint" />
          <span style={{ color: "#9AA2B0", fontSize: 12 }}>GmAvatar（服务对象首字）</span>
        </div>
      </div>

      <Card style={{ borderRadius: 18 }} title="下一步封装（00 总目录推进）">
        <ul style={{ lineHeight: 2, color: "#586273" }}>
          <li>GmTag 业务字典表格 / 随访队列表格（07/13）· Form 包装</li>
          <li>领域组件：筛查流程 Steps、转诊状态链、生命周期轴、生长曲线卡（13）</li>
          <li>npm 联网后：npm install && npm run gm:typecheck && npm run build 验证</li>
        </ul>
      </Card>
    </div>
  );
}
