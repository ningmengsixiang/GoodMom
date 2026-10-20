# 27 个组件的契约（源码实测）

> 「props 名 + 类型 + 默认值」逐条取自两包同名文件。凡两侧有差异，显式标注。
> 通用规则：两侧**源码 props 名都是 camelCase**（Vue 模板里可写 kebab-case）；React 独有 `className` / `style` / `children`；React 事件 `onXxx` ↔ Vue `emit("xxx")`。

---

## `GmButton`（两侧契约完全一致）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `type` | `primary \| secondary \| outline \| dashed \| text \| default` | `primary` |
| `status` | `default \| success \| warning \| danger` | `default` |
| `size` | `mini \| small \| default \| large` | `default` |
| `shape` | `round \| circle \| square` | `round` |
| `long` `disabled` `loading` | `boolean` | `false` |
| `nativeType` | `button \| submit \| reset` | `button` |
| `ariaLabel` | `string` | —（**仅图标按钮必填**，缺失 `console.warn`） |
| `icon` | 节点 / `icon` 槽 | —（前置 16px 槽位） |
| 事件 | React `onClick` / Vue `@click(MouseEvent)` | — |

- 类名契约：`gm-btn` `gm-btn--{type}` `gm-btn--{status}`（仅非 default）`gm-btn--sz-{size}` `gm-btn--circle|--square`（仅非 round）`gm-btn--long|--icon-only` `gm-btn--disabled|--loading` `gm-btn__spinner` `gm-btn__icon`
- DOM：`<button type disabled aria-busy={loading||undefined} aria-label>`；`loading` 时 `<span class="gm-btn__spinner">` **替换图标位、文字保留**
- 点击拦截：React 在 `disabled || loading` 时 `preventDefault + stopPropagation`
- `disabled: opacity .4`（暗色 .5）；spinner **18px**

## `GmButtonGroup`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `shape` | `attached \| round \| segmented` | `attached` |
| `ariaLabel` | `string` | — |

- 语义：`attached`/`round` → `role="group"`；`segmented` → `role="radiogroup"`
- 键盘：`←/→/↑/↓` 移动并激活、`Home/End` 到首尾（roving tabindex，选中 `0` 其余 `-1`）
- 自检告警：`segmented` 缺 `ariaLabel`，或组内 `aria-checked="true"` 数量 ≠ 1
- 类名：`gm-btn-group`、`gm-btn-group--{round|segmented}`（`attached` 无后缀）
- 硬约束：**组内必须同类型同尺寸**；文字长度差 ≤2 倍；`ariaLabel` 必填。**两个按钮不用组**

## `GmCard`

| 侧 | props | 类型 | 默认 |
| --- | --- | --- | --- |
| React | `title` `extra` `children` | `ReactNode` | — |
| React | `radius` | `number` | **22** |
| Vue | `title` | `string` | — |
| Vue | `radius` | `number` | **22** |
| Vue | `hoverable` `bodyless` | `boolean` | `false` |
| Vue | 插槽 | `default` `extra` `footer` | — |

- React 仅在 `title || extra` 时渲染 `.gm-card-head`（`<b>` + `<span>`），**无 footer 概念**
- ⚠️ 差异：React 无 `hoverable` / `bodyless` / footer —— 跨库迁移要改结构

## `GmStatusTag`（业务状态标签）★最常用也最容易错

| prop | React | Vue |
| --- | --- | --- |
| 内容 | `children`（必填） | `default` 槽 |
| `semantic` | `GmSemantic`，可选 | `GmSemantic`，可选（两侧未显式传时都按文案 `semanticOf()` 推导） |
| `five` | `GmFive` | 同 |
| `color` | `string`（hex 或 CSS 变量表达式） | 同 |
| `size` | `small \| default \| large`，默认 **`default`** | 同枚举，同默认 **`default`** |
| `closable` | `boolean` | `boolean`，默认 `false` |
| 关闭 | `onClose?: (ev: React.MouseEvent) => void` | `@close(ev: MouseEvent)` |
| `closeLabel` | `string`，默认「移除」 | `string`，默认「移除」 |

