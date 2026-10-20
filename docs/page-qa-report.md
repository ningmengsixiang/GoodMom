# 逐页规范质检报告（Page-level Spec QA）

- 生成时间：`2026-10-19 08:25:33+0800`
- 工具：`node scripts/page-qa.mjs`（Playwright 真实渲染；桌面 1440 / 移动 375 / 暗色档各测一遍）
- 口径：每条 finding 都带**规范锚点 + 选择器 + 实测值**，可逐条复现与回归
- 范围：真实页面 18 个（唯一首页逐模块 · 打印手册 · 演示页）；重定向桩 7 个**单独统计**（服务端摘掉跳转脚本后测桩自身，避免测成目标模块而重复计数）

## 0. 结论摘要（不含重定向桩）

| 规则 | 严重度 | 规范锚点 | 命中数 | 涉及页面 |
| --- | --- | --- | --- | --- |
| 模块未实现暗色档 `dark-missing` | P3 | 02 · 2.1.9 | 5 | 5 |

**合计 5 条**

## 0b. 档位偏离分布（P3 · 聚合，非逐条）

**偏离 4px 网格**（spacing-grid，锚点 02 · 2.3.1，共 45145 处）

| 实测值 | 命中元素数 | 样例 |
| --- | --- | --- |
| 7 | 12796 | `site/index.html · preview-index` `div.demo-topbar>span.demo-topbar__seg>div#preview-index--segNav>span.seg-it.on` |
| 9 | 12762 | `site/index.html · preview-index` `div.panel.glass-l2>div.demo-nav-grid>div>div` |
| 1 | 6124 | `site/index.html · preview-index` `div.grid.g2>div.panel.glass-l2>div.field>input` |
| 5 | 5905 | `site/index.html · preview-index` `div.wrap>header.hero.glass>div.hero-main>span.kicker` |
| 14 | 2730 | `site/index.html · site-index` `div.wrap>div.hero.glass>div.stat>span` |
| 6 | 1361 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.stat` |
| 10 | 992 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.cta` |
| 21.28 | 710 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.md>h4#site-spec--①-开发指南developer-guide` |
| 22 | 441 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.cta` |
| 18 | 343 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>div.journey` |
| 2 | 255 | `site/index.html · site-index` `div.secpad>div.sem>div.s>span` |
| 3 | 224 | `site/index.html · preview-index` `div.panel.glass-l2>div.descrow>div.it>b` |
| 13 | 121 | `site/index.html · site-index` `div.wrap>div.grid>div.card>p` |
| 26 | 116 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>p.sub` |
| 11 | 71 | `site/index.html · preview-index` `div.wrap>section#preview-index--allcomp>div.covline>span.cv` |
| 19.92 | 36 | `site/index.html · preview-index` `div.wrap>section#preview-index--guide>div.sec-head>h2` |
| 22.1776 | 28 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-20>div.md>h5#site-spec--品牌色阶---mmh-` |
| 15 | 25 | `site/index.html · site-index` `div.wrap>div.grid>div.card>h3` |

**字号不在层级**（type-scale，锚点 02 · 2.2.2，共 7357 处）

| 实测值 | 命中元素数 | 样例 |
| --- | --- | --- |
| 12.5 | 6077 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>pre.tree` |
| 13.5 | 439 | `site/index.html · site-index` `div.secpad>div.tree2>div.gr>b` |
| 13 | 246 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>h2#site-index--start>span.secnum` |
| 11 | 236 | `site/index.html · preview-index` `section#preview-index--glass>div.stage>div.lvl.l1>div.tag` |
| 10 | 130 | `site/index.html · preview-index` `div.hero-stage>div.demo-card.c1>div.row>span.badge` |
| 10.5 | 64 | `site/index.html · preview-index` `div.stmods>div.stmod>div>span.tpill.c-g` |
| 20 | 27 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.chap-hd>b` |
| 17 | 24 | `site/index.html · preview-index` `div>div>div.stepbox>button.stpm` |
| 26 | 23 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>h2#site-index--start>span` |
| 19 | 22 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.md>h2#site-spec--妈咪好-goodmom-妇幼儿童全生命周期设计系统` |
| 13.28 | 14 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-20>div.md>h5#site-spec--品牌色阶---mmh-` |
| 8.5 | 10 | `site/index.html · preview-index` `div.body>div.mrow2.mglass>span.md2>span` |
| 9.5 | 9 | `site/index.html · preview-index` `div.scr>div.body>div.mkpi.mglass>span.l` |
| 15.5 | 7 | `site/index.html · preview-index` `div.exgrid>a.excard.glass-l2>span>h3` |
| 22 | 6 | `site/index.html · site-index` `div.hero.glass>div.stat>span>b` |
| 11.5 | 6 | `site/index.html · preview-index` `div.wrap>section#preview-index--allcomp>div.covline>a` |
| 13.33 | 5 | `site/index.html · site-spec` `main#gm-main>section#gm-mod-site-spec>div.top>button#site-spec--modeBtn` |
| 34 | 3 | `site/index.html · preview-index` `section#preview-index--component>div.grid.g3>div.kpi.glass-l2>div.k-val.num` |

## 1. 逐页明细

### site/index.html · site-index

- 结构：标题 27 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 178
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · products

- 结构：标题 5 个 · 焦点样本 24 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1095
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/index.html · preview-index

- 结构：标题 86 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1252
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · preview-examples

- 结构：标题 0 个 · 焦点样本 34 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 422
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · preview-mobile

- 结构：标题 16 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 487
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/index.html · preview-patterns

- 结构：标题 8 个 · 焦点样本 22 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 148
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/index.html · site-spec

- 结构：标题 553 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 10812
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · site-manual

- 结构：标题 0 个 · 焦点样本 39 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 914
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · site-docs

- 结构：标题 4 个 · 焦点样本 28 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 68
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### preview/manual.html

- 结构：标题 8 个 · 焦点样本 5 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/goodmom-redesign.html

- 结构：标题 1 个 · 焦点样本 14 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 246
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个
- 控制台错误：1 条

✅ 未发现可机械判定的规范问题

### fuyouaicansai/index.html

- 结构：标题 2 个 · 焦点样本 8 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 44
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p01-women-health.html

- 结构：标题 6 个 · 焦点样本 42 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 979
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p02-preconception.html

- 结构：标题 6 个 · 焦点样本 44 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1118
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p03-maternity.html

- 结构：标题 6 个 · 焦点样本 44 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1279
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p04-newborn.html

- 结构：标题 6 个 · 焦点样本 43 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 998
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p05-child-health.html

- 结构：标题 6 个 · 焦点样本 47 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1384
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### fuyouaicansai/p06-ai-care.html

- 结构：标题 6 个 · 焦点样本 44 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1107
- 对比度（暗色档）：确证失败 0
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/docs.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/manual.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### site/spec.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### preview/examples.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### preview/index.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### preview/mobile.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题

### preview/patterns.html

- 结构：标题 0 个 · 焦点样本 1 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 3
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

✅ 未发现可机械判定的规范问题
