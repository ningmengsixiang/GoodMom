/**
 * 本地验收台（不随包发布）：
 * 直接消费 src（而非 dist），用真实的 Vite + Vue 运行时把全部组件跑一遍，
 * 用于目测玻璃态/暗色/a11y，以及 typecheck 之外的真机验证。
 *
 * 启动：cd goodmom-vue && npx vite --config playground/vite.config.ts
 */
import { createApp, ref } from "vue";
import {
  GmAvatar,
  GmButton,
  GmCard,
  GmCascader,
  GmClientCard,
  GmEmpty,
  GmLink,
  GmProgress,
  GmResponsiveView,
  GmRiskPicker,
  GmSkeleton,
  GmSpin,
  GmStatusTag,
  GmSteps,
  GmTag,
  GmVirtualList,
  GmTable,
  GmCollapse,
  GmDescriptions,
  GmModal,
  GmPopconfirm,
  GmPopover,
  GmTooltip,
  GmGrowthCard,
  BUSINESS_LABELS,
  type GmCascaderOption,
  type GmFive,
  type GmTableColumn,
  type GmGrowthData,
} from "../src/index";
import "../src/styles/index.css";

const regionOptions: GmCascaderOption[] = [
  {
    value: "sd",
    label: "山东省",
    children: [
      {
        value: "qd",
        label: "青岛市",
        children: [
          { value: "sn", label: "市南区" },
          { value: "sb", label: "市北区" },
        ],
      },
      { value: "jn", label: "济南市", children: [{ value: "lx", label: "历下区" }] },
    ],
  },
  { value: "js", label: "江苏省", children: [{ value: "nj", label: "南京市" }] },
];

