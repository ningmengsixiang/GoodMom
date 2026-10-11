# 验收门禁与命令矩阵

> 所有脚本都假定**在仓库根**执行（脚本内部 `os.chdir(ROOT)`）。
> 例外：`frontend-app` 相关命令要在 `frontend-app/` 下跑（CI 用 `working-directory`）。
>
> `<!-- facts: docs=21; icons=77; gates=29; negcases=81 -->`
> 上一行是**机器可读基线**：`audit.py report-facts` 会拿实测值逐项比对。
> 本表里的条数（`audit.py` 29 条 / 负向测试 81 条）此前写成 28 / 75，与实际脱节却无人发现。

## 门禁一览

| 脚本 | 作用 | 命令 | 阈值 | CI |
| --- | --- | --- | --- | --- |
| `check-module-boundary.py` | **架构门禁 B1–B10**：模块边界 / 分层方向 / 状态词登记 / 裸 hex / 内联玻璃配方 / CSS 变量可解析 | `python3 scripts/check-module-boundary.py`（`--only B6` 单跑一条） | `problems` 为空 | ✅ `architecture-gate` |
| `audit.py` | 全自动规范审计 **29 条**：链接 / 章节连续 / 图标 / 色彩 / hex 大小写 / 双包镜像 / 暗色对比度 / 导出 / CSS 语法 / 反馈族 / 生长曲线族 / `undefined-token` / `tint-base` / `bg-origin` / `btn-radius` / `report-facts`（报告数字对账）… | `python3 scripts/audit.py`（`--only <名>`、`--strict`） | 任一硬 FAIL → 退出 1 | ✅ `docs-links` |
| `check-status-map.py` | 15 章 ⇄ 两库状态映射表一致 + 六语义色四来源同号 | `python3 scripts/check-status-map.py --ci` | ERROR = 0 | ✅ |
| `check-style-parity.py` | 双库**同名选择器解析值**一致（仅浅色档声明值） | `python3 scripts/check-style-parity.py --ci` | `problems` = 0 | ✅ |
| `check-component-contract.py` | 双库 props / 默认值 / 契约类名 | `python3 scripts/check-component-contract.py --ci` | **未登记**差异 = 0（已登记 8 个） | ✅ `architecture-gate` |
| `check-md-links.py` | Markdown 内链（递归全仓含 `docs/**`） | `python3 scripts/check-md-links.py` | 失效链接 = 0 | ✅ |
| `check-version.py` | 版本一致性（唯一源 `VERSION`，**10 个载体**） | `python3 scripts/check-version.py --ci` | 不一致 = 0 | ✅ |
| `check-anchors.py` | 站点锚点完整性（畸形 href / 悬空锚点） | `python3 scripts/check-anchors.py` | `fail = 0` | ✅ |
| `coverage.py` | 组件/图标/状态/文档计数 | `python3 scripts/coverage.py --ci` | 与 `docs/coverage.json` 比，**回退即失败** | ✅ |
| `a11y.py` | 静态无障碍：焦点环压制无兜底（**选择器级**）+ 非交互元素挂点击 | `python3 scripts/a11y.py --ci` | FAIL = 0 | ✅ |
| `a11y-dom.py` | **渲染级**逐文本节点对比度（无头 Chrome，保留 alpha 做 source-over） | `python3 scripts/a11y-dom.py`（`--update-baseline`、`--json`） | ≤ 基线 `failN`（当前 0） | ✅ `a11y-dom` |
| `page-qa.mjs` | 逐页渲染级质检 **33 条规则**：对比度 / 焦点可见 / 热区 / 溢出 / Token 档位 / 图标与 emoji / 术语 / 版本 / 控制台 | `node scripts/page-qa.mjs --ci`（`--page`、`--json`、`--shots`） | **P0/P1/P2 = 0**（P3 不阻塞） | ✅ `site-build` |
| `layout-gate.mjs` | 布局体检（**71 页 × 7 档 = 386 次扫描**）：P0 横向溢出 / 背景白条；P1 出框 / 重叠 / 塌陷；P2 文字被切 | `node scripts/layout-gate.mjs`（`SITE_BASE` 复用已有服务） | **P0–P2 = 0** | ✅ |
| `app-smoke.mjs` | `frontend-app` 三端形态 + 四态（靠 `window.__GM_MOCK`） | 起 dev server（3081）后 `node scripts/app-smoke.mjs` | 断言全绿 | ✅ `app-smoke` |
| `site-smoke.mjs` / `mobile-smoke.mjs` / `products-smoke.mjs` / `product-apps-smoke.mjs` | 站点首页 / 移动端模块 / 产品矩阵 / 6 个独立产品页 | 起静态服务（5288）后分别跑 | 断言全绿 | ✅ |
| `site-parity.mjs` | 合并保真度（对齐 `site/.baseline/`，8 个已入库页面） | 同上 | 只允许 `INTENTIONAL` 差集 | ✅ |
| `patterns-smoke.cjs` | 示例页渲染回归（`file://` 直开） | `node scripts/patterns-smoke.cjs` | 42 条断言 | ❌ 不在 CI |
| `gate-negative-tests.py` | 门禁负向测试 **81 条**（覆盖 audit 的 14 条门禁 + 独立脚本 `@contract` / `@parity`）：给每条门禁**注入真实缺陷**，断言它必须 FAIL 且报出预期关键词 | `python3 scripts/gate-negative-tests.py`（`<词>` 只跑匹配用例） | 任一注入后仍 PASS 即失败 | ❌ 不在 CI（会**临时改写仓库文件**并按字节还原；本地跑前请保证工作区干净） |
| `goodmom-ui/playground/smoke.mjs` | React 组件契约渲染级冒烟（实测 **61/61**，含**无孤儿类名**检查） | `node goodmom-ui/playground/smoke.mjs` | 全绿 | ✅ `component-contract` |
| `goodmom-vue/playground/smoke.mjs` | Vue 组件契约渲染级冒烟（实测 **40/40**，含**无孤儿类名**检查） | 起 vite（5273）后 `node goodmom-vue/playground/smoke.mjs` | 全绿 | ✅ |