- **取色优先级：显式 `color` > `five` > `semantic`**；语义/五色走 `var(--lg-sem-*)` / `var(--mmh-m5-*)`
- 视觉三通道：`color: var(--lg-sem-x)` + `background: color-mix(… 13% …)`（`semTintFill`）+ 色点同色（`semTintBorder` 固定 32%）
- 五色分支**文字不用五色亮值**（走 `--lg-text-primary`），颜色由色点承载
- DOM：`<span class="gm-status-dot" aria-hidden>` + 可选 `<span class="gm-sr-only">{语义名}：</span>` + 可选 `<button class="gm-status-tag__close">`
- **尺寸类名两侧同规则**：`gm-status-tag--{size}`（`small` 复用 `default` 档视觉）。历史缺陷是 React 给 `large` 挂了一个 CSS 里不存在的字面类 `lg`，导致该 prop 完全无效 —— 已修。
- 自动取色来源：`tokens/business.ts` 的 `MAP`（**60 条**）；未登记文案 `semanticOf()` 回落 `neutral` 且**不报错**

## `GmTag`（分类 / 标记）

| prop | 类型 | 默认 |
| --- | --- | --- |
| 内容 | `children` / 默认插槽（必填） | — |
| `semantic` | `GmSemantic` | `undefined`（内部回退 `neutral`） |
| `five` | `GmFive` | `undefined` |
| `color` | `string` | `undefined` |
| `dot` | `boolean` | `true` |
| `size` | `small \| default` | `small` |

- 类名 `gm-tag` +（`size === "default"` 时追加字面类 `lg`，两侧一致）
- `data-semantic` 仅在既无 `color` 也无 `five` 时挂出
- 与 `GmStatusTag` **不合并**（D3）：`GmTag` 自包含轻量，`GmStatusTag` 承载业务状态

## `GmAvatar`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `text` | `string`（**必填**） | — |
| `size` | `number`（px 直径） | `36` |
| `tone` | `rose \| mint \| purple` | `rose` |
| `label` | `string` | `undefined` |

- 渲染 `String(text).slice(0,1)` 取首字；字号 `round(size * 0.42)`
- 无障碍：有 `label` → `role="img"` + `aria-label`；无 → **`aria-hidden`**（否则读屏把「张」当孤立文字念）
- 墨色用同色系**深档固定值**（`#B23A63` / `#25715D` / `#6242B8`）—— 白字压在亮粉渐变上实测仅 2.81:1

## `GmProgress`

| prop | React | Vue |
| --- | --- | --- |
| `percent` | `number`，默认 `0`（**可选**） | `number`（**必填**） |
| `type` | `line \| circle`，默认 `line` | 同 |
| `status` | `normal \| success \| warning \| danger` | 同 |
| `positive` / `danger` | `boolean`，`@deprecated` | `boolean`，默认 `false` |
| `text` | `boolean`，默认 `false` | 同 |
| `size` | `small \| default \| large`，默认 `default` | 同 |
| `diameter` | `number` | 同 |
| `valueText` | `string` | 同 |
| `indeterminate` | `boolean`，默认 `false` | 同 |
| `ariaLabel` | `string` | 同 |

- 线性高度 **3 / 6 / 10**（细/默认/粗）；环形直径 **56 / 72 / 96**
- 填充：`normal` = 品牌玫渐变 `linear-gradient(90deg,var(--mmh-rose-300),var(--mmh-rose-500))`；其余 `var(--lg-sem-positive|attention|risk)`
- 无障碍：`role="progressbar"` + `aria-valuemin/max/now/valuetext`；**`indeterminate` 不报 `aria-valuenow`**
- ⚠️ React 侧基于 Arco：直径必须走 `width`（Arco `size` 是枚举且只作用线性条）

## `GmSteps`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `{ title: string; description?: string; status?: "wait"\|"process"\|"finish"\|"error" }[]`（必填） | — |
| `current` | `number`（0 起） | `0` |
| `size` | `default \| small` | `default` |

- 未给 `status` 时自动推导：`i < current → finish`、`i === current → process`、其余 `wait`
- 语义：`<ol class="gm-steps">` + `<li class="gm-step {status}" aria-current="step">`；节点 `.gs-dot aria-hidden`，完成态内联对勾 SVG、`error` 显示 `!`、否则序号
- 小尺寸额外类 `sm`

## `GmToast`

| prop | React | Vue |
| --- | --- | --- |
| `open` | `boolean`（**必填受控**） | `boolean`（可选，支持 `v-model:open`） |
| `message` | `string` | 同 |
| `status` | `success \| error \| warning \| info`，默认 `info` | 同 |
| `duration` | `number`，默认 **2400**（`0` = 不自动关） | 同 |
| `actionText` | `string` | 同 |
| 事件 | `onAction` / `onClose` | `@action` / `@close` |
| `ariaLabel` | `string` | 同 |

