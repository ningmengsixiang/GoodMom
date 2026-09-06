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
- **PC 左侧玻璃侧栏（03.4.1）**：悬浮玻璃柱（距左缘 16px、圆角 22–28）；结构 Logo → 主导航（图标+文字）→ 分组小标题 → 底部用户/设置；展开 232–260px、收起仅图标 80px；选中=渐变玻璃芯片（无左边框粗条）；未读徽标=白底紫字 chip。
- **顶栏（03.4.2）**：面包屑/页面标题（左）、全局搜索（中，宽 280–360）、状态与用户（右）；玻璃悬浮 + 在线绿点。
- **分段/页签（03.4.3）**：分段=玻璃底 + 白色滑块平移 280ms；页签选中=底部紫渐变小条 scaleX(0→1)；移动端页签可横滑（热区 ≥44）。
- **站点菜单**：悬停下拉（hover dropdown）必须带桥接带（hover bridge，防移出即消失）；站内统一 logo 与导航；HTML 页面不出现 `.md` 链接（audit html-md）。
- **端映射与断点**：≥1281 侧栏可用、≤1280 回顶栏页签；移动端 TabBar（3–5 项）+ NavBar（返回/标题/操作）替代侧栏（10.3，侧栏移动禁用）；断点走 767/1024/1366 体系（audit `bp`）。
- **Do/Don't**：✔ 选中态渐变芯片/徽标白底紫字；✘ 传统 Dashboard 左边框粗条；✘ 移动端左侧栏；✘ 菜单无 hover 桥接带。

## Part 18 · 弹窗/反馈规范
- **形态族（03.9 + 07.3.7）**：Tooltip（180ms，Y4px）／Popover（240ms，指向触发点）／Modal（遮罩 250ms + 面板 320ms）／Drawer（右侧 320ms 滑入）／Toast（顶部滑入 320ms→驻留 2.4s→240ms 上滑）。
- **Modal 标准**：宽度语义化（常规 480–720）；遮罩点击/ESC/右上关闭；打开时 body 不滚动、焦点进面板首元素、关闭归还触发点；层叠 ≤2。
- **确认类操作**：提交/签发/删除类 → 确认弹层 + 按钮 `busyFor` 忙碌态（600–950ms）→ 结果 Toast/行状态动画；危险（注销档案等）再加重述对象名。
- **Toast 纪律**：同类只存 1 条；放顶部居中偏上（移动端避免遮挡 TabBar 与底部输入）；不用 Toast 承载表单错误正文（字段就近）。
- **移动差异**：抽屉/弹层优先底部面板（高 ≤92%，向上滑出）；全屏编辑可用整页（10.3/3.9）。
- **Do/Don't**：✔ 关闭后焦点归还；✘ 弹层套弹层无限堆叠；✘ 错误只弹 Toast 不落字段；✘ 无忙碌态双击重复提交。

## Part 19 · Empty/Error/Loading 规范
- **Empty（08.2.12）**：图标 48–52（移动端加大）+ 一句话说明 + 可选行动；有数据操作含义的空态给主行动（如“去建档”），纯空态用中性词。
- **Loading 三态**：① 按钮忙碌=图标位细环 0.9s/圈（不换内容不整钮转）；② 区块加载=骨架 1.15s shimmer（高度与终态近似防跳动）；③ 全屏/局部 Spin `role="status"` + 文案（07.9）。
- **Error（三通道）**：色（红）+ 文案（可理解原因 + 用户可做动作）+ 图标；医疗场景错误给“请稍后重试/联系客服/保持现场数据”等可执行引导，不给技术堆栈。
- **超时/断连**：实时类（随访推送/在线状态）用状态点呼吸警示 + 重连按钮；数据表行错误行内给重试（不整页崩溃）。
- **代码组件**：GmEmpty / GmSpin / GmSkeleton（goodmom-ui，含 role/aria）；图表空态沿用 GmEmpty + 12.3.3 色序注释。
- **Do/Don't**：✔ 骨架先于数据出现（首屏无闪白）；✘ 空态只给横线占位不给文案；✘ loading 与内容同屏闪烁切换（用过渡）；✘ 错误信息暴露内部结构。

