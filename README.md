<p align="center">
  <img src="logo.png" width="96" alt="妈咪好 GoodMom">
</p>

# 妈咪好 GoodMom · 妇幼儿童全生命周期设计系统

<p align="center">
  <b>高级液态玻璃 · 柔光蜜桃 · 温暖可信 · 医疗克制</b><br>
  妇幼儿童全生命周期健康管理平台专属设计系统 —— 孕期 · 婴幼儿/儿童保健 · 机构管理端 · 医护工作台
</p>

<p align="center">
  <img alt="版本" src="https://img.shields.io/badge/version-2.3-ff9ab6?style=flat-square">
  <img alt="文档" src="https://img.shields.io/badge/规范文档-19-6fc9b4?style=flat-square">
  <img alt="组件" src="https://img.shields.io/badge/组件-94-9a78ff?style=flat-square">
  <img alt="图标" src="https://img.shields.io/badge/图标-77-ffc3a0?style=flat-square">
  <img alt="示例" src="https://img.shields.io/badge/示例页面-7-e85d8f?style=flat-square">
  <img alt="许可证" src="https://img.shields.io/badge/License-MIT-8066f0?style=flat-square">
</p>

<p align="center">
  <a href="site/spec.html">📖 规范大全（HTML）</a> ·
  <a href="site/index.html">🏠 主站</a> ·
  <a href="site/docs.html">🗂 文档中心</a> ·
  <a href="preview/examples.html">🖥 示例中心</a> ·
  <a href="https://github.com/ningmengsixiang/GoodMom">GitHub ↗</a>
</p>

---


适用：妈妈/家庭 App（孕期首页、生长曲线、疫苗计划、儿保体检）、机构运营端、医护随访工作台与数据大屏。品牌定义见 [12](12-妈咪好品牌与设计语言.md)，妇幼领域组件见 [13](13-妇幼领域组件规范.md)；01–11 为通用视觉引擎文档。

**交付统计（V2.3）**：19 份规范文档 · 94 项组件（00 总目录）· 77 枚自绘图标（icons/lg-icons.svg）· 90+ 状态标签 · 3 套可交互预览（首页 / 移动端 / 示例中心 7 页）· 1 个前端封装库（frontend-app/packages/gm-arco-ui）

**体系架构**

```text
妈咪好 GoodMom · 妇幼儿童全生命周期设计系统
├── 品牌与业务层  12 品牌 · 13 妇幼领域组件 · 14 命名术语 · 15 业务词库/状态大典 · 16 一致性审计
├── 视觉引擎层   01 DNA · 02 Token · 03 PC 组件 · 04 数据可视化 · 07 动效 · 08 Semi 对齐 · 09 图标
├── 多端层      10 移动端规范 · 11 移动端全量库（含 iPad 10.1.1 / Arco Mobile 对齐 11.6）
├── 落地工具     05 AI Prompt 库 · 06 制作流程验收
└── 交付资产     preview（首页 / 移动 / 示例中心）· icons · frontend-app(@goodmom/gm-arco-ui)
```


---

## 内容架构（Arco 式导航分组）

> 按业界通用 IA 把本仓资源分组归档；栏目 → 落点 → 状态。整站浏览另见 site/index.html「网站目录」。

### ① 开发指南（Developer Guide）
| 栏目 | 落点 | 状态 |
| --- | --- | --- |
| 快速上手 | README 快速上手 · site #code · frontend-app | ✅ |
| 颜色 | [02 · 2.1](02-Token规范.md) · [12 · 12.3](12-妈咪好品牌与设计语言.md) | ✅ |
| 设计变量（Token） | [02](02-Token规范.md)（附录 A/B/C CSS） | ✅ |
| 定制主题 | [02.9](02-Token规范.md) · goodmom-ui/theme.css | ✅（进行中） |
| 国际化 | 预留（文案词库基础见 [15](15-妇幼业务词库与状态大典.md)） | ⏳ 规划 |
| 暗黑模式 | 预留（Token 双模式见 [12.3.2](12-妈咪好品牌与设计语言.md) 冷静模式） | ⏳ 规划 |
| VChart 图表 | [04 数据可视化](04-数据可视化规范.md) · 首页可视化图库 · 封装层 GmProgress 等 | ✅ |
| 组件索引 | [00 组件总目录](00-组件总目录.md)（94 项，PC/移动/妇幼） | ✅ |