- 时序：滑入 **320ms** → 驻留 **2400ms** → 淡出上滑 **240ms**（`LEAVE_MS = 240`）；两阶段挂载（先 `.is-leaving` 播完再卸载）
- 无障碍：`error` → `role="alert"` + `aria-live="assertive"`；其余 → `role="status"` + `aria-live="polite"`
- **同一时刻至多一个 `open`**（同类仅 1 条，`audit.py feedback-spec` 守门）；应统一走 `useAppToast()`
- **字段错误不用 Toast**

## `GmEmpty`

| prop | React | Vue |
| --- | --- | --- |
| `icon` | `ReactNode` | `unknown` + `icon` 槽 |
| `title` | `ReactNode`，`undefined`（**不渲染**） | `string`，默认 **「暂无数据」** |
| `desc` | `ReactNode` | `string` |
| `iconSize` | `default \| large`，默认 `default` | 同 |
| 行动槽 | `children` | 默认插槽 |

- 图标像素 `large ? 48 : 24`；容器 `.gm-empty`（`role="status"`）
- 内置默认 SVG：玻璃圆环人形 24×24 / `stroke-width 1.6`
- 分工：**Empty = 没有数据但一切正常**；有操作含义的空态才给主动作

## `GmResponsiveView`（容器宽度切形态）

| prop | React | Vue |
| --- | --- | --- |
| `data` | `T[]`（必填） | 同 |
| `mode` | `auto \| table \| condensed \| card`，默认 `auto` | 同 |
| `breakpoints` | `{ condensed, card }`，默认 **`{1024, 767}`** | 同 |
| `table` | `(rows) => ReactNode`（**必填**） | `table` 槽（`{ rows }`） |
| `condensed` | 可选（**未提供则回落 table**） | 同 |
| `card` | `(rows) => ReactNode`（**必填**） | `card` 槽 |
| `loading` | `boolean`，默认 `false` | 同 |
| `empty` | `ReactNode`（默认 `<GmEmpty title="暂无数据" />`） | `empty` 槽 |
| `onModeChange` | `(mode) => void` —— **prop，不是事件** | 同 |

- 解析：`width >= condensed → table`；`width > card → condensed`；否则 `card`
- 测量：`ResizeObserver` 观测根 `div`，回调用 `requestAnimationFrame` **推迟一帧**（否则 Chrome 抛 ResizeObserver loop 未捕获错误）；无 RO 回落 `window.resize + innerWidth`；SSR 首帧乐观值 = `condensed`
- **同一时刻只渲染一个分支**；排序/筛选/分页状态由页面持有，切形态**不重置**
- 分支优先级：`loading`（GmSpin）→ `rows.length===0`（GmEmpty）→ `card` → `condensed` → `table`
- DOM：`.gm-rv.gm-rv--{resolved}` + `data-mode`

## `GmVirtualList`

| prop | React | Vue |
| --- | --- | --- |
| `items` | `T[]`（必填） | 同 |
| `itemHeight` / `height` | `number`（**必填**，固定行高 / 视口高） | 同 |
| `overscan` | `number`，默认 `4` | 同 |
| `renderItem` | `(item, index) => ReactNode`（必填） | `default` 槽（`{ item, index }`） |
| `itemKey` | `(item, index) => Key` | 同 |
| `onEndReached` | `() => void` —— **prop，不是事件** | 同 |
| `endThreshold` | `number`，默认 `4` | 同 |
| `stickyTop` | `ReactNode` | `sticky` 槽 |
| `ariaLabel` | `string`，默认「长列表」 | 同 |
| 实例方法 | **无** | `defineExpose({ scrollToIndex })` |

- 窗口：`start = max(0, floor(scrollTop/itemHeight) - overscan)`；`count = ceil(height/itemHeight) + overscan*2`
- 无障碍：viewport `role="list"` + `tabIndex={0}`；项 `role="listitem"` + `aria-posinset` + `aria-setsize`；键盘 `PageDown/PageUp`（0.9 屏）、`Home/End`、`↑/↓`（±itemHeight）
- `onEndReached` **只在跨过阈值时触发一次**；回滚后再次到底可再触发
- **不支持动态行高**；门槛见 `inventory.md`

## `GmLink`

