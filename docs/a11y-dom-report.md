# A11y DOM 实测报告（渲染级对比度）

- 生成时间：`2026-09-12 09:46:38+0800`
- 工具：`scripts/a11y-dom.py` v2.0.0（无头 Chrome 逐文本节点按 WCAG 公式实测）
- 算法：前景/背景均**保留 alpha 并做 source-over 合成**（沿祖先链逐层叠加）；
  渐变与图片背景无法取样，标 INFO，不参与阈值。
- 覆盖：`site/index.html` 逐模块各测一遍（8 个模块靠 display 切换，只测默认模块会漏 7 个）；
  重定向桩与 `_*` 临时文件已排除。

| 页面 | 确证失败 | 其中渐变上界 | 无法判定 INFO | 失败样例（选择器 「文本」 对比度 前景 on 背景） |
| --- | --- | --- | --- | --- |
| preview/manual.html | 0 | 0 | 0 | &nbsp; |
| site/index.html · site-index | 10 | 10 | 166 | div.wrap&gt;div.hero.glass&gt;div.cta&gt;a.btn.pri 「视觉规范」 2.00 (rgb(52, 58, 70) on 渐变上界（亮 178,58,99 / 暗 158,48,84）); section#gm-mod-site-index&gt;div.wrap&gt;h2#site-index--start&gt;span.secnum 「0」 2.00 (rgb(52, 58, 70) on 渐变上界（亮 178,58,99 / 暗 158,48,84）); section#gm-mod-site-index&gt;div.wrap&gt;h2#site-index--about&gt;span.secnum 「01」 2.00 (rgb(52, 58, 70) on 渐变上界（亮 178,58,99 / 暗 158,48,84）) |
| site/index.html · preview-index | 103 | 99 | 1116 | div.wrap&gt;header.hero.glass&gt;div.hero-main&gt;span.kicker 「妈咪好 · GOODMOM · 妇幼全生命周期 · V2.5」 3.74 (rgb(128, 102, 240) on 渐变上界（亮 245,240,253 / 暗 245,242,255）); div.hero-main&gt;div.dna-chips&gt;span&gt;b 「Liquid Glass」 4.14 (rgb(128, 102, 240) on 渐变上界（亮 255,254,254 / 暗 255,255,255）); div.hero-main&gt;div.dna-chips&gt;span&gt;b 「Floating」 4.14 (rgb(128, 102, 240) on 渐变上界（亮 255,254,254 / 暗 255,255,255）) |
| site/index.html · preview-examples | 29 | 29 | 377 | section#gm-mod-preview-examples&gt;div#preview-examples--list&gt;div.pcbar.glass&gt;span.u 「王」 4.14 (rgb(255, 255, 255) on 渐变上界（亮 185,160,255 / 暗 128,102,240）); div#preview-examples--list&gt;div.kpis&gt;div.kpi.card&gt;div.v.num 「1,026」 2.63 (rgb(109, 158, 255) on 渐变上界（亮 254,250,249 / 暗 255,255,255）); div#preview-examples--list&gt;div.kpis&gt;div.kpi.card&gt;div.v.num 「86」 1.86 (rgb(242, 178, 92) on 渐变上界（亮 254,250,249 / 暗 255,255,255）) |
| site/index.html · preview-mobile | 15 | 14 | 91 | div.kpis&gt;div.gcard.kpi&gt;div.d&gt;b.up 「↑ 8.4%」 2.07 (rgb(66, 199, 161) on 渐变上界（亮 253,252,252 / 暗 249,246,245）); div.wrap&gt;div.kpis&gt;div.gcard.kpi&gt;div.v.num 「96.2%」 1.97 (rgb(66, 199, 161) on 渐变上界（亮 249,246,245 / 暗 235,226,222）); div.kpis&gt;div.gcard.kpi&gt;div.d&gt;b.up 「↑ 1.4pt」 2.07 (rgb(66, 199, 161) on 渐变上界（亮 253,252,252 / 暗 249,246,245）) |
| site/index.html · preview-patterns | 50 | 45 | 118 | div.wrap&gt;section#preview-patterns--link-demo&gt;div.sec-head&gt;span 「03 · 3.10｜四类型 × 三尺寸 × 状态谱」 3.12 (rgb(138, 146, 163) on 渐变上界（亮 253,242,238 / 暗 255,255,255）); div.glass&gt;div.row&gt;div.col&gt;span.lbl 「默认 / 强调 / 弱化 / 危险」 3.12 (rgb(138, 146, 163) on 渐变上界（亮 254,249,247 / 暗 255,255,255）); div.glass&gt;div.row&gt;div.col&gt;span.lbl 「尺寸 small / default / large」 3.12 (rgb(138, 146, 163) on 渐变上界（亮 254,249,247 / 暗 255,255,255）) |
| site/index.html · site-spec | 1 | 1 | 6180 | main#gm-main&gt;section#gm-mod-site-spec&gt;div.top&gt;a.ext2 「组件与状态」 3.28 (rgb(255, 255, 255) on 渐变上界（亮 255,169,194 / 暗 232,93,143）) |
| site/index.html · site-manual | 0 | 0 | 907 | &nbsp; |
| site/index.html · site-docs | 1 | 1 | 67 | div#site-docs--doc&gt;main.doc&gt;div#site-docs--dark&gt;button#site-docs--darkToggle 「切换暗黑 / 亮色」 2.00 (rgb(52, 58, 70) on 渐变上界（亮 178,58,99 / 暗 158,48,84）) |
| fuyouaicansai/goodmom-redesign.html | 31 | 31 | 289 | body.mode-sider&gt;nav#side&gt;button.nv.on&gt;span 「专家工作台」 3.96 (rgb(255, 255, 255) on 渐变上界（亮 199,166,255 / 暗 143,106,224）); body.mode-sider&gt;nav#side&gt;button.nv.on&gt;em.bdg 「42」 2.68 (rgb(255, 255, 255) on 渐变上界（亮 213,188,255 / 暗 171,143,232）); body.mode-sider&gt;nav#side&gt;button.nv&gt;em.bdg 「2」 4.14 (rgb(128, 102, 240) on 渐变上界（亮 255,255,254 / 暗 255,255,255）) |

