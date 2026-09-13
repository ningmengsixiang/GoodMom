# frontend-app · 妈咪好产品前端工程（Vite + React + Arco + `@goodmom/ui`）

> **架构与规范**：见 [`19-工程架构与组件复用规范.md`](../19-工程架构与组件复用规范.md)（七项决定：视觉基调 / 技术选型 /
> 组件选型 / 目录结构 / 模块边界 / 复用规则 / 样式系统）。
> **红线速查**：见 [`.claude/skills/goodmom-frontend/SKILL.md`](../.claude/skills/goodmom-frontend/SKILL.md)（R1–R11）。
> Monorepo（npm workspaces）：应用在根 `src/`，封装层在 `packages/gm-arco-ui`。

## 目录结构（19.4）

```text
frontend-app/
├── package.json              # workspaces:["packages/*"] · dev / build / gm:typecheck
├── vite.config.js            # 别名：@ → src · @gm → 封装层 src
├── tsconfig.json             # strict · paths 与 vite 别名一致
├── src/
│   ├── main.tsx              # 引导：arco.css → @gm/gm.css → styles/index.css
│   ├── App.tsx               # 装配（Provider → 壳 → 路由页面；零业务）
│   ├── app/                  # 装配层：routes / providers / layout / guards
│   ├── modules/              # 业务模块（9 个，各含 index · model · api · README）
│   ├── shared/               # 平台层：router / session / feedback / api / domain / components / hooks / utils / constants
│   ├── styles/               # 只写布局（Token 唯一源是 gm.css）
│   └── dev/                  # 开发期页面（组件演示，不进生产导航）
└── packages/gm-arco-ui/      # @goodmom/gm-arco-ui 封装层（与 goodmom-ui/src 逐字节镜像，禁手改）
```

## 运行

```bash
cd frontend-app
npm install                  # 首次需可访问 npm
npm run dev                  # http://localhost:3081
```

## 验收（必须实际执行，不许凭记忆断言）

```bash
cd frontend-app
npx tsc --noEmit -p tsconfig.json   # 应用类型（CI 已纳入）
npm run gm:typecheck                # 封装层类型
npm run build                       # 生产构建

cd .. && python3 scripts/check-module-boundary.py   # 工程架构门禁 B1–B9
```

## 开发期 QA 开关（仅 dev，生产构建会被摇掉）

四态（加载 / 空 / 错 / 有数据）不必靠断网或改代码来演：

```js
window.__GM_MOCK.setDelay(2000);                    // 把骨架看清楚
window.__GM_MOCK.empty("/workbench/today", true);   // 空态
window.__GM_MOCK.fail("/followup/tasks", true);     // 错误三通道
window.__GM_MOCK.clearCache();                      // 清请求缓存（重放四态前先清）
```

## 接真实网关

在 `.env.local` 里配 `VITE_API_BASE=https://…` 即自动走 HTTP（`shared/api/client.ts`），
页面与模块代码零改动；未配置时走 `shared/api/mock.ts`。