| prop | 类型 | 默认 |
| --- | --- | --- |
| 内容 | `children` / 默认插槽（必填） | — |
| `href` | `string` | `undefined`（有 → `<a>`；无 → `<button type="button">`） |
| `variant` | `default \| primary \| muted \| danger` | `default` |
| `underline` | `always \| hover \| none` | `hover` |
| `external` `disabled` | `boolean` | `false` |
| `icon` | 节点 / 槽 | — |
| `ariaLabel` | `string` | — |
| `size` | `small \| default \| large` | `default` |

- 分支：`disabled` → `<span aria-disabled="true">`（**不挂 href/onClick**）；`href` → `<a>`，外链补 `target="_blank" rel="noopener noreferrer"` + `gm-link__ex` 12px 图标 + `<span class="gm-sr-only">（新窗口打开）</span>`；否则 `<button type="button">`
- **禁 `href="#"` 假链接**

## `GmResult`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `status` | `success \| error \| warning \| info` | `info` |
| `title` | `string` | — |
| `desc` | `string`（Vue）/ `ReactNode`（React） | — |
| `actionText` | `string` | —（为空则不渲染按钮） |

- 容器与图标规则两侧逐字节一致（`.gm-result` / `.gm-result__ic`：居中竖排 + 56px 语义色圆图标）。React 侧此前**完全没有这两条规则**（渲染了 class 却没有样式 → 结果页裸排），已补齐。
| `onAction` / `@action` | — | — |
| `icon` `ariaLabel` | — | — |

- `role`：`error → alert`，其余 `status`
- **有意不提供 `code` / `stack` prop**（错误码属内部结构，不应出现在界面）
- 内置四态图标 24×24 / `stroke-width 1.7`；类名 `gm-result` `gm-result--{status}` `__ic` `__t` `__d` `__act`

## `GmSpin`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `text` | `string` | 「加载中…」（传空串则只显示指示器） |
| `size` | `sm \| md \| lg \| xl` 或 `number` | `md`；档位 **18/24/32/40**，数字入参**夹到 [18,40]** |
| `delay` | `number`(ms) | **300**（`0` = 立即；loading 与内容不得闪切） |
| `tone` | `brand \| inverse` | `brand` |
| `ariaLabel` | `string` | — |

- 未到 `delay` 时 `return null`；内部 `<i>` 尺寸即档位，`fontSize = max(11, px*0.62)`
- 无障碍：`role="status"` + `aria-live="polite"`
- **全系统仅允许这一个旋转元素**；`prefers-reduced-motion` 下停止旋转

## `GmSkeleton`

| prop | 类型 | 默认 |
| --- | --- | --- |
| `rows` | `number` | `3` |
| `widths` | `string[]`（循环取用） | `["100%","84%","70%"]` |
| `label` | `string`（读屏） | 「内容加载中」 |
| `rowHeight` | `number`(px) | `12`（**应贴近终态高度**） |

- 容器 `<div class="gm-skeleton" role="status" aria-busy="true" aria-label>`；每行 `<i aria-hidden>`
- 动画：**圆角胶囊 + 1.6s 上下微透明呼吸（α .5↔.85，ease-in-out）**；⛔ **禁左右扫光马赛克**

## `GmCascader`

| prop | React | Vue |
| --- | --- | --- |
| `options` | `GmCascaderOption[]`（必填） | 同 |
| `value` | `string[]`（传入即受控） | — → `v-model`（`modelValue`） |
| `defaultValue` | `string[]` | `string[]`，默认 `[]` |
| `onChange` / `@change` | `(value, selectedOptions) => void` | `@change(value, selectedOptions)` |
| `mode` | `popup \| inline \| picker`，默认 `popup` | 同 |
| `placeholder` | `string` | `string`，默认「请选择」 |
| `disabled` | `boolean` | `boolean`，默认 `false` |
| `changeOnSelect` | `boolean`，默认 `false` | 同 |
| `separator` | `string`，默认 `" / "` | 同 |
| `allowClear` | `boolean`，默认 `true` | 同 |

- `GmCascaderOption`：`{ value: string; label: ReactNode; children?: []; disabled?: boolean }`
- 语义：触发点 `<button aria-haspopup="listbox" aria-expanded>`；每列 `role="listbox"`；选项 `<button role="option" aria-selected>`；`picker` 形态 = 遮罩 + 底部弹层（`role="dialog" aria-modal`），点遮罩取消、**确定才提交**
- 键盘：`↑/↓` 列内移动、`→` 进下一列、`←` 回上一列、`Enter/Space` 选中、`Home/End`、`Escape` 关闭并归还焦点
- 规格：列 **168×240**（≥4 级列宽收至 148），选项行高 **34**；门槛：层级 ≤4 且单列 <200