## Part 20 · PC 端规范
- **定位**：≥1024 桌面工作台/官网/后台；12 列栅格（17.1.1），内容限宽 1200→按视口分级放宽（1366→1300 / 1600→1440 / 1920→1600 / 2K→1820）。
- **导航**：左侧侧栏（≥1281）或顶栏；面包屑层级；行内可悬停 Tooltip/下拉（桌面 hover 特权）。
- **密度与交互**：正文 14–15px、KPI 26–40px；行高 40–48 控件；hover 浮起/press 缩放在桌面都保留（鼠标为主，触屏一体机仍按触控 44）。
- **组件示例面**：site/index（主站）、preview/index（全组件演示）、preview/examples（示例中心 7 页，含 PC 妇幼工作站）、site/docs（文档中心树）。
- **Do/Don't**：✔ 悬停下拉带桥接带；✘ 纯鼠标依赖功能（键盘可达性 Part 23）；✘ 桌面做单列大留白浪费（用两栏+面板）。

## Part 21 · iPad 端规范
- **定位**：768–1023 医护平板（查房/随访/门诊辅助，10.1.1）；横屏 8:4（左列表右详情）或自适应卡片流；竖屏回落手机单列。
- **形态**：TabBar+NavBar（侧栏保持禁用）；卡片可两栏半；表格→卡片/横滑窄表；图表降级摘要（10.5.2）。
- **断点与 Token**：768–1023 单档；平板增量 `--lg-m-gutter-page:20px` 等（10.2.1）；audit `bp` 允许 768。
- **交互差异**：触控目标 ≥44；保留触控笔/键盘场景 focus ring（10.1.1）；无 hover 依赖（press 呈现）；悬浮操作支持（iPadOS 指针 hover 可选增强）。
- **安全区**：刘海/圆角用 `env(safe-area-inset-*)`；横竖屏切换布局稳定（状态不丢）。
- **Do/Don't**：✔ 单列内容宽度复用手机组件但允许两栏；✘ 侧栏/桌面级 hover 菜单在平板启用；✘ 忽略 768–1023 中间态（此前断点漂移问题已收敛）。

## Part 22 · Mobile 端规范
- **骨架（10.3）**：NavBar（返回/标题/操作）＋ TabBar（3–5 玻璃胶囊）；页面内容单列卡片流。
- **触控**：热区 ≥44×44、关键按钮 ≥48；输入高 44、字号 ≥16（防聚焦缩放）；页面两侧留白 ≥16（`--lg-m-gutter-page`）。
- **输入与选择**：Select/Picker 用底部弹层（不遮键盘、不悬空）；日期/开关/步进/上传见 11.2 全量；校验错误就近 + 底部操作表承担 Popconfirm（10.3）。
- **表格/列表**：→卡片列表或横滑窄表；分页改「上滑加载更多 + 到底提示」。
- **反馈位置**：Toast 居中偏上（避免遮挡 TabBar）；底部抽屉/底部弹层常用；FAB 在 TabBar 之上抬升（08.2.1）。
- **横竖屏与安全区**：横屏转 iPad 逻辑（Part 21）；刘海/底部指示条 `env()` 处理，TabBar 不压内容（11 章验收项）。
- 预览页：preview/mobile.html（实机边框复刻）；断点 ≤767。

