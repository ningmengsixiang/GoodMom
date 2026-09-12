# 页面组合范式

## 列表页（服务对象 / 筛查 / 随访队列）

```
页面容器
├── 筛选区（容器查询 / GmResponsiveView 切换密集度）
├── 统计条（GmCard + 数字，色语义见 tokens.md）
├── GmResponsiveView
│   ├── #table     → 表格（PC，≥1024）
│   ├── #condensed → 紧凑表格或双列（768–1023）
│   └── #card      → 卡片列表（≤767）
└── 分页（PC）/ 触底加载（移动端）
```

原则：

- **状态留在页面层**：排序、筛选、分页由页面持有，形态切换不重置。
- **每行状态用 `GmStatusTag`**，不写色。
- **>500 行固定行高** 才上 `GmVirtualList`；否则普通 `v-for` + 分页。
- 空态必须给下一步动作（`GmEmpty` 里放主按钮），不能只有插画。

```vue
<GmResponsiveView :data="rows" :loading="loading">
  <template #table="{ rows }">
    <table>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td>{{ r.name }}</td>
          <td><GmStatusTag>{{ r.status }}</GmStatusTag></td>
          <td><GmLink :href="`/client/${r.id}`">详情</GmLink></td>
        </tr>
      </tbody>
    </table>
  </template>
  <template #card="{ rows }">
    <GmCard v-for="r in rows" :key="r.id" hoverable>
      <GmClientCard :name="r.name" :sub="r.sub">
        <template #tags><GmStatusTag>{{ r.status }}</GmStatusTag></template>
        <template #ops><GmLink :href="`/client/${r.id}`">详情</GmLink></template>
      </GmClientCard>
    </GmCard>
  </template>
</GmResponsiveView>
```

## 表单页

```
GmCard（分组）
├── 一行两列（PC）/ 单列（移动端，容器查询）
├── 控件全部 ≥40px 高（移动端 ≥44）
└── 底部操作条：主行动在右（移动端全宽 GmButton long）
```

- 校验错误要「就近 + 文字 + 色彩」三通道，不能只把边框变红。
- 提交中：主按钮 `loading`，并禁用重复提交。
- 危险操作（删除/停用）用 `type="primary" status="danger"`，且需二次确认。
- 不确定要不要的字段先不加 —— 妇幼场景表单过长会显著降低录入完成率。

## 详情页

```
页头：GmAvatar + 姓名 + GmStatusTag 组合 + 主行动按钮
主体：GmCard 分区（基本信息 / 风险分级 / 随访记录 / 检查结果）
风险分级：GmRiskPicker（若可编辑）或 GmTag five="mN"（若只读）
时间线：GmSteps 或自定义列表
```

- 组合标签（如 `已建档` `管理中` `高危`）按 15.2.9 顺序展示，不要随意排序。
- 只读态用 `GmTag`，可编辑态才用 `GmRiskPicker` —— 别让只读页面上出现可点控件。

## 移动端要点（10 章）

| 项 | 约定 |
| --- | --- |
| 断点 | 卡片 ≤767 · 紧凑 768–1023 · 表格 ≥1024（**按容器宽度**） |
| 热区 | 可点元素 ≥44×44（R7） |
| 底部操作 | `GmButton long`，考虑 `env(safe-area-inset-bottom)` |
| 选择器 | 多列选择用 `GmCascader mode="picker"`（底部弹层 + 确定才提交） |
| 步骤条 | `GmSteps` ≤767 自动纵向 |
| 表格 | 不在移动端横向滚大表 —— 用 `#card` 分支重排为卡片 |

## 反馈三态（08 章）

| 场景 | 用什么 |
| --- | --- |
| ≤300ms 请求 | **不显示** loading（闪烁比等待更糟） |
| >300ms 局部刷新 | `GmSpin` |
| 首屏结构已知 | `GmSkeleton`（必须与真实内容同结构同高度，避免 CLS） |
| 无数据 | `GmEmpty` + 下一步动作 |
| 出错 | `GmEmpty` 变体 + 重试按钮；错误文案要说人话和怎么解决 |

## 页面级组合容易踩的坑

| 坑 | 后果 | 正确做法 |
| --- | --- | --- |
| 每个组件各自 `fetch` | 瀑布请求 + 形态切换重复请求 | 页面层取数，向下传 props |
| `watch` 把 props 拷进本地 state | 双向不同步（Vue 反模式） | 直接用 props 或 `defineModel` |
| 用 `v-if` + `v-show` 同时做两套布局 | 读屏读到重复内容、移动端多渲染一份 | 只渲染一个分支 |
| 状态色写死在页面 | 换肤/暗色失效 | `GmStatusTag` + 变量 |
| 直接改 `border-width` 做选中态 | 布局抖动（R9） | `box-shadow` / `outline` |
