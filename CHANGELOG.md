## [V2.8] · 独立审计整改（P0 6 / P1 21 / P2 17）

> 依据：`docs/设计系统问题清单.md`（独立审计，44 项）。逐项证据与命令见该文档第 8 节，决策依据见 `docs/审查决策记录.md` D13。

### 阻断级（P0）
- **交付物入库**：V2.5–V2.7 全部提交；CI 新增 `delivery-integrity` job —— 未提交/未跟踪文件、`ci.yml` 引用未入库脚本、缺失站点基线，三者任一即失败。
- **首页锚点**：修 `build-site.py` 重复输出 `href="` 的缺陷，**同时**发现并修掉 76 处悬空锚点（`#gm-mod-site-spec--ch-xx` 的目标 id 实为 `site-spec--ch-xx`）；新增 `scripts/check-anchors.py` 门禁；外壳补 `preventDefault` 与失效 hash 回退（旧实现点分享链接会整页空白）。
- **应用镜像**：`gm.css` 与 `theme.css` 逐字节一致（补齐 37 个缺失选择器，GmEmpty/GmSpin/GmSkeleton/GmTag/GmSteps 不再零样式）；`mirror_sync` 不再跳过 `theme.css` 并加选择器集合比对（负向测试已验证）。
- **站点基线**：`site/.baseline/` 移出 `.gitignore` 并入库 —— "CI 依赖的输入"不能同时是"非交付内容"。

### 严重（P1）
- **无障碍对比度**：六语义色改为 AA 达标档（近白 ≥5.79:1 / 13% 淡色片 ≥4.85:1 / 18% 淡色片 ≥4.50:1），并要求组件消费 CSS 变量而非静态 hex（暗色档随之生效）。
- **`a11y-dom.py` 重写为 v2**：旧版丢弃 alpha（读数夸大 2–3 倍）、跑不完（无头 Chrome 不会自行退出）、探针写进自己的输入目录、留孤儿进程、不入 CI 无阈值。现为 22 秒跑完、保留 alpha 做 source-over 合成、渐变承载面取色标上界以**确证**失败、逐模块测量、动效钉在终态保证可重复、报告带时间戳，并以 `docs/a11y-dom-baseline.json` 设阈值门禁。
- **站点构建管线**：修 `gen-spec.py` 三个致命缺陷（`SCRIPT` 从未定义、`%` 格式化必崩、缺 `modeBtn`/`chapnav`）—— 在此之前"重新生成站点片段"根本做不到，内嵌规范快照因此长期停在 94 项/12 模块的旧版本。CI 增加"片段新鲜度"门禁。
- **双库一致性**：组件规则层全部 Token 化并与 Vue 解析值对齐（106 个共同选择器差异 0）；`GmSteps` 补 `<ol>/aria-current`、`GmRiskPicker` 补键盘可达与 44px 热区、`GmResponsiveView` 补 rAF 规避、`GmCascader` 用 `composedPath()`；React 侧补齐 `SEMANTIC_VAR`/`FIVE_VAR` 等 Token 引用能力。
- **版本治理**：新增 `VERSION` 唯一版本源 + `scripts/check-version.py`（10 个载体）；README 版本表补 V2.6/V2.7 并恢复时序；`print-manual.sh` 从版本源取名、去掉 `|| true` 与假成功。
- **计数真实化**：`coverage.py` 改为全仓唯一计数来源并计入 `@goodmom/vue`（React 16 + Vue 16 = 32；状态文案 60；示例 6 页）；README/16/18 改引用之。
- **品牌资产**：favicon 与页面品牌图改 `brand/*.svg`；`logo.png` 3.28MB → 42KB 并移入 `brand/`；消除 BR-02-02 与 BR-02-03 的条款矛盾。

