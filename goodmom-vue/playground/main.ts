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
  BUSINESS_LABELS,
  type GmCascaderOption,
  type GmFive,
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

    return { risk, region, regionProbe, dark, progress, rows, regionOptions, BUSINESS_LABELS };
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
  </div>`,
};

createApp(App).mount("#app");
