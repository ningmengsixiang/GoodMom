# A11y DOM 实测报告（渲染级）

- 工具：`scripts/a11y-dom.py`（无头 Chrome 逐文本节点按 WCAG 公式实测）
- 说明：实色背景按 ≥4.5（大字/粗体 ≥3.0）判定；渐变背景无法取样，标 INFO——文字承载面已按 D6 离线切深档（实测值见 docs/审查决策记录.md D5）

| 页面 | 文本节点失败(实色) | 渐变未取样(INFO) | 备注 |
| --- | --- | --- | --- |
| site/index.html | 4 | 148 | span 设计师 2.32; span 前端 / 封装 2.32; span 产品 / 内容 2.32 |
| site/docs.html | 0 | 1 | &nbsp; |
| site/spec.html | 564 | 4021 | blockquote 按业界通用 IA 把本仓资源分组归档；栏目 → 落点 → 状 2.79; th 栏目 2.52; th 落点 2.52 |
| preview/index.html | 147 | 712 | span 妈咪好 · GOODMOM · 妇幼全生命周期 · V2.0 1.28; b Liquid Glass 4.14; b Floating 4.14 |
| preview/mobile.html | 4 | 93 | span 搜索 2.32; span × 2.99; span × 2.99 |
| preview/examples.html | 71 | 295 | span 检查异常 1.34; span 待复查 1.98; span 待随访 1.98 |
| preview/manual.html | 0 | 0 | &nbsp; |
| fuyouaicansai/goodmom-redesign.html | 53 | 254 | em 42 1.00; em 2 4.14; span 在线 1.67 |