### 一般（P2）
- `a11y.py` outline 检查由文件级改为**选择器级**；`coverage.py` 由"永不失败"改为基线门禁；`audit.py` 扩作用域（Vue、组件层、片段、根目录）。
- 新增门禁脚本：`check-anchors.py`、`check-md-links.py`（递归）、`check-version.py`、`check-style-parity.py`。
- 探针与截图不再写入交付目录；`redirect-legacy.py` 区分"缺失"与"内容错误"；CI 站点 job 的服务接线改为同一 `run` 块 + 就绪轮询；Node 钉到 `20.19`、缓存键指向锁文件。
- Token 规范补齐 D5/D9 与动效档；`--lg-border-hairline` 拆为宽度/颜色两个变量；五色统一为 `m1..m5`；`14.4.5` 标题错号修正。

### 已知未结项（**不静默转绿**）
- 渲染级对比度仍有 **240 项确证失败**，集中在页面档演示色与设计探索稿（`fuyouaicansai/`）；基线已钉在 240，超过即 CI 失败，逐行处置清单见 `docs/a11y-dom-report.md`「按前景色归类的成因分布」。
- WCAG 1.4.11（非文本对比度）无自动检查；首页仍为 698KB 单文件（分包未做）；无单元测试套件；无 `tokens.json` 单一源；38 个 Part 文件名未 ASCII 化；Figma 源文件不存在。

---

## [V2.7] · 站点合并为唯一首页（8 个入口页 → 单文件 + 单一主导航）
- **问题**：站点此前有 9 个 HTML 入口，其中 `site/index.html`（官网落地页）与 `preview/index.html`（视觉预览）都长得像"首页"，另有 7 个卫星页各自带 hero/导航，打开哪个都像另一个首页，信息架构失控。
- **结果**：合并为**唯一入口** `site/index.html`（827KB 单文件）+ 顶部一套主导航，切换 8 个模块：首页与总览 / 视觉规范 / 组件与状态 / 移动端 / 交互范式 / 规范全文 / 标准手册 / 文档索引。旧 7 个入口改写为**重定向页**（保留旧链接可达、锚点透传、`noindex`）；打印版 `preview/manual.html` 按用途保留为独立页。
- **构建管线**：新增 `scripts/build-site.py`——从 `site/fragments/*.html` 片段组装唯一首页，并对 6 套独立样式与 10 段脚本做**自动作用域隔离**。站点自此是"产物"而非手写页：`--extract` 抽取片段、无参构建、`--check` 供 CI 校验产物一致性。
- **必须自动化的三类冲突**（手工粘贴必然踩雷且无法回归，故做成脚本）：
  1. **CSS 类名冲突**：`.btn` `.chip` `.glass` `.block` `.tab` `.bx` `.kpi` `.cur` … 在 preview 各页间大量重名（实测交集 39/31/20 处）→ 全部改写到模块作用域 `.gm-mod--x`。
  2. **CSS 自定义属性冲突**：`--t` `--t2` `--t3` `--rose` `--mint` `--danger` `--font` `--ease` 等**同名不同值**，原样合并会互相覆盖、把前面模块颜色整体改错（不报错、只是"颜色不对"）→ 把各页 `:root/html/body/*` 规则改写到模块根，同名变量在各自模块内独立生效。
  3. **JS 选择器越界**：脚本里大量**全局** `document.querySelector('.tab'|'.chip'|'.bx'|'.sel'|'.tg')`，合并后会命中别的模块同名元素 → 按模块重写 id 与选择器，并处理 `document.body` 挂载点、页面级 `data-theme`、`html[data-theme="dark"] body` 暗色规则。