## Part 23 · Accessibility 规范
- **对比度（WCAG 2.2 AA）**：正文/控件 ≥4.5:1，大字（≥24px 常规/≥18.66px 加粗）≥3:1；token 已收敛：主 #343A46(≥7)、次级 #4F5B6E(白 6.88/暖 4.98)、白字实底档 --mmh-solid-*（D5/D7）。页面实测以 `a11y-dom.py` 报告为准（渐变/长尾清单见 docs/a11y-dom-report.md 与 D7b）。
- **键盘**：可交互元素原生可聚焦或显式 tabindex；`:focus-visible` 显式环（2px，禁裸 outline:none）；radio/分段支持 ←/→/Home/End（roving tabindex + aria-checked/selected）。
- **焦点管理**：Modal/Drawer 打开聚焦首元素、关闭归还触发点；非模态层不劫持焦点。
- **ARIA/读屏（07.9）**：装饰图标 aria-hidden；传义图标 role="img"+label；radiogroup/status/dialog 语义到位；加载用 role=status；表格用真实 table/语义 header（不滥用 div 表格）。
- **触控与缩放**：触控 ≥44/关键 48；200% 文字缩放不破版（弹性布局 + 容器最小内容检查）；安全区 env()。
- **动效**：prefers-reduced-motion 全局降级（07.5）。
- **自动化**：静态 `a11y.py`（outline 兜底/禁 span+onClick）已入 CI；渲染级 `a11y-dom.py` 出报告；axe 运行时级走查列长期项（18 章 A3 备注）。

## Part 24 · 行业设计系统
- **领域**：妇幼/儿童全生命周期（备孕—孕期—产后—0–6 岁）；双用户端（妈妈/家长 C 端 + 医生/医护 B 端工作台）。
- **词库唯一源**：业务状态与文案见 15 章（90+ 状态词条、随访对象状态文案 15.2.4）；术语/禁别名见 14 章——产品、设计、工程、AI 生成必须同词。
- **风险分级（02.10/15.2.10）**：五色（绿/黄/橙/红/紫）仅用于妊娠风险分级；升级规则红=当日处置/橙=24h 复核/黄=周内随访；例外：任务“即将到期/已逾期”=琥珀、医疗结果类逾期/未到诊升级红。
- **领域组件（13 章）**：妊娠档案、儿保五健、疫苗计划、高危随访等业务卡/表单；风险选择器 GmRiskPicker（radiogroup 键盘可达）；状态标签（GmStatusTag/GmTag）五色+六语义。
- **医疗克制**：数据严谨（剂量/区间专业口径，解释大白话）；语气不制造恐慌；异常结果无庆祝动效；紧急语义不允许一键忽略（15.2）。
- **合规边界**：面向医疗软件的可用性/法规（如 IEC 62366、器械软件准入）需在立项评审单独评估；本系统提供语言与视觉克制基线、不替代准入评估与临床验证（Part 36/37 亦须守此边界）。

## Part 25 · Figma 组件库标准
- **页面结构（镜像代码分层）**：01 Primitive（色板 ramp/字号/圆角/间距刻度）→ 02 Alias（语义/文本/品牌位）→ 03 Components（按 03/10/11 族）→ 04 States（每组件状态板）→ 05 Forms → 06 Nav → 07 Feedback → 08 Mobile → 09 Charts（12.3.3 色序）。
- **命名同步纪律**：图层/样式/变量命名 = 14 章官方名（组件 kebab/中文禁别名）+ 02 token 名（`--lg-* / --mmh-*`）；Figma 名称与代码 token 一一对应，禁止图里一套、代码一套（Part 27 双轨禁令）。
- **Variables 三层**：primitive → alias → component 逐层引用；颜色/圆角/间距/字号全部变量化，组件内不写裸值。
- **组件规范**：Auto Layout 4px 网格；属性 = props 白名单（克制、与代码 props 对齐）；每组件带主态 + 状态预览板 + Do/Don't 页（镜像 03）；组件描述链接编号规范章节。
- **协同流程**：Figma Token → 导出 JSON → 人工 review（与决策记录比对）→ 落 `tokens/*.ts` + theme.css → `refresh-spec.py` + audit 校验；任一方向变更同步另一侧。
- **验收点**：抽查组件 → 与代码渲染像素级关键项（颜色/圆角/间距）无裸值偏差；状态齐全；命名可 grep 到代码同名。

