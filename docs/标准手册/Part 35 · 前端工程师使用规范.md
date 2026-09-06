# Part 35 · 前端工程师使用规范（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：接入顺序、工程命令与集成纪律。
> 用词：应/宜/可；编号 `35-xx`。

## 1 目的与适用范围
## 2 条款
- FE-35-01 应：接入顺序 arco.css→@goodmom/ui/theme.css→组件/tokens；覆盖只改主题层。
- FE-35-02 应：使用 Gm*（12 模块）tokens/gmIcon/GmIcon/i18n 官方 API（goodmom-ui README）。
- FE-35-03 应：工程 npm run typecheck（根）与 build；CI 三 job；改动后跑 audit/a11y --ci。
- FE-35-04 应：页面集成 先 token 后组件后页面壳；新封装回填 index.ts/README/00/coverage；禁魔法色与页面裸断点。
- 验收：[ ] typecheck 绿；[ ] audit 色彩/bp OK。
