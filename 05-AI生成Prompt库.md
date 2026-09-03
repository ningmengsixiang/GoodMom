# 05 · AI 生成 Prompt 库

> 直接复制使用。通用底座 + 行业场景 + 负面提示词三段组合；如需"图生图"，把 [视觉预览页](preview/index.html) 或参考图拖给 AI，并附加一句 `keep the same glass material, warm ivory background, purple cyan ambient glow and floating UI style`。
> 提示词默认英文（主流文生图模型对英文理解最稳），中文说明写在注释里，复制时不包含 `<!-- -->` 注释。

---

## 5.1 出图参数建议

```text
大屏 / Dashboard:  --ar 16:9（建议 3840×2160 或先出 1536×864 再放大）
Web 界面:          --ar 16:10 或 16:9
App 界面:          --ar 9:16（多屏拼接时保持同一底色与光斑位置）
模型:             Midjourney v6 / Flux / SDXL；写实向 3D 材质优先
风格一致性:        同一项目所有图共享 5.2 风格底座 + 同一负面词；优先图生图锁定
文字策略:          大屏里的标题文字 AI 常写错 → 提示词内写明 "clean simple headline text '安全态势'"，
                  出图后对错字做局部重绘或后期替换真字
```

---

## 5.2 风格底座（Style Base，五段式中第一段，必加）

```text
Premium Liquid Glass UI design system, futuristic high-end SaaS interface,
spatial computing aesthetic, translucent glassmorphism, soft 3D interface,
floating UI components, layered depth, transparent frosted glass panels,
high-transparency acrylic material, subtle glass refraction, realistic glass edges,
soft white highlights, elegant rounded corners, floating cards, floating buttons,
translucent input fields, liquid glass icons, soft diffused shadows, ambient
cinematic lighting, subtle purple cyan pink ambient glow, warm ivory background,
neutral premium color palette, sophisticated minimal interface, clean typography,
generous whitespace, precise visual hierarchy, elegant modern product design,
Apple-inspired spatial UI aesthetic, premium fintech/productivity software
visual language, soft volumetric lighting, realistic material rendering,
delicate reflections, subtle depth of field, extremely polished UI, clean and
sophisticated, no clutter
```

> 这一段是"不改的 DNA"。行业大屏 = 风格底座 + 场景块 + 负面词；单卡/图标素材 = 风格底座 + 素材块 + 负面词。

---

## 5.3 大屏 Master：Liquid Glass Command Center（通用总览）

```text
Ultra-premium futuristic Liquid Glass Command Center dashboard, large-scale
enterprise data visualization interface, spatial glass operating system,
transparent floating glass panels, layered translucent UI, soft 3D glass
components, liquid glass buttons, liquid glass icons, holographic data
visualization, elegant real-time charts, server monitoring, cloud infrastructure,
cybersecurity visualization, AI data analytics, network topology, system status,
floating KPI cards, transparent data panels, glass navigation system, subtle
purple cyan blue gradients, warm neutral background, cinematic ambient lighting,
soft volumetric glow, realistic glass refraction, high-quality reflections,
ultra-soft shadows, premium enterprise software aesthetic, Apple Vision Pro
inspired spatial interface, minimal sophisticated composition, extremely clean
typography, high information density but visually organized, 8K, ultra detailed,
photorealistic material rendering, professional enterprise dashboard design
```

---

## 5.4 行业大屏 Prompt

### 5.4.1 网络安全态势大屏（通用示例 · 妇幼语境用 13.6 GoodMom Prompt 映射指标）

```text
【风格底座】above a cybersecurity situation awareness command center for an
enterprise, main KPI "blocked attacks" as a large purple glass number card,
real-time attack trend area chart in purple with soft red alert highlights,
world map with soft glowing purple hotspots and glass nodes, attack topology
diagram with frosted glass server nodes and flowing active-threat lines in
purple with white cores, threat event realtime stream list with green red purple
status dots, asset risk donut chart, floating KPI cards showing incidents
detected / blocked / high-risk assets, left glass navigation rail with shield
and lock liquid glass icons, balanced and organized layout, 12-column grid,
roomy spacing,【画面比例 16:9】；负面词见 5.7
```

> 使用说明：把「【风格底座】」替换为 5.2 完整段落；保留本段英文作为场景描述。下同。

### 5.4.2 云服务器 / 云资源监控大屏

```text
【风格底座】above a cloud infrastructure monitoring command center,
resource overview row with 4 glass KPI cards (instances, online rate, average
load, monthly cost), CPU and memory usage donut charts in cyan and blue,
server instance table in translucent glass rows with online offline alert
status badges, load trend smooth area charts in cyan, network traffic topology
with regional glass nodes and bandwidth lines, auto-scaling dashed forecast
line, bottom full-width alert stream with glass chips and a purple action
button, cyan blue ambient glow accents, cool but warm-neutral background,
organized enterprise dashboard, 16:9；负面词见 5.7
```

### 5.4.3 软件工厂 / 研发效能大屏（DevOps / Software Factory）

```text
【风格底座】above a software factory DevOps analytics dashboard, top funnel
row of 4 glass KPI cards (demand throughput, defect rate, deploy frequency,
change failure rate), CI/CD pipeline execution state as segmented glass bars
with green success red failed purple running status dots, cumulative flow
diagram area chart in purple, release frequency rounded bar chart in cyan,
demand throughput smooth line chart in purple, code quality radar chart,
bottom event stream of failed pipelines with team member avatars and service
chips, purple cyan gradient ambient accents, warm neutral ivory background,
clean organized premium enterprise dashboard, 16:9；负面词见 5.7
```