> ⚠️ 本地起 vite 用 `node node_modules/vite/bin/vite.js`（`npx vite` 在本机静默退出、不报错）；CI 里 `npx vite` 正常。

> ⚠️ `gate-negative-tests.py` 会**临时改写仓库文件**（随后还原）—— 运行前保证工作区干净。

### 两处「带理由的登记表」（新增值之前先登记）

| 登记表 | 在哪 | 管什么 |
| --- | --- | --- |
| `ALLOWED` / `PAGE_ALIAS` | `scripts/audit.py` | 站点样式里允许出现的 hex（严格层 vs 页面档）。新颜色不进表 → `color-css`/`color-html` 直接拦 |
| `REGISTERED`（断点） | `scripts/audit.py` 的 `breakpoint_reg()` | 规范四档之外的**已裁决**宽度（900/1200/560/520/480/420），每条写明它解决什么；登记外的新宽度照旧 WARN |
| `IDIOM` / `BASE_EQUIVALENT` | `check-component-contract.py` / 两库 `playground/smoke.mjs` | 宿主惯用写法映射 / 与基态等价的档位类 —— 都必须写明理由 |

> **V2.9 起 `audit.py` 通篇 OK、零 WARN 零 FAIL**。这份干净是刻意的：新漂移立刻可见，
> 别用"它本来就有 WARN"当借口往里面加新的。

## B1–B10（实际 10 条，文档常写 B1–B9）

| 规则 | 检查什么 | 违反后果 |
| --- | --- | --- |
| B1 | 跨模块只走 `@/modules/<name>` 公共出口 | 深链让模块重构变成全仓改 |
| B2 | 跨模块依赖必须在模块 README「依赖」行声明 | 边界图永远过期 |
| B3 | 分层方向单向（app → modules → shared） | 循环引用 |
| B4 | `dev/` 只允许被 `app/` 装配 | 开发期页面进生产链路 |
| B5 | 模块具备 index / model / README 且四行齐全 | 边界只在某人脑子里 |
| B6 | `model.ts` 状态词必须在 15 章登记 | **静默回落灰色** |
| B7 | 业务代码**禁裸 hex** | 暗色档失效 |
| B8 | 业务代码**禁内联玻璃配方**（`linear-gradient(` / `box-shadow:` / 用 `rgba()` 当底色） | 同一张卡十种写法 |
| B9 | `var()` 引用的变量**要么有定义、要么带兜底值** | **整条声明被静默丢弃** |
| B10 | `var(--lg-x, #HEX)` 的兜底值必须等于 `theme.css` 真源 | 兜底值与真值分叉，换肤后错色 |

> 「`var(变量, 兜底值)` 里的兜底值不算违规」—— B7/B8 的例外。

## 按改动类型跑什么

### 改 Token（颜色 / 圆角 / 间距 / 阴影 / 模糊 / 动效时长）