- **验证中修掉的真实缺陷**（多为"不报错、只是行为不对"的静默故障，逐条记录以免回退）：
  - **CSS 注释被当成选择器**：生成 `.mod /* 注释 */ :root{…}`，注释吞掉选择器 → 模块内自定义属性/圆角全失效（原生 `getPropertyValue` 返回空、圆角 0）。
  - **JS 改写语法错误**：替换串漏写右括号/闭引号，`querySelector('.topnav .ng')` 变成 `querySelector("#mod .topnav .ng')` → 整个模块脚本静默失效（级联无选项、虚拟列表空、暗色开关死）。
  - **HTML 拼接串被误当选择器**：`html += '<button class="cas-o">'` 被加前缀 → 拼出非法 HTML，同时 `root.querySelector(".cas-p")` 被改成在 root 内再找模块根 → 恒为 null。
  - **同一脚本内联两份**（body 内嵌 + `<!--@js-->` 区块）：事件监听绑定两遍，点击"展开又立刻收起"（级联面板、暗色开关全失灵）。
  - **`document.body` 作用域错位**：动态节点挂到外壳 body 后脱离模块作用域（picker 遮罩/底部弹层、各页 toast 消失）；整页暗色开关会把 `data-theme` 加到 `<html>`，**把整站连同外壳一起变暗** → 统一改挂模块根。
  - **辅助函数同名互相覆盖**：六个模块都叫 `MOD_ROOT()`，后声明者胜出，前置模块拿到**别的模块根**（实测 patterns 拿到 site-docs 的根）→ 改为按模块唯一 `MODROOT_<mod>()`。
  - **JS 字符串里的 id 未加前缀**：`mask.innerHTML='… id="dlgNo" …'` 这类由脚本拼出的 HTML，其 id 与 `getElementById` 前缀不一致 → 弹窗按钮点不动。
  - **页面级暗色选择器落空**：`html[data-theme="dark"] body` 合并后 body 不在模块内 → 改为 `:where([data-theme="dark"])` 命中模块根自身（零特异性，不压过原有底纹）。
- **新增守门工具**：
  - `scripts/site-parity.mjs`：**合并保真度**校验——枚举每个模块与**其原页面**的全部元素类名/id 求差集（只登记"有意移除"项：各页自建顶栏/旧页面返回链接），并对比模块根文字色与页面级暗色变量。**15/15 通过**。
  - `scripts/site-smoke.mjs`：单一首页冒烟 **41/41 通过**——模块切换独占显示、样式隔离（同名 `--text` 在 3 个模块各自解析、`:root` 已改写为模块作用域）、交互（状态谱/级联展开与取值/虚拟列表窗口化+滚动位移+撑满总高/暗色仅作用本模块不污染整站）、键盘（tablist 方向键）、旧页零残留链接、控制台零错误。
  - `scripts/redirect-legacy.py`：旧入口重定向的生成与校验（`--check` 供 CI）。
- **构建幂等性**：`--extract → 构建` 反复执行产物**逐字节一致**（已实测）。为此在抽取阶段剥离构建期注入的辅助块——否则把产物当源再抽一次，会把注入物当"原页面内容"写回片段，再次构建时二次替换，生成 `function document.documentElement{…}` 这类非法 JS，而逐脚本 `node --check` 又全部通过，只在浏览器以 `Unexpected token '.'` 暴露。
- **迁移期事故与防护（如实记录）**：`site/index.html` 既是产物又是抽取源，首次 `--extract` 在 build 覆盖之后才读它，抽到的是刚生成的产物而非原版落地页（内容静默从 32KB 缩到 8.7KB）；`preview/*.html` 为未入库文件，被重定向覆盖后无 git 可恢复。由此固化两道防护：① 抽取源与产物同路径时**从 git HEAD 取原版**；② 抽取后自动比对**可见文本保留率**，低于 90% 直接中止不落盘。预览页内容最终从既有产物中按模块回收（内容无损，各预览页浏览器零报错）。
- **CI**：新增 `site-build` job——产物一致性（`build-site.py --check`）、旧页重定向校验、合并保真度、单一首页冒烟（起静态服务后跑）。`audit.py` 的 `spec_health()` 改为在合并产物里校验 site-spec 模块（章节数 + 阅读器资产）并校验旧入口仍是重定向；`hex-case` 排除构建产物与片段（Vite 压缩会把 hex 统一成小写，属工具行为而非书写不规范）；外壳链接不再出现 `.md`；`site-spec`/`site-manual` 断点收敛到 767/1024 体系档。
- 回归：`audit.py` PASS（15 项）· `a11y.py` PASS · `coverage.py` 文档 19 / 组件 98 / 图标 77 · `check-status-map.py` PASS · 三包 typecheck 0 错误 · 站点冒烟 41/41 · 合并保真度 15/15 · 构建幂等 ✅

