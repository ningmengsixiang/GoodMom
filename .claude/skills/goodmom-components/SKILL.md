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
| `reference/inventory.md` | 组件总表（00 目录 99 行）+ 两库 19 对映射 + 选型决策树 |
| `reference/contracts.md` | 19 个组件逐条 props / 事件 / 插槽 / 默认值 / 类名契约 |

## 场景 → 首选组件（照抄这张表）

| 场景 | 首选 | 备注 |
| --- | --- | --- |
| 任何按钮（含全宽主行动） | `GmButton` | **亮粉底必配深字**；`loading` 保留宽度 |
| 业务状态（待随访/已逾期/高危…） | `GmStatusTag` | 文案查 15 章词库定色；**禁页面自选 semantic** |
| 风险五色（妊娠分级） | `GmRiskPicker`（可编辑）/ **`GmStatusTag five="mN"`**（只读） | **别让只读页面出现可点控件**；⛔ 不要用 `GmTag five` —— 它的文字直接吃五色亮值，12px 实测 1.78–3.93:1，五档全不达 AA |
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

## 跨库迁移必读（同名 ≠ 等价）

| 组件 | 差异 | 影响 |
| --- | --- | --- |
| `GmStatusTag` | React `semantic` 默认 `neutral`、**不自动推导**；Vue 默认 `undefined`、**从文案自动推导** | React 侧必须显式传 `semantic={semanticOf(label)}`，否则永远灰 |
| `GmStatusTag` | React `size` 默认 `small` / Vue `default`；React `size="large"` 输出类 `gm-status-tag lg` 而 CSS 只有 `--large` | **React 的 `large` 实际无效**（已知缺陷） |
| `GmCard` | React 无 `hoverable` / `bodyless` / footer 槽 | 迁移要改结构 |
| `GmClientCard` | React `actions` prop ↔ Vue `ops` 槽 | |
| `GmResponsiveView` / `GmVirtualList` | `onModeChange` / `onEndReached` 两库**都是 prop，不是事件** | 写 `@end-reached` 无效 |
| 受控值 | React `value`+`onChange` ↔ Vue `v-model` | `GmCascader`、`GmRiskPicker` |
| 事件名 | `onAction` → `@action`；`onClose` → `@close` | |
| 样式注入 | React 入口**零 CSS import**（消费方显式引）；Vue 入口**副作用引入** | 漏引 = 无样式 |

完整 19 条契约见 `reference/contracts.md`；两库差异清单见 `20-前端设计规范.md` §20.6.4。

## 组件级硬规则

1. **加粗/强调不得改 `border-width`** → 用 `box-shadow` / `outline`（否则 44×44 热区实测尺寸抖动 1px）。
2. 长文本/数值撑破容器是 P0；表格操作列用 `.col-ops` + `.ops`（列头与单元格**都要**加），行内操作 **≤3** 个、单元格内联元素 **≤26px**（否则顶破行高 44–52）。
3. `loading` 态**保留宽度**；`disabled` **不改变尺寸**。
4. 仅图标按钮**必须**给 `ariaLabel`（缺失会 `console.warn`）。
5. 骨架 = 圆角胶囊 + 上下呼吸（α .5↔.85、1.6s）；Spin = 0.9s/圈。
6. 组合顺序固定：对象组合「头像 → 名称 → 状态标签(≤3) → 摘要 → 右侧操作」；操作组合「查看 → 编辑 → Primary → danger(最后)」。
