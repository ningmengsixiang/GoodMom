# 贡献指南（简版）

1. 先查规范：组件/状态/词 → 00 组件总目录 / 14 命名术语 / 15 业务词库
2. 新组件：先在规范文档与 00 登记，再补 `src/components/Gm*.tsx` 并在 index.ts 导出
3. 颜色只用六语义与品牌 Token（theme.css / tokens/status.ts）
4. 提交前：`npm run typecheck`；有网络时同步跑 CI
