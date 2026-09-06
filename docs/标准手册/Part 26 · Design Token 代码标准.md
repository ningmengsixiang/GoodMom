# Part 26 · Design Token 代码标准（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：token 代码文件与审计边界。
> 用词：应/宜/可；编号 `26-xx`。

## 1 目的与适用范围
## 2 条款
- TC-26-01 应：唯一代码源 tokens/{design,business,status}.ts + theme.css(:root)；命名 `--lg-*`/`--mmh-*`+scope-kebab。
- TC-26-02 应：色值六进制只出现在 token 层（组件 0 魔法色，audit color-css 严格层 FAIL）。
- TC-26-03 应：alias 深色=状态文字唯一源（--lg-sem-*）；白字实底 --mmh-solid-*；文字承载行动 --mmh-grad-action-hc（D5/D6）。
- TC-26-04 应：页面色落 ALLOWED∪PAGE_ALIAS（D4）；代码层仅 ALLOWED；旧色回归 color-banned 拦截。
- TC-26-05 应：生成 refresh-spec.py 保阅读器；图标 build-icons.py；coverage.py 统计封装。
- TC-26-06 应：工程 npm run typecheck/build；CI open-pkg-typecheck。
- 验收：[ ] audit 色彩三检 OK；[ ] typecheck 绿；[ ] spec 已重生成。