## [V2.6] · Vue 3 组件库（@goodmom/vue）+ 前端开发规范 skill
- **新包 `goodmom-vue`（@goodmom/vue v0.1.0）**：零基座自研 Vue 3 组件库（**无任何第三方 UI 依赖**，不引 Element Plus/Ant Design Vue）——16 个 SFC 组件 1:1 覆盖 React 版 + 新增适配：`GmButton`/`GmStatusTag`/`GmCard`/`GmAvatar`/`GmClientCard`/`GmTag`/`GmLink`/`GmProgress`/`GmEmpty`/`GmSpin`/`GmSkeleton`/`GmSteps`/`GmRiskPicker`/`GmCascader`/`GmResponsiveView`/`GmVirtualList`；props/emits/slots 全量类型（`vue-tsc` 输出 `.d.ts`），产物 `dist/index.js`(40KB) + `index.cjs`(38KB) + `style.css`(22KB) + 类型声明
- **基座切换的连带重写**：原 `GmButton`/`GmProgress`/`GmStatusTag` 依赖 Arco，Vue 版改为**自包含实现**（按钮 6 类型 × 4 状态 × 4 尺寸 × 3 形状四态谱、进度条线性+环形含 `role="progressbar"`+`aria-valuetext`、状态标签自绘淡底/描边/色点）；`theme.css` 拆分重写为 `base.css`（Token + 语义变量 + 暗色 + `prefers-reduced-motion` 兜底）与 `components.css`（组件视觉），移除全部 Arco 选择器
- **组件库能力**：`defineModel` 受控（`v-model`）统一 `GmRiskPicker`/`GmCascader`；`defineSlots` 类型化插槽（`GmResponsiveView` 的 table/condensed/card 分支、`GmVirtualList` 的 `{item,index}` 作用域插槽）；`defineExpose`（`GmVirtualList.scrollToIndex`）；`app.use(GoodMomVue)` 全量注册 + 具名导出按需引入双形态
- **无障碍契约在 Vue 版逐条保持**：`GmRiskPicker` radiogroup + roving tabindex + 方向键/Home/End；`GmCascader` 三形态（popup/inline/picker）+ `aria-haspopup`/`aria-expanded`/`role="listbox"`/`role="option"` + 列内 roving tabindex + **Escape 归还焦点**；`GmSteps` 语义 `<ol>` + `aria-current="step"`；`GmLink` 有 href → `<a>`、无 href → `<button>`（禁用态降级非交互 span + `aria-disabled`）；`GmProgress`/`GmSkeleton`/`GmSpin` 的 `role="status"`；移动端热区 ≥44
- **本地验收台 + 自动化冒烟**：`playground/`（Vite + 真机 Vue 运行时，含暗色切换、16 组件全量渲染、2000 条虚拟列表、三种级联形态）；`playground/smoke.mjs`（Playwright）**37/37 PASS**——覆盖渲染计数、六语义自动取色（待随访/高危/阳性/已建档）、未登记文案回落 neutral、D9「粉底白字」反例守卫、进度条 ARIA、RiskPicker 与 Cascader 键盘、暗色变量、ResponsiveView 容器宽度解析为 card、移动端步骤条纵向、控制台零错误
- **验证中修掉 3 个真实缺陷**：① **业务状态字典缺 `高危`**（15.2.9 明确标 🔴）→ `GmStatusTag` 静默渲染为 neutral 灰，线上表现为「高危显示成灰色」；同时补 `异常`（15.2.2 🔴）。**React 版 `@goodmom/ui` 同表同缺陷，一并修复** ② **CSS 类名冲突**：尺寸类 `.gm-btn--default` 与类型类 `.gm-btn--primary`… 同名同特异性，后写的尺寸规则**静默吃掉** `type="primary"` 的渐变底色（实测按钮变灰底）→ 尺寸类改名 `--sz-*` ③ **`GmStatusTag` 插槽文案提取失败**：Vue 3.5 把插槽子节点包进 Fragment vnode，原遍历只看 `children` 取到空串 → 语义推导全量回落灰色；改为「vnode 遍历识别 Fragment/Text + 挂载后 DOM textContent 校正」双重兜底
- **新增守门工具 `scripts/check-status-map.py`**：解析 15 章 15.2.x 全量色点清单（60 条）⇄ `goodmom-vue`/`goodmom-ui` 两张状态映射表**双向校验**（漏登记 ERROR / 语义不一致 ERROR / 自造词 WARN），并内置**已裁决例外白名单**（`已逾期`：15.2.7 行内标 🔴 但 15.5 例外条明确「任务类已逾期用琥珀」，映射表口径正确；医疗结果类须页面显式 `semantic="risk"`）；接入 CI，把「静默变灰」这类不可见缺陷变成构建失败
- **前端开发规范 skill**：新增 `.claude/skills/goodmom-frontend/`（`SKILL.md` + 5 份 reference：`components.md`/`tokens.md`/`a11y.md`/`patterns.md`/`checklist.md`）——11 条红线（R1 主行动深字、R2 禁裸 hex、R3 状态色单源、R4 新状态必须登记、R5 双通道、R6 动作/导航语义、R7 移动热区、R8 焦点可见、R9 加粗不吃布局、R10 减弱动效、R11 组件零色值）、6 步开发流程、可执行的验收命令、6 类页面组合范式与提交前 8 组可量化清单
- **工程与 CI**：根 `package.json` 增 `goodmom-vue` workspace 与 `build:vue`/`typecheck:vue`/`publish:vue`；CI 新增 `vue-pkg-build` job（构建 + 产物完整性 + 校验 `style.css` 内含品牌 Token，防止 base.css 漏打包）；Vite 版本对齐单一 8.x（消除 vite 7/8 双份安装导致的 `PluginOption` 类型不兼容）
- **环境适配（记录踩坑）**：仓库路径含中文使 `URL.pathname` 百分号编码 → Vite `root` 必须走 `fileURLToPath`（否则 `mkdir` EPERM）；验收台根组件用字符串 template，须把 `vue` alias 到 `esm-bundler` 全量构建（默认 runtime-only **静默渲染空 `#app` 且无任何报错**）；npm 默认缓存不可写 → 使用工作区本地 `.npm-cache`（已入 `.gitignore`）
- 回归：`npm run typecheck`（三包）0 错误 · `npm run build:vue` 成功 · `check-status-map.py --ci` PASS（两包各 60 条一致）· 冒烟 37/37 · 既有 `audit.py`/`a11y.py`/`coverage.py` 未受影响

