## [V2.9] · 档案数据呈现（Descriptions · 折叠 · 玻璃表格）

> 依据：03 · 3.7 / 08 · 8.2.11+8.2.13 / 11 · 11.2.6 / Part 15 · TB-15-01/02。
> 逐条实测证据与决策见 `docs/审查决策记录.md` **D19**。

### 一类组件在 5 个地方各写一遍，没有两处一致
实测（渲染后 dump 计算样式）：表头字号 11 / 11.5 / 12px（02 · 2.2.2 的类型阶最小档是 caption 12）、
字重 500 / 600（03.7 要求 600）、表体 12.5 / 13px（类型阶里「表格正文」就是 body-sm 14/20）、
分隔色 `.06` / `.08` / `.09` 三种、行高 49 / 51 / 55 / 57（03.7 是 44–52）、
操作列有的靠行内 `style="text-align:right"` 有的没有、`.op` 与 `.ops` 两个名字并存；
描述列表**完全没有** 8.2.13 要求的「≤1 行省略 + 全文」；
折叠只有一个 `transition:.25s` 而实测计算值 `0s / all`（原生 `<details>` 切的是 `display`，加 transition 无效）。

### 收敛为一份配方（外壳「数据呈现层」）
- **`.gm-tbl`**：正文 body-sm 14/20 · 表头 14px **600** 次级色 · hairline 分隔 · `scope="col"` ·
  整表 `tabular-nums` · 操作列 `col-ops` 右对齐 + `.ops` 内联动作组 · `.gm-tbl-wrap` 横滑。
- **`.gm-desc`**：`<dl>` + `<dt class="k">` / `<dd class="v" title="全文">` · key caption 12px ·
  value body-sm **14/20** · 单行省略（8.2.13）。
- **`.gm-fold`**：44 热区标题行 · 高度过渡 300ms（`grid-template-rows` 0fr⇄1fr）· 箭头 220ms ·
  一屏同组 ≤3 · `aria-expanded`/`aria-controls`。
- 页面侧**只加 class**：删掉 19 处私有实现（含 6 处死规则与 1 处 JS 残留选择器）。
  独立演示页保留同源一份，由门禁逐项比对两份数值。

### 阻断级（P0）
- **表格语义被 `display:block` 抹掉**：旧实现给 `<table>` 自己加 `display:block;overflow-x:auto`
  做移动端横滑 —— 这会在 Chrome / Firefox 里把表格语义从无障碍树里移除（TB-15-02 要求保留表头语义）。
  改为外层 `.gm-tbl-wrap{overflow-x:auto}`，并补齐全部 `<th scope="col">`。
- **外壳配方被同权特异性静默压掉**：模块规则经构建会加 `.gm-mod--x ` 前缀（0,2,0），
  与 `.gm-tbl .badge`（0,2,0）**同权**而模块更靠后 → 外壳那条完全不生效
  （实测 `.gm-tbl .badge{padding-top:3px}` 算出仍是 `4px 12px`）。覆盖模块已有类一律改 ≥(0,2,1) 写法。

### 严重（P1）
- **暗色档"页面翻了、表格没翻"**：数据呈现层读系统命名（`--lg-text-secondary`/`--lg-divider`），
  而 `preview-patterns` 只有私有命名（`--t2`/`--line`）→ 暗底深字实测 **1.61:1 / 1.50:1**（12 处）。
  修法为**惰性别名**（`--lg-text-secondary:var(--t2)`），一处定义、暗色自动跟随。
- **别名接多了反而改坏对比度**：顺手把 `--lg-text-tertiary` 也接了，导致页面里
  `var(--lg-text-tertiary, 深色兜底)` 从"走兜底"变成"走别名值"，禁用态链接变成 `#8A92A3`（**3.12:1**），
  被 `a11y-dom` 判为新增确证失败 → 别名白名单化为门禁。
