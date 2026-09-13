# 逐页规范质检报告（Page-level Spec QA）

- 生成时间：`2026-09-13 14:46:08+0800`
- 工具：`node scripts/page-qa.mjs`（Playwright 真实渲染；桌面 1440 / 移动 375 / 暗色档各测一遍）
- 口径：每条 finding 都带**规范锚点 + 选择器 + 实测值**，可逐条复现与回归
- 范围：真实页面 10 个（唯一首页 8 模块逐模块 · 打印手册 · 演示页）；重定向桩 7 个**单独统计**（服务端摘掉跳转脚本后测桩自身，避免测成目标模块而重复计数）

## 0. 结论摘要（不含重定向桩）

| 规则 | 严重度 | 规范锚点 | 命中数 | 涉及页面 |
| --- | --- | --- | --- | --- |
| 模块未实现暗色档 `dark-missing` | P3 | 02 · 2.1.9 | 5 | 5 |

**合计 5 条**

## 0b. 档位偏离分布（P3 · 聚合，非逐条）

**偏离 4px 网格**（spacing-grid，锚点 02 · 2.3.1，共 34151 处）

| 实测值 | 命中元素数 | 样例 |
| --- | --- | --- |
| 7 | 10102 | `site/index.html · preview-index` `div>span>div#preview-index--segNav>span.seg-it.on` |
| 9 | 10068 | `site/index.html · preview-index` `div.panel.glass-l2>div>div>div` |
| 1 | 3974 | `site/index.html · preview-index` `div.grid.g2>div.panel.glass-l2>div.field>input` |
| 5 | 3577 | `site/index.html · preview-index` `div.wrap>header.hero.glass>div.hero-main>span.kicker` |
| 14 | 1940 | `site/index.html · site-index` `div.wrap>div.hero.glass>div.stat>span` |
| 6 | 1329 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.stat` |
| 10 | 893 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.cta` |
| 21.28 | 618 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.md>h4` |
| 22 | 421 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>div.hero.glass>div.cta` |
| 18 | 344 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>div.journey` |
| 3 | 224 | `site/index.html · preview-index` `div.panel.glass-l2>div.descrow>div.it>b` |
| 2 | 205 | `site/index.html · site-index` `div.secpad>div.sem>div.s>span` |
| 13 | 121 | `site/index.html · site-index` `div.wrap>div.grid>div.card>p` |
| 26 | 114 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>p.sub` |
| 11 | 71 | `site/index.html · preview-index` `div.wrap>section#preview-index--allcomp>div.covline>span.cv` |
| 19.92 | 36 | `site/index.html · preview-index` `div.wrap>section#preview-index--guide>div.sec-head>h2` |
| 15 | 25 | `site/index.html · site-index` `div.wrap>div.grid>div.card>h3` |
| 34 | 23 | `site/index.html · preview-mobile` `body>main#gm-main>section#gm-mod-preview-mobile>div#preview-mobile--pmStage` |

**字号不在层级**（type-scale，锚点 02 · 2.2.2，共 6233 处）

| 实测值 | 命中元素数 | 样例 |
| --- | --- | --- |
| 12.5 | 4753 | `site/index.html · site-index` `main#gm-main>section#gm-mod-site-index>div.wrap>pre.tree` |
| 13.5 | 441 | `site/index.html · site-index` `div.secpad>div.tree2>div.gr>b` |
| 11 | 381 | `site/index.html · site-index` `div.hero.glass>div.stat>span>i` |
| 13 | 241 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>h2#site-index--start>span.secnum` |
| 10 | 185 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>h2#site-index--start>small` |
| 10.5 | 64 | `site/index.html · preview-index` `div.stmods>div.stmod>div>span.tpill.c-g` |
| 20 | 26 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.chap-hd>b` |
| 11.5 | 25 | `site/index.html · preview-index` `section#preview-index--component>div.panel.glass-l2>div.panel.glass-l2>p.mh` |
| 17 | 24 | `site/index.html · preview-index` `div>div>div.stepbox>button.stpm` |
| 26 | 23 | `site/index.html · site-index` `section#gm-mod-site-index>div.wrap>h2#site-index--start>span` |
| 19 | 21 | `site/index.html · site-spec` `div.wrap>section#site-spec--ch-readme>div.md>h2` |
| 8.5 | 10 | `site/index.html · preview-index` `div.body>div.mrow2.mglass>span.md2>span` |
| 9.5 | 9 | `site/index.html · preview-index` `div.scr>div.body>div.mkpi.mglass>span.l` |
| 15.5 | 7 | `site/index.html · preview-index` `div.exgrid>a.excard.glass-l2>span>h3` |
| 22 | 6 | `site/index.html · site-index` `div.hero.glass>div.stat>span>b` |
| 13.33 | 5 | `site/index.html · site-spec` `main#gm-main>section#gm-mod-site-spec>div.top>button#site-spec--modeBtn` |
| 34 | 3 | `site/index.html · preview-index` `section#preview-index--component>div.grid.g3>div.kpi.glass-l2>div.k-val.num` |
| 6.5 | 3 | `site/index.html · preview-index` `div>div>svg>text` |

## 1. 逐页明细

### site/index.html · site-index

- 结构：标题 27 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 178
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · preview-index

- 结构：标题 86 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 1303
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · preview-examples

- 结构：标题 0 个 · 焦点样本 34 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 473
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · preview-mobile

- 结构：标题 15 个 · 焦点样本 60 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 464
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

- 结构：标题 478 个 · 焦点样本 32 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 7810
- 横向溢出：桌面 0px / 移动 0px
- 移动端非行内热区受检 0 个

| 严重度 | 规则 | 锚点 | 位置 | 实测 |
| --- | --- | --- | --- | --- |
| P3 | dark-missing | 02 · 2.1.9 | `.gm-mod.is-on` | 该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化 |

### site/index.html · site-manual

- 结构：标题 0 个 · 焦点样本 39 个（其中不可见 0）· emoji 0 处
- 对比度（浅色档）：确证失败 0（渐变上界 0）· 无法判定 913
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
