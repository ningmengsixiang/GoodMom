# A11y DOM 实测报告（渲染级对比度）

- 生成时间：`2026-09-26 12:11:48+0800`
- 工具：`scripts/a11y-dom.py` v2.0.0（无头 Chrome 逐文本节点按 WCAG 公式实测）
- 算法：前景/背景均**保留 alpha 并做 source-over 合成**（沿祖先链逐层叠加）；
  渐变与图片背景无法取样，标 INFO，不参与阈值。
- 覆盖：`site/index.html` 逐模块各测一遍（模块数从 build-site.py 的 MODULES 读取；模块靠 display 切换，只测默认模块会漏掉其余全部）；
  重定向桩与 `_*` 临时文件已排除。

| 页面 | 确证失败 | 其中渐变上界 | 无法判定 INFO | 失败样例（选择器 「文本」 对比度 前景 on 背景） |
| --- | --- | --- | --- | --- |
| preview/manual.html | 0 | 0 | 1 | &nbsp; |
| site/index.html · site-index | 0 | 0 | 178 | &nbsp; |
| site/index.html · products | 0 | 0 | 1035 | &nbsp; |
| site/index.html · preview-index | 0 | 0 | 1229 | &nbsp; |
| site/index.html · preview-examples | 0 | 0 | 402 | &nbsp; |
| site/index.html · preview-mobile | 0 | 0 | 432 | &nbsp; |
| site/index.html · preview-patterns | 0 | 0 | 155 | &nbsp; |
| site/index.html · site-spec | 0 | 0 | 10373 | &nbsp; |
| site/index.html · site-manual | 0 | 0 | 913 | &nbsp; |
| site/index.html · site-docs | 0 | 0 | 68 | &nbsp; |
| fuyouaicansai/goodmom-redesign.html | 0 | 0 | 246 | &nbsp; |
| fuyouaicansai/index.html | 0 | 0 | 44 | &nbsp; |
| fuyouaicansai/p01-women-health.html | 0 | 0 | 979 | &nbsp; |
| fuyouaicansai/p02-preconception.html | 0 | 0 | 1118 | &nbsp; |
| fuyouaicansai/p03-maternity.html | 0 | 0 | 1325 | &nbsp; |
| fuyouaicansai/p04-newborn.html | 0 | 0 | 1034 | &nbsp; |
| fuyouaicansai/p05-child-health.html | 0 | 0 | 1435 | &nbsp; |
| fuyouaicansai/p06-ai-care.html | 0 | 0 | 1107 | &nbsp; |

**确证失败合计 0**（其中 0 项为渐变承载面的上界确证，0 项为实色承载面直接确证）；无法判定（渐变但上界达标）22074。

阈值基线（`docs/a11y-dom-baseline.json`）：实色失败 ≤ 0（基线生成于 2026-09-12 11:04:13+0800）。
