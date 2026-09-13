/**
 * React 组件契约验收台（不随包发布）
 *
 * 与 `goodmom-vue/playground/main.ts` 一一对应：同名组件必须在两边渲染出
 * 同契约的 DOM（class / role / aria / 语义色）。这不是"演示页"，
 * 而是**断言的目标页面** —— 每一项都对应 `smoke.mjs` 里的一条检查。
 *
 * 为什么必须有：Vue 侧一直有 37 项渲染级冒烟，React 侧此前**一项都没有**
 * （只有 typecheck + 构建）。上轮实测到的两个真实缺陷（环形直径被 Arco 的 `size`
 * 吃掉、`actions` 契约与 `tags` 不一致）都属"类型能过、渲染不对"这一类 ——
 * 正是没有渲染级验收才让它们长期存活。
 */
import React, { useState } from "react";
const FIVE_LABEL: Record<string, string> = {
  m1: "绿 · 低风险", m2: "黄 · 一般风险", m3: "橙 · 较高风险",
  m4: "红 · 高风险", m5: "紫 · 合并传染病",
};

import { createRoot } from "react-dom/client";
import {
  GmAvatar, GmButton, GmButtonGroup, GmCard, GmCascader, GmClientCard, GmEmpty,
  GmLink, GmProgress, GmResponsiveView, GmResult, GmRiskPicker, GmSkeleton, GmSpin,
  GmStatusTag, GmSteps, GmTag, GmToast, GmVirtualList,
  semanticOf, BUSINESS_LABELS, type GmFive, type GmCascaderOption, type GmSemantic,
} from "../src/index";

const regionOptions: GmCascaderOption[] = [
  { value: "sd", label: "山东省", children: [
    { value: "qd", label: "青岛市", children: [
      { value: "sn", label: "市南区" }, { value: "sb", label: "市北区" }] },
    { value: "jn", label: "济南市" } ] },
  { value: "js", label: "江苏省", children: [{ value: "nj", label: "南京市" }] },
];

const SEMS: GmSemantic[] = ["positive", "info", "attention", "risk", "neutral", "special"];
const FIVES: GmFive[] = ["m1", "m2", "m3", "m4", "m5"];

const VListRows = Array.from({ length: 1284 }, (_, i) => ({ id: i + 1, name: `档案 ${i + 1}` }));

