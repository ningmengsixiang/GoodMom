# 妈咪好 GoodMom · UIUX 设计系统标准手册

> **定位**：妈咪好 UIUX 设计系统（妇幼儿童全生命周期）的「38 部分总纲 + 标准速查 + 资产导航」。
> 本手册不替代分篇规范（详见每部分「来源」），而是把散落规范、代码封装、治理工具按统一标准组织成可评审、可交付、可落地的手册。
> 版本：V1.0（随主系统 V2.4）· 维护：docs/审查决策记录.md + CHANGELOG.md 同步 · 更新方式见 Part 31。

---

## Part 00 · 手册总览与映射

| Part | 章节 | 主要来源（`../NN-*.md` 即根目录编号规范） | 落地物 / 工具 | 状态 |
| --- | --- | --- | --- | --- |
| 01 | 设计系统总则 | 01、README | site/spec.html | ✅ 覆盖 |
| 02 | 品牌视觉系统 | 12、brand/、logo.png | logo-mark.svg、logo.svg、logo-tile.svg | ✅ 覆盖 |
| 03 | Design Token | 02、tokens/* | theme.css、tokens/{design,business,status}.ts | ✅ 覆盖 |
| 04 | 色彩系统 | 02.1、12.3、14.4.5、D1/D5/D7 | `--lg-sem-*`、`--mmh-m5-*`、`--mmh-solid-*` | ✅ 覆盖 |
| 05 | Typography | 02.2、07 | 字体栈 token、tabular-nums | ✅ 覆盖 |
| 06 | Grid & Layout | 17、10 | 12 列/8:4/单列栅格 | ✅ 覆盖 |
| 07 | Spacing | 02.3 | 4px 基准刻度 | ✅ 覆盖 |
| 08 | Iconography | 09、goodmom-icons | lg-icons.svg(77)、registry.ts、build-icons.py | ✅ 覆盖 |
| 09 | Illustration | 12.4、13 | 插画基调条目 | ➕ 增量 |
| 10 | Motion | 07、7.2/7.3/7.9 | 动效 token、reduced-motion | ✅ 覆盖 |
| 11 | 100+ 基础组件规范 | 00(94)、03、08、10/11、13 | goodmom-ui 12 模块 | ✅ 覆盖（封装子集） |
| 12 | 组件状态规范 | 15、07.8、08、18.2.5 | 六语义/五色/GmStatusTag 等 | ✅ 覆盖 |
| 13 | UX 交互规范 | 07、17.3、13 | 组合顺序、反馈节奏 | ✅ 覆盖 |
| 14 | 表单规范 | 03.5、10.6、11 | 玻璃输入/选择/校验 | ✅ 覆盖 |
| 15 | 数据表格规范 | 03.7、10.5.3 | 表格→卡片列表降级 | ✅ 覆盖 |
| 16 | Dashboard 规范 | 04、17、10 | 图表/大屏纪律 | ✅ 覆盖 |
| 17 | 导航规范 | 03.4、10.3 | 侧栏/顶栏/TabBar、断点规则 | ✅ 覆盖 |
| 18 | 弹窗/反馈规范 | 03.9、07.3.7、08.2 | Modal/Drawer/Toast | ✅ 覆盖 |
| 19 | Empty/Error/Loading 规范 | 08.2.12/13/15、GmEmpty/GmSpin/GmSkeleton | theme 样式 | ✅ 覆盖 |
| 20 | PC 端规范 | 03、17 | 桌面栅格与密度 | ✅ 覆盖 |
| 21 | iPad 端规范 | 10.1.1、10.2.1 | 768–1023 平板档 | ✅ 覆盖 |
| 22 | Mobile 端规范 | 10、11 | 移动组件全量 | ✅ 覆盖 |
| 23 | Accessibility 规范 | 07.8/7.9、18、D1–D7 | a11y.py、a11y-dom.py | ✅ 覆盖 |
| 24 | 行业设计系统 | 13、15、02.10 | 妇幼医疗领域组件与词库 | ✅ 覆盖 |
| 25 | Figma 组件库标准 | 03/10/11 + 本章 | — | ➕ 新增 |
| 26 | Design Token 代码标准 | 02、tokens、theme.css | audit.py 色彩校验 | ✅ 覆盖 |
| 27 | Design-to-Code 标准 | 16、17、18、D4 | coverage.py、audit | ✅ 覆盖 |
| 28 | AI UI 生成标准 | 05 | AI 生成 Prompt 库 | ✅ 覆盖 |
| 29 | Design QA 标准 | 06、18、scripts | audit/coverage/a11y 套件 | ✅ 覆盖 |
| 30 | Design Governance | 00、14、16、docs/审查决策记录.md | 登记制度、决策记录 | ✅ 覆盖 |
| 31 | 版本管理 | CHANGELOG.md、README | V2.x 记录、决策记录 | ✅ 覆盖 |
| 32 | 项目落地 SOP | 06、17 | 制作流程与验收 | ✅ 覆盖 |
| 33 | 设计师工作规范 | 01/06/09/14 + 本章 | — | ➕ 新增 |
| 34 | 产品经理使用规范 | 15、00、README + 本章 | — | ➕ 新增 |
| 35 | 前端工程师使用规范 | 03、08、goodmom-ui README + 本章 | 组件库/工具链 | ✅ 覆盖 |
| 36 | AI Agent 使用规范 | 05、CONTRIBUTING + 本章 | AI 生成/审查流程 | ➕ 增量 |
| 37 | 项目交付验收规范 | 06、18、scripts | 全量回归套件 | ✅ 覆盖 |
| 38 | 设计系统资产库 | docs/coverage-report.md 等 | 资产清单与同步命令 | ✅ 覆盖 |

> 状态口径：✅ 覆盖＝有对应分篇/工具可直接引用；➕＝本手册补充增量条目。

---

## Part 01 · 设计系统总则
- **使命**：妇幼儿童全生命周期（备孕—孕期—产后—儿童 0–6 岁）业务一致体验；医疗克制 + 温暖可信（来源 `../01-设计总览与设计DNA.md`）。
- **四大 DNA**：液态玻璃材质、蜜桃粉品牌 + 淡紫柔光、圆形家族、呼吸感留白。
- **双源纪律**：规范文档为设计源，`theme.css/tokens/*` 为代码源，任一改动必须双侧同步并更新 spec（`scripts/refresh-spec.py`）。
- **新增登记制**：任何新组件/命名/术语须先查 00 目录与 14 术语表登记，禁止“先造后补”。
- 审查闭环：每轮改动以 `scripts/audit.py` 全量回归（见 Part 37）。

## Part 02 · 品牌视觉系统
- 品牌名唯一写法：**妈咪好 GoodMom**（禁止 Good Mom / Goodmom 异拼）。
- Logo：正式 v2 = `brand/logo-mark.svg`（孕妈剪影 + 爱心 + GOODMOM），全局图标位使用 `../logo.png`；v1 几何版退役（见 `../12-妈咪好品牌与设计语言.md` 12.8 与决策记录 D-series）。
- 品牌色：蜜桃粉主 + 淡紫柔光；亮渐变 `--mmh-grad-primary` 用于装饰，**文字承载行动走 `--mmh-grad-action-hc`**（AA，D5/D6）。
- 界面禁 emoji：图标一律 `lg-icon-*`；文风安心鼓励、不说教、专业不恐慌（12.5）。

## Part 03 · Design Token
- 三层：primitive（基础色板/字号/圆角刻度）→ alias（语义/文本）→ component（组件配方）。
- 分层纪律：色值六进制只允许出现在 token 层与受控工具文件；组件内禁用魔法色（本轮已收敛 GmProgress/GmAvatar，`goodmom-ui/src/tokens/design.ts`）。
- 语义 alias 深色为状态文字/色点唯一源：`--lg-sem-positive #2f8f76 / info #4a76d0 / attention #b9771c / risk #d35466 / neutral #757e8e / special #7a5ce0`（决策 D1）。
- 白字实底档 `--mmh-solid-*`：positive #1e6b52 / attention #9a5a0e / danger #b04052 / info #385cb3 / special #6242b8（D5）。
- 代码层新增必须过 `audit.py` 的 ALLOWED 严格校验；页面新增色过 ALLOWED/PAGE_ALIAS（D4）。

## Part 04 · 色彩系统
- 语义色：六语义（Part 03）+ 孕产妇五色（绿/黄/橙/红/紫 `--mmh-m5-m1..m5`，仅用于妊娠风险语境）。
- 文本三档 AA 实测口径（WCAG 2.2）：主 `#343A46`（≥7:1）、次级 `#4F5B6E`（白 6.88/暖 4.98）、三级 `#9AA2B0` 只用于 ≥24px/≥18.66px 粗体大号（D7/D7b）。
- 背景暖底 alias 收口为 PAGE_ALIAS 审计档（site/spec/preview 样式），代码层不受污染。
- 对比度底线：正文 ≥4.5:1；大字 ≥3:1；色不单独传义（配文字/图标）。

## Part 05 · Typography
- 字体栈：`Inter / PingFang SC / MiSans / Noto Sans SC`；数字一律 `tabular-nums`。
- 医疗数值口径严谨：剂量/区间用专业单位；说明文案大白话。
- 白字仅允许在 ≥4.5:1 深档或大字号展示场景；不做“≥13px/600 即合规”式豁免。

## Part 06 · Grid & Layout
- 三端栅格：PC 12 列；iPad 8:4（左列表右详情）；Mobile 单列（`../17-页面布局与组件组合规范.md` 17.1）。
- 页面壳/组合顺序（17.3）：头像 → 标签/状态 → 数值 → 操作；留白 48–72 呼吸带。
- 断点收敛：≤767 / 768–1023（平板） / ≥1024 / ≥1366（大屏增强）；页面偏离会触发 audit `bp` 检查。

## Part 07 · Spacing
- 4px 基准网格；语义间距走 `../02-Token规范.md` 2.3（页面留白/卡间隙/卡内边距分端）。
- 组合内 gap 与 pad 只能取刻度值；禁止零散魔法间距。

## Part 08 · Iconography
- 自绘线性 24×24 / 1.7px 圆头 / `lg-icon-{语义kebab}`，共 77 枚，sprite=registry=文档三方同步（`scripts/build-icons.py` 再生成）。
- 装饰位 `aria-hidden`；传义图标 `role="img"`+`aria-label`（`gmIcon(name,size,title?)`）。
- 新增图标先走 09.6 流程再提交；页面不混第三方图标。

## Part 09 · Illustration
- 风格：柔和圆角扁平/2.5D；暖杏粉底；人物=孕妈/宝宝/医护；禁止惊悚医学细节、卡通贴纸感。
- 头像：圆玻璃 + 实照（实名）或柔和插画（社区）。
- 增量补充：插画作为「品牌资产」入库并命名 `ill-{语义}`，与图标一样受 09 流程管理；插图不得承载诊断级医学信息。

## Part 10 · Motion
- 时长 Token：fast 120ms / base 220ms / slow 400ms / entrance 800ms / draw 1000ms / breathe 2.4s / float 8s；曲线默认 ease-out `cubic-bezier(.22,1,.36,1)`（07 · 7.2）。
- 配方：按钮 sheen/按压/loading、卡片浮起、开关 spring、分段滑块、弹层、数字滚动、描线、骨架、呼吸点（规范 07 · 7.3 + 动效库）。
- 性能红线：只动 transform/opacity；全屏 backdrop-blur ≤6 节点；`prefers-reduced-motion` 全局降级；动效不承载唯一信息。

## Part 11 · 100+ 基础组件规范
- 规范定义 94 项（00 总目录全量），代码封装 12 模块（`goodmom-ui`，含 GmEmpty/GmSpin/GmSkeleton/GmSteps…），明细见 docs/coverage-report.md。
- 覆盖矩阵与 Semi 对齐见 `../08-组件覆盖清单与Semi对齐.md`；自包含轻量适配（无 Arco 依赖）见 GmTag/GmSteps 头部注释。
- 未封装组件先用 Arco 原生 + `gm-*` 主题类实现，并回填 00 与 coverage。

## Part 12 · 组件状态规范
- 六语义 × 90+ 业务状态词条（15 章）；五色仅风险语境（02.10）。
- 状态完整性要求：hover/focus/disabled/loading/error/empty 全状态（07.8 覆盖矩阵逐组件打勾）。
- 双通道：色点+文字/图标（GmStatusTag/GmTag 共享 SEMANTIC_COLOR 单一映射）。

## Part 13 · UX 交互规范
- 反馈节奏：每次交互 ≤250ms 有反馈；等待操作立即 loading；错误三通道（色+文案+图标）。
- hover 与 press 二选一呈现（`@media(hover:none)` 切 press），不双依赖。
- 弹层焦点管理：打开聚焦首元素，关闭归还触发点（07.9）。

## Part 14 · 表单规范
- 玻璃输入形态：圆角 20、focus 4px 紫 ring、错误抖动一次（240ms，03.5）。
- 移动端：高 44、字号 ≥16 防聚焦缩放、Select 用底部弹层（10.6）。
- 触控基线：触屏 ≥44×44、关键按钮 ≥48；桌面鼠标允许 40（本轮已统一）。

## Part 15 · 数据表格规范
- PC 玻璃表格 3.7；移动端降级卡片列表或横滑窄表（10.5.3）。
- 行 hover 淡白底、操作列按钮内联对齐（17.2 覆写）；不做贴地行分页（移动用加载更多）。

## Part 16 · Dashboard 规范
- 可视化语言见 `../04-数据可视化规范.md`；数据色序品牌默认 12.3.3。
- 图表动效：描线/柱状成长/draw 1000ms；大屏用 canvas/SVG，禁逐帧 blur。
- 大屏层级 ≤3、信息密度克制、状态灯条成组（03.6）。

## Part 17 · 导航规范
- PC：左侧玻璃侧栏（3.4.1，收起态仅图标）或顶栏（3.4.2）；移动：TabBar+NavBar（侧栏禁用）。
- 选中态 = 渐变芯片（非左边框粗条）；未读数徽标白底紫字；悬停下拉需桥接带（站点实现）。
- 断点：≥1281 可用侧栏，≤1280 回顶栏页签（fuyouaicansai 参考实现）。

## Part 18 · 弹窗/反馈规范
- Modal：遮罩 250ms 淡入 + 面板 320ms ease-out（.98→1）；按 ESC/遮罩/×关闭，同类仅存一条 Toast（320ms 滑入→驻留 2.4s→240ms 上滑）。
- Drawer：右侧 320ms 滑入，承载次级任务（随访录入等）。
- 打开弹层时 body 不滚动、焦点归还；确认类操作统一 `busyFor` 忙碌态（600–950ms）再给结果。

## Part 19 · Empty/Error/Loading 规范
- Empty：图标 48–52 + 标题 + 说明（08.2.12）；Error：三通道 + 可重试动作；Loading：按钮圈 0.9s/圈（不换内容）、骨架 1.15s shimmer、Spin `role=status`。
- 代码组件：GmEmpty / GmSpin / GmSkeleton（goodmom-ui，theme.css 样式齐全）。

## Part 20 · PC 端规范
- ≥1024 栅格 12 列；触控不豁免 44（触屏一体机按 Part 14）；侧栏/顶栏/面包屑齐全。
- 密度：正文 14–15px、数字强调 26–40；卡片圆角 22、按钮 22/26（02.4 已对齐）。

## Part 21 · iPad 端规范
- 768–1023 = 医护平板档（10.1.1）：8:4 分栏或自适应卡片流；竖屏回落手机单列。
- 保留键盘/触控笔场景 focus ring；`env(safe-area-inset-*)` 处理刘海。
- 断点变量示例见 10.2.1（`--lg-m-gutter-page` 等）。

## Part 22 · Mobile 端规范
- 全量组件/表单/反馈移动形态见 `../10-移动端组件规范.md` + `../11-移动端组件全量库.md`。
- 热区 44/48、字号 ≥16、底部 TabBar 之上放反馈、Select/Picker 底部弹层、表格→卡片列表。
- 移动预览：preview/mobile.html（复刻实机边框样式）。

## Part 23 · Accessibility 规范
- 对比度：正文/控件 ≥4.5:1，大字 ≥3:1（token 已收敛，见 Part 04）；状态双通道。
- 键盘：focus-visible 显式环；radio/分段 ←/→/Home/End；弹层焦点管理；触控 ≥44。
- 静态走查：`scripts/a11y.py`（outline:none 兜底、禁 span+onClick）已入 CI。
- 渲染级实测：`scripts/a11y-dom.py` 输出 docs/a11y-dom-report.md（渐变无法取样按 INFO；残留清单见报告与决策记录 D7b）。

## Part 24 · 行业设计系统
- 领域：妇幼/儿童全生命周期；业务词库唯一源 15 章；术语禁别名见 14 章。
- 五色风险分级（02.10/15.2.10）：红=当日处置、橙=24h 复核、黄=周内随访、蓝/绿=常规。
- 医疗克制：数据严谨、语气不制造恐慌、异常文案专业（12.5/13 章）。
- 合规提示：面向医疗软件的可用性/法规要求（如 IEC 62366 类）应在立项评审中单独评估，本系统提供语言/视觉克制基线，不替代准入评估。

## Part 25 · Figma 组件库标准
- 页面结构镜像代码：`Primitive / Alias / Components / States / 表单 / 导航 / 反馈 / 移动`。
- 组件命名 = 14 章官方名（kebab/语义）；Style/Variable 命名 = 02 token 名（`--lg-* / --mmh-*`）。
- 变量三层导入：primitive → alias → component；颜色引用变量而非裸色。
- Auto Layout 4px 网格；组件属性=props 白名单（克制）；每组件附“状态预览板”与 Do/Don't 页（与 03 对齐）。
- 与代码同步机制：Figma token 导出 JSON → 人工 review → 落 `tokens/*.ts` + theme.css，再由 audit 校验（Part 27）。

## Part 26 · Design Token 代码标准
- 唯一代码源文件：`goodmom-ui/src/tokens/{design,business,status}.ts` + `theme.css`；命名映射见 business.ts（40+ 词条 semanticOf）。
- 色值六进制仅存 token 层；`audit.py`：代码层 ALLOWED（严格 FAIL）、页面层 ALLOWED∪PAGE_ALIAS、`color-banned` 旧色回归检测。
- spec 生成 = `scripts/gen-spec.py` + `refresh-spec.py`（保留阅读器）；任何 md/token 变更后执行 refresh 并回归。

## Part 27 · Design-to-Code 标准
- 还原偏差验收：间距/字号/圆角/阴影只能取 token 刻度；偏差判定走 18 章逐项自查 + audit。
- 规范-代码映射：00 目录（规范全量 94）↔ 代码封装（12）↔ docs/coverage-report.md 自动统计。
- 页面不重复定义品牌 `:root`；使用预置 `--mmh-*`/`--lg-*`；HTML 无 `.md` 链接、统一菜单与 logo。

## Part 28 · AI UI 生成标准
- 生成规范提示词见 `../05-AI生成Prompt库.md`（219 行配方）；AI 产物必须过本手册 Part 29/37 验收。
- AI 生成页面前置约束：Token 化色值、禁 emoji、禁 md 链接、统一导航、呼吸感留白、玻璃层级 L1–L4。
- 医疗语境禁 AI 自行发明剂量/风险口径——只允许复述 15 章词表与既有临床文案。

## Part 29 · Design QA 标准
- 分层走查：视觉（间距/层级/玻璃档）→ 组件状态 → 交互节奏 → 可访问性 → 响应式 → 品牌词 → 合规（医疗克制）。
- 自动 QA 套件（脚本根目录 `scripts/`）：audit.py（13 项）、coverage.py、a11y.py、a11y-dom.py、refresh-spec.py。
- 回归入口：`python3 scripts/audit.py && python3 scripts/a11y.py --ci && python3 scripts/coverage.py --ci`。

## Part 30 · Design Governance
- 登记制度：新组件 → 00 加行 → 14 补术语/状态 → 09 图标流程 → 10/11 或 08.2 落端规范（00 第 3 节）。
- 命名/术语唯一源 14 章（含禁用别名与旧称迁移表）；新增名词先登记。
- 决策记录制：`docs/审查决策记录.md`（D1–D7b）保存多来源冲突裁决、实测数据与保留项，作为审计与评审依据。
- 审计工具纪律：audit 白名单即治理边界；页面别名收口 PAGE_ALIAS（D4）。

## Part 31 · 版本管理
- 版本载体：`CHANGELOG.md`（V2.x 条目）+ `README.md` 版本记录 + root `package.json`（workspaces 独立版本）。
- 规则：破坏性/系统性变更升中版本（V2.3→V2.4 审查整改轮）；补丁与文档同步记录。
- spec.html 与 docs 快照随版本重生成；决策记录随版本留档。

## Part 32 · 项目落地 SOP
- 六步（06 章）：需求对齐 → 术语/词表登记 → 组件组合选型（17.3）→ Token/资产落地 → 页面验收（16.6 合规表）→ 交付回归（37）。
- 双端落点矩阵：PC 用侧栏/桌面组件，iPad 用 8:4，Mobile 用 TabBar/移动组件（10.3/17.1）。

## Part 33 · 设计师工作规范
- 交付前自查清单：Token 引用、AA 对比度、状态齐全、断点三档、禁 emoji、命名入 14 表。
- 交稿物：设计稿（Figma 变量化）+ 状态说明 + 关键数值标注（token 名而非裸值）。
- 变更纪律：设计变更须同步 md 规范 + spec（refresh）+ CHANGELOG，勿只改图。

## Part 34 · 产品经理使用规范
- 使用 15 章词库拟文案/PRD（状态词与医疗口径唯一源）；需求先查 00 是否已存在组件再提新 UI。
- 涉及风险分级（红/橙/黄/蓝/绿）必须引 02.10/15.2.10 口径；提示语按 12.5 语气规范。
- 版本需求与 CHANGELOG 对应；验收引用 Part 37 清单。

## Part 35 · 前端工程师使用规范
- 引入 `@arco-design/web-react` CSS 后加载 `@goodmom/ui/theme.css`；`tokens/*` 提供语义映射；组件使用见 goodmom-ui README。
- 类型/构建：`npm run typecheck`（根，覆盖 @goodmom/ui+icons）、`npm run build`；CI 含 docs-links / gm-ui-typecheck / open-pkg-typecheck。
- 页面接入顺序：先 tokens 后组件后页面壳（17.1.1→class 映射）；魔改需回填封装并跑 audit。

## Part 36 · AI Agent 使用规范
- 生成/审查前必读：本手册 + 关联分篇 + 决策记录；结论必须带 `文件:行号` 证据，不臆测。
- 禁止行为：改色/新增术语/引入 emoji 或第三方图标而不登记；越权把“需设计负责人”项当完成项。
- 标准操作：md/token 改动后跑 `refresh-spec.py` + `audit.py`；TSX 改动本地无网时标注“待 CI typecheck”。
- 多来源冲突处理：对照 02/14/12 与决策记录后给出裁决建议，未经确认不动权威值。

## Part 37 · 项目交付验收规范
- 硬性闸门（全部 PASS 才可交付）：`audit.py`（md 链/章节/图标/HTML 无 md/色彩/旧色/断点/spec 阅读器）、`a11y.py`、`coverage.py` 数值对齐、CI 三个 job 绿。
- 文档闸门：spec 章节=20 且阅读器在；CHANGELOG/README 版本同步；决策记录回填。
- 人工闸门：白字/渐变等设计级项经设计负责人过稿（登记于报告），不允许自动判定代过。

## Part 38 · 设计系统资产库
- 资产清单：19 编号规范（根 `[0-9][0-9]-*.md`）、94 组件目录、12 代码组件、77 图标（icons/lg-icons.svg）、7 HTML 展示页（site 3 + preview 4）、12 模块 goodmom-ui、logo 资产（logo.png + brand/*）、docs 报告（audit-report/coverage-report/a11y-dom-report/审查决策记录）。
- 覆盖度量：`scripts/coverage.py` → docs/coverage-report.md + coverage.json；同步命令清单见各 Part 与 README。
- 再生成入口：spec = `python3 scripts/refresh-spec.py`；图标 = `scripts/build-icons.py`；审计/覆盖/可达见 Part 29。

---

> 手册维护提示：新增分篇或工具时，同步更新 Part 00 映射表与 Part 29/37 闸门描述；任何数值型标准改动必须在 docs/审查决策记录.md 留档实测依据。
