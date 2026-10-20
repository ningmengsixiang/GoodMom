# 组件总表与两库映射

> 来源：`00-组件总目录.md`（实为 **99 行**：编号 1–98 + `10b`）· `08-组件覆盖清单与Semi对齐.md` · 两包 `src/index.ts`。
> 口径：**规范定义 ≠ 代码实现**。下表用 ✅ 标「库里真有这个组件可以 import」，⚠️ 标「只有站点 CSS 类、两个库都没有」，✗ 标「还没做」。

## 0. 一句话结论

- 两库各 **27 个 `Gm*` 组件，完全同名同数**。
- 99 行总表里**只有 22 行有库实现**（V2.10 新封 7 行 8 组件：`Table` `Collapse` `Descriptions` `Modal` `Popconfirm` `Popover`/`Tooltip`、生长曲线卡）。
- **代码存在但 `00` 未登记** 2 个：`GmRiskPicker`、`GmClientCard`（在 13.1 / 15.6.1 以领域件口径登记）。

## 1. ✅ 库内真实存在的 27 个组件

| 组件 | 用途 | 关键点 |
| --- | --- | --- |
| `GmButton` | 按钮全谱 | 主行动粉底**必配深字**；`loading` 保留宽度 |
| `GmButtonGroup` | 按钮组 / 分段 | 三形态 `attached`(默认)/`round`/`segmented`；3 个起才用 |
| `GmLink` | 文字型操作 | 有 `href` → `<a>`；无 → `<button>`；**禁假链接** |
| `GmCard` | 玻璃卡 | 默认 `radius=22`；React 无 footer/hoverable/bodyless |
| `GmClientCard` | 服务对象卡 | 头像 46 + 姓名 + 副信息 + 标签/操作区（妇幼领域） |
| `GmAvatar` | 首字渐变玻璃圆 | 默认 36；墨色固定深档（**不用白字**） |
| `GmTag` | 分类 / 标记 | `dot` 默认 `true`；与 `GmStatusTag` **不合并**（D3） |
| `GmStatusTag` | **业务状态** | 文案查 15 章词库定色；三通道：浅底 + 加深文字 + 色点 |
| `GmSteps` | 步骤条 | `<ol>/<li>` + `aria-current="step"`；状态自动推导 |
| `GmProgress` | 进度 | 线性高 3/6/10；环形 56/72/96；`indeterminate` **不报 `aria-valuenow`** |
| `GmSkeleton` | 首屏骨架 | `role="status" aria-busy`；胶囊 + 1.6s 呼吸，**禁左右扫光** |
| `GmSpin` | 局部加载 | 档位 18/24/32/40；`delay` 默认 300ms；**全系统只允许这一个旋转元素** |
| `GmEmpty` | 空态 | `role="status"`；图标 24/48 |
| `GmResult` | 结果页 | 成功/失败；`error → role="alert"`；**有意不给 code/stack** |
| `GmToast` | 轻提示 | 滑入 320 / 驻留 2400 / 淡出 240ms；**同类仅 1 条** |
| `GmCascader` | 级联选择 | `popup`/`inline`/`picker` 三形态；层级 ≤4、单列 <200 |
| `GmRiskPicker` | **妊娠风险五色** | `role="radiogroup"`；文字走主文字色，颜色由色点承载 |
| `GmResponsiveView` | 容器宽度切形态 | 阈值 1024/767；**同一时刻只渲染一个分支** |
| `GmVirtualList` | 长列表窗口化 | 固定行高；`overscan` 默认 4；`scrollToIndex` **仅 Vue 暴露** |
| `GmTable` | 玻璃表格（V2.10） | th `scope="col"`；`aria-sort` 排序（TB-15-02）；省略+title；空态 GmEmpty |
| `GmCollapse` | 折叠面板（V2.10） | 300ms grid-rows + 220ms 箭头；一屏 ≤3（maxOpen 默认 3）；aria-expanded/controls 内建 |
| `GmDescriptions` | 描述列表（V2.10） | `<dl>` 键值语义；key caption **次级色**（D19）；单行省略 + title |
| `GmModal` | 弹窗（V2.10） | `role=dialog`+`aria-modal`；ESC/遮罩/× 关闭；锁滚动；焦点进面板/归还触发点；移动竖排 |
| `GmPopconfirm` | 气泡确认（V2.10） | 非模态 `role=dialog`；触发器 `aria-haspopup`+`aria-expanded`；danger 深档实底；180ms/Y4px |
| `GmPopover` | 气泡面板（V2.10） | `--lg-glass-popover` 材质、圆角 20；240ms 指向触发点 |
| `GmTooltip` | 文字气泡（V2.10） | 180ms/Y4px；移动 tap 开合（禁 hover 依赖）；`role="tooltip"` |
| `GmGrowthCard` | 生长曲线卡（V2.10） | 数据契约与站点 `window.gmGrowth` 逐字一致；P3–P50–P97 分段线性；框选/开关/隐藏数据表 |