## [V2.5] · 七层清单缺口补齐（Link / 边框档 / 暗黑模式 / Cascader / 响应式容器 / 虚拟长列表）
- 组件补齐：**Link 链接**独立成规范（03 · 3.10：5 类型 × 3 尺寸 × 状态谱、外链语义、移动热区 ≥44、长文常显下划线）；**Cascader 级联选择解禁**（03 · 3.5.5 PC 弹层/内联 + 10 · 10.11.3 移动多列 Picker，08.3 移出暂缓）；**响应式适配容器**（10 · 10.11.1：按容器宽度切 table/condensed/card，单分支渲染、状态不重置）；**虚拟长列表**（10 · 10.11.2：>50 项 / >200 行 / DOM 行 >300 必须窗口化，固定行高 + overscan 4、组合顺序与无障碍语义）
- Token 补齐：**边框宽度成档**（02 · 2.7.1：hairline/0.5/1/1.5/2px + 焦点环；禁 3px 以上常规描边；加粗不许吃布局）；**暗黑模式全量映射**（02 · 2.1.9「夜间暖石板」：底 `#1B1A21`、面 `#23222A`、文字 `#F3EFEC`/`#C9C4CE`/`#A6ADB9`，玻璃降白、阴影加深、语义色切浅档；`[data-theme="dark"]` 支持局部暗色）——闭环 18 · A2
- 代码落地：新增 `GmLink` / `GmCascader` / `GmResponsiveView` / `GmVirtualList`（双包逐字节一致，`index.ts` 导出 + README 同步）；`tokens/design.ts` 增 `border` / `ring` / `link` / `dark`；`theme.css` 与 `gm.css` 增语义层变量 + 暗色段 + 新组件样式（代码组件 12 → **16**）
- 示例与登记：新增 `preview/patterns.html`（六项能力可视化：链接各态、级联三形态、容器宽度实测切换、1284 条虚拟列表、暗色容器、边框档对照）；00 目录 94 → **98 项**（含 Cascader 解禁与 Transfer/TreeSelect 拆分），14.2.1 补 4 个官方名，08.2 补 8.2.18–8.2.22，11.2 补 11.2.16–11.2.18
- 工具与治理：`audit.py` 新增 `dark_contrast()`（暗色 10 项文字/语义色在最坏合成面实测 <4.5:1 即 FAIL）与 `exports_check()`（组件必须导出）；`ALLOWED` 扩入暗色档；`a11y-dom.py` 补 `--user-data-dir`（修复受限环境下探针永远拿不到结果的假通过）；`hex-case` 清理 Storybook 脚手架 5 处小写色值；决策记录新增 D11/D12
- 顺带修复：`GmCard.tsx` 既有语法错误（行尾 `//` 吃掉参数解构，导致整库 tsc 报 10 个 TS1xxx）；`goodmom-icons/src/index.ts` 含 JSX 但非 `.tsx` 扩展名（CI `open-pkg-typecheck` 必然失败）→ 重命名为 `index.tsx`；`00` 目录内因重编号失效的 5 处交叉引用
- 环境限制（如实记录）：`a11y-dom.py` 的渲染级实测在本机无法完成（无头 Chrome 创建默认 profile 失败 / 探针超时）——工具已改为**显式 ERR 且不静默通过**，`docs/a11y-dom-report.md` 保留上一次真实实测结果未覆盖写入；暗色数值口径以 D11 离线实测表 + `audit.py dark_contrast` 为准
- 工具加固：`audit.py hex-case` 跳过构建产物目录（`dist` / `storybook-static`）——否则本地 Storybook 产物里的第三方小写 hex 会造成假 FAIL（R15）
- 示例页真机验证：Playwright 打开 `preview/patterns.html` → **43/43 PASS、无 console/page 错误**（覆盖链接全态/级联三形态与键盘/容器宽度驱动形态切换/1284 条窗口化与触底回调/暗色切换与局部暗色/边框档/桌面 1400 与移动 390 无横向溢出、区块不重叠）；脚本入库 `scripts/patterns-smoke.cjs`
- 验证中修掉 2 个真实缺陷：① 级联选项点击后重渲染使被点节点脱离文档，`root.contains(target)` 误判为外部点击导致面板自动收起（改用 `composedPath` 快照判定）；② 移动端级联触发条未满宽（`.cas` 仍为 `inline-block` + 并列 `.col` 未堆叠）→ 页面与 `theme.css`/`gm.css` 同步补移动规则
- 实测发现并回填规范：DPR 1 下浏览器把 `border-width` 吸附到整设备像素，`1.5px` 档实测计算值为 `1px`（DPR 2 才呈现）→ 02 · 2.7.1 补第 7 条「强调态不得只靠加粗」
- Storybook 10.6 接入（`npm create storybook@latest`：React + Vite builder，addons docs / a11y / vitest / mcp / chromatic）：`.storybook/preview.tsx` 引入**真实根样式**（Arco 基底 → `theme.css`，顺序遵循 theme.css 头部契约），并按 02 · 2.1 的 `--lg-page-bg` 铺底（白底会同时失真玻璃层次与品牌色）；`stories/` 10 个文件 **47 个 story**（GmButton / GmRiskPicker / GmStatusTag / GmAvatar / GmTag / GmProgress / GmCard / GmClientCard / GmEmpty / GmSteps），含全项目唯一 `CssCheck`——断言主按钮计算样式 `color: rgb(52,58,70)`，即 D9「品牌粉底配深字」是否真的生效（根样式未加载时会是 Arco 默认白字）；`play` 只写在能证明非显性事实处（键盘方向键/Home/End 推进选择与 roving tabindex、语义色单源映射、`tint()` 推导、token 渐变落地）
- 顺带修复真缺陷：`theme.css` 的 `:focus-within .gm-*:focus` 是**非法 CSS 选择器**（类名内嵌通配符），被 lightningcss 拒绝并**中断任意 Vite 生产构建**（含 `frontend-app`）——Storybook 构建先撞上；改为 `[class*="gm-"]:focus`
- 环境阻塞（如实记录）：本仓库路径含中文 → `@storybook/addon-vitest` 把 setup-file 以**绝对路径**交给浏览器加载，百分号编码后浏览器取不到，全部 stories 报 `No test suite found`。实证：仓库原位 13 文件全失败；**同一份代码（含 node_modules 真实拷贝）置于纯 ASCII 路径**后 `npx vitest --project storybook run` → **10 文件 / 47 项全通过**（`ln -s` 无效——vitest 会 realpath 回中文路径，须真实拷贝或直接用 ASCII 路径的检出）。原因已写入 `vitest.config.ts` 注释；`playwright` 固定 `1.62.0` 以复用本机已装 chromium-1234，免去 200MB 浏览器下载
- 回归：`audit.py` PASS（15 项）· `a11y.py` PASS · `coverage.py` 文档 19 / 组件 98 / 代码 16 / 图标 77 · `npm run typecheck` 双包 0 错误 · `npm run build` 双包成功