```bash
# 0. 改文件（手工）
#    goodmom-ui/src/theme.css          ← Token 唯一数值源
#    02-Token规范.md                    ← 同步文档表格
#    goodmom-vue/src/styles/base.css    ← Vue 侧 Token 层
# 1. 同步应用侧镜像（镜像目录禁手改，只能从真源复制）
cp goodmom-ui/src/theme.css   frontend-app/packages/gm-arco-ui/src/gm.css
cp goodmom-ui/src/tokens/*.ts frontend-app/packages/gm-arco-ui/src/tokens/
# 2. 必跑
python3 scripts/audit.py
python3 scripts/check-style-parity.py --ci
python3 scripts/check-status-map.py --ci
# 3. 渲染级复测
python3 scripts/a11y-dom.py
# 4. 组件库与产物
npm run typecheck && npm run build && npm run build:vue
node goodmom-ui/playground/smoke.mjs
# 5. 应用侧
cd frontend-app && npx tsc --noEmit -p tsconfig.json && npm run build
```

### 改组件（`Gm*` 封装 / 两个库）

```bash
# 0. 改 goodmom-ui/src/**；若要同步 Vue，再改 goodmom-vue/src/**
#    再镜像到应用侧（见上）
npm run typecheck && npm run build && npm run build:vue
python3 scripts/check-component-contract.py     # 未登记差异必须为 0
python3 scripts/check-style-parity.py --ci
python3 scripts/audit.py --only mirror
node goodmom-ui/playground/smoke.mjs
cd goodmom-vue && npx vite --config playground/vite.config.ts &   # 另开终端，端口 5273
node goodmom-vue/playground/smoke.mjs
cd ../frontend-app && npx tsc --noEmit -p tsconfig.json && npm run build
```

### 改页面

```bash
cd frontend-app && npx tsc --noEmit -p tsconfig.json && npm run build
cd .. && python3 scripts/check-module-boundary.py            # B1–B10
npx vite --port 3081 --strictPort &                          # 另开终端
node scripts/app-smoke.mjs
python3 scripts/a11y.py --ci
```

### 改文档 / 改计数 / 改版本

```bash
python3 scripts/check-md-links.py
python3 scripts/audit.py
python3 scripts/coverage.py --ci
python3 scripts/check-version.py --ci
# 若动了站点快照（spec / manual / products / product-apps）：
python3 scripts/gen-spec.py && python3 scripts/gen-manual.py
python3 scripts/gen-products.py && python3 scripts/gen-product-apps.py
python3 scripts/build-site.py --check
python3 scripts/check-anchors.py
```

`check-version.py` 的 **10 个载体**（改版本要一起改）：
`VERSION` · 根 `package.json` · `CHANGELOG.md` 顶部 · `README.md` 徽章 · `README.md` 交付统计 · `16-优化与一致性审计.md` 产品品牌行 · `docs/标准手册/README.md` · `docs/妈咪好UIUX设计系统标准手册.md` · `docs/标准手册/Part 38 · 设计系统资产库.md` · `preview/manual.html` 页头与页脚。
（历史文件 `CHANGELOG.md` / `docs/审查决策记录.md` / `12-妈咪好品牌及设计语言` 不计入。）

## 站点侧完整回归（改站点/产品页时）

```bash
python3 -m http.server 5288 --bind 127.0.0.1 &
export SITE_URL=http://127.0.0.1:5288/site/index.html
node scripts/site-parity.mjs && node scripts/site-smoke.mjs && node scripts/mobile-smoke.mjs
node scripts/products-smoke.mjs && node scripts/product-apps-smoke.mjs
node scripts/page-qa.mjs --ci
node scripts/layout-gate.mjs
```

> 起服务 / 跑脚本 / 关服务**必须在同一个 shell 块**内（否则后台进程被清理，报错变成 `ERR_CONNECTION_REFUSED`，与真实原因无关）。

## CI 的 10 个 job

`delivery-integrity`（工作树干净 + 引用脚本已入库 + 基线存在）· `docs-links` · `a11y-dom` · `gm-ui-typecheck` · `component-contract` · `app-smoke` · `architecture-gate` · `open-pkg-typecheck` · `site-build` · `vue-pkg-build`

## 失败怎么定位

| 症状 | 先看 |
| --- | --- |
| 样式「没生效」/ 0 内边距 / 0 圆角 | `audit.py --only undefined-token` + `check-module-boundary.py` B9 —— 大概率是**幽灵 Token**（`goodmom-tokens/reference/ghost.md`） |
| 状态显示成灰色 | `check-status-map.py` + `check-module-boundary.py --only B6` —— 文案未登记 |
| 暗色档看不清 | `audit.py --only dark` + `page-qa` 的 `contrast` |
| 页面出现横向滚动条 / 底部白条 | `layout-gate.mjs`（P0） |
| 两库外观不一致 | `check-style-parity.py` + `check-component-contract.py` |
| 改了 Token 完全没效果 | 忘了同步应用镜像（`gm.css`）或用了硬编码 hex |
| CI 说工作树不干净 | 重跑生成器（`gen-*.py`）并把产物一起提交 |