const App = {
  components: {
    GmAvatar, GmButton, GmCard, GmCascader, GmClientCard, GmEmpty, GmLink, GmProgress,
    GmResponsiveView, GmRiskPicker, GmSkeleton, GmSpin, GmStatusTag, GmSteps, GmTag, GmVirtualList,
    GmTable, GmCollapse, GmDescriptions, GmModal, GmPopconfirm, GmPopover, GmTooltip, GmGrowthCard,
  },
  setup() {
    const risk = ref<GmFive | undefined>("m2");
    const region = ref<string[]>([]);
    /* 冒烟测试专用隔离实例：Cascader 是 v-model 双向绑定，
       三个实例共享同一个 region ref 会互相写入（测「初始 1 列」时会被上一步的选择污染）。
       因此单独给一个永远不被写入的独立 ref。 */
    const regionProbe = ref<string[]>([]);
    const dark = ref(false);
    const progress = ref(45);
    const rows = Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `服务对象 ${i + 1}` }));

    /* ── V2.10 新组件演示数据 ─────────────────────────────────────── */
    const tblCols: GmTableColumn[] = [
      { key: "name", title: "服务对象", sortable: true },
      { key: "gest", title: "孕周" },
      { key: "status", title: "状态" },
      { key: "ops", title: "操作", align: "right" },
    ];
    const tblData = [
      { key: 1, name: "张敏", gest: "28 周", status: "黄 · 一般风险", ops: "随访 · 详情" },
      { key: 2, name: "李华", gest: "32 周", status: "绿 · 低风险", ops: "随访 · 详情" },
      { key: 3, name: "王芳", gest: "24 周", status: "橙 · 较高风险", ops: "随访 · 详情" },
      { key: 4, name: "赵兰", gest: "36 周", status: "正常", ops: "随访 · 详情" },
    ];
    const tblSortKey = ref<string | undefined>(undefined);
    const tblSortOrder = ref<"asc" | "desc" | null>(null);
    const folds = [
      { key: "a", title: "2024-10 儿保随访记录", tone: "positive", content: "身高体重头围均正常，喂养指导完成；下次重点关注语言发育。" },
      { key: "b", title: "疫苗接种提示", tone: "attention", content: "13 价肺炎第 3 剂次到期，请携带接种本。" },
      { key: "c", title: "喂养记录", content: "近 7 天奶量均值 720ml/日，夜醒 1 次。" },
    ];
    const descs = [
      { label: "出生日期", value: "2023-04-12 · 足月顺产" },
      { label: "出生体重 / 身长", value: "3.2kg / 50cm", num: true },
      { label: "母亲姓名", value: "张敏" },
      { label: "建档机构", value: "市妇幼保健院儿保科" },
      { label: "最近随访", value: "2026-10-08 · 王医生" },
    ];
    const growth: GmGrowthData = {
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
    /* 冒烟先断言 role=dialog，再点取消回收遮罩（否则遮罩拦截后续点击） */
    const modalOpen = ref(true);

    return {
      risk, region, regionProbe, dark, progress, rows, regionOptions, BUSINESS_LABELS,
      tblCols, tblData, tblSortKey, tblSortOrder, folds, descs, growth, modalOpen,
    };
  },
  template: `
  <div :data-theme="dark ? 'dark' : undefined" style="min-height:100vh;background:var(--lg-page-bg);padding:24px;font-family:var(--lg-font)">
    <h1 style="font-size:20px;color:var(--lg-text-primary)">@goodmom/vue 验收台</h1>
    <GmButton :type="dark ? 'primary' : 'secondary'" @click="dark = !dark">切换主题（当前 {{ dark ? '暗色' : '亮色' }}）</GmButton>

    <section style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <GmButton type="primary">主行动</GmButton>
      <GmButton type="secondary">次行动</GmButton>
      <GmButton type="outline">描边</GmButton>
      <GmButton type="dashed">虚线</GmButton>
      <GmButton type="text">文字</GmButton>
      <GmButton type="default">中性</GmButton>
      <GmButton type="primary" status="success">成功</GmButton>
      <GmButton type="primary" status="danger">危险</GmButton>
      <GmButton type="primary" loading>提交中</GmButton>
      <GmButton type="primary" disabled>禁用</GmButton>
      <GmButton type="primary" size="large">大</GmButton>
      <GmButton type="primary" size="small">小</GmButton>
      <GmButton type="primary" size="mini">迷你</GmButton>
    </section>

    <section style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
      <GmTag semantic="positive">正常</GmTag>
      <GmTag semantic="info" size="default">进行中</GmTag>
      <GmTag semantic="attention">注意</GmTag>
      <GmTag semantic="risk">风险</GmTag>
      <GmTag semantic="special" :dot="false">特殊</GmTag>
      <GmTag five="m3">橙 · 较高风险</GmTag>
      <GmStatusTag>待随访</GmStatusTag>
      <GmStatusTag>高危</GmStatusTag>
      <GmStatusTag>阳性</GmStatusTag>
      <GmStatusTag>已建档</GmStatusTag>
      <GmStatusTag size="large" closable>已转诊</GmStatusTag>
      <GmStatusTag>未登记的新状态</GmStatusTag>
    </section>

    <section style="margin-top:20px;display:flex;gap:16px;flex-wrap:wrap;align-items:center">
      <GmAvatar text="张" :size="36" />
      <GmAvatar text="李" :size="46" tone="mint" />
      <GmAvatar text="王" :size="56" tone="purple" />
      <GmLink href="https://example.com">普通链接</GmLink>
      <GmLink external href="https://example.com">外链</GmLink>
      <GmLink variant="danger" @click="() => {}">删除动作（button 语义）</GmLink>
      <GmLink disabled>禁用链接</GmLink>
    </section>

    <section style="margin-top:20px;display:flex;gap:16px;flex-wrap:wrap">
      <GmCard title="孕产妇档案" style="width:320px">
        <template #extra>2024-06-01</template>
        <GmClientCard name="张三" sub="32岁 · 孕 24 周 · 第 2 胎">
          <template #tags><GmStatusTag>待随访</GmStatusTag><GmTag five="m1">绿 · 低风险</GmTag></template>
          <template #extra>3 天前</template>
          <template #ops><GmLink>随访</GmLink><GmLink variant="muted">详情</GmLink></template>
        </GmClientCard>
      </GmCard>
      <GmCard title="空状态" style="width:280px">
        <GmEmpty desc="还没有随访记录，去新建一条吧">
          <GmButton type="primary" size="small">新建随访</GmButton>
        </GmEmpty>
      </GmCard>
      <GmCard title="加载" style="width:280px">
        <GmSpin /><GmSkeleton :rows="3" style="margin-top:12px" />
      </GmCard>
    </section>

    <section style="margin-top:20px;display:flex;gap:24px;flex-wrap:wrap;align-items:center">
      <div style="width:280px"><GmProgress :percent="progress" text value-text="已完成 45%" /></div>
      <GmProgress :percent="72" type="circle" value-text="已完成 72%" />
      <GmProgress :percent="100" positive />
      <GmProgress :percent="88" danger />
      <GmButton size="small" @click="progress = (progress + 20) % 120">改进度</GmButton>
    </section>

    <section style="margin-top:20px">
      <GmRiskPicker v-model="risk" />
      <p style="color:var(--lg-text-secondary);font-size:12px">当前选择：{{ risk }}</p>
    </section>

    <section style="margin-top:20px;display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
      <!-- 冒烟测试专用：独立 v-model，避免与下方实例互相污染 -->
      <GmCascader v-model="regionProbe" :options="regionOptions" data-probe="cascader" />
      <GmCascader v-model="region" :options="regionOptions" />
      <GmCascader v-model="region" :options="regionOptions" mode="picker" />
      <div style="width:420px"><GmCascader v-model="region" :options="regionOptions" mode="inline" /></div>
    </section>

    <section style="margin-top:20px">
      <GmSteps
        :current="1"
        :items="[
          { title: '建档', description: '已完成' },
          { title: '首次随访', description: '进行中' },
          { title: '复查', description: '待办' },
          { title: '结案' },
        ]"
      />
    </section>

    <section style="margin-top:20px">
      <GmResponsiveView :data="rows.slice(0, 12)" :breakpoints="{ condensed: 900, card: 600 }">
        <template #table="{ rows }">
          <table style="width:100%;border-collapse:collapse;color:var(--lg-text-primary);font-size:13px">
            <tr v-for="r in rows" :key="r.id"><td style="padding:8px;border-bottom:1px solid var(--lg-divider)">{{ r.name }}</td></tr>
          </table>
        </template>
        <template #card="{ rows }">
          <div v-for="r in rows" :key="r.id" style="padding:10px;color:var(--lg-text-primary);border-bottom:1px solid var(--lg-divider)">{{ r.name }}</div>
        </template>
      </GmResponsiveView>
    </section>

    <section style="margin-top:20px;max-width:520px">
      <GmVirtualList :items="rows" :item-height="44" :height="264" aria-label="服务对象长列表">
        <template #default="{ item, index }">{{ index + 1 }}. {{ item.name }}</template>
      </GmVirtualList>
    </section>

    <section style="margin-top:20px">
      <GmTable
        :columns="tblCols"
        :data="tblData"
        :sort-key="tblSortKey"
        :sort-order="tblSortOrder"
        @sort-change="(k, o) => { tblSortKey = k; tblSortOrder = o; }"
      />
    </section>

    <section style="margin-top:20px;max-width:640px">
      <GmCollapse :items="folds" :default-open-keys="['a']" />
    </section>

    <section style="margin-top:20px;max-width:640px">
      <GmDescriptions :items="descs" />
    </section>

    <section style="margin-top:20px;display:flex;gap:16px;flex-wrap:wrap;align-items:center">
      <GmModal :open="modalOpen" title="随访确认" ok-text="确定" cancel-text="取消" @cancel="modalOpen = false">
        随访记录已保存，是否提交审核？
      </GmModal>
      <GmPopconfirm title="确认注销该档案？" description="注销后不可恢复" danger ok-text="确认注销">
        <span style="color:var(--lg-sem-risk);font-weight:600">注销档案</span>
      </GmPopconfirm>
      <GmPopover title="高危随访说明" content="高危孕产妇需在 7 天内完成复访。">
        <span style="color:var(--lg-link)">高危随访</span>
      </GmPopover>
      <GmTooltip title="实时防护已开启">
        <span style="color:var(--lg-sem-special)">防护状态</span>
      </GmTooltip>
    </section>

    <section style="margin-top:20px;max-width:560px">
      <GmGrowthCard :data="growth" />
    </section>
  </div>`,
};

createApp(App).mount("#app");