## [V2.4] · A–H 审查整改（八维审计 Round 1–8）
- 可访问性：GmRiskPicker 键盘/读屏可达（radiogroup + 方向键 + focus-visible）；gmIcon title 语义化；07.9 ARIA/读屏通则；scripts/a11y.py 静态走查并入 CI
- 治理与工具：audit.py 增 color-banned 旧色回归与 bp 断点收敛检查；scripts/coverage.py 覆盖度量（规范 94 / 代码 12 / 图标 77）入库并接 CI；spec 刷新管线落库（gen-spec + refresh-spec 保阅读器）
- 书写规范：hex 色值全仓统一大写（568 处 / 34 文件，14.1.1 新增「色值（hex）字母一律大写」条款）；audit.py 增 hex-case 守门检查并入 CI（含生成物排除与报告自引用回路防护）
- 品牌统一（D9）：主行动 token `--mmh-grad-action-hc` 定为**品牌粉上半段** `--mmh-grad-action-hc: #FFC4D6→#F77FA3`（Rose-300→Rose-500）+ 文字 `#343A46`——按钮底色即品牌主色，文字区实测 4.89–7.67:1（全尺寸过 AA，余量优于 D8 的 4.53–5.71）；全系统以该 token 为底的控件文字由白转深（71 处 + Arco 默认白字显式覆盖 3 处 + redesign `--g` 7 处 + 手册顶栏）；白字在 `#F77FA3` 上仅 2.46:1，故「品牌亮粉底 + 白字」被明令禁止；含 #E85D8F 深端的 `--mmh-grad-primary` 仍仅作装饰
- 品牌统一（D8，取值已由 D9 取代）：主行动 token 曾由 `#B23A63→#9E3054` 上移为同族加深档 `#C44C74→#B23A63`；本轮同时消除多套并存配方——修正 frontend-app/gm.css 仍用亮粉底+白字（2.46:1，AA 违规）、统一 8 处页面重复声明与 fallback、redesign `--g`、gen-manual/site-manual 顶栏按钮、10 处被 `!important` 压住的基础规则
- 按钮漏项补修（D8）：补齐 D6 未覆盖的 4 个主行动/选中态——preview/mobile `.cta`（移动端主 CTA，实测白字仅 **1.43:1**）、`.tab.on`（2.46:1）、`.seg2 .s2.on`、preview/index `.demo-card.c3 .gbtn`；并清理 `.cta/.tab.on/.s2.on/.chip.on/.switch.on/.gbtn` 遗留旧紫辉光 `rgba(154,120,255,…)` 与 `.btn-ghost:hover` 紫洗色，统一为品牌玫辉光
- 工具修复：`scripts/a11y-dom.py` 探针失败时不再静默输出空表（原会把"未实测"误呈现为"全部通过"），改为显式 ERR 行 + exit 1
- 组件一致化（D10）：应用侧包 `frontend-app/packages/gm-arco-ui` 与设计系统源 `goodmom-ui` 完成镜像——17 个源文件逐字节一致；修掉漏迁的 4 处缺陷（`GmRiskPicker` 仍为 `<span onClick>` 键盘不可达、`GmStatusTag` 缺色点违背 14.4 双通道、`GmAvatar`/`GmProgress` 硬编码色绕过 token、`tokens/design.ts` 圆角与 02·2.4 不符且缺三个渐变）；补齐 `GmEmpty`/`GmSpin`/`GmSkeleton` + 2 adapters + `i18n.ts` 与公开导出
- 工具盲区收口（D10）：`scripts/a11y.py` 扫描范围由 `goodmom-ui/**` 扩至含 `frontend-app/**`（此前应用侧 a11y 违规永不被 CI 发现）；`scripts/audit.py` 新增 `mirror_sync()` 守门，双包任一文件漂移即 FAIL 并指名文件
- 语义与品牌：六语义色以 alias 深色为唯一源（14.4.5 / 02.1.5 / theme --lg-sem-*）；对比度 WCAG 真口径 + 高对比主行动 --mmh-grad-action-hc / .gm-btn-hc；Logo v2 定案；禁 emoji 示例修正；触控基线统一
- 组件：GmEmpty / GmSpin / GmSkeleton 新增；RiskPicker 五色主题变量化；按钮玻璃态四态；圆角对齐 02.4
- 页面与文档：断点收敛 767/1024/1366 体系；10.2 平板档；计数 56→77；README 封装子集口径；决策记录 docs/审查决策记录.md

