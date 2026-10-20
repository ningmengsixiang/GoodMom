---
name: goodmom-components
description: Use when 在本仓库决定该用哪个 UI 组件、或要查某个组件的 props/事件/插槽/状态、或需要在 React（@goodmom/ui / gm-arco-ui）与 Vue（@goodmom/vue）两种写法之间对照与迁移。触发词：选组件、用哪个组件、Gm 组件、GmButton、GmCard、GmStatusTag、GmTag、GmEmpty、GmResult、GmSkeleton、GmSpin、GmProgress、GmSteps、GmToast、GmCascader、GmRiskPicker、GmClientCard、GmResponsiveView、GmVirtualList、GmAvatar、GmLink、Arco、Table、Form、Modal、Drawer、ActionSheet、props、插槽、slot、事件、emit、React 改 Vue、Vue 改 React、空态、加载、分页、长列表。
---

# 组件选型与两库对照

## 三层结构：先看在哪一层

| 层 | 是什么 | 例子 |
| --- | --- | --- |
| ① Arco 原生 | 复杂交互件基座（重交互不自研） | `Table` `Form` `DatePicker` `Tree` `Select` |
| ② `Gm*` 封装 | **视觉 + 无障碍 + 状态词**的统一实现 | `GmButton` `GmCard` `GmStatusTag` `GmEmpty` `GmSkeleton` `GmResult` `GmProgress` `GmRiskPicker` `GmVirtualList` |
| ③ 领域组件 | 妇幼业务语义 | 孕周卡、生长曲线、疫苗计划、随访队列 |

**选型顺序**：③ 有就用 ③ → 没有查 ② → ② 没有才用 ①，并且**先判断是否该提为 ②**（同一视觉在第 2 个模块出现时**必须**提为组件库组件）。

| 文件 | 内容 |
| --- | --- |
| `reference/inventory.md` | 组件总表（00 目录 99 行）+ 两库 27 对映射 + 选型决策树 |
| `reference/contracts.md` | 27 个组件逐条 props / 事件 / 插槽 / 默认值 / 类名契约 |

## 场景 → 首选组件（照抄这张表）

| 场景 | 首选 | 备注 |
| --- | --- | --- |
| 任何按钮（含全宽主行动） | `GmButton` | **亮粉底必配深字**；`loading` 保留宽度 |
| 业务状态（待随访/已逾期/高危…） | `GmStatusTag` | 文案查 15 章词库定色；**禁页面自选 semantic** |
| 风险五色（妊娠分级） | `GmRiskPicker`（可编辑）/ `GmStatusTag five="mN"` 或 `GmTag five="mN"`（只读） | **别让只读页面出现可点控件**；五色分支文字已统一走 `--lg-text-primary`（D35，实测 9.8–12.6:1），两个组件都安全 |
| 容器 / 卡 | `GmCard` | 玻璃配方在组件库里，页面别自己写 gradient |
| 列表（≤1023 或移动） | `ListRow`（应用内 `shared/components`） | 行主体是 `button`，键盘可达 |
| 表格（≥1024） | Arco `Table` | 与列表**同一份数据**，按容器宽度切形态 |
| 加载 | `GmSkeleton`（区块）/ `GmSpin`（局部） | **二者不叠加**；骨架 = 胶囊 + 1.6s 呼吸，**禁左右扫光** |
| 空态 | `GmEmpty` | 图标 large + 一句话 + **可选**行动 |
| 错误 / 结果 | `GmResult` | 三通道；给可执行动作 |
| 反馈提示 | `useAppToast()` → `GmToast` | 同类仅 1 条；**字段错误不用 Toast** |
| 长列表 | `GmVirtualList` | 门槛见下 |
| 表单 | Arco `Form` + `shared/utils/validators` | 校验规则唯一源 |
| 选择类（移动） | 底部弹层（`GmCascader mode="picker"`） | 移动端禁桌面式多列面板 |

## 决策速查

```text
【按钮层级】这个动作是"本页最想让人做的事"吗？
├─ 是  → primary（同屏已有 primary 则降级 secondary）
└─ 否  → 与主行动并列在按钮区吗？
        ├─ 是  → secondary / default
        └─ 否  → 在重复出现的容器里（表格行/卡片/列表项）吗？
                ├─ 是  → text（≥3 个动作时只留 1 个可见，其余收进"更多"）
                └─ 否  → outline / dashed
一屏配额：L1 primary 1 个 · L2 ≤2 个 · L3/L4 不限
```

| 决策 | 规则 |
| --- | --- |
| `GmButtonGroup` | **三个及以上、语义同级、可连续选择**才用组；**两个按钮不用组**（直接并排 + 间距 12）。组内同类型同尺寸、文字长度差 ≤2 倍、`ariaLabel` 必填 |
| Link vs Button | 导航/跳转/次级动作 → **链接**；提交/确认/主行动 → **按钮**。一屏内主色链接 **≤2 处** |
| Tag vs StatusTag | 文案来自 15 章词库 → `GmStatusTag`（自动取色）；否则 → `GmTag`（显式 semantic/color） |
| Empty vs Result | `GmEmpty` = **没有数据但一切正常**；`GmResult` = **操作有结论**（成功/失败） |
| Modal / Drawer / ActionSheet | Mobile **底部优先**；危险操作在最后且带理由；**一次一个弹层**，弹窗内不再开弹窗 |
| `GmVirtualList` | 移动 **>50** 项 / PC 表格 **>200** 行 / 单次渲染 DOM **>300** 行时窗口化；固定行高 + `overscan` 4。**低于门槛直接 `map`/`v-for` 更快更简单** |
| `GmCascader` | 层级 **≤4** 且单列 **<200** 项；超过改「搜索 + 逐级下钻页面」。⛔ 三个 `Select` 串联、单列超 12 汉字、移动端沿用桌面多列面板 |
| 容器宽度切形态 | 用 `GmResponsiveView`（阈值 1024 / 767），**不用视口断点** |