### ② 组件（Component，按 Arco 分类）
| 分类 | 对应 |
| --- | --- |
| 通用（Button/Icon/Typography…） | [03](03-组件规范.md) · [09 图标](09-图标库规范.md) |
| 布局（页面壳/栅格/卡片/空间） | [17 · 17.1](17-页面布局与组件组合规范.md) · [03.3](03-组件规范.md) |
| 数据展示（Table/Card/Statistic/状态Tag…） | [03](03-组件规范.md) · [00](00-组件总目录.md) |
| 数据输入（Form/Input/选择器/上传…） | [03.5](03-组件规范.md) · [08.2](08-组件覆盖清单与Semi对齐.md) |
| 反馈（Toast/Dialog/ActionSheet/Banner…） | [03.9](03-组件规范.md) · [11.2](11-移动端组件全量库.md) |
| 导航（NavBar/TabBar/Steps/分页…） | [03.4](03-组件规范.md) · [10/11](10-移动端组件规范.md) |
| 其他（工具/领域组件） | [13 妇幼领域](13-妇幼领域组件规范.md) · [15.6.1](15-妇幼业务词库与状态大典.md) |

### ③ 设计指南（Design Guide）
| 栏目 | 落点 | 状态 |
| --- | --- | --- |
| 简介 | [01](01-设计总览与设计DNA.md) · [12](12-妈咪好品牌与设计语言.md) | ✅ |
| 设计价值观 | 01 · Design DNA 速览（README） | ✅ |
| 设计原则 | [01](01-设计总览与设计DNA.md) · [14](14-命名与术语规范.md) | ✅ |
| 样式指南 | [02](02-Token规范.md) · [12.3](12-妈咪好品牌与设计语言.md) 色板/渐变/阴影 | ✅ |

### ④ 组件用法（Usage）
| 栏目 | 落点 |
| --- | --- |
| 用法速查（Do/Don't） | [03 · 3.11](03-组件规范.md) |
| 页面与组合规范 | [17](17-页面布局与组件组合规范.md) |
| 状态词与语义色 | [14 · 4.4.5](14-命名与术语规范.md) · [15](15-妇幼业务词库与状态大典.md) |
| 动效/触控用法 | [07](07-交互动效与微交互规范.md) · [10.7](10-移动端组件规范.md) |
| 合规审计 | [16.6](16-优化与一致性审计.md) |
| 标准答案（可照抄页面） | preview/examples.html（7 套完整页） |

---
## 目录结构