## Part 26 · Design Token 代码标准
- **代码唯一源**：`goodmom-ui/src/tokens/{design,business,status}.ts` + `theme.css`（:root）；命名 = `--lg-*`/`--mmh-*` + scope-kebab；业务词条 semanticOf 见 business.ts（40+）。
- **硬规则**：① 色值六进制只允许出现在 token 层（组件内 0 魔法色，audit color-css 严格层 FAIL 拦截）；② alias 深色为状态文字唯一源（`--lg-sem-*`）；③ 白字实底用 `--mmh-solid-*`；④ 文字承载行动用 `--mmh-grad-action-hc`（D5/D6）。
- **页面层**：site/preview 静态页色落 ALLOWED ∪ PAGE_ALIAS（D4）；代码层仅 ALLOWED；旧色回归由 color-banned 拦截（`#3F9C88`）。
- **生成与同步**：`scripts/gen-spec.py` + `refresh-spec.py`（保留阅读器）重生成 site/spec.html；图标 `build-icons.py`；`coverage.py` 统计封装计数。
- **工程**：根 `npm run typecheck`（@goodmom/ui + @goodmom/icons）、`npm run build`；CI 含 open-pkg-typecheck。
- **变更流程**：查 02/14 无同名 → token 层新增 → 组件引用 var → audit + typecheck → spec 重生成 → CHANGELOG 记录。

## Part 27 · Design-to-Code 标准
- **映射纪律**：图面颜色/字号/间距/圆角/阴影只能出自 token；还原以 token 值为准（不允许类型化 token 偏差），视觉微调（±≤2px 类）由设计评审裁定并在决策记录留档。
- **规范-代码登记**：00 目录=规范全量（94）↔ 代码封装=12（coverage.py 自动统计）↔ docs/coverage-report.md；新增封装双向登记。
- **页面壳映射**：17.1.1 栅格/17.3.1 组合顺序 → 页面 class 结构；站内不重复定义品牌 :root，统一导航与 logo（`../logo.png`）；HTML 无 `.md` 链接（audit html-md）。
- **双轨禁令**：Figma、代码、spec 三方必须同源同步；页面出现第三方风格/裸色视为回归（audit 色彩 + stale）。
- **验收工具**：`audit.py`（含章节/图标/色彩/断点/spec）、`coverage.py`、CI 三 job；规范变更必须跑 `refresh-spec.py`。

## Part 28 · AI UI 生成标准
- **生成输入**：先给出上下文（产品域 15 词库 + 目标端 + 参考规范章节），禁止只给一句“做个页面”即产出终稿。
- **输出合规清单（硬性）**：Token 化色值（无裸色）；禁 emoji；图标走 lg-icon/GmIcon；无 `.md` 链接、统一导航 logo；玻璃层级 L1–L4；留白 4px 刻度；断点 767/1024/1366；语义词引用 14/15 表。
- **医学安全**：AI 不得发明剂量/分期/风险口径——只允许复述 15 章词表与既有临床文案；生成结果需医疗口径复核人签名。
- **质量与流程**：生成 → 对照 `../05-AI生成Prompt库.md` 与 Part 29/37 清单自检 → refresh/audit 回归 → 人工过稿（设计 + 领域）→ 交付。
- **AI 审查角色规范**（36 章一致）：结论带文件:行号证据；不臆测；冲突先对照 02/14/12 + 决策记录给出裁决建议；“需设计负责人”项不得代判完成。

## Part 29 · Design QA 标准
- **分层走查顺序**：视觉（Token/间距/层级）→ 组件状态齐全 → 交互节奏（07）→ 可访问性（23）→ 响应式（06/21/22）→ 品牌词（14/15）→ 医疗克制（24）→ 合规边界。
- **自动套件（scripts/）**：`audit.py`（13 项，含 md 链/章节/图标/html-md/stale/色彩 ALLOWED·PAGE_ALIAS/color-banned/bp/spec）、`coverage.py`、`a11y.py`、`a11y-dom.py`、`refresh-spec.py`。
- **回归入口**：`python3 scripts/audit.py && python3 scripts/a11y.py --ci && python3 scripts/coverage.py --ci`。
- **分级与闭环**：发现 → 定级（P0 阻断/P1 明显/P2 优化）→ 修复 → 回归 → 决策记录留档（若涉及多源冲突或品牌视觉）；设计级（白字/渐变/层级取舍）由设计负责人人眼过稿，不得以工具数值代判（D7b）。
- **证据要求**：每项结论给 `文件:行号`；无法取样/未覆盖处标注待确认。