## 2. 曾经的「站点达标、库待补」清单（V2.10 已全部封进库）

| 文档组件 | 站点类 | 状态 |
| --- | --- | --- |
| Table 表格 | `.gm-tbl` | ✅ V2.10 → `GmTable` |
| Collapse 折叠 | `.gm-fold` | ✅ V2.10 → `GmCollapse` |
| Descriptions 描述列表 | `.gm-desc` | ✅ V2.10 → `GmDescriptions` |
| Modal / Dialog | 站点演示 | ✅ V2.10 → `GmModal` |
| Popconfirm 气泡确认 | 站点演示 | ✅ V2.10 → `GmPopconfirm` |
| Popover / Tooltip | 站点 Tooltip | ✅ V2.10 → `GmPopover` / `GmTooltip` |
| 生长曲线卡（百分位带） | `window.gmGrowth()` | ✅ V2.10 → `GmGrowthCard`（站点外壳仍保留为页面侧唯一实现） |

> 库组件与站点外壳**同源配方**：`.gm-tbl`/`.gm-fold`/`.gm-desc`/`.gm-growth*` 选择器与数值一致，
> 由 `check-style-parity.py`（库内）与站点侧 page-qa 共同守护。

## 3. ✗ 规范有、代码无（还没做，别 import）

**导航**：`FloatButton`/`Fab`/`BackTop` · `NavBar` · `TabBar` · `Navigation` 侧栏 · `Breadcrumb` · `Tabs` · `Segmented`（能力由 `GmButtonGroup shape="segmented"` 承载） · `SearchBar` · `IndexBar` · `Anchor` · `Pagination` · `LoadMore` · `Dropdown` · `PullRefresh` · `Drawer`/`SideSheet` · `BottomSheet` · `Tree`(⏸)

**展示**：`KPI`/`Statistic` · `Cell` · `List` · `Swiper` · `NoticeBar` · `Timeline` · `Image` · `ImageViewer` · `Rate` · `Badge` 数字徽标（**无独立组件**）

**录入**：`Input`/`TextArea` · `Select` · `Picker` · `DatePicker`/`TimePicker` · `Radio`/`Checkbox` · `Switch` · `Slider` · `Stepper` · `InputNumber` · `Upload` · `Form` · `OTP` · `Transfer`/`TreeSelect` · `ColorPicker`

**反馈**：`Notification` · `ActionSheet` · `Banner` · 新手引导

**基础**：`Design Token`/`Layout`/`Grid`/`Space`/`Typography`/`Divider`/`Icon`/`Motion` 都是**规范概念，非组件**（Icon 走 `lg-icon-*`，77 枚，`icons/lg-icons.svg`）

**可视化**：折线/柱/环形/雷达/散点/拓扑/地图/Sparkline/大屏蓝图 —— 全部无组件（走 04 章规范 + 站点实现）

**妇幼领域（14 项）**：孕周卡 · 产检计划卡 · 记录卡（胎动/体重/宫高） · 分娩清单 · 宝宝卡 · 生长曲线卡 · 疫苗计划卡 · 儿保体检卡 · 喂养睡眠记录 · 随访队列 · 高危提醒条 · 全生命周期轴 · 机构看板 · 档案时间线 —— **全部待实现**，页面自行按 13 章组装

## 4. 两库映射（27 对同名）

| React `@goodmom/ui` | Vue `@goodmom/vue` | 源文件 |
| --- | --- | --- |
| `GmAvatar` `GmButton` `GmButtonGroup` `GmCard` `GmCascader` `GmClientCard` `GmEmpty` `GmLink` `GmProgress` `GmResponsiveView` `GmResult` `GmRiskPicker` `GmSkeleton` `GmSpin` `GmStatusTag` `GmSteps` `GmTag` `GmToast` `GmVirtualList` `GmTable` `GmCollapse` `GmDescriptions` `GmModal` `GmPopconfirm` `GmPopover` `GmTooltip` `GmGrowthCard` | 同名同名同名（27 个完全一致） | `Xxx.tsx` ↔ `Xxx.vue` |