| 文件 | 内容 | 适合谁 |
| --- | --- | --- |
| [`00-组件总目录.md`](00-组件总目录.md) | **全系统组件总目录**：PC + 移动 + 妇幼领域 94 项一张表平铺（端归属、章节速查、双端形态） | 所有人，先查这张表 |
| [`01-设计总览与设计DNA.md`](01-设计总览与设计DNA.md) | 风格定义、核心关键词、10 大视觉特征、5 层空间层级、L.Glass Design DNA | 所有人，先读这一篇 |
| [`02-Token规范.md`](02-Token规范.md) | 颜色 / 字体 / 间距 / 圆角 / 玻璃材质 / 阴影 全套 Token（含可直接复制的 CSS 变量） | 设计师、前端 |
| [`03-组件规范.md`](03-组件规范.md) | 按钮、卡片、导航、输入框、开关、徽章、状态点、3D 玻璃图标等组件规格 | 设计师、前端 |
| [`04-数据可视化规范.md`](04-数据可视化规范.md) | 图表类型、数据色序、KPI 卡、玻璃表格、行业大屏布局蓝图 | 数据可视化设计 |
| [`05-AI生成Prompt库.md`](05-AI生成Prompt库.md) | 通用 Master Prompt、分行业大屏 Prompt、负面提示词、HTML 实现指令 | AI 出图 / AI 编程 |
| [`06-制作流程与验收清单.md`](06-制作流程与验收清单.md) | AI→Figma→前端工作流、验收清单、常见错误与避坑 | 全员 |
| [`07-交互动效与微交互规范.md`](07-交互动效与微交互规范.md) | 动效分级与 Token、组件级微交互配方（按钮/卡片/开关/图表…）、无障碍与性能纪律 | 前端、动效设计 |
| [`08-组件覆盖清单与Semi对齐.md`](08-组件覆盖清单与Semi对齐.md) | 对照 Semi Design 80+ 组件逐项核对 LG 覆盖度，本期补齐 FloatButton/Steps/Progress/DatePicker 等 17 项适配规范 | 设计师、前端（能力盘点） |
| [`09-图标库规范.md`](09-图标库规范.md) | LG 自绘线性图标库（GoodMom 版）：以 Semi Icons 为基准的绘制标准、77 枚图标清单（10 类，含孕产妇阶段/儿童年龄段/儿童健康五健+口腔镜）、颜色/尺寸/接入规范 | 全员（图标即代码） |
| [`10-移动端组件规范.md`](10-移动端组件规范.md) | **移动端独立规范**：PC↔Mobile 差异、移动 Token/字号/安全区、TabBar/NavBar/ActionSheet 等移动组件、图表降级、触控反馈、性能与验收 | 移动端 UI / 前端 |
| [`11-移动端组件全量库.md`](11-移动端组件全量库.md) | **移动端全量组件库**：60+ 组件覆盖地图（6 大类）、20+ 新增细则、6 套页面模板、Arco Mobile 对齐（按钮谱/CapsuleTabs/Calendar/Selector 等 11.6） | 移动端 UI / 前端 |
| [`12-妈咪好品牌与设计语言.md`](12-妈咪好品牌与设计语言.md) | **品牌顶层**：妈咪好 GoodMom 定位/四大板块、视觉五关键词、品牌色板与双模式机制 | 全员（品牌口径） |
| [`13-妇幼领域组件规范.md`](13-妇幼领域组件规范.md) | **妇幼领域组件**：孕周卡/生长曲线（百分位带）/疫苗计划/随访队列等 14 项、医疗合规、医护大屏 Prompt | 领域设计/前端 |
| [`14-命名与术语规范.md`](14-命名与术语规范.md) | **命名/术语/状态标签唯一标准**：组件官方名（含别名迁移）、妇幼常用词词典、状态标签集与颜色映射 | 全员（先查词再用） |
| [`15-妇幼业务词库与状态大典.md`](15-妇幼业务词库与状态大典.md) | **业务语言权威**：按钮文案词典、九套状态 Tag、人员/档案/筛查/大屏词表、六语义色彩、PC/iPad/手机按钮分级 | 业务/产品/设计/前端 |
| [`16-优化与一致性审计.md`](16-优化与一致性审计.md) | **一致性体检与基线**：计数快照、命名/版本纪律、词库/颜色规则、变更登记 | 维护人（每次改结构先看这里） |
| [`17-页面布局与组件组合规范.md`](17-页面布局与组件组合规范.md) | **页面与组合全局规范**：页面壳/栅格留白/对齐基线（图标-文字）、组件组合顺序与间距档、实现验收 | 全员（先查后做） |
| [`preview/index.html`](preview/index.html) | 液态玻璃视觉预览页（浏览器直接打开，可视化 Token、组件、微交互与图标库） | 全员对照参考 |
| [`preview/mobile.html`](preview/mobile.html) | **移动端视觉预览**（手机框：NavBar、底部 TabBar、卡片流、触控按压反馈） | 移动端对照参考 |
| [`preview/examples.html`](preview/examples.html) | **示例中心**：常用完整页面 7 套（列表/详情/表单/移动/iPad/工作站/孕妇档案），支持顺序浏览 | 全员对照参考 |
| [`preview/manual.html`](preview/manual.html) | **总览手册（打印版）**：定位/架构/DNA/状态/文档地图，浏览器可另存 PDF | 全员（对外介绍用） |
| [`site/index.html`](site/index.html) | **开源网站落地页**：品牌 Hero/能力/视觉/快速上手/开源治理（可直接部署 GitHub Pages） | 对外展示用 |
| [`brand/`](brand/) | **品牌图形资产**：Logo v1 孕妇形象（logo-mark / logo / tile 三种 SVG，规范见 12 · 12.8） | 品牌使用 |

