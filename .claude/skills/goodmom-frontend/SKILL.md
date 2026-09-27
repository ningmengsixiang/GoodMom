---
name: goodmom-frontend
description: Use when 在本仓库（妈咪好 GoodMom 设计系统）写或改任何前端代码 —— React 页面组件（frontend-app / @goodmom/ui / gm-arco-ui）、Vue 3 页面组件（@goodmom/vue）、站点与独立产品页的样式。触发词：新建页面/写个组件/这个颜色不对/按钮样式/状态标签/暗色模式/表单/表格/列表/弹窗/移动端适配/无障碍/对比度/对不上设计稿/加个卡片/图表配色/改 Token/换主题。也用于评审前端实现是否符合规范、以及判断某个 CSS 变量或组件到底能不能用。
---

# 妈咪好前端开发规范（入口）

## 唯一事实来源

**禁止凭空写视觉数值。** 一切数值只有两个合法来源：

| 来源 | 路径 | 说明 |
| --- | --- | --- |
| **代码（最高权威）** | `goodmom-ui/src/theme.css`、`goodmom-vue/src/styles/{base,components}.css`、两包 `src/tokens/*.ts` | 实际生效的值 |
| 规范正文 | `20-前端设计规范.md`（落地口径）→ `02`（Token）`03/08`（组件）`07`（动效）`10/11`（移动端）`14/15`（命名与状态词）`17`（布局）`19`（工程） | 为什么这么定 |

> **文档与代码冲突时，以代码为准。** 02 章定义了大量代码未实现的 Token，见下方 R12。

## 红线（违反即返工，无例外）

| # | 红线 | 为什么 |
| --- | --- | --- |
| **R1** | **只写代码已定义的变量**。用之前先查 `reference/tokens.md` 的可用清单；查不到就**写字面量**，不要写 `var()` | 幽灵 Token 会让**整条声明被静默丢弃** —— 不报错，只是 0 内边距 / 0 圆角 / 默认字号 |
| **R2** | 语义色只能来自 `SEMANTIC_COLOR` / `--lg-sem-*`；**业务代码禁裸 hex**、禁自造色板 | 暗色档与换肤会失效；改色要全仓找 |
| **R3** | 业务状态用 `<GmStatusTag>`，由组件查 15 章词库定色；**禁止页面自选 semantic、禁手写 statusMap** | 各页各色即失控 |
| **R4** | 新业务状态文案必须**四处一次改齐**：15 章 + `goodmom-ui/src/tokens/business.ts` + 应用镜像 + `goodmom-vue/src/tokens/business.ts` | 漏登记**静默**回落灰色（线上「高危显示成灰」），不报错 |
| **R5** | 状态不得只靠颜色区分：必须「色点 + 文字」双通道 | WCAG 1.4.1 |
| **R6** | 动作用 `<button>`、导航用 `<a href>`；**禁止 `href="#"` 假链接** | 读屏播报与右键菜单语义错误 |
| **R7** | 移动端（≤767px）热区 ≥44×44，关键按钮 ≥48；正文/输入字号 ≥16px | 10 章硬性约定；iOS 聚焦缩放 |
| **R8** | 焦点可见：用 `--lg-ring-width/-color/-offset` 做 `:focus-visible`；**禁止裸 `outline:none`** | 键盘用户唯一导航手段 |
| **R9** | 加粗/强调**不得改 `border-width`**，用 `box-shadow` / `outline` | 会让 44×44 触控目标实测尺寸抖动 1px |
| **R10** | 动效尊重 `prefers-reduced-motion`（React 侧已全局兜底，**Vue 侧只有组件白名单**，自写动画必须自己加） | 无障碍 |
| **R11** | 组件内不得出现裸色值；不得改 `Gm*` 组件的视觉（覆写颜色/圆角/阴影） | 要改就改组件库 + 同步两个包 + 02/03 章 |
| **R12** | **禁用「文档有、代码无」的 Token**：`--lg-space-*`、`--lg-type-*`、`--lg-num-*`、`--lg-weight-*`、`--lg-radius-card`、`--lg-radius-btn`、`--lg-radius-btn-lg`（`--lg-radius-btn-sm` 已补，可用）、`--lg-z-*`、`--lg-blur-*`、`--lg-opacity-*`、`--lg-glow-*`、`--lg-grad-*`、`--lg-purple/cyan/blue/pink/peach-*`、`--lg-m-*`、`--lg-dur-*`、`--lg-ease-standard/-emphasized`、`--mmh-peach-*`、`--mmh-grad-signature`、`--lg-font-sans` 全部**零实现**。间距/字号/圆角/模糊直接写字面量（档位见 `reference/tokens.md`）。若确需幽灵变量，只能写成 `var(--幽灵, 兜底值)` 并注释说明 | 这是本系统**第一号静默失败源**。照 02 章写 CSS 会得到一片「没生效」 |
| **R13** | 主行动按钮：底 `--mmh-grad-action-hc`（品牌粉**上半段**）+ 字 `--lg-text-on-accent`（深字）；**亮粉底禁白字**（2.46–2.9:1 不达 AA）；**不套玻璃白描边/白内高光** | D9 裁决 |
| **R14** | **禁纯黑 `#000000`、禁纯白 `#FFFFFF`**（底色 `#1B1A21`/`#23222A`，文字 `#F3EFEC`）；**禁 3px 以上常规描边** | 02 · 2.1.9 / 2.7.1 |
| **R15** | 同页同一份数据按**容器宽度**切形态 → 用 `GmResponsiveView`；**不得**用视口断点 | 同一页多容器宽度不同，用视口断点必然有一个错 |

