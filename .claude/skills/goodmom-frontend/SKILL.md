---
name: goodmom-frontend
description: Use when 在本仓库编写或修改任何 Vue 页面、组件或样式；当任务涉及 @goodmom/vue 组件选型、按钮配色、状态标签语义色、双色 Token、暗色模式、表单/表格/列表/弹窗、移动端适配、无障碍焦点与键盘、或评审前端实现是否符合视觉规范时使用。也适用于用户说"新建页面""写个组件""这个按钮颜色不对""加个表单""列表很卡""移动端错位""对比度不够""对不上设计稿""状态色错了"等场景。
---

# 妈咪好前端开发规范（Vue 3）

## 唯一事实来源

**禁止凭空写视觉数值。** 一切颜色、圆角、间距、时长只能来自：

| 来源 | 路径 | 用途 |
| --- | --- | --- |
| Token 数值 | `02-Token规范.md` | 颜色/圆角/边框/动效档位 |
| 组件契约 | `03-组件规范.md` | 组件用法、类型、状态 |
| 交互动效 | `07-交互动效与微交互规范.md` | 时长、缓动、四态 |
| 组件覆盖 | `08-组件覆盖清单与Semi对齐.md` | 该用哪个组件 |
| 移动端 | `10-移动端组件规范.md` `11-移动端组件全量库.md` | 断点、热区、形态 |
| 业务词库 | `15-妇幼业务词库与状态大典.md` | 状态文案唯一出处 |
| 命名术语 | `14-命名与术语规范.md` | 组件名/CSS 前缀 |

代码侧唯一实现源：`goodmom-vue/src/tokens/`（Token 与业务字典）。**改了数值要同时改 Token 文件和 02 章。**

## 红线（违反即返工，无例外）

| # | 红线 | 原因 |
| --- | --- | --- |
| R1 | 主行动按钮底色用 `--mmh-grad-action-hc`（品牌粉上半段），文字**必须**深字 `#343A46`（`--lg-text-on-accent`） | 亮粉底 + 白字仅 2.9:1，AA 不达标（D9 裁决） |
| R2 | 状态语义色只能来自 `SEMANTIC_COLOR` / `--lg-sem-*`，**页面禁止写裸 hex** | 六语义单一映射源，各页各色即失控 |
| R3 | 业务状态用 `<GmStatusTag>文案</GmStatusTag>`，由组件查 15 章词库定色 | 页面手写 semantic 必然漂移 |
| R4 | 新业务状态文案必须同时登记 `goodmom-vue/src/tokens/business.ts`（与 `goodmom-ui` 同表）与 15 章 | 漏登记**静默**回落灰色（不报错），线上表现为「高危显示成灰」 |
| R5 | 状态不得只靠颜色区分：必须「色点 + 文字」双通道 | WCAG 1.4.1 |
| R6 | 动作用 `<button>`、导航用 `<a href>`；**禁止 `href="#"` 假链接** | 读屏播报与右键菜单语义错误 |
| R7 | 移动端（≤767px）可点热区 ≥44×44 | 10 章硬性约定 |
| R8 | 焦点可见：用 `--lg-ring-width/-color/-offset` 做 `:focus-visible`；**禁止用 `outline:none` 抹掉焦点** | 键盘用户唯一导航手段 |
| R9 | 加粗/强调不得改 `border-width`，改用 `box-shadow`/`outline` | 避免布局回流抖动（02 · 2.7.1） |
| R10 | 动效必须尊重 `prefers-reduced-motion`（组件库已全局兜底，自写动画要跟上） | 无障碍 |
| R11 | 组件内不得出现裸色值；不得自造色板 | 暗色模式与业务主题会失效 |

## 开发流程

1. **查覆盖**：先在 `08` 章 + `goodmom-vue/src/index.ts` 找现成组件。有则用，没有才自建。
2. **查 Token**：需要视觉数值先查 `DesignTokens` 或 `--lg-*` / `--mmh-*` 变量。找不到档位 → 提问，不要臆造。
3. **定状态**：列出该界面所有业务状态文案，逐个核对 `business.ts` 是否已登记（R4）。
4. **写结构**：语义化标签（`button`/`a`/`table`/`ol`）+ 组件；交互可达性一次写对（R6/R7/R8）。
5. **写样式**：只用 CSS 变量；暗色模式不额外写规则（变量已切）；响应式用 `GmResponsiveView` 或容器查询。
6. **自检**：跑下方验收命令，全绿才算完成。

## 验收（必须实际执行，不许凭记忆断言）

```bash
# 1) 类型与库构建
npm run typecheck:vue
npm run build:vue

# 2) 真机冒烟（37 项：渲染/语义色/对比度/键盘/暗色/断点/RO 循环/控制台）
cd goodmom-vue && npx vite --config playground/vite.config.ts   # 另开终端
node goodmom-vue/playground/smoke.mjs
```

冒烟脚本已覆盖 R1、R2、R5、R8 的机器可判定部分（含「粉底白字」反例守卫）。**改了组件或 Token 必须重跑。**

## 参考文件（按需读取，不要一次全读）

- `reference/components.md` —— 16 个组件的 props/事件/插槽速查与选型决策树
- `reference/tokens.md` —— 完整 Token 表 + 暗色映射 + 变量使用规范
- `reference/a11y.md` —— 无障碍基线（键盘、焦点、ARIA、对比度）与常见错法
- `reference/patterns.md` —— 页面级组合范式（列表页/表单页/详情页/移动端）
- `reference/checklist.md` —— 提交前逐条验收清单（可量化）

## 常见误区

| 做法 | 为什么错 | 正确做法 |
| --- | --- | --- |
| 页面里写 `color: #E85D8F` | 暗色模式失效、无法换肤 | `var(--lg-link)` |
| 自己写 `statusMap` 映射状态色 | 与 15 章脱钩，必然漂移 | `GmStatusTag` + `business.ts` |
| 用视口断点切表单/卡片 | 同一页多容器宽度不同，必然有一个错 | `GmResponsiveView`（容器宽度） |
| `v-if` + CSS 双渲染后隐藏 | 读屏读到重复内容、移动端白渲染一份 | 同一时刻只渲染一个分支 |
| 200 行列表上虚拟滚动 | 过度工程，反而更慢更复杂 | 固定行高且 >500 行才用 `GmVirtualList` |
| 用 `watch` 把 props 拷进本地 state | 双向不同步，是 Vue 反模式 | `defineModel` 或直接用 props |
| 组件内 `import` 具体色值常量做样式 | 组件库应当零基座、样式全走 CSS 变量 | class + CSS 变量 |