---

## 谁该读什么（角色 → 文档）

| 角色 | 先读 | 再读 |
| --- | --- | --- |
| 产品 / 业务 | [12 品牌](12-妈咪好品牌与设计语言.md) · [15 业务词库/状态](15-妇幼业务词库与状态大典.md) | [13 妇幼领域](13-妇幼领域组件规范.md) |
| 设计师（PC/大屏） | [01 DNA](01-设计总览与设计DNA.md) → [02 Token](02-Token规范.md) | [03 组件](03-组件规范.md) · [04 数据可视化](04-数据可视化规范.md) |
| 设计师（移动） | [10 移动端](10-移动端组件规范.md) · [11 全量库](11-移动端组件全量库.md) | [09 图标](09-图标库规范.md) |
| 前端 / 组件封装 | [02 Token](02-Token规范.md) → [03 组件](03-组件规范.md) | [07 动效](07-交互动效与微交互规范.md) · [14 命名](14-命名与术语规范.md) · `frontend-app` |
| AI 出图 / AI 编程 | [05 Prompt 库](05-AI生成Prompt库.md) | [13 · 13.6](13-妇幼领域组件规范.md) 妇幼 Prompt |
| 交付验收 / 维护 | [06 流程验收](06-制作流程与验收清单.md) | [16 一致性审计](16-优化与一致性审计.md) |

## 工程目录（封装层）

| 路径 | 说明 | 状态 |
| --- | --- | --- |
| `frontend-app/` | Vite + React + Arco 前端骨架（npm workspaces） | 需可联网执行 `npm install && npm run dev`（沙箱无外网） |
| `frontend-app/packages/gm-arco-ui/` | `@goodmom/gm-arco-ui` 封装层：GmButton / GmStatusTag / 主题 CSS | 骨架完成，待依赖构建验证 |
| `goodmom-ui/` | **妈咪好开源组件库 @goodmom/ui**（Arco 基底 + GoodMom 封装）：Gm* 组件/主题/语义字典 + LICENSE/NOTICE | 独立开源子库，待联网构建 |
| `goodmom-icons/` | **图标子包 @goodmom/icons**：77 枚自绘线性图标（registry.ts 编译产物） | 源码就绪，联网构建 |

## 找组件（两步定位）

> ① 查 [`00-组件总目录.md`](00-组件总目录.md)（PC + 移动一张表）→ ② 沿「PC 规范 / 移动规范」列跳到对应章节。

## 快速上手

1. **AI 出图** → 打开 [`05-AI生成Prompt库.md`](05-AI生成Prompt库.md)，复制 Master Prompt 或对应行业 Prompt，粘贴负面提示词。
2. **Figma 建库** → 按 [`02-Token规范.md`](02-Token规范.md) 建立样式 Token（颜色 / 字体 / 圆角 / 阴影 / 模糊）。
3. **前端落地** → 复制 02 章末尾的 CSS 变量块，组件按 [`03-组件规范.md`](03-组件规范.md) 实现。
4. **视觉对照** → 浏览器打开 [`preview/index.html`](preview/index.html) 实时查看效果（含微交互演示，悬停、按压、开关、分段控件等均可直接操作）。
5. **移动端** → 规范见 [`10-移动端组件规范.md`](10-移动端组件规范.md)，预览 [`preview/mobile.html`](preview/mobile.html)（建议浏览器设备模式）。
6. **完整示例页** → 打开 [`preview/examples.html`](preview/examples.html)，按“下一页”顺序走完 7 套常用页面。

---

## 一句话设计规范

> **透明的材质、柔和的光、漂浮的结构、克制的颜色、极简的文字、强烈的空间层级。**