## 开发流程

1. **查技能**：按下表路由，先读对应子技能的 SKILL.md（**不要一次全读**）。
2. **查组件**：先在组件库找现成的（`@goodmom/ui` / `@goodmom/vue`）；有则用，没有才自建，并先判断是否该提为组件库组件。
3. **查 Token**：需要数值先查 `reference/tokens.md`。**找不到档位 → 提问或写字面量，不要臆造 `var()`。**
4. **定状态**：列出该界面所有业务状态文案，逐个核对是否已登记（R4）。React 侧 `GmStatusTag` **不会**自动推导语义，必须显式传。
5. **写结构**：语义化标签 + 组件；交互可达性一次写对（R6/R7/R8）。
6. **写样式**：只用可用变量或字面量档位；暗色模式**不写任何专属规则**；响应式走 `GmResponsiveView` 或 `useMediaQuery`。
7. **自检**：跑验收命令，全绿才算完成。

### 任务 → 读哪个子技能

| 任务 | 子技能 / 文件 |
| --- | --- |
| 颜色、Token、暗色模式、圆角、间距、字号、主题 | `goodmom-tokens`（可用清单 + 幽灵 Token 禁用清单） |
| 选组件、props、React↔Vue 写法对照、组件契约 | `goodmom-components` |
| 状态标签、状态文案、语义色、妊娠风险五色 | `goodmom-status` |
| 页面骨架、栅格、响应式、移动端、列表/表单/详情范式 | `goodmom-layout` |
| 动效时长/曲线、hover/focus/loading、无障碍、对比度 | `goodmom-motion-a11y` |
| 改完要跑哪些命令、门禁失败怎么定位 | `reference/verification.md` |
| 工程目录、模块边界 B1–B10、命名、复用抽象 | `19-工程架构与组件复用规范.md` |

## 验收（必须实际执行，不许凭记忆断言）

```bash
# React 页面（frontend-app）
cd frontend-app && npx tsc --noEmit -p tsconfig.json && npm run build
cd .. && python3 scripts/check-module-boundary.py     # B1–B10：裸 hex / 内联渐变 / 状态词 / 幽灵变量

# Vue 页面 / 组件库
npm run typecheck && npm run build:vue

# 视觉与无障碍（起服务后）
node scripts/page-qa.mjs --ci        # P0/P1/P2 必须为 0
node scripts/layout-gate.mjs         # 溢出 / 白条 / 错位
python3 scripts/a11y-dom.py          # 渲染级对比度
```

完整命令矩阵（按「改 Token / 改组件 / 改页面 / 改文档」分类）见 `reference/verification.md`。

## 常见误区

| 做法 | 为什么错 | 正确做法 |
| --- | --- | --- |
| `padding: var(--lg-space-4)` | `--lg-space-*` 代码零实现 → 整条声明被丢弃，等于没写 | `padding: 16px`（R12） |
| `border-radius: var(--lg-radius-card)` | 该变量不存在（只有 `--lg-radius-pill` / `--lg-radius-control` / `--lg-radius-btn-sm`） | `border-radius: 22px` |
| `font-size: var(--lg-type-body)` | 不存在 | `font-size: 15px`（移动端 16px） |
| 页面里写 `color: #E85D8F` | 暗色模式失效、无法换肤 | `var(--lg-link)` 或 `var(--lg-sem-*)` |
| 自己写 `statusMap` 映射状态色 | 与 15 章脱钩，必然漂移 | `GmStatusTag` + `semanticOf()` |
| React 侧 `<GmStatusTag>高危</GmStatusTag>` | React **不会**从文案推导语义 → 永远灰色 | `semantic={semanticOf("高危")}` |
| 用视口断点切表格/卡片 | 同页多容器宽度不同，必有一个错 | `GmResponsiveView`（R15） |
| `v-if` + CSS 双渲染后隐藏 | 读屏读到重复内容 | 同一时刻只渲染一个分支 |
| 写 `[data-theme="dark"] .card{…}` | 暗色专属规则 = 永久维护缺口 | 用变量，页面零暗色规则 |
| 200 行列表上虚拟滚动 | 过度工程，反而更慢更复杂 | 固定行高且 >200 行（PC 表格）/ >50（移动）才用 |
| 用 `watch` 把 props 拷进本地 state（Vue） | 双向不同步 | `defineModel` 或直接用 props |
| 主按钮加白描边「更亮」 | 白边落在浅粉亮端看不见、暗端看得见 | 去掉（R13） |
| 语义淡底用 `color-mix(…, transparent)` | 玻璃与渐变透出，12px 字只剩 4.06:1 | 混 `--lg-tint-base`（`semTint*` 已封装） |