## `GmRiskPicker`（妇幼领域）

| prop | React | Vue |
| --- | --- | --- |
| `value` | `GmFive` | — → `defineModel<GmFive \| undefined>` |
| `onChange` / `@change` | `(v: GmFive) => void` | `@change(value)` |
| `disabled` | `boolean` | `boolean`，默认 `false` |
| `ariaLabel` | `string`，默认「妊娠风险等级」 | 同 |

- `LABEL`：`m1`「绿 · 低风险」`m2`「黄 · 一般风险」`m3`「橙 · 较高风险」`m4`「红 · 高风险」`m5`「紫 · 合并传染病」；`ORDER = m1…m5`
- 语义：`role="radiogroup"` + 每项 `<button role="radio" aria-checked class="gm-risk-it[ on]">`（色点 + 文字）
- roving tabindex：无选中时 **`m1` 可聚焦**；有选中时仅选中项 `0`；禁用时全 `-1`
- 键盘：`←/→/↑/↓` 移动并切换、`Home/End`
- 文字**不用五色亮值**（走 `--lg-text-primary`）；颜色由色点 + 描边 + 选中环承载

## `GmClientCard`（妇幼领域）

| prop | React | Vue |
| --- | --- | --- |
| `name` | `string`（必填） | 同 |
| `sub` | `string` | 同 |
| `avatar` | `string`（默认取 `name`） | 同 |
| `tone` | `rose \| mint \| purple`（透传 `GmAvatar` → 实际 `rose`） | 默认 `rose` |
| `tags` | `ReactNode \| ReactNode[]`，默认 `[]` | `tags` 槽 |
| `extra` | `ReactNode` | `extra` 槽 |
| `actions` | `ReactNode \| ReactNode[]`，默认 `[]` | **`ops` 槽** |

- 结构：`.gm-client` + `GmAvatar size={46}` + `.gm-client-main`（`__name` + `__sub`）+ 可选 `.gm-client-extra` + 条件渲染 `.gm-client-ops`

## `GmTable`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `columns` | `{ key, title, align?, sortable?, ellipsis?, render? }[]`（必填） | — |
| `data` | `Record<string, unknown>[]`（必填） | — |
| `rowKey` | `string` | `"key"`（取不到回落行下标） |
| `caption` | `ReactNode` / `string` | — |
| `sortKey` / `sortOrder` | `string` / `"asc" \| "desc" \| null`（受控） | — / `null` |
| `onSortChange` / `@sort-change` | `(key, order) => void` | — |
| 空态槽 | React `empty` / Vue `empty` 槽 | 默认 `<GmEmpty title="暂无数据" />` |

- 语义：`<th scope="col">`；排序列表头是 `<button class="gm-tbl__sortbtn">`，组件维护 `aria-sort="ascending|descending|none"`（TB-15-02）；asc → desc → null 循环
- 操作列：`column.align === "right"` → 表头与单元格都挂 `col-ops`；行内操作 ≤3
- `ellipsis`：`.gm-tbl__ell` 单行省略 + `title` 全文（TB-15-02）
- 硬约定：整表 `tabular-nums`；td `padding:12px 14px` 不折行；宽表横滑由外层 `.gm-tbl-wrap` 承担；加载骨架/卡片流/窗口化分别组合 GmSkeleton/GmResponsiveView/GmVirtualList

## `GmCollapse`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `{ key, title, content, tone? }[]`（必填） | — |
| `defaultOpenKeys` | `string[]` | `[]` |
| `accordion` | `boolean` | `false` |
| `maxOpen` | `number` | **3**（11 · 11.2.6 一屏 ≤3 写死，组件内建收最早） |

- 动画内建：展开先 `open` 再 0fr→1fr；收起先推 0fr 等 **300ms** 再摘 `open`（原生 details 收起时 transition 播不出来）；箭头 220ms
- 语义：原生 `<details>/<summary>` + summary 补 `aria-expanded`/`aria-controls`；键盘 Enter/Space 原生承担
- `tone` 五色状态点：`data-tone` 挂在 `<details>` 上（neutral/positive/attention/risk/info）
- 结构硬约定：`.gm-fold__body>div` 代理层**不得带 padding**（0fr 轨道含 padding 不可压缩，实测残留 14px）