- **改名后热区静默失联**：`.op` → `.ops` 时漏改 `@media(max-width:767px)` 的 `.op a::after`，
  ≤767px 操作链接热区只剩 **13×36**（page-qa 一次报出 17 条）。

### 一般（P2）
- **行高 44–52 变成可算的算术**：`12×2 + 20 + 1 = 45`；单元格内联元素一律 ≤26
  （表格内头像/徽章/`mini` 按钮）→ 最坏 51。配套两条硬规则：单元格**不折行**（折行 → 65px）、
  单元格直接子元素 `flex-wrap:nowrap`（页面里 `.block span{flex-wrap:wrap}` 会把头像与文字拆行 → 80px）。
- **折叠收起残留 14px**：`0fr` 轨道的基尺寸取子项 min-content 而 padding 不可压缩 →
  内边距必须放在代理层的下一层。
- **TB-15-01 的悬空引用**：它引用「17.2 基线 `.ops`」，而 17.2 里没有这个小节 →
  站点因此分裂出 `.op`/`.ops`。已在 **17 · 17.2.3** 正式定义该基线。
- 尺寸回档：`btn.mini` 30 → **26**、`btn.lg` 50/18 → **48/26**（03 · 3.2.4）；
  窄视口不再把表格字号降到 13px（类型阶里没有这一档）。
- 顺带删掉 `preview-patterns` 与 `@js` 分段逐行重复的 238 行 body 内联脚本副本。

### 新增门禁与负向测试
- **`audit.py data-present`**：外壳配方数值逐项校验 + 折叠代理层不得带 padding +
  描述列表省略 + **片段零私有实现** + `<th>` 必须 `scope` + 用了配方必须接系统 Token（别名白名单）+
  独立演示页配方与外壳**逐项相等**。
- **`page-qa.mjs` 新增 13 条渲染级检查**：表头/表体字号与字重、`scope`、行高 44–52（并报出撑破行的内联元素）、
  操作列右对齐、`tabular-nums`、`display:table`、描述列表 body-sm 与单行省略、折叠 44 热区/过渡/收起零占位/aria。
  ⚠️ 工具自身的一个坑：它为测量稳定注入了 `*{transition-duration:0s!important}`，
  于是 duration 恒为 0s —— 用它判定"有没有写过渡"必然误报，已改为看 `transition-property`。
- **`css_syntax` 纳入独立演示页与 `preview/*.html` 的 `<style>`**：这些页此前完全不在检查范围内，
  本轮往它们 CSS 段插规则时差点留下不平衡的花括号（会让其后所有规则被静默吞掉）。
- **负向测试 20 → 33 条**（新增 13 条），其中 3 条第一次跑就抓出我自己写的**空转门禁**
  （`block()` 的花括号转义写成 `\{\{`，任何规则都匹配不到 → 门禁全量误报"缺少配方"）。

### 结果与回归
- `page-qa.mjs --ci`：**P0–P2 = 0**（P3 仍为 6 条「模块未实现暗色皮肤」）。
- `a11y-dom.py`：确证对比度失败 **0**（曾因别名接多而出现 1 项，已修）。`site-parity` **15/15** · `site-smoke` **48/48**。
- 其余门禁全绿：`audit.py`（含新门禁）· `a11y.py` · `coverage.py` · 内链/锚点/状态字典/版本/样式对齐/双库契约 ·
  `build-site --check` · `redirect-legacy --check` · 生成器幂等 · 负向测试 33/33。

### 仍未做（登记在案）
`GmTable` / `GmDescriptions` / `GmCollapse` 尚未做成库组件（本轮只把站点与独立演示页对齐到规范）；
TB-15-05（医疗结论列颜色+文字）、TB-15-07（ResponsiveView 三形态统一）、TB-15-08（>200 行窗口化）
尚无站点演示场景与机械门禁。

---

## [V2.9] · 反馈与提示族完善（Toast / Modal / Popconfirm / Tooltip）

> 依据：Part 18 · MD-18-01/02/04。逐条实测证据与决策见 `docs/审查决策记录.md` **D18**。