function App() {
  const [risk, setRisk] = useState<GmFive>("m2");
  const [seg, setSeg] = useState("全部");
  const [cascade, setCascade] = useState<string[]>([]);
  return (
    <div id="pg">
      <section>
        <h2>GmButton · 全谱（D9：亮粉底必配深字）</h2>
        <div className="row">
          <GmButton type="primary">Primary 随访</GmButton>
          <GmButton type="secondary">Secondary 已预约</GmButton>
          <GmButton type="outline">Outline 导出</GmButton>
          <GmButton type="dashed">Dashed 添加</GmButton>
          <GmButton type="text">Text 查看</GmButton>
          <GmButton type="primary" status="success">Success</GmButton>
          <GmButton type="primary" status="warning">Warning</GmButton>
          <GmButton type="primary" status="danger">Danger</GmButton>
        </div>
        <div className="row">
          <GmButton type="primary" size="small">small</GmButton>
          <GmButton type="primary" size="default">default</GmButton>
          <GmButton type="primary" size="large">large</GmButton>
          <GmButton type="primary" shape="round">round</GmButton>
          <GmButton type="primary" shape="circle" ariaLabel="新增" icon={<span aria-hidden>＋</span>} />
          <GmButton type="primary" loading>提交中</GmButton>
          <GmButton type="primary" disabled>禁用</GmButton>
          <GmButton type="primary" long>全宽主行动</GmButton>
        </div>
        <div className="row">
          <GmButtonGroup shape="attached" ariaLabel="按钮组">
            <GmButton type="outline" nativeType="button">甲</GmButton>
            <GmButton type="outline" nativeType="button">乙</GmButton>
          </GmButtonGroup>
        </div>
      </section>

      <section>
        <h2>GmStatusTag / GmTag · 语义与业务字典（15 章）</h2>
        <div className="row">
          {SEMS.map((s) => <GmStatusTag key={s} semantic={s}>{s}</GmStatusTag>)}
          <GmStatusTag semantic="attention">待随访</GmStatusTag>
          <GmStatusTag semantic={semanticOf("高危")}>高危</GmStatusTag>
          <GmStatusTag semantic={semanticOf("阳性")}>阳性</GmStatusTag>
          <GmStatusTag semantic={semanticOf("已建档")}>已建档</GmStatusTag>
          <GmStatusTag semantic={semanticOf("这不是登记过的词")}>这不是登记过的词</GmStatusTag>
          <GmStatusTag semantic="risk" closable onClose={() => {}}>可关闭</GmStatusTag>
        </div>
        {/* 孕产妇五色（02 · 2.10 / 15.2.10）：色点承载颜色，文字走主文字色 */}
        <div className="row" id="five-row">
          {(["m1", "m2", "m3", "m4", "m5"] as const).map((k) => (
            <GmStatusTag key={k} five={k}>{FIVE_LABEL[k]}</GmStatusTag>
          ))}
        </div>
        <div className="row">
          {FIVES.map((f) => <GmStatusTag key={f} five={f}>{f}</GmStatusTag>)}
          {SEMS.map((s) => <GmTag key={s} semantic={s}>{s}</GmTag>)}
          <GmTag semantic="positive" dot>带点</GmTag>
          <GmTag semantic="info" size="small">小号</GmTag>
        </div>
      </section>

      <section>
        <h2>GmProgress · 线性 / 环形 / 不确定 / 语义</h2>
        <div className="row" id="progress-row">
          <GmProgress percent={45} text valueText="已完成 45%" />
          <GmProgress percent={100} positive text />
          <GmProgress percent={72} status="warning" text />
          <GmProgress percent={30} status="danger" text />
          <GmProgress percent={0} indeterminate valueText="加载中" />
        </div>
        <div className="row" id="ring-row">
          {/* 环形直径必须真的生效：Arco 的 size 是四档枚举，像素直径只能走 width */}
          <GmProgress type="circle" percent={64} diameter={88} valueText="环形 88" />
          <GmProgress type="circle" percent={40} diameter={120} valueText="环形 120" />
          <GmProgress type="circle" percent={80} size="small" valueText="环形 small 档" />
        </div>
      </section>

      <section>
        <h2>GmSteps / GmAvatar / GmLink</h2>
        <GmSteps current={1} items={[
          { title: "建档" }, { title: "首访" }, { title: "评估" }, { title: "随访" }]} />
        <div className="row">
          <GmAvatar text="朵" size={40} tone="rose" />
          <GmAvatar text="安" size={40} tone="purple" label="安女士" />
          <GmAvatar text="米" size={40} tone="mint" />
          <GmLink href="#x">行内链接</GmLink>
          <GmLink href="https://example.com" external>外链</GmLink>
          <GmLink disabled>禁用链接</GmLink>
        </div>
      </section>

      <section>
        <h2>GmCard / GmClientCard / GmEmpty / GmResult / GmSkeleton / GmSpin</h2>
        <GmCard title="卡标题" extra="右侧">卡内容</GmCard>
        <div style={{ height: 12 }} />
        <GmCard title="第二张卡（无 extra）">用于核对多卡并存时的间距与描边</GmCard>
        <div style={{ height: 12 }} />
        <GmClientCard
          name="张敏 · 孕 28 周" sub="档案号 MMH-2025-0102 · 管理医生 王医生"
          tags={<GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>}
          actions={<GmButton size="small" type="primary">随访</GmButton>}
        />
        <div className="row">
          <GmEmpty iconSize="large" title="暂无数据" desc="换个条件试试" />
          <GmResult status="error" title="提交失败" desc="网络不稳定，请稍后重试" actionText="重新提交" onAction={() => {}} />
        </div>
        <GmSkeleton rows={3} label="内容加载中" />
        <div className="row"><GmSpin /><GmSpin text="加载中" /><GmSpin tone="inverse" /></div>
      </section>

      <section>
        <h2>GmRiskPicker · 受控 + 键盘</h2>
        <GmRiskPicker value={risk} onChange={setRisk} />
      </section>

      <section>
        <h2>GmCascader · popup / inline / picker</h2>
        <div className="row">
          <GmCascader options={regionOptions} value={cascade} onChange={setCascade} placeholder="选择地区" />
          <GmCascader options={regionOptions} mode="picker" placeholder="picker" />
        </div>
        <GmCascader options={regionOptions} mode="inline" />
      </section>

      <section>
        <h2>GmResponsiveView · 按容器宽度切形态</h2>
        <GmResponsiveView
          data={VListRows.slice(0, 6)}
          table={(rows) => <table><tbody>{rows.map((r) => <tr key={r.id}><td>{r.name}</td></tr>)}</tbody></table>}
          condensed={(rows) => <ul>{rows.map((r) => <li key={r.id}>{r.name}</li>)}</ul>}
          card={(rows) => <ul>{rows.map((r) => <li key={r.id}>{r.name}</li>)}</ul>}
        />
      </section>

      <section>
        <h2>GmVirtualList · 1284 条窗口化</h2>
        <GmVirtualList
          items={VListRows} itemHeight={52} height={312} stickyTop="吸顶标题" ariaLabel="档案长列表"
          renderItem={(it: { id: number; name: string }) => <div>{it.name}</div>}
        />
      </section>

      <section>
        <h2>GmToast · error 走 role=alert</h2>
        <GmToast open message="保存成功" status="success" />
        <GmToast open message="保存失败" status="error" />
      </section>

      <section>
        <h2>字典自检</h2>
        <div className="row"><span id="biz-count">{BUSINESS_LABELS.length}</span> 条业务状态词</div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