## Design DNA（妈咪好 GoodMom 速览）

| 维度 | 设计原则 |
| --- | --- |
| 材质 | Translucent Liquid Glass（高透亚克力，非纯白） |
| 结构 | Floating / Layered（一切悬浮，多层级） |
| 圆角 | 24–48px（一切皆圆，拒绝直角） |
| 边框 | 1px translucent white |
| 阴影 | Large / Soft / Diffused（无纯黑硬阴影） |
| 背景 | 奶杏暖调（蜜桃光斑 + 淡紫柔光，非纯白非纯黑） |
| 主色 | 蜜桃粉（`--mmh-rose-*`；液态紫=氛围/引擎档） |
| 辅色 | 薄荷=儿保正向 · 蓝=信息 · 琥珀/珊瑚=注意/风险 |
| 点缀 | 淡紫柔光（特殊协作 / 技术焦点） |
| 光效 | Ambient / Volumetric（漫射柔光，禁止霓虹） |
| 图标 | LG 线性图标 24×24（GoodMom 版 77 枚 / 10 类） |
| 字体 | Inter / SF Pro；中文 PingFang SC / MiSans |
| 信息密度 | Medium |
| 空间感 | Very High（5 级景深） |
| 视觉关键词 | 温暖可信 · 液态玻璃 · 医疗克制 · 生长曲线 |
| 禁止 | Neon / Flat / Clutter / 幼齿卡通 / 恐慌化文案 |

## 开源使用说明（安装 / 构建 / 贡献）

```bash
# 克隆
git clone git@github.com:ningmengsixiang/GoodMom.git && cd GoodMom

# 本地预览（无需构建，双击打开即可）
open preview/index.html      # 首页 · 全组件/样式/状态
open preview/examples.html   # 示例中心（5 套完整页面，可顺序浏览）
open preview/mobile.html     # 移动端预览（建议浏览器设备模式）
open preview/manual.html     # 总览手册（打印 → 另存 PDF）

# 前端封装库（Vite + React + Arco）
cd frontend-app
npm install
npm run dev            # http://localhost:3081（GmButton/GmStatusTag/领域组件演示）
npm run gm:typecheck   # 封装层类型检查
npm run build          # 应用构建

# 导出总览手册 PDF（本机需安装 Google Chrome）
bash scripts/print-manual.sh
```

**贡献约定**
1. 新增组件/状态/词：先登记 [00](00-组件总目录.md) + [14](14-命名与术语规范.md)/[15](15-妇幼业务词库与状态大典.md)，再产出设计稿/代码；
2. 图标新语义走 [09 · 9.6](09-图标库规范.md) 流程，并同步 `icons/lg-icons.svg` 与计数（README / 09 / 16）；
3. 预览与示例页用色只用六语义 + 品牌 Token（02.9/12.3），禁止发明新色；
4. 推送前跑 CI：文档链接检查 + 封装层 typecheck（`.github/workflows/ci.yml`）；
5. 版本与变更记录写入 [CHANGELOG.md](CHANGELOG.md)，README「版本记录」同步。

---
---

## 版本记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| V1.0 | — | 首版（液态玻璃引擎）：DNA、Token、组件、数据可视化、AI Prompt 库、预览页 |
| V2.0 | — | 品牌化：命名「妈咪好 GoodMom」、蜜桃粉主色+淡紫柔光、品牌 Token（02.9/12）、妇幼领域组件（13）、母婴图标（09 B）、双端预览换肤 |
| V2.1 | — | 全系统优化：名称/版本/域示例清扫（04/05/08/09/10）、示例中心 5 页、状态样式库 v2、五色分级、图标 77/10 类、前端封装骨架（16） |
| V2.2 | — | 首页专业包装（分组菜单/速览条/三步指南）、打印版总览手册、README 交付统计与架构、仓库初始化（.gitignore/LICENSE/CHANGELOG） |
| V2.3 | — | 网站整合：主站用户旅程+目录+统一页脚；导航 GitHub 开源入口；示例中心扩至 7 页（PC 工作站/孕妇档案）；Logo 全局接入；视觉与文档一致性同步 |
