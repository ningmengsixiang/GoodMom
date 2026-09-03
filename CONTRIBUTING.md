# 参与贡献（GoodMom 总仓）

- 设计规范修改：先读 16 · 一致性审计 → 登记（00 组件 / 14 命名 / 15 词库）→ 改文档并同步计数与预览
- 图标新增：09 · 9.6 流程 → 更新 icons/lg-icons.svg → `python3 scripts/build-icons.py` 再同步 goodmom-icons
- 组件封装：goodmom-ui（@goodmom/ui）与 frontend-app/packages/gm-arco-ui；颜色只用六语义与品牌 Token
- 提交前：README 链接检查（CI 自动）＋封装层 `npm run typecheck`
- 行为准则见 CODE_OF_CONDUCT.md；安全报告见 SECURITY.md