### 反馈组件从"只有目录登记"到"有唯一实现"
- **新增 `GmToast`**（`goodmom-ui` React + `goodmom-vue` Vue，props / 默认值 / 契约类名逐项一致）：
  受控 `open`、**驻留计时内置**（默认 2400ms，调用点不再各写一遍 `setTimeout`）、
  `error → role="alert" + aria-live="assertive"`、其余 `role="status" + polite`、
  语义色点走 `--lg-sem-*` 双通道；退场**两阶段挂载**，先播满 240ms 再摘节点。
- **站点侧收敛为外壳唯一实现 `window.gmToast(msg, status)`**：站点原有 **5 套私有 Toast**（`.copied` / `#toast` /
  `#gtoast` / `.fx` / `.mtoast`）实测**没有一套完全达标**（位置 `bottom:34px`、滑入 `.35s`/`.25s`、
  驻留 1500/1600/2300ms 三种、全部没有 `role`/`aria-live`）→ 全部删除，改调用外壳那一份。
  Toast 是跨模块浮层，故样式与实现都放外壳、只此一份；挂载点取 `.gm-mod.is-on`。

### 阻断级（P0）
- **Toast 被吸顶导航整条盖住**（本轮最隐蔽）：合并为单一首页后外壳多了一条 60px（移动 **144px**）的
  sticky 导航（`z-index:200`）。模块内 Toast 沿用独立页的 `top:20px` 时，
  **节点存在、样式全部生效、逐页质检也不报，但视觉完全不可见** —— 只有渲染级测量能发现。
  已由外壳统一给出 `--gm-toast-top`（桌面 76px / 移动 160px = 实测导航高度 + 16px），
  并加门禁：外壳缺这两个值即 FAIL。
- **IDREF 断链**：合并时 id 加模块前缀，但 `build-site.py` 的 `prefix_ids` 只改 id、不改引用 →
  `id="preview-index--pcBubTitle"` 配 `aria-labelledby="pcBubTitle"`，两边合法、门禁全绿，读屏拿到空引用。
  已让 `prefix_ids` / `prefix_js_ids` 同步改写 IDREF 属性（`aria-labelledby` / `aria-describedby` /
  `aria-controls` / `for` / `list` …），构建断言新增「断链 IDREF」检查。

### 严重（P1）
- **未定义 Token 让反馈语义色集体失效**：合并后的首页上 `--lg-sem-*` **根本没有定义**，
  而 `preview-index` 有 **59 处无兜底引用**（`color:var(--lg-sem-special)`）。这类声明在计算值阶段
  整条失效、被浏览器**静默丢弃**：不报错、静态扫描与对比度检查都看不到（元素退化成继承色）。
  实测 `.t1` 算出继承色而非紫色。已按 `theme.css` 浅色档补齐 6 个语义色 +
  `--lg-glass-control` / `--lg-shadow-xl` / `--rose-deep`，`preview-mobile` 的 `--sem-special` 一并补齐。
- **Modal 无障碍缺失**：站点示例弹层无 `role="dialog"` / `aria-modal`，无 ESC、无焦点管理、无滚动锁
  （键盘用户进不去也出不来，焦点留在地下的页面上）；演示稿 Modal 同样缺 role 与焦点归还。
  已按 MD-18-02 全部补齐：遮罩点击 / ESC / × 关闭、打开锁滚动、焦点进面板首元素、**关闭归还触发点**。
- **白描边回归**：`.tip` 的 `rgba(255,255,255,.75)` 与演示稿 `.toast` 的纯白 1px
  —— 与 D16 的白底按钮同一缺陷类（白边落在白/浅底上等于「没有边」）。全部改暖中性发丝线。

### 一般（P2）
- **时序对齐 MD-18-01**：Tooltip `.2s`/5px → **180ms / Y 4px**；Popconfirm 同口径；
  Modal 遮罩 `.2s` → **250ms**、面板 `.24s`/`scale(.965)`/16px → **320ms / `.98` / 12px**；
  演示稿 Toast `.25s`/`.22s`/2300ms → **320ms / 2400ms / 240ms**。