**确证失败合计 240**（其中 230 项为渐变承载面的上界确证，10 项为实色承载面直接确证）；无法判定（渐变但上界达标）9311。

## 按前景色归类的成因分布

> 修色板时按本表从上往下改，一次一行即可消掉一批失败。

| 前景色 | 失败数 | 涉及页面 | 样例（对比度 / 承载面） |
| --- | --- | --- | --- |
| `rgb(128, 102, 240)` | 44 | fuyouaicansai/goodmom-redesign.html、site/index.html · preview-index | 3.74 · 渐变上界（亮 245,240,253 / 暗 245,242,255） |
| `rgb(138, 146, 163)` | 44 | site/index.html · preview-patterns | 3.12 · 渐变上界（亮 253,242,238 / 暗 255,255,255） |
| `rgb(255, 255, 255)` | 42 | fuyouaicansai/goodmom-redesign.html、site/index.html · preview-examples、site/index.html · preview-index | 2.46 · 渐变上界（亮 255,196,214 / 暗 247,127,163） |
| `rgb(232, 93, 143)` | 30 | site/index.html · preview-examples、site/index.html · preview-index、site/index.html · preview-mobile | 2.98 · rgb(255,240,244) |
| `rgb(52, 58, 70)` | 11 | site/index.html · site-docs、site/index.html · site-index | 2.00 · 渐变上界（亮 178,58,99 / 暗 158,48,84） |
| `rgb(66, 199, 161)` | 11 | site/index.html · preview-index、site/index.html · preview-mobile | 2.12 · 渐变上界（亮 255,254,254 / 暗 255,255,255） |
| `rgb(239, 106, 123)` | 11 | site/index.html · preview-examples、site/index.html · preview-index、site/index.html · preview-mobile | 2.99 · 渐变上界（亮 255,254,254 / 暗 255,255,255） |
| `rgb(138, 109, 16)` | 11 | fuyouaicansai/goodmom-redesign.html、site/index.html · preview-examples、site/index.html · preview-index | 4.43 · 渐变上界（亮 252,241,218 / 暗 252,243,220） |
| `rgba(88, 98, 115, 0.7)` | 9 | site/index.html · preview-index | 3.14 · 渐变上界（亮 255,252,252 / 暗 209,209,210） |
| `rgb(242, 178, 92)` | 7 | site/index.html · preview-examples、site/index.html · preview-index、site/index.html · preview-mobile | 1.86 · 渐变上界（亮 255,254,253 / 暗 255,255,255） |
| `rgb(204, 204, 204)` | 4 | fuyouaicansai/goodmom-redesign.html | 1.61 · 渐变上界（亮 254,250,249 / 暗 255,255,255） |
| `rgb(105, 216, 210)` | 2 | site/index.html · preview-index | 1.70 · 渐变上界（亮 255,254,253 / 暗 255,255,255） |
| `rgb(109, 158, 255)` | 2 | site/index.html · preview-examples、site/index.html · preview-index | 2.63 · 渐变上界（亮 255,254,253 / 暗 255,255,255） |
| `rgb(79, 181, 156)` | 2 | fuyouaicansai/goodmom-redesign.html、site/index.html · preview-index | 2.49 · 渐变上界（亮 255,254,254 / 暗 255,255,255） |
| `rgb(141, 90, 21)` | 2 | site/index.html · preview-patterns | 2.02 · rgb(66,53,44) |
| `rgba(88, 98, 115, 0.6)` | 1 | site/index.html · preview-index | 2.56 · 渐变上界（亮 254,250,248 / 暗 163,162,166） |
| `rgb(255, 195, 160)` | 1 | site/index.html · preview-index | 1.55 · 渐变上界（亮 255,254,253 / 暗 255,255,255） |
| `rgb(154, 120, 255)` | 1 | site/index.html · preview-index | 3.23 · 渐变上界（亮 255,254,253 / 暗 255,255,255） |
| `rgb(182, 154, 255)` | 1 | site/index.html · preview-mobile | 2.22 · 渐变上界（亮 251,250,249 / 暗 243,238,235） |
| `rgba(88, 98, 115, 0.4)` | 1 | site/index.html · preview-patterns | 1.82 · 渐变上界（亮 254,249,247 / 暗 255,255,255） |
| `rgb(37, 113, 93)` | 1 | site/index.html · preview-patterns | 2.39 · rgb(34,46,49) |
| `rgb(183, 47, 66)` | 1 | site/index.html · preview-patterns | 2.41 · rgb(55,36,45) |
| `rgb(94, 102, 115)` | 1 | site/index.html · preview-patterns | 2.77 · rgb(32,32,40) |

阈值基线（`docs/a11y-dom-baseline.json`）：实色失败 ≤ 10（基线生成于 2026-09-12 09:46:00+0800）。
