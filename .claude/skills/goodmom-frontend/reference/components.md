# 组件速查（@goodmom/vue）

包入口：`import { GmButton } from "@goodmom/vue"`；样式一次引入 `import "@goodmom/vue/style.css"`。
全量注册（仅原型/内部工具）：`app.use(GoodMomVue)`。

## 选型决策树

```
要展示状态？ ── 是 → 文案来自 15 章词库？ ── 是 → GmStatusTag（自动取色）
                                          └ 否 → GmTag（显式 semantic / color）
               否 → 要展示服务对象？ ── 是 → GmClientCard
                                    └ 否 → 要容器？ ── 是 → GmCard
                                                    └ 否 → 继续按语义选（见下表）
```

## 组件表

| 组件 | 用途 | 关键 props | 事件/插槽 |
| --- | --- | --- | --- |
| `GmButton` | 按钮（唯一动作入口） | `type` `status` `size` `shape` `long` `loading` `disabled` `nativeType` `ariaLabel` | `@click`；插槽 `default` `icon` |
| `GmStatusTag` | **业务状态**（自动取语义色） | `semantic` `five` `color` `size` `closable` | `@close`；`default` |
| `GmTag` | 分类/标记（非状态） | `semantic` `five` `color` `dot` `size` | `default` |
| `GmCard` | 玻璃卡片容器 | `title` `radius` `hoverable` `bodyless` | `default` `extra` `footer` |
| `GmAvatar` | 首字头像 | `text` `size` `tone` `label` | — |
| `GmClientCard` | 服务对象卡 | `name` `sub` `avatar` `tone` | `tags` `extra` `ops` |
| `GmLink` | 链接/文字按钮 | `href` `variant` `underline` `external` `disabled` `size` | `@click`；`default` `icon` |
| `GmProgress` | 进度条 | `percent` `type` `positive` `danger` `text` `size` `valueText` | — |
| `GmEmpty` | 空状态 | `title` `desc` `iconSize` `icon` | `default` `icon` |
| `GmSpin` | 局部加载 | `text` `size` | — |
| `GmSkeleton` | 首屏骨架 | `rows` `widths` `label` | — |
| `GmSteps` | 步骤条 | `items` `current` `size` | — |
| `GmRiskPicker` | 妊娠风险五色单选 | `v-model` `disabled` `ariaLabel` | `@change` |
| `GmCascader` | 级联选择 | `v-model` `options` `mode` `changeOnSelect` `separator` `allowClear` | `@change` |
| `GmResponsiveView` | 容器级响应式分支 | `data` `mode` `breakpoints` `loading` | `table` `condensed` `card` `empty` |
| `GmVirtualList` | 虚拟长列表 | `items` `itemHeight` `height` `overscan` `endThreshold` `ariaLabel` | `default` `sticky`；暴露 `scrollToIndex` |

## 关键用法

### 按钮 —— 类型 × 状态的合成规则

```vue
<!-- 主行动：品牌粉上半段渐变 + 深字（R1，不要改成白字） -->
<GmButton type="primary">保存并提交</GmButton>
<!-- 危险实底走 D5 深档（小字号白字 AA 达标） -->
<GmButton type="primary" status="danger">删除</GmButton>
<!-- 危险描边：文字用语义 alias，浅底可读 -->
<GmButton type="outline" status="danger">停用</GmButton>
<!-- 仅图标必须给 ariaLabel，否则读屏只有"按钮" -->
<GmButton shape="circle" aria-label="关闭"><template #icon>✕</template></GmButton>
<!-- loading 自动禁用点击 + aria-busy，且保留宽度不跳动 -->
<GmButton type="primary" loading>提交中</GmButton>
```

尺寸：`mini 26 / small 32 / default 40 / large 48`（圆角 16/18/22/26，02.4）。

### 状态标签 —— 页面不写色

```vue
<GmStatusTag>待随访</GmStatusTag>   <!-- 自动 attention 琥珀 -->
<GmStatusTag>高危</GmStatusTag>     <!-- 自动 risk 珊瑚（R4 曾漏登记，已修） -->
<GmStatusTag five="m4">红 · 高风险</GmStatusTag>  <!-- 五色优先 -->
<GmStatusTag semantic="positive">已通过</GmStatusTag> <!-- 文案不在词库时显式指定 -->
```

未登记文案回落 `neutral` 灰且**不报错** —— 所以新状态必须按 R4 登记，否则线上静默变灰。

### 链接 vs 按钮（R6）

```vue
<GmLink href="/detail/1">查看档案</GmLink>          <!-- 导航 → <a> -->
<GmLink @click="followUp">发起随访</GmLink>          <!-- 动作 → <button> -->
<GmLink external href="https://x.com">外部规范</GmLink> <!-- 自动 target/rel + 尾图标 + 读屏后缀 -->
<GmLink disabled>不可用</GmLink>                     <!-- 非交互 span + aria-disabled -->
```

### 受控组件 —— 一律用 v-model

```vue
<GmRiskPicker v-model="risk" />
<GmCascader v-model="region" :options="regionOptions" mode="picker" />
```

### 响应式 —— 按容器宽度，不按视口

```vue
<GmResponsiveView :data="rows" :breakpoints="{ condensed: 1024, card: 767 }">
  <template #table="{ rows }"><DataTable :rows="rows" /></template>
  <template #card="{ rows }"><ClientCardList :rows="rows" /></template>
</GmResponsiveView>
```

同一时刻只渲染一个分支。页面的排序/筛选/分页状态留在页面层，**切换形态不得重置**。

### 虚拟列表 —— 门槛

固定行高且数据 >500 行才用；`<200` 行直接 `v-for` 更快更简单。

```vue
<GmVirtualList ref="listRef" :items="items" :item-height="44" :height="264"
  aria-label="服务对象长列表" @end-reached="loadMore">
  <template #default="{ item, index }">{{ index + 1 }}. {{ item.name }}</template>
</GmVirtualList>
```

`@end-reached` 只在跨过阈值时触发一次，回滚后再到底可再触发（不会重复请求同页）。
动态行高不支持 → 改分页或定高卡片。

## 反模式

| 反模式 | 后果 |
| --- | --- |
| `GmStatusTag` 里塞复杂 HTML 结构 | 文案提取可能取不到 → 回落灰色；状态标签只放纯文案 |
| `GmCascader` 选项 >200 条 | 列全量渲染，卡顿；改用搜索式选择 |
| `GmResponsiveView` 里做数据请求 | 形态切换会重复请求；数据在页面层取好传进来 |
| 给 `GmVirtualList` 传变高的项 | 窗口计算错位，出现空白/跳动 |
