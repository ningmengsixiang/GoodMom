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
  GmTable, GmCollapse, GmDescriptions, GmModal, GmPopconfirm, GmPopover, GmTooltip,
  GmGrowthCard,
  semanticOf, BUSINESS_LABELS, type GmFive, type GmCascaderOption, type GmSemantic,
  type GmTableColumn, type GmGrowthData,
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

/* ── V2.10 新组件演示数据 ─────────────────────────────────────────── */
const TBL_COLS: GmTableColumn[] = [
  { key: "name", title: "服务对象", sortable: true },
  { key: "gest", title: "孕周" },
  { key: "status", title: "状态" },
  { key: "ops", title: "操作", align: "right", render: () => (
    <span className="ops">
      <a href="#ops">随访</a>
      <a href="#ops">详情</a>
    </span>
  ) },
];
const TBL_DATA = [
  { key: 1, name: "张敏", gest: "28 周", status: <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag> },
  { key: 2, name: "李华", gest: "32 周", status: <GmStatusTag five="m1">绿 · 低风险</GmStatusTag> },
  { key: 3, name: "王芳", gest: "24 周", status: <GmStatusTag five="m3">橙 · 较高风险</GmStatusTag> },
  { key: 4, name: "赵兰", gest: "36 周", status: <GmStatusTag semantic="positive">正常</GmStatusTag> },
];
const FOLDS = [
  { key: "a", title: "2024-10 儿保随访记录", tone: "positive" as const, content: "身高体重头围均正常，喂养指导完成；下次重点关注语言发育。" },
  { key: "b", title: "疫苗接种提示", tone: "attention" as const, content: "13 价肺炎第 3 剂次到期，请携带接种本。" },
  { key: "c", title: "喂养记录", content: "近 7 天奶量均值 720ml/日，夜醒 1 次。" },
];
const DESCS = [
  { label: "出生日期", value: "2023-04-12 · 足月顺产" },
  { label: "出生体重 / 身长", value: "3.2kg / 50cm", num: true },
  { label: "母亲姓名", value: "张敏" },
  { label: "建档机构", value: "市妇幼保健院儿保科" },
  { label: "最近随访", value: "2026-10-08 · 王医生" },
];
const GROWTH: GmGrowthData = {
  title: "体重生长曲线", tone: "mint", seriesName: "宝宝实测",
  source: "WHO 2006 · 0–24 月龄", bandLabel: "P3–P97 · 示意数据",
  xName: "月龄", xUnit: "月", yName: "体重", yUnit: "kg",
  x: [0, 3, 6, 9, 12, 15, 18, 21, 24], xTicks: [0, 6, 12, 18, 24], yTicks: [6, 8, 10, 12, 14],
  p3: [2.5, 4.6, 6.1, 7.1, 7.7, 8.3, 8.8, 9.2, 9.7],
  p50: [3.3, 6.4, 7.9, 8.9, 9.6, 10.3, 10.9, 11.5, 12.2],
  p97: [4.3, 7.1, 9.2, 10.5, 11.5, 12.4, 13.2, 13.9, 14.6],
  actual: [3.4, 6.2, 7.9, 8.9, 9.7, 10.5, 11.5, 12.0, 9.4],
  focus: 18,
  advisories: [{ x: 24, tone: "attention", text: "24 月龄 · 体重 9.4kg 低于 P3（9.7kg）：建议 2 周内复测并评估喂养（示意）" }],
};
function TableDemo() {
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  return (
    <GmTable
      columns={TBL_COLS}
      data={TBL_DATA}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(k, o) => { setSortKey(k); setSortOrder(o); }}
    />
  );
}
function ModalDemo() {
  const [open, setOpen] = useState(true); /* 冒烟先断言 role=dialog，再点关闭回收遮罩 */
  return (
    <GmModal open={open} title="随访确认" okText="确定" cancelText="取消" onCancel={() => setOpen(false)}>
      随访记录已保存，是否提交审核？
    </GmModal>
  );
}

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
        <h2>GmTable · 玻璃表格（排序 / 状态列 / 操作列）</h2>
        <TableDemo />
      </section>

      <section>
        <h2>GmCollapse · 折叠面板（300ms grid-rows / 一屏 ≤3）</h2>
        <GmCollapse items={FOLDS} defaultOpenKeys={["a"]} />
      </section>

      <section>
        <h2>GmDescriptions · 描述列表</h2>
        <GmDescriptions items={DESCS} />
      </section>

      <section>
        <h2>GmModal / GmPopconfirm / GmPopover / GmTooltip</h2>
        <div className="row">
          <ModalDemo />
          <GmPopconfirm title="确认注销该档案？" description="注销后不可恢复" danger okText="确认注销">
            <span style={{ color: "var(--lg-sem-risk)", fontWeight: 600 }}>注销档案</span>
          </GmPopconfirm>
          <GmPopover title="高危随访说明" content="高危孕产妇需在 7 天内完成复访。">
            <span style={{ color: "var(--lg-link)" }}>高危随访</span>
          </GmPopover>
          <GmTooltip title="实时防护已开启"><span style={{ color: "var(--lg-sem-special)" }}>防护状态</span></GmTooltip>
        </div>
      </section>

      <section>
        <h2>GmGrowthCard · 生长曲线（百分位带 / 框选 / 开关）</h2>
        <GmGrowthCard data={GROWTH} />
      </section>

      <section>
        <h2>字典自检</h2>
        <div className="row"><span id="biz-count">{BUSINESS_LABELS.length}</span> 条业务状态词</div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