## [V2.3] · 网站整合与收尾
- 主站 site 整合：用户旅程 / 网站目录 / 统一多列页脚；导航 GitHub 开源入口
- 示例中心扩至 7 套页面（+PC 妇幼工作站 +孕妇档案详情页）
- Logo（logo.png / brand SVGs）全局接入；主站图标点缀与空间感优化
- 文档与统计全仓同步（README/16/站点/手册）；清理 .DS_Store 与历史空格问题

# Changelog · 妈咪好 GoodMom 设计系统

## [V2.2] · 包装与文档交付
- 首页专业版：分组菜单（概览/样式/组件/状态/可视化图标）、交付总览速览条、三步使用指南
- 新增打印版《设计系统总览手册》（preview/manual.html，浏览器另存 PDF）
- README：交付统计、体系架构、角色→文档矩阵、工程目录
- 仓库化：.gitignore / LICENSE(MIT) / CHANGELOG 初始化

## [V2.1] · 全系统优化
- 名称/版本/域示例清扫（04/05/08/09/10）
- 示例中心 5 页（列表/详情/表单向导/移动/iPad）＋首页入口卡
- 状态样式库 v2（模块页签/语义筛选/复制）、孕产妇五色分级
- 图标 77/10 类（成长阶段 L、儿童健康 H 五健+口腔+医护镜）
- 前端封装骨架 frontend-app/packages/gm-arco-ui

## [V2.0] · 品牌化
- 命名「妈咪好 GoodMom」；蜜桃粉主色 + 淡紫柔光
- 品牌 Token（02.9/12）、妇幼领域组件（13）、母婴图标（09 B）
- 双端预览换肤；iPad 中端分层（10.1.1）

## [V1.0] · 首版（液态玻璃引擎）
- DNA/Token/组件/数据可视化/Prompt 库/流程验收/预览页