### 5.4.4 通用 Web / App SaaS 界面

```text
Premium Liquid Glass UI design system【风格底座】above a high-end SaaS
product web application screen, glass top navigation bar with search field
and avatar, floating glass cards, purple primary button and cyan secondary
button, translucent form inputs, liquid glass 3D icons, glass sidebar
navigation with purple gradient active item, warm ivory background with soft
purple cyan pink ambient light blobs, generous whitespace, elegant typography,
precise hierarchy, Apple Vision Pro inspired spatial UI, clean minimal premium
look, UI design, 16:10；负面词见 5.7
```

---

## 5.5 单组件 / 素材 Prompt（供 Figma 与素材库使用）

### 玻璃卡片组

```text
【风格底座】above a UI kit sheet of floating frosted glass cards on warm ivory
background, rounded 28px corners, translucent white glass with subtle purple
cyan inner refraction, thin white borders, soft diffused shadows, one KPI card
with large purple number, one area chart card, one settings glass card with
glass toggle and glass input, even spacing, flat front view, high detail,
clean, no text artifacts
```

### 液态玻璃 3D 图标（单体）

```text
A single liquid glass icon of [云服务器/盾牌/数据库/星芒AI], soft 3D,
translucent frosted glass material, rounded shapes, white glossy highlight on
top-left, subtle purple and cyan inner refraction, thin white outline, soft
floating shadow, warm ivory background, premium Apple-like spatial UI,
minimalist, high detail, no text, no neon
```

### 玻璃导航 / 仪表板外壳（不含数据细节，用作底稿）

```text
【风格底座】above an empty floating glass dashboard shell wireframe, only
glass containers and layout: one large central panel, three left column cards,
right column with a tall event-feed card, top glass bar, left glass icon rail,
no text, no charts inside, soft ambient glow, front view, symmetrical
```

---

## 5.6 出图技巧

1. **先壳后肉**：先出"空壳版式"（5.5 第三段），再分别出 KPI、图表、图标素材，最后拼贴——比一次出整屏更容易保证文字与版式干净。
2. **锁定底色**：所有图使用同一条 `warm ivory background` 与同一光斑描述，拼屏才不会"跳色"。
3. **图生图锁风格**：第一张满意后，后续全部以它为参考，prompt 只需改场景名词。
4. **文字后期**：AI 出图标题若有错字，用"局部重绘"(inpaint) 只改文字区域，或导出后在 Figma/PS 覆盖真实字体。
5. **参数**：Midjourney 建议 `--style raw` 减少装饰溢出 + 5.7 负面词；Flux/SDXL 用 CFG 3.5–5。

---

## 5.7 负面提示词（Negative Prompt，所有图必带）

```text
No cyberpunk, no excessive neon, no black background, no dark sci-fi interface,
no gaming UI, no excessive glowing, no hard shadows, no sharp corners, no flat
UI, no ordinary card layout, no generic dashboard, no excessive gradients,
no excessive glass transparency, no metallic interface, no chrome material,
no clutter, no dense text, no tiny unreadable typography, no distorted text,
no random icons, no low-quality 3D, no cartoon style, no childish design,
no excessive decorative elements, no traditional enterprise software aesthetic,
no watermark, no signature, no text errors
```

中文速记版（写入模型负面栏）：

```text
赛博朋克、霓虹、黑底、科幻暗黑、游戏UI、过度发光、硬阴影、锐角、扁平、
普通卡片布局、千篇一律仪表盘、过度渐变、过度玻璃、金属镀铬、杂乱、密排文字、
不可读小字、错乱文字、乱放图标、劣质3D、卡通幼稚、过度装饰、传统企业软件风、水印
```

---

## 5.8 AI 前端 / 编码实现指令（复制给 AI 程序员）

```text
请按照以下设计系统实现页面：背景使用暖象牙 #E6D9D0 到米色 #D7C5BC 的柔和渐变，
叠加 4 个极淡 radial 光斑（紫 rgba(154,120,255,.22)、青 rgba(114,221,229,.20)、
粉 rgba(245,184,198,.18)、白高光），全部使用 --lg-glow-* 数值。
先建立 02 章附录的 CSS 变量 :root 块，再实现：L1 主玻璃面板
(backdrop-filter: blur(48px) saturate(1.2); background 半透明白 0.14;
border 1px rgba(255,255,255,.45); inset 顶部高光; 圆角 40px)、L2 玻璃卡片
(blur 32px, 填充 0.22, 圆角 22px, 阴影 0 8px 24px rgba(58,52,84,.08))、
紫色渐变主按钮(135deg #A98BFF→#7D66F2, hover 加紫色辉光并浮起1px)、
青色次按钮、玻璃输入框(内阴影嵌合感)。图表遵循数据色序 紫#9A78FF → 青#72DDE5
→ 蓝#7D8CFF，数字使用 tabular-nums。禁止黑背景、霓虹、硬阴影、直角。
```

---

## 5.9 快捷复制模板（填空式）

```text
【画面类型】大屏总览 / 数据安全 / 云监控 / 软件工厂 / SaaS 界面 / 单卡 / 单图标
【行业词汇】__________________________________（例：网络攻击拦截、GPU 集群、缺陷密度）
【主色侧重】紫 / 青 / 蓝 / 混合（决定图表主序列颜色描述）
【标题文字】__________________________________（写真实要用的标题，出图后核对）
```

组合公式：`风格底座(5.2) + 场景描述 + 负面词(5.7) + 比例参数(5.1)`。
