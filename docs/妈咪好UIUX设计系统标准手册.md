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
- **目标**：妇幼儿童全生命周期（备孕—孕期—产后—0–6 岁儿童）跨端一致体验；用「医疗克制 + 温暖可信」的语言与视觉服务妈妈、家长与医护两端（`../01-设计总览与设计DNA.md`）。
- **四大 DNA（01 章）**
  1. 液态玻璃材质（半透明白 + backdrop-blur + 白描边 + 顶部高光 + 柔影；L1–L4 层级见 02.5）
  2. 蜜桃粉品牌 + 淡紫柔光（`--mmh-grad-primary` / `--mmh-m5-*` 语义见 12.3）
  3. 圆形家族（交互组件圆角 ≥16、容器 18–40、chip 999）
  4. 呼吸感留白（页面 48–72px 呼吸带，4px 基准）
- **非目标（Do Not）**：不做炫技/纯装饰视觉；不做未经临床验证的医学主张；不做与引擎（Arco/Semi）语义冲突的自造组件（先查 08 覆盖矩阵）。
- **双层源纪律**：设计源=编号规范（00–18）；代码源=goodmom-ui（tokens/*、theme.css、components/*）。任一变更双侧同步，随后 `python3 scripts/refresh-spec.py` 重生成 site/spec.html。
- **登记纪律**：新组件/术语/图标先登记（00 目录 → 14 术语表 → 09 图标流程 → 10/11 或 08.2 端规范），禁止“先造后补”。
- **验收点**：新增/修改后执行 `python3 scripts/audit.py`（13 项全绿）、`coverage.py --ci`、`a11y.py --ci`；评审结论落 `docs/审查决策记录.md`。
- 关联工具与文件锚点：README.md（角色→文档矩阵）、00-组件总目录.md、docs/audit-report.md。

## Part 02 · 品牌视觉系统
- **品牌名唯一写法**：中文「妈咪好」+ 英文「GoodMom」＝**妈咪好 GoodMom**；禁止 Good Mom / Goodmom / 妈咪好goodmom 等异拼（14 章禁别名 + docs/audit-report stale 检查会拦）。
- **Logo（v2 定案，2026-09）**：正式稿 `brand/logo-mark.svg` / `logo.svg`（孕妈剪影 + 爱心 + GOODMOM）；站点全局图标位用根目录 `../logo.png`；v1 几何版退役仅留档（12.8 与决策记录）。
  - 尺寸/位置：页面级 ≥24px 高；与文字间距 ≥ logo 高的 0.5×；favicon 用 logo.png（site/preview 已统一）。
  - 禁止：改色/旋转/拉伸变形/叠在花纹上/加投影；深色底上需加白底圆角容器（品牌版式另审）。
- **品牌 Token（12.3 语义重映射）**：玫瑰梯度 `--mmh-grad-primary`（装饰）与 `--mmh-grad-action-hc`（文字承载 CTA，AA，D5/D6）双轨；桃/杏辅助 `--mmh-mint/peach`；淡紫柔光氛围（图表/技术焦点）。
- **品牌语言（12.5 Tone of Voice）**
  - 称呼：妈妈/家长（不用“亲”）；医护端：医生/医护老师。
  - 语气：安心、鼓励、不说教；异常提醒不制造恐慌（“建议尽快预约复查”优于“很危险”）。
  - 禁忌词：胖/黑历史类；幼龄化叠字滥用；**界面禁 emoji**（图标一律 `lg-icon-*`）。
- **验收点**：页面标题与正文统一「妈咪好 GoodMom」；favicon/logo 引用一致；无第三方图标/过期资产；`audit.py` stale 与 html-md 通过。

## Part 03 · Design Token
- **三层模型（02 章 + tokens 代码）**
  | 层 | 含义 | 例 | 代码落点 |
  | --- | --- | --- | --- |
  | primitive | 基础刻度（色板 ramp/字号/圆角/间距刻度） | rose-500 `#F77FA3` | tokens/design.ts |
  | alias | 语义别名（文本/状态/品牌位） | `--lg-sem-positive` `#2f8f76` | theme.css :root + status.ts |
  | component | 组件配方 | 按钮渐变/玻璃档/焦点环 | theme.css `gm-*` 规则 |
- **命名规范**：`--lg-*`（引擎通用）/`--mmh-*`（妈咪好品牌）+ `{scope}-{语义kebab}`；组件类名 `gm-*`；业务映射 `semanticOf`（business.ts 40+ 词条）。
- **唯一代码源**：`goodmom-ui/src/tokens/{design,business,status}.ts` + `theme.css`；六进制只允许出现在 token 层与受控生成物（组件内魔法色已收敛：GmProgress/GmAvatar 引 DesignTokens）。
- **文本三档**：primary `#343A46` / secondary `#4F5B6E`（AA 收敛，D7）/ tertiary `#9AA2B0`（仅大字号，见 Part 04）。
- **禁用/废弃管理**：弃用 token 保留 1 个版本并标记；旧色回归由 `audit.py` color-banned（`#3F9C88` 等）拦截；页面新色须落在 ALLOWED ∪ PAGE_ALIAS（D4）。
- **主题/变体**：默认妈咪好主题 + `data-theme="dark"` 最小段（theme.css）与「冷静模式」（12.3.2：医护工作台低饱和主行动，只改 Token 不改结构）。
- **验收点**：代码层 audit color-css OK（严格）；新增 token 前查 02/14 是否已存在；变更后 `refresh-spec.py` + `npm run typecheck`（CI open-pkg-typecheck）。

## Part 04 · 色彩系统
- **六语义（alias 深色，14 · 4.4.5 权威）**
  | 语义 | 值 | 覆盖状态 |
  | --- | --- | --- |
  | positive 正常/正向 | `--lg-sem-positive` `#2f8f76` | 正常/完成/通过/未见异常/阴性 |
  | info 信息/进行 | `--lg-sem-info` `#4a76d0` | 已建档/筛查中/进行中 |
  | attention 注意/待办 | `--lg-sem-attention` `#b9771c` | 待复查/待随访/待审核/即将到期 |
  | risk 风险/异常 | `--lg-sem-risk` `#d35466` | 异常/阳性/失访/逾期 |
  | neutral 中性/未动 | `--lg-sem-neutral` `#757e8e` | 未开始/草稿/已归档 |
  | special 特殊/协作 | `--lg-sem-special` `#7a5ce0` | 转诊/会诊/重点管理 |
  > 用法：alias 作色点/色块/图形/大标签；**作为小字正文请用主/次级文本色**，具体页面是否达 AA 以 `a11y-dom.py` 报告为准（勿臆测全量达标）。
- **白字实底档（D5）**：`--mmh-solid-positive #1e6b52 / attention #9a5a0e / danger #b04052 / info #385cb3 / special #6242b8`（白字 4.7–7.0:1）；状态 chip 不得叠加顶部白高光层（实测会把白字拉到 2.5–2.9:1）。
- **孕产妇五色**（`--mmh-m5-m1..m5` = #4CB98A/#F2C14E/#F0954A/#EE5C70/#8F6AE0）：仅妊娠风险分级语境（02.10/15.2.10），与六语义并行不冲突。
- **文本 AA 实测口径（D7/D7b）**：主 `#343A46`（≥7:1）；次级 `#4F5B6E`（白 6.88 / 暖 4.98）；三级 `#9AA2B0` 只用于 ≥24px 常规/≥18.66px 加粗，小字场景禁止。
- **背景/别名**：页面暖底与引擎展示色归 PAGE_ALIAS 审计档（D4），代码层不受污染；渐变职责：亮渐变=装饰，文字承载=深档（D6）。
- **Do/Don't**：✔ 状态+文字双通道；✔ 数据图表遵循 12.3.3 色序；✘ 纯红/纯荧光（02.1.5 禁）；✘ 颜色单独传义；✘ 页面自定义品牌 :root 裸色。

## Part 05 · Typography
- **字体栈**：`Inter / PingFang SC / MiSans / Noto Sans SC`（中英混排回退链）；代码/数字加 `font-variant-numeric: tabular-nums`。
- **字号档（建议值，02.2/10.6）**：正文 14–15px；卡片标题 15–17px；页面标题 20px；KPI 数字 26–40px；移动端输入 ≥16px（防 iOS 聚焦缩放）；说明 11.5–12px 仅辅助且遵循 AA 口径。
- **字重/行高**：常规 400、强调 500/600、标题/数字 700；正文行高 1.7（中文宜 1.6–1.8）；大段正文 ≤70 字/行。
- **强调规则**：标题可用品牌深玫 `--mmh-rose-700`（现收敛为 #B23A63，D7）；正文主文字用 primary；小字辅助一律次级以上（tertiary 仅大字号）。
- **Do/Don't**：✔ 数字与单位对齐、剂量区间严谨；✘ 全大写中文/拼音正文；✘ 低于 11px 正文；✘ 用颜色传达语义却不配文字。
- 关联：02 · 2.2、10.6.2（移动表单字）、13 章（医疗口径）、docs/a11y-dom-report.md（渲染级实测）。

## Part 06 · Grid & Layout
- **端与断点（收敛口径，audit `bp` 检查执行）**
  | 档 | 视口 | 栅格/形态 |
  | --- | --- | --- |
  | 手机 | ≤767 | 单列卡片流；TabBar+NavBar |
  | 平板（iPad） | 768–1023 | 8:4 左列表右详情 或 自适应卡片流 |
  | PC | ≥1024 | 12 列（17.1.1） |
  | 大屏增强 | ≥1366 | 内容区放宽（1300→1820 分级，见 fuyouaicansai 实现） |
  | 侧栏可用 | ≥1281 | 左侧玻璃侧栏；≤1280 回顶栏页签 |
- **页面壳（17 章）**：`.wrap` 居中限宽 → 玻璃顶栏/侧栏 → 内容区；层叠面板 ≤3（17.3.3）。
- **组合顺序（17.3.1）**：头像/标识 → 标题 → 标签/状态 → 数值 → 操作 → 说明；对齐用 17.2 内联布局基线（.btn/.av/.tg/.op inline-flex 等）。
- **Do/Don't**：✔ 弹性可换行、禁用固定像素列宽；✔ 每页一个主行动；✘ 移动端左侧栏/贴地表格行内分页；✘ 自定义页面 :root 断点（须用 767/1024/1366 体系）。
- 验收：`audit.py` bp OK；页面栅格与 17.1 映射表可对照。

## Part 07 · Spacing
- **基准**：4px 网格（02 · 2.3）；间距只允许取刻度（4/8/12/16/20/24/32/40/48/56/64…），禁止零散魔法值。
- **语义间距（移动端增量，10.2）**：`--lg-m-gutter-page:16px`（页面留白）、`--lg-m-gap-card:12px`、`--lg-m-pad-card:16px`、`--lg-m-pad-panel:18px`；桌面玻璃面板参考 L1–L4 内边距 token。
- **呼吸感**：页面级留白 48–72px（预览页已应用）；大屏卡片内部按 12 列网格布局。
- **组合间距规则**：卡片内 16/18px pad；两卡 gap 12–16px；区块间 24–32px；标题下 6–12px。
- **Do/Don't**：✔ 兄弟元素间距 > 父子内边距一致读；✘ 用 margin 模拟视觉层级不清的分隔（优先 divider/间距 token）；✘ 负间距堆叠（浮层除外走 z 体系）。
- 关联：02 · 2.3 刻度表、17.1 栅栏（gap 24）。

## Part 08 · Iconography
- **体系**：自绘线性图标 24×24 viewBox、1.7px 圆头、`lg-icon-{语义kebab}` 命名；共 **77 枚**（icons/lg-icons.svg），10 大类含母婴保健 B 类（baby/mom/milk/vaccine/vital/clinic…）。
- **同步机制**：sprite（icons/lg-icons.svg）＝registry（goodmom-icons/src/registry.ts）＝09 文档，三方由 `scripts/build-icons.py` 再生成；audit `icons` 检查唯一与命名。
- **使用规范**：尺寸档 16/18/20/24（09 · 9.4 移动 22–24）；颜色默认 `currentColor` 继承；与文字并排时 icon 底部视觉对齐（inline-flex）。
- **可访问性**：装饰位 `aria-hidden="true"`；独立传义图标 `role="img"`+`aria-label`（`gmIcon(name,size,title?)`、React `GmIcon` 同规则）；禁止给无意义图标加 label。
- **Do/Don't**：✔ 语义图标+文字双保险；✘ 第三方/emoji 混入（audit stale 不拦 emoji，靠 09/12 规则与人工）；✘ 直接改 sprite 不跑 build-icons；✘ 自造语义重复图标（先查 09 语义表）。
- 新增流程：09.6 登记 → 画 24 网格 → build-icons.py → registry 同步 → 页面引用。

## Part 09 · Illustration
- **风格标准（12.4）**：柔和圆角扁平 / 2.5D；暖杏粉底（`--mmh-peach-*` 系）；人物=孕妈/宝宝/医护；禁止惊悚医学细节、卡通贴纸感、第三方程控插画素材混入。
- **用途矩阵**：Hero/引导页情感位；空状态配图（08.2.12 图标 48 场景可升级为插画）；社区头像替代（柔和插画，实名场景用照片）；**禁止**在诊断/数据密集界面做插画喧宾夺主（Part 16 数据面只留图标+图表）。
- **资产命名与入库**：`ill-{语义}`（如 ill-mom-hug）；沿用 09 流程登记与版本化；源文件（SVG）入资产库并输出适配透明底与暖底两版。
- **医学克制**：插图不承载剂量/分期等诊断信息；医疗设备/紧急场景文案不配可爱化插画（13 章口径）。
- **验收点**：新插画过风格四检（圆角/色系/人物范围/无贴纸感）+ 资产登记；页面插图总数克制（Hero ≤2–3 件，07.2 float 只给装饰件）。

## Part 10 · Motion
- **Token（07 · 7.2 权威）**
  | Token | 值 | 用途 |
  | --- | --- | --- |
  | fast | 120ms | 按压、光标移入即反馈 |
  | base | 220ms | 通用 hover / 颜色过渡 |
  | slow | 400ms | 状态过渡、弹层 |
  | entrance | 800ms | 面板/页面入场（多卡 60–90ms 错峰） |
  | draw | 1000ms | 图表描线、数字滚动 |
  | breathe | 2.4s | 实时状态呼吸（唯一允许无限循环） |
  | float | 8s | Hero 悬浮件缓慢浮动 |
  - 曲线：出场 `cubic-bezier(.22,1,.36,1)`；对称 `cubic-bezier(.65,0,.35,1)`；spring `cubic-bezier(.34,1.56,.64,1)`（开关/勾选/计数）。
- **分级 M1–M4**：M1 状态反馈（120–220ms）→ M2 悬浮/展开（220–400ms）→ M3 强调/庆祝（400ms+）→ M4 环境呼吸（仅在线/实时）。
- **组件配方速查（07.3）**：按钮 sheen 0.8s / 按压 scale(.96)120ms / loading 圈 0.9s·转；卡片 hover 浮起 6px；开关 spring 300ms；分段滑块 280ms；弹层 250+320ms；Toast 滑入 320→驻留 2.4s→240ms；骨架 1.15s shimmer；列表错峰 60ms×n。
- **红线**：只动 transform/opacity；全屏 backdrop-blur ≤6 节点；动效不承载唯一信息（颜色/文字双通道）；`prefers-reduced-motion` 全局降级（07.5/07.9）。
- **验收**：`a11y.py`（outline/reduced-motion 静态项）+ 人工走查动效库（侧栏「动效库」视图演示 20 种配方）。

## Part 11 · 100+ 基础组件规范
- **目录与覆盖口径（重要）**：00-组件总目录登记 **94 项 = 规范全量**（含字段/交互/领域组件）；`goodmom-ui` **已封装 12 模块 = 代码子集**；二者关系以 `docs/coverage-report.md`（coverage.py 自动统计）为准，README 已标注口径，避免“查 94 以为都有”。
- **组件质量基线（03/08 逐组件）**：① 状态全覆盖（hover/focus/press/disabled/loading/error/empty 见 07.8 矩阵）；② props 克制且可组合（GmButton=Arco 全谱透传 + gm 语义类）；③ 同义场景复用同组件（状态标签 GmStatusTag/GmTag 共享 SEMANTIC_COLOR，不同引擎上下文不合并——D3）；④ 支持主题/局部定制（色走 token var）。
- **引擎策略**：Arco（React）为工程基底、Semi 对齐矩阵见 08；自包含轻量适配（无 Arco 依赖）仅用于 GmTag/GmSteps 类轻组件。
- **封装子集现状**：GmButton/StatusTag/Tag/Card/Avatar/Progress/Steps/RiskPicker/ClientCard/Empty/Spin/Skeleton（12）。缺封装组件：先用 Arco 原生 + `gm-*` 主题类实现，并按 00 登记制度回填。
- **验收点**：组件新增须 index.ts 导出 + README 更新 + coverage 计数更新；`npm run typecheck`（CI）通过；组件内无魔法色。

## Part 12 · 组件状态规范
- **状态词汇（15 章唯一源）**：六语义（Part 04 alias 表）× 90+ 业务状态词条；状态点/文本徽章/数值徽标/灯条四种表达（03.6）。
- **必备状态集（每组件对照 07.8 矩阵打勾）**：默认 / hover（触屏 press）/ focus-visible / disabled（需给理由文案）/ loading（不换内容，图标位换圈）/ error（色+文案+图标三通道）/ empty /（可编辑组件加）read-only。
- **五色分级对象标签**：妊娠风险语境专用（红=当日处置/橙=24h 复核/黄=周内/蓝绿=常规，15.2.10），不与六语义混用（D1）。
- **状态双通道**：颜色从不单独传义；GmStatusTag/GmTag 色点+文字已落地（色点 aria-hidden）。
- **Do/Don't**：✔ 禁用原因可见（Tooltip/说明）；✘ 裸禁用无解释；✘ loading 时文字跳动/整钮旋转；✘ hover 与 press 同时作为唯一入口。
- 落地：tokens/status.ts（SEMANTIC_COLOR/FIVE_COLOR）、business.ts semanticOf 40+ 词条、theme.css 呼吸点/焦点环（2.4s/2px）。

## Part 13 · UX 交互规范
- **反馈法则（07.8 通则）**：① hover 与 press 二选一呈现（`@media(hover:none)` 切 press）；② focus 可见=`:focus-visible` 显式环（禁裸 outline:none，a11y.py 检查）；③ disabled 给理由；④ loading 不换内容；⑤ 错误三通道；⑥ 每次交互 ≤250ms 起反馈，等待即进 loading（禁“点了没反应”）。
- **流程类交互**：确认→忙碌(600–950ms busyFor)→结果反馈（Toast/行状态动画）三段式；AI 智能体回复先打字点再出内容。
- **页面编排**：视图切换淡入 0.3s；多卡入场 60–90ms 错峰；KPI 数字 easeOut 滚动 700ms–1s；图表描线 draw 1s。
- **领域约定**：医疗结果类状态不嬉皮（无庆祝动画承载诊断结果）；红级风险提醒置顶且不许被一键忽略（15.2）。
- **验收**：交互实现比照「动效库」配方与 07 章验收清单（07.7）。

## Part 14 · 表单规范
- **形态族（03.5 PC + 10.6/11.2 移动）**：Input/Search（玻璃内嵌 3.5.1）、Checkbox/Radio（软玻璃勾选 3.5.2）、Switch（spring 3.5.3）、Select（3.5.4 底部弹层选择器）、Stepper/Slider/Picker/Upload/Date 见 10.6/11.2。
- **玻璃规格**：高 40（L48/S32），圆角 20；focus 4px 紫 ring 200ms 淡入；错误=边框红 + 一次 ±4px 抖动（240ms）仅校验场景。
- **标签与错误**：label 与控件关联（htmlFor/aria）；必填标记统一（14 词表：必填）；错误在字段下就近展示且三通道；提交态禁重复点击（busy）。
- **移动端**：输入高 44、字号 ≥16（防缩放）；Select/Picker 底部弹层不遮键盘；日期/时间用原生或玻璃滚轮；触控目标 ≥44、关键 ≥48。
- **校验节奏**：失焦即时（轻）＋ 提交全量（重）两段；危险操作需二次确认（Popconfirm/底部操作表）。
- **Do/Don't**：✔ 长表单分组卡片 + 进度；✘ placeholder 当 label；✘ 错误只标红不配文。

## Part 15 · 数据表格规范
- **PC 玻璃表格（03.7）**：表头二级灰（已升次级 `#4F5B6E`，D7b）、行 hover 淡白底、分隔线 rgba(58,52,84,.08)；操作列右对齐内联（.ops，17.2 基线）。
- **列/排序/筛选**：列宽可拖（关键列固定需标注）；排序/筛选给 aria-sort/expanded 语义；长文本省略+title。
- **状态行**：行内 loading（骨架行/局部圈）、错误/空态（GmEmpty 图标 48 居中）、禁用行置灰且说明。
- **移动降级（10.5.3）**：表格→卡片列表（字段名-值布局）或横滑窄表；禁止行内分页，用「加载更多/到底提示」。
- **双通道**：结论列颜色+文字（异常/阳性/阴性词），医疗结果不加装饰色文字干扰（用 alias 深色+词）。
- **验收**：对齐 17.2 覆写类；无全宽贴地边框；无裸 hover 仅色差传达。

## Part 16 · Dashboard 规范
- **信息架构**：顶部 KPI 条（4–6 卡）→ 主趋势图 → 二级对比/构成 → 明细表/队列；数据色序遵循 12.3.3（Rose-500/Peach/Purple-300/Mint…），语义色只表状态。
- **图表语言（04 章）**：趋势用折线/面积（描线 draw 1s）；对比用柱状（成长 900ms 错峰）；构成用环/饼（中心可放总数）；关系/分布按 04 选型；移动端图表降级为静态摘要+横滑（10.5.2）。
- **大屏纪律（04/07.6）**：16:9、12 列栅格、层叠面板 ≤3；动效克制（只动 transform/opacity；实时刷新走 draw 重绘或 2.4s 呼吸，禁止全屏逐帧 blur）；文字 ≥14，数字 tabular-nums。
- **状态处理**：加载=骨架+Spin（role=status）；无数据=GmEmpty 图文；错误=三通道+重试；实时连接断连用状态点呼吸警示。
- **医疗注意**：不自动推断“异常”图标闪烁成装饰；风险队列红级置顶且操作可达（15.2）。

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