## Part 30 · Design Governance
- **登记制度（00 第 3 节）**：新组件 → 00 加行 → 14 补术语/状态 → 09 图标流程 → 10/11 或 08.2 落端规范 → 代码封装回填（Part 27）。
- **命名/术语唯一源**：14 章（含禁用别名与旧称迁移表）；新增名词先登记，禁止先造后补。
- **决策记录制**：`docs/审查决策记录.md`（D1–D7b）记录多来源冲突裁决、实测数值、保留项；作为评审与 AI 审查依据，随版本留档。
- **审计即治理**：ALLOWED（代码）/PAGE_ALIAS（页面）即色板治理边界；color-banned 拦历史回归；bp 管断点；coverage 管封装量——治理不靠口头约定，靠可执行检查。
- **角色与评审**：设计/工程/PM/AI 贡献统一走“登记 → 实现 → 回归 → 过稿”闭环；未过设计负责人的视觉取舍不得宣称已完成（Part 36/37）。

## Part 31 · 版本管理
- **版本载体**：root `package.json`（主版本 V2.x，与系统文档同步）+ workspaces 独立包版本（@goodmom/ui 0.x 等）+ `CHANGELOG.md` + `README.md` 版本记录表。
- **分级规则**：破坏性/系统性变更 → 中版本（如 V2.3→V2.4 审查整改轮）；局部补丁与文档同步 → 小步提交但 CHANGELOG 记录；决策记录随版本留档。
- **同步矩阵**：改版本时需同步——README 交付统计/版本记录、CHANGELOG 条目、spec.html（refresh）、docs 报告日期；不一致会误导（历史口径问题已修复：README/pkg/spec 同号）。
- **发布步骤（收尾）**：全量回归（Part 37）→ 更新 CHANGELOG/README → 提交推送 → CI 三 job 绿 → 在决策记录标注版本与轮次。

## Part 32 · 项目落地 SOP
- **六步流程（06 章）**：① 需求对齐（端/用户/词表）→ ② 术语与状态登记（14/15）→ ③ 组件组合选型（00/17.3）→ ④ Token/资产落地（02/09/13）→ ⑤ 页面实现与合规自查（16.6 + Part 29）→ ⑥ 交付回归（Part 37）。
- **入口检查**：任何新页面/功能上线前跑「16.6 组件合规表 + 17 章验收」；站点页并入前执行 audit html-md/统一导航/logo 检查。
- **端映射**：PC=侧栏/桌面组件（Part 17/20）；iPad=8:4（Part 21）；Mobile=TabBar/移动组件（Part 22）；跨端复用一个域模型、不同形态。
- **变更节奏**：小步提交 + 每批回归；涉及 Token/词表/色彩 → 加跑 refresh-spec + audit。

## Part 33 · 设计师工作规范
- **交付物**：Figma 变量化画稿 + 状态说明 + token 标注（写 token 名不写裸值）+ 异常/边界用例。
- **自检清单（交付前）**：Token 引用无裸色；AA 对比度（Part 23）；组件状态齐全（Part 12）；三端断点预览（Part 20–22）；禁 emoji、命名入 14 表；插画/图标过风格与登记（Part 08/09）。
- **协作纪律**：设计变更须同步 md 规范 + spec（refresh）+ CHANGELOG，禁止只改图不改规范；领域词与医疗口径以 15 章为准。
- **签字权**：白字/渐变/层级等品牌视觉取舍得设计负责人拍板，工具数值只作证据不代判（D7b/Part 29）。

## Part 34 · 产品经理使用规范
- **词库对齐**：PRD/交互稿文案使用 15 章状态词条与 14 术语；新增业务状态先登记再写稿。
- **组件查重**：提新 UI 前查 00 目录是否已有组件/领域组件（94 全量目录 + 12 封装子集见 docs/coverage-report.md）；已有则复用，避免各自实现。
- **领域口径**：涉及妊娠风险分级（五色）引用 02.10/15.2.10；随访/儿保/疫苗计划等流程用 13 章组件语言描述。
- **验收引用**：交付验收直接引 Part 37 清单；需求版本与 CHANGELOG 对应。