- **该页示例文案与实现打架**：演示稿自己写着「滑入 320ms」「驻留 2.4s」，实现却是 `.25s` / 2300ms —— 现已一致。
- **Popconfirm** 补 `role="dialog"` + `aria-labelledby`，触发器补 `aria-haspopup="dialog"` + `aria-expanded`。
- **删掉 550 行死副本**：`preview-index` / `preview-mobile` 的 body 内联 `<script>` 与 `@js` 分段逐行相同，
  构建静默丢弃前者（`drop_body_scripts`），改错一边毫无提示。只留 `@js` 一份并留注释说明。

### 修复（同轮自测补记）
- **Toast 暗色档白底白字（P1，自测发现）**：提示底是硬编码的 97% 白，而文字取
  `var(--lg-text-primary)` —— 暗色档该 token 是浅色字 `#F3EFEC`，
  **实测 1.14:1，等于看不见**。库侧与外壳都补了 `[data-theme="dark"] .gm-toast` 覆盖，
  修后实测：浅色 11.42:1、暗色 13.37:1。
  这类缺陷**任何现有门禁都测不到**：Toast 是交互后才出现的临时节点，
  逐页质检与对比度门禁扫 DOM 时它并不存在。已把「必须有暗色档」写进 `feedback-spec`。

### 新增门禁与负向测试
- **`audit.py feedback-spec`**：库侧滑入 320ms / 退场 240ms（且必须是动画而非 transition）、
  必须 `top:var(--gm-toast-top …)` 且无白描边、四个语义色点必须取 `--lg-sem-*`；组件侧 `role`/`aria-live`/
  `alert` 分流 / 默认驻留 2400ms / `LEAVE_MS = 240`；外壳侧唯一 `window.gmToast` / `DWELL`/`LEAVE` /
  同类仅 1 条 / `role` 分流；**站点片段再出现私有 Toast 一律 FAIL**；独立演示页含 Modal 语义一并校验。
- **`audit.py undefined-token`**：片段里 `var(--x)` 无兜底引用必须有定义（先剥注释再扫描）。
- **`scripts/gate-negative-tests.py`（新增，20 条用例）**：给每条门禁注入真实缺陷，断言必须 FAIL 且报出
  预期原因，随后按字节还原。**本轮它当场抓到一个空转门禁**：`feedback-spec` 里的
  `r"\%s\s*\{" % re.escape(cls)` 会生成要求「字面量反斜杠」的模式，那条检查从写下起就永不命中。
- `audit.py` 新增 `--only <门禁名>`：负向测试需要"只跑这一条"，否则注入的缺陷会被别的门禁先拦下，
  反而证明不了目标门禁有效。
- `site-parity.mjs` 的合并保真度拦下了**有意移除**的两个常驻节点（`.copied` / `.mtoast`），
  已登记进该脚本的 `INTENTIONAL` / `INTENTIONAL_IDS` 并写明理由 —— 属"登记豁免"，不是放宽判定。

### 结果与回归
- `page-qa.mjs --ci`：**P0–P2 = 0**（P3 仍为 6 条「模块未实现暗色皮肤」，不阻塞）。
- `a11y-dom.py`：确证对比度失败 **0**（基线 0）。`site-parity.mjs` **15/15** · `site-smoke.mjs` **48/48**。
- 其余门禁全绿：`audit.py` · `a11y.py` · `coverage.py` · `check-md-links.py` · `check-anchors.py` ·
  `check-status-map.py` · `check-version.py` · `check-style-parity.py` · `check-component-contract.py`（19 对组件）·
  `build-site.py --check` · `redirect-legacy.py --check` · gen 幂等 · 新增负向测试 20/20。

