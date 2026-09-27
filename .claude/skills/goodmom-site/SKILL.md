---
name: goodmom-site
description: Use when 改动或新增妈咪好设计系统的**站点与独立产品页** —— site/index.html 及其片段、site/fragments/*、scripts/gen-*.py、scripts/build-site.py、fuyouaicansai/p01…p06、preview/* 旧入口、site/.baseline 保真度基线。触发词：站点、唯一首页、规范全文、标准手册、文档索引、产品矩阵、独立产品页、fuyouaicansai、preview、片段新鲜度、站点构建、site/index.html、改产物没生效、锚点、重定向、站点冒烟、page-qa、layout-gate、站点暗色没生效。
---

# 站点与独立产品页（第三实现）

设计系统有**三个消费面**：① React 库 ② Vue 库 ③ **站点与独立产品页**（原生 HTML/CSS，由脚本生成）。
前两个由 `goodmom-tokens` / `goodmom-components` 管；本技能只管第三个 —— 它有自己的生成流水线、自己的门禁、以及一处**尚未补齐的暗色档缺口**。

## 三条铁律

**R1 `site/index.html` 是产物，禁止手改。** 它是 `build-site.py` 把 9 个片段拼起来的单文件。
手改会在下一次重跑生成器时静默丢失，且 `python3 scripts/build-site.py --check` 直接 FAIL。
**要改站点 → 改片段或生成器 → 重跑构建。**

**R2 分清"生成源"与"手写源"，改错了地方等于没改。**

| 片段 | 谁生成 |
| --- | --- |
| `site/fragments/site-spec.html` | `scripts/gen-spec.py`（从 21 份编号文档 + README） |
| `site/fragments/site-manual.html` | `scripts/gen-manual.py`（从 `docs/标准手册/`） |
| `site/fragments/products.html` | `scripts/gen-products.py`（从 `prd/zong.md`） |
| `fuyouaicansai/p01…p06` | `scripts/gen-product-apps.py`（从 `prd/zong.md` + `products_data.py` + `product_app_assets.py`） |
| `site/fragments/site-index.html` | **手写源**（直接改它） |
| `site/fragments/preview-{index,examples,mobile,patterns}.html` | **手写源** |
| `site/fragments/site-docs.html` | **手写源** |
| `preview/*.html` | 兼容旧链接的**重定向桩**（`redirect-legacy.py --check` 守门，别删） |
| `site/.baseline/*.html`（8 个） | 保真度基线（`site-parity.mjs` 的比对对象） |

> ⚠️ 改 `site/fragments/preview-*.html` 这类手写源**不会**被生成器覆盖；改 `gen-*.py` 的输出片段则**必须**重跑生成器，否则 CI 的「片段新鲜度」步骤会 FAIL。

**R3 改了生成源就重跑生成器，并让工作树里的产物一起进提交。**

```bash
python3 scripts/gen-spec.py && python3 scripts/gen-manual.py
python3 scripts/gen-products.py && python3 scripts/gen-product-apps.py
python3 scripts/build-site.py
git diff --exit-code -- site/fragments/ fuyouaicansai/   # CI 的同款新鲜度断言
```

## 站点模块（9 个，锚点即路由）

| 模块 id | 名称 | 来源 |
| --- | --- | --- |
| `site-index` | 首页与总览 | 手写源 |
| `products` | 产品矩阵（6 产品 × 2 页） | `gen-products.py` |
| `preview-index` | 视觉规范 | 手写源 |
| `preview-examples` | 组件与状态 | 手写源 |
| `preview-mobile` | 移动端 | 手写源 |
| `preview-patterns` | 交互范式 | 手写源 |
| `site-spec` | 规范全文（21 份） | `gen-spec.py` |
| `site-manual` | 标准手册 | `gen-manual.py` |
| `site-docs` | 文档索引 | 手写源 |

**深链格式**：`site/index.html#gm-mod-<模块id>`；章节深链带 `--ch-NN`（如 `#site-spec--ch-20`）。
旧入口 `preview/*.html`、`site/spec.html` 等是**重定向桩**，锚点会透传 —— 别把它们改成内容页。

## 颜色与断点：新增之前先登记

站点的样式**不走组件库的 Token 文件**，它自己定义一份精简 Token（`build-site.py` 的 SHELL、
`gen-products.py` 的 `CSS`、`product_app_assets.py` 的 `APP_CSS`）。因此新增颜色/断点会被门禁拦：

| 门禁 | 规则 | 怎么过 |
| --- | --- | --- |
| `audit.py` 的 `color-css` / `color-html` | 站点样式里的每个 hex 必须在 `ALLOWED`（严格层）或 `PAGE_ALIAS`（页面档）里 | 加进 `PAGE_ALIAS` 并**写明理由**；能在 Token 里表达的优先用 `var()` |
| `audit.py` 的 `bp` | 媒体查询只允许 `≤767 / 768–1023 / ≥1024 / ≥1366` + `REGISTERED` 里的已裁决例外 | 新宽度要么合并进四档，要么进 `REGISTERED` 并写明它解决什么 |
| `audit.py` 的 `undefined-token` | 片段里 `var(--x)` 无兜底引用未定义变量 | 用已定义变量，或写 `var(--x, 兜底值)`（`<code>`/`<pre>` 里的文档反例不算） |

> **V2.9 起 `audit.py` 通篇 OK、零 WARN 零 FAIL** —— 这份干净是刻意的：任何新漂移立刻可见。
> 别用"它本来就有 WARN"当借口放新的进去。

## 暗色档：站点这一面**尚未补齐**（D37，写代码前必读）

`page-qa` 长期报 **13 条 P3 `dark-missing`**：`site/index.html` 的 6 个模块 +
`fuyouaicansai/p01…p06` **根本没有** `[data-theme="dark"]` 规则。

两套暗色语义，别混：

| 面 | 暗色属性挂在哪 |
| --- | --- |
| 站点模块 | **模块根** `.gm-mod.is-on`（`build-site.py rewrite_page_dark_css`）—— 只挂 `<html>` 会测出一个"永远不会发生"的状态 |
| 独立产品页 | `document.body` + `<html>` |

**已知实现路径与坑**（D37 记录，可直接复用）：把散在规则里的白色叠加字面量抽成填充档 Token（浅色档取值＝原值，浅色观感零变化）+ 补暗色档，能让 `dark-missing` 由 13 降到 5，
**但 `page-qa` 的暗色探针会同时报约 90 条假阳性** —— 它的 `bgOf()` 只把不透明 `background-color`
当作"底"，渐变 `background-image` 不算，而站点页面底正是渐变，于是探针落到纯白兜底再压暗色文字。

> ⛔ **不要在没有修探针的前提下声称站点支持暗色**，也不要为了让它变绿去放宽探针 —— 那是 CI 里的真实门禁。
> 顺序是：先修 `page-qa.mjs` 的暗色模型（至少要能表达"渐变画布"这一层），再落实现。

## 验收

```bash
python3 scripts/build-site.py --check        # 产物与构建结果一致（禁手改）
python3 scripts/redirect-legacy.py --check   # 旧入口必须仍是重定向
python3 scripts/check-anchors.py             # 畸形 href / 悬空锚点
python3 scripts/audit.py                     # 含 color-html / bp / undefined-token / spec
```

起服务 / 跑脚本 / 关服务**必须在同一个 shell 块**里，否则后台进程被清理，报错变成
`ERR_CONNECTION_REFUSED`，与真实原因无关：

```bash
python3 -m http.server 5288 --bind 127.0.0.1 &
export SITE_URL=http://127.0.0.1:5288/site/index.html SITE_BASE=http://127.0.0.1:5288
node scripts/site-parity.mjs        # 15/15 保真度（对 site/.baseline）
node scripts/site-smoke.mjs         # 54/54 首页各模块
node scripts/mobile-smoke.mjs       # 86/86 移动端模块（左滑/下拉/上拉/焦点陷阱/暗色）
node scripts/products-smoke.mjs     # 121/121 产品矩阵 7 页
node scripts/product-apps-smoke.mjs # 160/160 独立产品页 6×4 视图
node scripts/page-qa.mjs --ci       # P0–P2 必须为 0
node scripts/layout-gate.mjs        # 386 次扫描（320–1920 × 7 档）P0–P2 必须为 0
python3 scripts/a11y-dom.py         # 渲染级对比度，确证失败必须为 0
```

`layout-gate` 的 320 档（iPhone SE）是三处历史溢出的真凶现场 —— **别只看 375**。

## 常见错误

| 做法 | 为什么错 | 正确做法 |
| --- | --- | --- |
| 直接改 `site/index.html` | 下次构建静默丢失，`--check` FAIL | 改片段或生成器后重跑构建 |
| 改 `gen-spec.py` 后只跑 `build-site.py` | 片段没重生成 → CI 新鲜度步骤 FAIL | 先跑生成器，再构建 |
| 手改 `site/.baseline/*` 来让 parity 变绿 | 基线是"原页面"的快照，改它等于取消比对 | 改片段，让两边一致 |
| 在站点 CSS 里随手写新 hex | `color-css`/`color-html` 会拦；也绕过了 Token | 用 `var()`；确需新值则登记 `PAGE_ALIAS` 并写理由 |
| 新增 `@media (max-width:733px)` 之类 | `bp` 会拦（规范只四档 + 已登记例外） | 合并进四档，或进 `REGISTERED` 写明理由 |
| 把 `preview/*.html` 改回内容页 | 旧链接兼容会断，`redirect-legacy --check` FAIL | 保持重定向桩，内容进 `site/index.html` 的对应模块 |
| 声称"站点已支持暗色" | 13 条 `dark-missing` 仍在；探针也无法验证 | 先修探针，见 D37 |
