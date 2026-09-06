# Part 25 · Figma 组件库标准（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：Figma 设计库的页面/变量/组件组织与同步。
> 用词：应/宜/可；编号 `25-xx`。

## 1 目的与适用范围
## 2 条款
- FG-25-01 应：页面镜像代码分层：Primitive→Alias→Components→States→Forms→Nav→Feedback→Mobile→Charts。
- FG-25-02 应：图层/样式/变量命名＝14 章官方名＋02 token 名（`--lg-*`/`--mmh-*`）；Figma 与代码一一对应，禁止双轨。
- FG-25-03 应：Variables 三层引用（primitive→alias→component）；颜色/圆角/间距/字号全变量化，组件内不写裸值。
- FG-25-04 应：Auto Layout 4px 网格；组件属性=props 白名单；每组件含状态板与 Do/Don't 页。
- FG-25-05 应：协同——导出 Token JSON→人工 review→落 tokens/*.ts+theme.css→refresh-spec+audit；任一方向同步另一侧。
- 验收：[ ] 抽查与代码无裸值偏差；[ ] 状态齐全；[ ] 命名可 grep 到代码。