## 页面不得做的事

- ✘ 改 `Gm*` 组件的视觉（`style` 覆写颜色/圆角/阴影）→ 要改就改组件库 + 同步两个包 + 02/03 章。
- ✘ 自建第二套按钮 / 标签 / 空态（哪怕只有 5 行）。
- ✘ 直接 `import { Button } from "@arco-design/web-react"` 当主行动按钮 —— 唯一逃生口是 `@goodmom/ui` 的 `ArcoButton`（并注明为何需要 Arco 原生能力）。
- ✘ 组件内出现裸色值；✘ 自造色板。
- ✘ `size` 类名直接叫 `.gm-btn--small` —— 必须 `--sz-*` 前缀，否则与 `.gm-btn--default` 同名同特异性，后写的规则静默吃掉类型底色。

## 两库是同一套标准（V2.9 起零能力差异）

两库各 **27 个同名组件**，**props / 事件 / 默认值 / 契约类名 / DOM / 无障碍行为完全一致** —— 这是四条机器门禁的判定结果，不是承诺：

| 不变量 | 门禁 | 当前 |
| --- | --- | --- |
| props 与事件（归一化宿主惯用写法后） | `check-component-contract.py --ci` | 19/19 |
| 契约类名（源码里**全部** `gm-*` 字面量） | 同上 | 0 处不同 |
| 每个输出的 class 都有对应 CSS 规则（无孤儿类名） | 两库 `playground/smoke.mjs` | 全绿 |
| 默认值 · 契约类名 · 惯用写法映射的能力对等 | 同上 | 0 处不同 |
| CSS 声明写法（共享选择器逐字节）· 暗色覆盖集合 · Token 层 | `check-style-parity.py --ci` | 233 个共享选择器、0 处不同 |
| DOM 与无障碍（渲染级） | 两库 `playground/smoke.mjs` | **75/75 · 54/54** |

### ✅ 唯一允许的差异：宿主语言惯用写法

门禁会先把两侧**归一化到同一个规范名**再严格比对，所以"叫法不同"是被承认的，而**新漂移照旧 FAIL**：

| 规则 | React 写法 | Vue 写法 | 规范名 |
| --- | --- | --- | --- |
| 默认内容区 | `children` | 默认插槽 | `#default` |
| 具名区域 | prop（`ReactNode` / render 函数） | 具名插槽 | `#<name>` |
| 受控值 | `value` + `onChange` | `v-model`（`modelValue` + `update:modelValue`） | prop `value` + 事件 `change` |

名字确实不同但能力相同的少数几处由 `IDIOM` 表显式登记（并必须通过能力对等校验）：
`GmCascader`/`GmRiskPicker` 的受控值、`GmResponsiveView` 的 `table`/`condensed`/`card`/`empty`、`GmVirtualList` 的 `renderItem`↔默认插槽 与 `stickyTop`↔`sticky` 插槽。

### 写法对照（能力等价，写代码时照自己的宿主写）

| 能力 | React | Vue |
| --- | --- | --- |
| 子内容 | `children` | 默认插槽 |
| 具名区域（标题/头部右侧/底部/操作区） | `title` / `extra` / `footer` / `ops`（`ReactNode`） | 同名具名插槽 |
| 受控值 | `value` + `onChange` | `v-model` |
| 事件 | `onClick` / `onAction` / `onClose` / `onChange` | `@click` / `@action` / `@close` / `@change` |
| 长列表行渲染 / 吸顶 | `renderItem` / `stickyTop` | 默认插槽 / `sticky` 插槽 |
| 响应式三分支 | `table` / `condensed` / `card` / `empty` render prop | 同名具名插槽 |
| 命令式滚动 | `ref` → `scrollToIndex(index)` | `ref` → `scrollToIndex(index)` |

**⚠️ 两处 prop 是 prop、不是事件**：`GmResponsiveView.onModeChange`、`GmVirtualList.onEndReached` —— 写 `@end-reached` 无效。

> **V2.9 之前**这里是一张「同名 ≠ 等价」的差异表（React 的 `GmStatusTag` 不自动推导语义、`size` 默认值两侧不同、`size="large"` 输出一个 CSS 里不存在的类名、`GmCard` 少 `hoverable`/`bodyless`、`GmResult` 容器无样式、`GmProgress` 一个基于 Arco 一个自绘……）。这些**全部已消除**，差异表随之作废。历史清单见 `20-前端设计规范.md` §20.12.3。

## 组件级硬规则

1. **加粗/强调不得改 `border-width`** → 用 `box-shadow` / `outline`（否则 44×44 热区实测尺寸抖动 1px）。
2. 长文本/数值撑破容器是 P0；表格操作列用 `.col-ops` + `.ops`（列头与单元格**都要**加），行内操作 **≤3** 个、单元格内联元素 **≤26px**（否则顶破行高 44–52）。
3. `loading` 态**保留宽度**；`disabled` **不改变尺寸**。
4. 仅图标按钮**必须**给 `ariaLabel`（缺失会 `console.warn`）。
5. 骨架 = 圆角胶囊 + 上下呼吸（α .5↔.85、1.6s）；Spin = 0.9s/圈。
6. 组合顺序固定：对象组合「头像 → 名称 → 状态标签(≤3) → 摘要 → 右侧操作」；操作组合「查看 → 编辑 → Primary → danger(最后)」。