### 仍未做（登记在案）
`Notification`(#64) / `ActionSheet`(#66) / `Banner`(#69) / `Drawer`(#26) / `NoticeBar`(#36) 两库仍无组件实现；
`GmModal` / `GmPopconfirm` / `GmTooltip` 尚未做成库组件（本轮只把站点演示对齐到规范）；
MD-18-03（确认类三段式 busyFor）与 MD-18-06（层叠 ≤2）尚无机械门禁。

---

## [V2.9] · 逐页规范质检与全量整改（每页质检 → 规范问题 → 修复）

> 依据：新增的渲染级逐页质检工具 `scripts/page-qa.mjs`（17 页 × 桌面/移动/暗色三档 × 17 类规则）。
> 逐条证据、规范锚点与实测值见 `docs/page-qa-report.md`；决策依据见 `docs/审查决策记录.md` D14。

### 阻断级（P0）
- **暗色模式在合并站点完全失效**：`build-site.py` 的 CSS 作用域把 `[data-theme="dark"] .glass`（祖先语义）
  改写成 `.gm-mod--x [data-theme="dark"] .glass`（后代语义），而该属性实际挂在**模块根自身**上 ——
  全部暗色规则永不命中。表现为「点了暗色开关、按钮文案变了、`data-theme` 也挂上了，页面纹丝不动」。
  已在 `scope_selector` 改为**复合**写法（`.gm-mod--x[data-theme="dark"] …`）：既命中原生节点，特异性也更高。

### 严重（P1）
- **D9 只落地一半**：`site-index` / `site-docs` 两个片段的 `--mmh-grad-action-hc` 仍是 D5/D8 的深玫
  `#B23A63→#9E3054`，而文字已按 D9 切成深字 → **深底深字 2.00:1**（首页主 CTA / 全部章节序号 / 暗色开关）。
  统一回 `#FFC4D6→#F77FA3`。
- **填充档当文字色用（80+ 处）**：`--lg-*-500`、`--mmh-rose-600`、`--lg-purple-600/500`、`--lg-cyan-600/500`、
  `mint-600`、peach-400 等在 02 · 2.1.5 是填充/图表档，却被直接用作 `color`。统一改用语义 alias 深色。
- **品牌亮渐变 + 白字（D9 禁止）** 13 类控件：`.ext2` `.gbtn` `.cta` `.copied` `.sel.on` `.sttab.on` `.pgit.on`
  `.mchip.on` `.excard .no` `.lc.done .d` `.sg-o.on` `#fx-hero` `mbtn` → 主行动档 + 深字。
- **三级色承载小字号**（02 · 2.1.1 只允许 ≥24px 常规 / ≥18.66px 加粗）与 **D7 回归**（次级色被
  `rgba(...,.7/.6)` 稀释回 3.14:1）逐处收敛。
- **暗色档漏项**：状态 chip、吸顶条、级联占位符、品牌玫在暗底仍是浅色档值（1.11–2.39:1）→ 按 02 · 2.1.9 补齐。
- **触控热区**：≤767px 用 10 章认可的 `::after` 补足 100+ 控件至 44×44（复选框按「视觉 22×22 / 热区 44×44」）。
- **横向溢出**：斜杠长串（Chrome 不在此断行）、引用块长 URL、网格子项 `min-width:auto` 三类根因统一收口。
- **焦点环**：被 `outline:none` 抹掉的输入类控件补 `:focus-visible`；**表单标签**：搜索框 / 滑块 / 表格复选框补 `aria-label`。

### 一般（P2）
- 档位回档：圆角（02 · 2.4）、边框宽度（含 blockquote 4px → 2px）、backdrop 模糊（含补齐 L4 的 40px 档）、
  字重（`<b>` 在 700 父级下按 `bolder` 算成 900）。
- 界面禁 emoji：状态图例与六语义图例的 `🟢🔵🟠🔴⚪🟣` 改为语义色点/色块。
- 版本载体：标准手册「资产清单」仍写 V2.5 → V2.9。
- **`page-qa.mjs` 工具口径校正**（避免把合规实现报成违规）：禁用态按 WCAG 1.4.3 豁免、规范正文不算界面、
  `::after` 热区视为合规、【02 · 2.4】只管短边 ≥32px 的组件与容器（行内 `code` 芯片不在管辖内）。

### 结果与回归
- `page-qa.mjs`：真实页问题 **480 → 6**（全部为 P3「模块未实现暗色皮肤」），**P0/P1/P2 = 0**；重定向桩 7 页各 1 条 → 0。
- `a11y-dom.py`（独立实现的对比度实测）：确证失败 **240 → 0**，基线已收紧为 0；门槛从「不超过 240」变成「必须为 0」。
- 回归全绿：`audit.py` · `a11y.py` · `coverage.py` · `check-md-links.py` · `check-anchors.py` · `check-status-map.py`
  · `check-version.py` · `check-style-parity.py` · `build-site.py --check` · `redirect-legacy.py --check`
  · `site-parity.mjs` 15/15 · `site-smoke.mjs` 48/48 · `page-qa.mjs --ci`（新门禁已接 CI）。

### 修正（同轮补记）
- **logo 恢复原样**：本轮的"圆角一律回档"批量修改误把 **7 处 logo 图片的渲染圆角**一起改了
  （logo 资产文件本身零改动）。已全部恢复原值，并按用户要求把 logo 定为**强制沿用当前版本**。
- **新增 `audit.py logo-guard` 门禁**：① logo 引用必须解析到真实资产；② logo 渲染圆角对表校验（10 处），
  任何改动显式 FAIL。负向测试已验证（注入 24px→22px 漂移 → 立即 FAIL 并指名）。
- `scripts/page-qa.mjs` 把 logo **永久排除**在圆角规则之外（原 finding 正是诱导误改圆角的源头）。
- **顺带修掉既有断裂**：`preview/manual.html` 的 logo 指向已不存在的 `../logo.png`（打印版长期裂图），
  改为 `../brand/logo.png`。

### 修正（同轮补记）
- **正式 logo 回归用户提供资产**（撤销 V2.8 的错误裁决）：用户确认"目前用的 logo 是错的"。
  取证：逐像素比对证明 `brand/logo.png` 与原始 `logo.png`（2032×2032）是同一张图（平均通道差 3.57），
  而页面此前在用的 `logo-mark.svg` / `logo.svg` / `logo-tile.svg` 与它**画面完全不同**（46.3 / 69.5）——
  三个 SVG 是工具自绘稿，V2.8 轮次以"原图 3.28MB 太大"为由换掉了用户的 logo，且该轮自述"未对 logo.png 做视觉判断"。
- **现在的口径**：正式 logo = `brand/logo.png`（真源 2032×2032，全分辨率留档）；
  页面内品牌图 `brand/logo-512.png`（260KB）、favicon `brand/logo-192.png`（48KB）；三个自绘 SVG 退役留档。
  全站 28 处引用已切换，零断链。
- **规范同步**：12 · §12.4/12.8、标准手册总纲、Part 02（BR-02-02/03 + 沿革）、Part 38、README、02-Token、12.8 标题
  中"正式稿 = SVG"的错误表述全部纠正。
- **`audit.py logo-guard` 升级**：页面引用只能是正式派生档（引用退役 SVG 或 3.28MB 真源即 FAIL）、
  **真源尺寸必须 2032×2032**（再被"优化"就 FAIL）、正式档与退役档都必须存在、渲染圆角白名单 10 处。
  负向测试已逐一验证（改回 SVG → FAIL；压缩真源 → FAIL；改圆角 → FAIL；还原 → PASS）。
- 修复 `preview/manual.html` favicon 指向已不存在的 `../logo.png`（打印版长期裂图）。

### 视觉优化（用户反馈：按钮）
- **主按钮"描边与分层错行、发脏"**：根因是 02 · 2.5 给**半透明玻璃面**的「白色描边 + 顶部白内高光」，
  在 D9 把主按钮改成**不透明**品牌粉底之后没有摘掉 —— 白边在浅粉上亮端看不见、暗端看得见，
  边缘一圈深浅不均，再叠一层 inset 白高光就成双线发糊。现改为 `border:none` + **同族玫色双层阴影**
  （接触影 + 辉光，02 · 2.6 色相统一）。
- **白底按钮"描边廉价"**：根因是浅底控件的边用了白色（`rgba(255,255,255,.7~.85)`）——白边在白/浅底上
  等于没有边，轮廓糊掉。现改用 02 · 2.7.1 同源的**暖中性 hairline** `var(--lg-divider)`（暗色档自动翻白）
  + 02 · 2.6 双层柔影。描边按钮改 `1.5px rgba(232,93,143,.45)`（替代纯色饱和硬边）+ 极淡玫影。
- **统一范围**：主按钮 / 白底按钮 / 描边按钮 / 语义实底按钮，以及浅底控件 `chip`、级联选择器、
  搜索框、勾选框、开关轨道。**不动**半透明玻璃面（`.glass`/`.card`/`.panel`）的白边 —— 那是 02 · 2.5 的材质定义。
- **消除"同一个按钮各页各一套"**：`preview-index` 那组 `!important` 原来只覆写 background/color，
  把旧设计的 border 与 inset 高光全留下（这正是"错行"的直接根因）→ 改为覆写整组配方；
  另修 `preview-mobile .cta` 同一条规则里 `border`/`box-shadow` 各声明两次的重复。
- **组件库补齐**：React 与 Vue **此前都没有"白底/次要按钮"实现**（Vue 用了 `--lg-border-white-75` 同一缺陷，
  React 落到 Arco 默认样式）→ 两库按统一配方落地；`gm.css` 逐字节镜像、双库 parity 差异 0。
- **顺带修掉"删覆写即回归"隐患**：`.btn.mint/.danger`、`.b1.mint/.danger`、`.mbb-success/-warning/-danger`
  的基底声明原为"浅色渐变 + 白字"（2.5–3.5:1），靠 `!important` 深实底兜着 —— 基底一并改为深实底（D5）。
- **验证**：全站 **60 个按钮/浅底控件变体，残留白描边或白内高光 = 0**；主按钮配方 5 页完全一致；
  对比度与全部门禁保持全绿。规范写入 **03 · 3.2.4.1**，决策见 D16。

- **全站同步（用户要求）**：范围由 5 个模块扩到 **8 模块 + 7 重定向页 + 打印版手册 + 演示稿 + 两个组件库**。
  改用**严格判据**（品牌粉底元素的 shadow 必须以统一配方开头）后，暴露真问题：全站品牌粉辉光原有
  **16 种不同几何**（`0 6px 14px .3` / `0 8px 20px .3` / `0 10px 22px .4` / `0 8px 18px .28` …）——
  这正是"每处都略有不同"的系统性根源。现统一 15 个控件/徽标的辉光并去掉其白描边。
  **未同步（有意保留）**：半透明玻璃面白边、`.hero-logo` 环境光、滑块拇指、头像与聊天气泡。
- 顺带修正：`site-docs .demoBtn` 基底仍是旧「亮粉渐变 + 白字」（D9 违规，靠 `!important` 兜着）；
  `10-移动端组件规范.md` 的 `.tab-item.on` 代码示例在教旧辉光；手册/规范顶栏 CTA 与重定向桩 CTA
  此前无配方 → 一并写入生成器。
- **验证**：全站品牌粉底元素 **67 个 → 统一配方 63 + 刻意平铺 4，未达标 0、白描边 0**。

### 状态与加载组件族完善（V2.9）
- **骨架（最危险的一处）**：`08 · 8.2.15` 明文「圆角胶囊 + 1.6s 上下微透明呼吸（α .5↔.85）、
  **禁止左右扫光马赛克**」，而**组件库实现的正是被禁止的横向扫光**（`background-position` 动画、
  1.15s、7px 直角）——而**站点演示一直是对的**：演示符合规范、库违反规范，开发者复制的却是库。
  三条全部修正，站点演示的胶囊/底色/白描边一并对齐。
- **规范冲突裁决**：`Part 19 · EL-19-02` 的「骨架 1.15s shimmer」与 `08 · 8.2.15` 直接冲突
  （周期与形态都不同）→ **以 08 为准**，Part 19 已改写并注明依据。
- **Spin**：0.8s → **0.9s**；尺寸默认 16 → 档位 18/24/32/40（规范细环 18–40，越界夹回）；
  补 `delay`（默认 300ms，防闪切 —— Vue 侧原本只在注释里写了这条约定、组件并无声能力）、
  `tone="inverse"`（深底/按钮内白环）、`aria-live` 与无文案时的 `aria-label`。
- **GmSkeleton**：补 `rowHeight`（EL-19-02「高度近似终态」）与 `aria-busy`。
- **GmEmpty**：`.d` 11.5px 三级色 → 12px 次级色（02 · 2.1.1）。
- **GmProgress**：高度档修正为规范值 **3/6/10**（React 用 Arco 默认、Vue 用 4/8/12，均不符）；
  轨道改 `rgba(58,52,84,.08)`（暗色档翻白）+ 圆头胶囊；补 `status` 四值走 `--lg-sem-*` alias；
  补 `indeterminate`（**不报 `aria-valuenow`**，未知进度不给读屏假数值）；补完整 aria 与
  100% 时的「一次白扫光」；修掉 Vue 侧 `--sm/--lg` 与组件输出 `--small/--large` 对不上的死代码。
- **新增 `GmResult`**（本轮最大缺口）：`00` 已登记 #40、`EL-19-03` 明确要求 Error 三通道，
  但两库都没有实现 → 现两库同契约落地（色/文案/动作；`error` 用 `role="alert"`；
  **有意不给 `code`/`stack` prop** —— 那正是「暴露内部结构」的入口）。
- **新增防回归门禁 `audit.py loading-spec`**（负向测试已验证）：骨架不得扫光、必须胶囊与规范底色、
  Spin 必须 0.9s 且下限 ≥18、进度条必须 3/6/10、`GmResult` 必须两库齐备且无 code/stack prop、
  **站点演示骨架必须与库同口径**（专门拦"演示对、库错"的分裂）。
- 站点演示区补「结果页三通道」与「进度条已知/未知时长」两块，与库同口径。
- **并发说明**：本轮与另一会话（双库组件契约，P1-12）并行，按用户要求只改不重叠文件；
  对方新增的 `check-component-contract.py` 抓住了我 `GmSpin` 的 props 分歧，已按契约补齐 Vue 侧。

- **顺带修掉两个"静默失效"缺陷并各加门禁**：① 我插入 CSS 注释时漏写 `*/`，使 Vue 侧
  `.gm-spin i` / `.gm-spin--inverse` 整段被吞成注释（浏览器不报错、页面不报错、既有门禁全绿，
  只有 parity 以"单边选择器"间接暴露）；② 正则替换留下一个多余 `}` 导致解析错位。
  → 新增 `audit.py css-syntax`（注释/花括号平衡，负向测试已验证）。
- 两库进度槽改用 **`--lg-track` token**（替代单边 `[data-theme="dark"]` 选择器），
  分歧消失且暗色切换走 02 · 2.1.9 的变量重定义机制。

### 已知未结项（**不静默转绿**）
- 6 个模块无暗色皮肤（token 层支持，属皮肤缺口，`page-qa.mjs` 记为 P3）。
- 「偏离 4px 网格」4 万+ 处、「字号不在层级」1.1 万处按**聚合口径**登记（`docs/page-qa-report.md` 0b 节给分布）。
- WCAG 1.4.11（非文本对比度）仍无自动检查；其余同 V2.8 未结项。

---

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