## `GmDescriptions`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `{ label, value, title?, num? }[]`（必填） | — |
| `columns` | `number`（2–4） | **3**（`--gm-desc-cols`） |
| `columnsSm` | `number` | **1**（`--gm-desc-cols-sm`） |

- 语义：`<dl>` + `<dt class="k">` / `<dd class="v">`；key caption 12/16 **次级色**（三级色 12px 约 2.6:1，D19 裁决）
- value body-sm 14/20 600 主色；单行省略 + `title` 全文（8.2.13，缺省取 value 字符串形态）；`num` → tabular-nums
- 断点 1023/767 内建（与站点同一套 CSS 变量）

## `GmModal`（V2.10）

| prop | React | Vue |
| --- | --- | --- |
| `open` | `boolean`，默认 `false`（受控） | 同，另有 `v-model:open` |
| `title` | `ReactNode` | `string` |
| `okText` / `cancelText` | `string` | 同，默认「确定」/「取消」 |
| `closable` / `maskClosable` | `boolean`，默认 `true` | 同 |
| `width` | `number`，默认 **480** | 同 |
| `footer` | `ReactNode` | `footer` 槽 |
| 内容 | `children` | 默认插槽 |
| 事件 | `onOk` / `onCancel` / `onClose` | `@ok` / `@cancel` / `@close`（on* prop 同支持） |

- 时序（MD-18-01）：遮罩淡入 **250ms** + 面板 **320ms**（scale .98→1、下移 12px）；退场 240ms 播完再卸载
- 行为内建（MD-18-02）：`role="dialog"` + `aria-modal="true"` + `aria-labelledby`；打开锁 body 滚动、焦点进面板；ESC/遮罩点击（e.target===currentTarget）/×/取消 关闭；关闭**归还焦点到触发点**；层叠 ≤2 由调用方保证
- 移动端（11.2.15）：双按钮竖排（确认在下、取消在上）、单按钮全宽；宽 ≤ 屏宽-64、圆角 24

## `GmPopconfirm`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `title` / `description` | `ReactNode` / `string` | — |
| `okText` / `cancelText` | `string` | 「确定」/「取消」 |
| `danger` | `boolean` | `false`（确认钮 D5 深档 danger 实底） |
| 触发器内容 | `children` / 默认插槽（**只能是图标/文字**，整块是按钮） | — |
| 事件 | `onConfirm` / `onCancel` ↔ `@confirm` / `@cancel` | — |

- 非模态 `role="dialog"` + `aria-labelledby`（Part 18 裁决口径）；触发器 `aria-haspopup="dialog"` + `aria-expanded`
- 焦点：打开进气泡首按钮；ESC/外点（mousedown outside）关闭并**归还触发点**；进出 180ms / Y4px
- 移动端由 ActionSheet 承担（10.4），本组件不内置第二套形态

## `GmPopover`（V2.10）

| prop | React | Vue |
| --- | --- | --- |
| `title` | `ReactNode` | `string` |
| 内容 | `content`（ReactNode，必填） | `content` 槽（兼容 `content` prop） |
| 触发器 | `children` | 默认插槽（**只能是图标/文字**） |

- 面板 `--lg-glass-popover` 材质、圆角 20；**240ms 指向触发点**（MD-18-01）
- 触发器 `aria-haspopup="dialog"` + `aria-expanded`；气泡 `role="dialog"`（带交互内容）；ESC/外点关闭归还焦点

## `GmTooltip`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `title` | `string`（**必填**） | — |
| 内容 | `children` / 默认插槽 | — |

- MD-18-01：**180ms / Y4px**；`role="tooltip"` + `pointer-events:none`
- 触发：桌面 hover / 键盘 focus（事件冒泡自内部可聚焦子元素）/ 移动端 tap 开合（10.4 禁 hover 依赖）；Escape 收起

## `GmGrowthCard`（V2.10）

| prop | 类型 | 默认 |
| --- | --- | --- |
| `data` | `GmGrowthData`（必填，契约与站点 `window.gmGrowth` **逐字一致**：xName/xUnit/yName/yUnit/source/bandLabel/seriesName/x/p3/p50/p97/actual/focus/xTicks/yTicks/advisories/hint/tone/mini） | — |
| `showP50` / `showWarnToggle` / `interactive` | `boolean` | `true` |
| 事件 | `onPoint(index)` / `onRange(range)` ↔ `@point` / `@range` | — |