## Part 35 · 前端工程师使用规范
- **接入顺序**：`@arco-design/web-react/dist/css/arco.css` → `@goodmom/ui/theme.css` → 组件/tokens；样式覆盖只改主题层，不在页面写品牌 :root。
- **可用 API**：Gm* 组件（12 模块，见 goodmom-ui README）、tokens（design/business/status）、gmIcon/GmIcon（title 语义化）、i18n。
- **工程**：`npm run typecheck`（根：@goodmom/ui+icons）、`npm run build`；CI = docs-links / gm-ui-typecheck / open-pkg-typecheck；本地改动后跑 `scripts/audit.py` 与 `a11y.py --ci`。
- **页面集成**：先 token 后组件后页面壳（17.1→class）；新封装组件回填 index.ts/README/00/coverage；禁止魔法色与页面级裸断点。

## Part 36 · AI Agent 使用规范
- **前置阅读**：本手册 + 相关分篇 + `docs/审查决策记录.md`；上下文不足先盘点仓库（read/grep 带行号），禁止凭记忆臆造。
- **取证纪律**：所有结论给 `文件:行号` 证据；找不到写“未发现/待确认”；只描述会话证据能支撑的内容。
- **产出闭环**：md/token/规范改动 → `refresh-spec.py` + `audit.py` 回归；TSX/代码改动离线无法 tsc 时标注“待 CI typecheck”；页面/工具改动后跑 a11y/coverage 按需。
- **冲突协议**：多来源冲突（如语义色文档 vs 代码）→ 对照 02/14/12 与决策记录给出裁决建议与影响面，未获确认不动权威值；“需设计负责人”项不得自行宣称完成（Part 29/33）。

## Part 37 · 项目交付验收规范
- **硬性闸门（全部通过才可交付）**
  - `python3 scripts/audit.py`：md 链/章节 00–18/icons 77/html 无 md/stale/色彩（ALLOWED·PAGE_ALIAS）/color-banned/bp/spec 章节 20+阅读器
  - `python3 scripts/a11y.py --ci`：outline 兜底/禁 span+onClick
  - `python3 scripts/coverage.py --ci`：docs 19/组件 94/12/图标 77 数值对齐
  - CI：docs-links、gm-ui-typecheck、open-pkg-typecheck 三 job 绿
- **文档闸门**：CHANGELOG/README 版本同步；spec.html 由 refresh 重生成；决策记录回填（D-条目与保留项）。
- **人工闸门**：品牌视觉（白字/渐变/层级）与医疗口径由设计/领域负责人过稿；`docs/a11y-dom-report.md` 残留清单逐条裁决或排期。
- **交付物清单**：规范 md + site/preview HTML + goodmom-ui/icons + scripts 工具 + docs 报告 + CHANGELOG。

## Part 38 · 设计系统资产库
- **资产清单（2026-09 V2.4）**
  | 资产 | 数量/位置 |
  | --- | --- |
  | 编号规范文档 | 19 份（根 `[0-9][0-9]-*.md`） |
  | 组件目录（规范全量） | 94（00-组件总目录.md） |
  | 代码组件（封装） | 12（goodmom-ui/src，components 9 + adapters… 以 coverage 为准） |
  | 自绘图标 | 77（icons/lg-icons.svg ↔ registry ↔ 09） |
  | HTML 展示 | site 3 + preview 4 + fuyouaicansai 交互稿 |
  | Logo/品牌 | logo.png + brand/{logo-mark,logo-tile,logo}.svg（v2 定案） |
  | 报告 | docs/{audit-report,coverage-report,a11y-dom-report,审查决策记录}.md |
- **同步命令**：spec=`python3 scripts/refresh-spec.py`；图标=`python3 scripts/build-icons.py`；度量=`python3 scripts/coverage.py`；审计/可达=`audit.py / a11y.py / a11y-dom.py`。
- **维护规则**：资产增减后同步 Part 00 映射与本表；数值型标准改动在决策记录留实测依据。