**写法对照**

| 差异类 | React | Vue |
| --- | --- | --- |
| 子内容 | `children` | 默认插槽 |
| 具名区域 | `title` / `extra` / `actions` 等 **props（ReactNode）** | `title` / `extra` / `footer` / `ops` / `tags` **具名插槽** |
| render-prop | `table(rows)` / `renderItem(item,i)` / `stickyTop` | 同名具名插槽（收 `{ rows }` / `{ item, index }` / `sticky`） |
| 受控值 | `value` + `onChange` | `v-model`（`modelValue` / `update:modelValue`） |
| 事件 | `onClick` / `onAction` / `onClose` / `onChange` | `@click` / `@action` / `@close` / `@change` |
| 伪事件 | — | ⚠️ `GmResponsiveView.onModeChange`、`GmVirtualList.onEndReached` 两侧**都是 prop**，不是 emit |
| 框架 props | 显式 `children` / `className` / `style` | 默认插槽 / `class` / `style` 透传 |
| 基座 | Arco（peer `^2.60.0`），仅 `GmProgress` 实际用到；逃生口 `ArcoButton` | **零基座** |
| 样式注入 | 入口**零 CSS import**，消费方显式引 `theme.css`（应用侧镜像 `gm.css`） | 入口**副作用**引 `src/styles/index.css`；`exports["./style.css"]` |
| 构建 | `tsc` | `vite build && vue-tsc --emitDeclarationOnly` |
| 独有 | `ArcoButton` 逃生口（`GmProgress` 已改为与 Vue 同构的自绘实现） | —（能力面已对齐，仅写法不同） |

**V2.9 起两库零能力差异**：props/事件/默认值/契约类名/DOM/无障碍行为全部一致；只有**宿主语言惯用写法**（`children`↔默认插槽、具名 prop↔具名插槽、`value`+`onChange`↔`v-model`）由 `IDIOM` 表显式登记并通过能力对等校验。逐条见 `reference/contracts.md`。

## 5. 选型决策树

```text
需要展示状态吗？
└─ 文案来自 15 章词库？
   ├─ 是 → GmStatusTag（自动取色）
   └─ 否 → GmTag（显式 semantic / color）

妊娠风险分级？
├─ 可编辑 → GmRiskPicker
└─ 只读   → GmStatusTag five="mN" 或 GmTag five="mN"（D35 起两者同规则：
                                   亮值只做色点/淡底，文字走主文字色，实测 9.8–12.6:1）

同一页同一份数据要按宽度切形态？
└─ GmResponsiveView（table / condensed / card，阈值 1024/767）

列表很长？
└─ 移动 >50 项 · PC 表格 >200 行 · DOM >300 → GmVirtualList
   低于门槛 → 直接 map / v-for（更快更简单）

加载？
├─ 首次进入 → GmSkeleton（区块）
└─ 刷新     → GmSpin（局部）      （二者不叠加）

没有数据？
├─ 一切正常 → GmEmpty
└─ 有结论   → GmResult
```

## 6. 命名规范

| 对象 | 规则 | 正例 |
| --- | --- | --- |
| 组件名 | PascalCase，`Gm` 前缀（妇幼领域件同样 `Gm*`） | `GmStatusTag` |
| 组件文件 | PascalCase，与组件同名 | `GmStatusTag.tsx` / `.vue` |
| 目录名 | kebab-case | `shared/components` |
| CSS 类 | `gm-` + kebab；修饰符 `--`；元素 `__` | `.gm-btn--primary`、`.gm-btn__icon` |
| 尺寸类 | **必须 `--sz-*`** | `.gm-btn--sz-large`（叫 `--small` 会与 `--default` 冲突） |
| props | 两侧源码都是 camelCase；Vue 模板惯用 kebab | `ariaLabel` / `aria-label` |
| 事件 | React `onXxx` ↔ Vue `@xxx` / `emit("xxx")` | `onAction` ↔ `@action` |
| 插槽 | 小写单词，无语义歧义 | `default` `icon` `extra` `footer` `tags` `ops` `sticky` |
| Token | kebab-case 小写；`--lg-*` 引擎 / `--mmh-*` 品牌 | `--lg-glass-card` |
| 业务模块 | 目录 kebab-case；组件文件 PascalCase；工具/模型 camelCase | `modules/archive/pages/ArchiveListPage.tsx` |