- 视觉硬约定（13.2）：参考带 alpha **.12**（rose 档 #FFD0D8 .12）+ 细白上界；主曲线 #F77FA3 **2.5px** round + 端点白芯粉描边；警戒线 **1.5px** `--gm-guide` 虚线（告警转 attention）；P50 中线细白 1px 虚线；带外点转琥珀/红 + 玻璃气泡建议；轴刻度 12px 次级色 tabular-nums
- 交互：PC 悬停单点 + 鼠标拖拽框选（`role="status"` 播报）；M 端长按单点 / 滑动回看（touch 不进框选）；`mini` 形态只留带 + 线 + 端点（200×74）
- 无障碍：svg `role="img"` + aria-label（含最新读数）；`table.gm-sr-only`（table-layout:fixed）隐藏数据表逐点读数；开关 `aria-pressed`；移动热区 ≥44（toggle ::after 扩热区）
- 百分位：P3–P50–P97 **分段线性**（单一线性偏 6–8 分位），带外外推夹 1/99

---

## 文档级契约（组件实现依赖，非 props）

- **Token 与状态字典为两库共享源**：`src/tokens/{status,business,design}.ts` —— 「改一处必须改两处」。
- **状态字典导出面**：`SEMANTIC_COLOR`（前景六色）· `SEMANTIC_SOLID`（D5 白字实底达标档）· `SEMANTIC_VAR`（`--lg-sem-*`）· `SEMANTIC_LABEL` · `SEMANTIC_CSS_SUFFIX = "gm-sem"` · `FIVE_COLOR` / `FIVE_VAR`（`--mmh-m5-*`）· `varOf`（**仅 React**）· `semTint` / `semTintFill`（用 `--lg-tint-pct`，浅 13% / 暗 8%）/ `semTintBorder`（固定 32%）。
- ⛔ **禁止 `color-mix(…, transparent)`**：底会随底下玻璃与品牌渐变浮动；混实底后浅 4.86:1 / 暗 4.9:1。
- `GmStatusTag` 的 `SEMANTIC_LABEL` 中文名（正常/信息/注意/风险/中性/特殊）是**颜色之外的第二通道**，供读屏与图例使用。

## 守门机制（三层）

| 层 | 工具 | 防的是 | 在 CI |
| --- | --- | --- | --- |
| CSS 写法 | `scripts/check-style-parity.py --ci` | 共享选择器**逐字节**一致 · 暗色覆盖集合 · **浅/暗两张 Token 表** | ✅ `docs-links` |
| props / 默认值 / 类名 | `scripts/check-component-contract.py --ci` | API 面漂移 + 惯用写法映射的能力对等（归一化后严格比对） | ✅ `architecture-gate` |
| 镜像 | `scripts/audit.py mirror_sync` | React 包 ↔ 应用镜像逐字节（**排除 `goodmom-vue/**`**） | ✅ |
| 状态字典 | `scripts/check-status-map.py --ci` | 15 章 ⇄ 两库映射表 + 六语义四来源同号 | ✅ |

**已登记差异：只剩宿主惯用写法映射**（`IDIOM` 表）。原先的 `KNOWN_DIVERGENCE` 白名单（8 个组件）已**删除** —— 它的粒度是「允许这个组件的 props 不一致」，于是整组 props 与默认值的比对被跳过，实测漏掉了 `GmStatusTag` 的 `size` 默认值不同、`size="large"` 无效、`GmCard` 少 `hoverable`/`bodyless`、`GmEmpty` 的 `title` 默认值不同等真缺陷。

现在改为「**归一化宿主惯用写法 → 严格集合比对 → 能力对等校验**」：

| 规则 | React | Vue | 规范名 |
| --- | --- | --- | --- |
| 默认内容区 | `children` | 默认插槽 | `#default` |
| 具名区域 | prop（`ReactNode` / render 函数） | 具名插槽 | `#<name>` |
| 受控值 | `value` + `onChange` | `v-model`（`modelValue` + `update:modelValue`） | prop `value` + 事件 `change` |

`IDIOM` 里每条映射都必须通过 `capability_parity()`：映射表里写了哪一侧，那一侧就必须真有那个成员。**任何新的漂移照旧 FAIL。**
