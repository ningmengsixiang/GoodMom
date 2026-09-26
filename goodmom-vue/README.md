# @goodmom/vue

妈咪好 GoodMom **玻璃液态视觉规范**的 Vue 3 组件库。零基座自研（无任何第三方 UI 依赖），
16 个组件 + 设计 Token + 业务状态字典，数值与 `02-Token规范.md` 逐条对齐。

- **零基座**：不依赖 Element Plus / Ant Design Vue，样式全部走 CSS 变量，无版本冲突与主题覆写负担
- **双主题**：浅色 + 暗色（`data-theme="dark"`），变量级切换，组件内无硬编码色值
- **无障碍内建**：焦点环、键盘导航、roving tabindex、ARIA 语义、`prefers-reduced-motion`
- **类型完备**：`vue-tsc` 生成 `.d.ts`，props/emits/slots 全量类型
- **业务对齐**：`GmStatusTag` 自动查 15 章状态词库定语义色，页面不写色

## 安装

```bash
npm install @goodmom/vue
```

## 快速开始

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "@goodmom/vue/style.css";   // 必须引入，否则组件无样式

createApp(App).mount("#app");
```

按需具名导入（推荐，支持 tree-shaking）：

```vue
<script setup lang="ts">
import { GmButton, GmCard, GmStatusTag } from "@goodmom/vue";
</script>

<template>
  <GmCard title="服务对象">
    <GmStatusTag>待随访</GmStatusTag>
    <GmButton type="primary">发起随访</GmButton>
  </GmCard>
</template>
```

或全量注册（仅原型 / 内部工具，会把所有组件打进产物）：

```ts
import GoodMomVue from "@goodmom/vue";
import "@goodmom/vue/style.css";
createApp(App).use(GoodMomVue).mount("#app");
```

## 组件

| 组件 | 说明 |
| --- | --- |
| `GmButton` | 按钮：6 类型 × 4 状态 × 4 尺寸 × 3 形状；loading 保留宽度不跳动 |
| `GmStatusTag` | **业务状态标签**：按 15 章词库自动取六语义色 |
| `GmTag` | 分类/标记标签：显式 semantic / 五色 / 自定义色 |
| `GmCard` | 玻璃卡片：title / extra / footer |
| `GmAvatar` | 首字渐变头像 |
| `GmClientCard` | 服务对象卡：头像 + 姓名 + 组合标签 + 摘要 + 操作区 |
| `GmLink` | 链接 / 文字按钮：按有无 `href` 自动选 `<a>` 或 `<button>` |
| `GmProgress` | 进度条：线性 + 环形，`role="progressbar"` + `aria-valuetext` |
| `GmEmpty` | 空状态：玻璃圆环图标 + 行动槽 |
| `GmSpin` | 局部加载指示器 |
| `GmSkeleton` | 首屏骨架屏 |
| `GmSteps` | 步骤条：移动端自动纵向 |
| `GmRiskPicker` | 妊娠风险五色单选：radiogroup + roving tabindex |
| `GmCascader` | 级联选择：popup / inline / picker 三形态 |
| `GmResponsiveView` | 容器级响应式分支（ResizeObserver，按容器宽度而非视口） |
| `GmVirtualList` | 虚拟长列表：固定行高窗口化 + 触底加载 |

## Token

```ts
import { DesignTokens, SEMANTIC_COLOR, FIVE_COLOR, semanticOf } from "@goodmom/vue";
```

CSS 侧直接用变量（**页面禁止写裸 hex**）：

```css
.panel {
  background: var(--lg-glass-card);
  color: var(--lg-text-primary);
  border: var(--lg-border-1) solid var(--lg-border-white-70);
  border-radius: var(--lg-radius-control);
}
```

主行动按钮必须「品牌粉渐变 + 深字」（亮粉底白字仅 2.9:1，不合格）：

```css
background: var(--mmh-grad-action-hc);
color: var(--lg-text-on-accent); /* #343A46 */
```

## 暗色模式

```vue
<div :data-theme="isDark ? 'dark' : undefined">
  <!-- 组件无需任何额外样式 -->
</div>
```

## 开发

```bash
npm run typecheck        # vue-tsc --noEmit
npm run build            # dist/index.js + index.cjs + style.css + *.d.ts
```

本地验收台（真机渲染全部组件，含暗色/移动端）：

```bash
npx vite --config playground/vite.config.ts   # http://localhost:5273
node playground/smoke.mjs                     # 35 项冒烟：渲染/语义色/对比度/键盘/暗色/断点
```

`playground/vite.config.ts` 里有两处必须保留的配置（注释已说明原因）：
`root` 必须走 `fileURLToPath`（仓库路径含中文，`URL.pathname` 会百分号编码导致 EPERM），
`vue` 必须 alias 到 `esm-bundler` 全量构建（验收台根组件用字符串 template，需要运行时编译器）。

## 规范出处

| 主题 | 文档 |
| --- | --- |
| Token 数值 | `02-Token规范.md` |
| 组件契约 | `03-组件规范.md` |
| 交互动效 | `07-交互动效与微交互规范.md` |
| 组件覆盖 | `08-组件覆盖清单与Semi对齐.md` |
| 移动端 | `10-移动端组件规范.md` |
| 业务词库 | `15-妇幼业务词库与状态大典.md` |
| 命名术语 | `14-命名与术语规范.md` |
| 前端设计规范 | [`20-前端设计规范.md`](../20-前端设计规范.md) |
| 前端开发规范（技能族） | `.claude/skills/goodmom-frontend/`（入口）· `goodmom-tokens` / `goodmom-components` / `goodmom-status` / `goodmom-layout` / `goodmom-motion-a11y`（子技能） |

## 与 React 版的关系

`@goodmom/ui`（React + Arco）与 `@goodmom/vue`（Vue 3 零基座）**共享同一套 Token 数值与
状态字典**：`src/tokens/` 保持一致，改一处必须改两处，并由
`python3 scripts/check-status-map.py --ci` 在 CI 校验状态字典与 15 章的一致性。

Vue 版不再依赖 Arco，因此 `GmButton` / `GmProgress` / `GmStatusTag` 为自包含实现，
`GmTag` 与 `GmStatusTag` 的分工（D3 裁决）在 Vue 版延续为「标记 vs 业务状态」。
