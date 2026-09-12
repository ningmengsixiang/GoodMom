# 02 · Token 规范（Design Tokens）

> 本系统所有尺寸、颜色、材质、阴影都以 **Token** 管理。Token 命名统一小写 kebab-case，前缀 `lg-`；Figma 中对应样式前缀 `LG /`。
> 文末附**可直接复制的前端 CSS 变量**。

**命名规范示例**

```text
CSS:      --lg-color-purple-500 / --lg-glass-card / --lg-radius-card
Figma:    LG / Color / Purple / 500
           LG / Glass / Card
           LG / Radius / Card
           LG / Shadow / Md
           LG / Type / Title
```

**色彩使用总原则**

> 底色只使用暖中性；彩色只作为 ①按钮等强调 ②图表数据 ③环境光 ④状态色 出现。大面积彩色背景一律禁止。

---

## 2.1 颜色 Token

### 2.1.1 中性底色（Surface & Text Neutrals）

| Token | Hex | 用途 |
| --- | --- | --- |
| `--lg-warm-white` | `#F4F0EC` | 屏幕最亮层、高亮背景、玻璃内亮色填充 |
| `--lg-warm-ivory` | `#E6D9D0` | **页面主背景**（Warm Ivory） |
| `--lg-soft-beige` | `#D7C5BC` | 次级环境色、玻璃下氛围色斑（Soft Beige） |
| `--lg-cool-gray` | `#4F5B6E` | 次级文字、弱图标、注释（Cool Gray） |
| `--lg-deep-slate` | `#343A46` | **主文字、最深元素**（Deep Slate） |

**文本语义色**（浅底玻璃上）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--lg-text-primary` | `#343A46` | 标题 / 正文（对比度最高） |
| `--lg-text-secondary` | `#4F5B6E` | 次级文字 |
| `--lg-text-tertiary` | `#9AA2B0`（建议值） | 辅助说明 / 时间戳 / 弱标签 |
| `--lg-text-placeholder` | `rgba(88,98,115,0.5)` | 输入框占位符 |
| `--lg-text-disabled` | `rgba(88,98,115,0.4)` | 禁用态文字 |
| `--lg-text-on-accent` | `#343A46` | 彩色强调底（主行动档亮粉）上的文字。**D9 裁定**：亮粉底必须配深字，白字实测仅 2.46–2.9:1 不达 AA。暗色档 `#1B1A21` |
| `--lg-divider` | `rgba(58,52,84,0.10)` | 分隔线 / 表格行线 |

> 无障碍底线（WCAG 2.2 AA，D2 裁决）：主文字对比度 ≥7:1（`#343A46` on `#E6D9D0` 实测 8.26:1）；次级 `#4F5B6E` 实测 4.46:1，仅可用于大字号/图形伴文，正文级一律用主文字；三级 `#9AA2B0` 仅用于 ≥24px 常规或 ≥18.66px 加粗的辅助展示且永不作可点击主标签——小字号辅助改回次级色。

### 2.1.2 主色：Liquid Purple（液态紫）

| Token | Hex | 用途 |
| --- | --- | --- |
| `--lg-purple-600` | `#8066F0` | 渐变深端、按下态、深色图表元素 |
| `--lg-purple-500` | `#9A78FF` | **主紫（品牌主色）** |
| `--lg-purple-300` | `#B69AFF` | 亮紫（浅底图形、高亮描边） |
| `--lg-purple-200` | `#D9CBFE`（建议值） | 图表次级、紫色芯片底 |
| `--lg-purple-100` | `#EDE7FE`（建议值） | 选中态洗色底、标签底 |

### 2.1.3 辅色：Liquid Cyan / Blue

| Token | Hex | 用途 |
| --- | --- | --- |
| `--lg-cyan-600` | `#69D8D2` | 深青（强调字、描边） |
| `--lg-cyan-500` | `#72DDE5` | **主青** |
| `--lg-cyan-300` | `#A5F1EE` | 亮青（图表、高光） |
| `--lg-cyan-100` | `#E0F8F6`（建议值） | 青色洗色底 |
| `--lg-blue-600` | `#6D9EFF` | 深蓝 |
| `--lg-blue-500` | `#7D8CFF` | **主蓝** |
| `--lg-blue-300` | `#9CAEFF` | 亮蓝（图表、链接高亮） |
| `--lg-blue-100` | `#E4EAFF`（建议值） | 蓝色洗色底 |

### 2.1.4 点缀：Liquid Pink / Peach（仅环境光与点缀）

| Token | Hex | 用途 |
| --- | --- | --- |
| `--lg-pink-500` | `#F2A5B7` | 深粉（极少量图表） |
| `--lg-pink-400` | `#F5B8C6` | 主粉 |
| `--lg-pink-300` | `#FFD0D8` | 亮粉（氛围光） |
| `--lg-pink-100` | `#FDE9EE`（建议值） | 洗色底 |
| `--lg-peach-500` | `#F0AE86`（建议值） | 深蜜桃 |
| `--lg-peach-400` | `#F6C0A0`（建议值） | 主蜜桃 |
| `--lg-peach-300` | `#FBD9BE`（建议值） | 亮蜜桃（氛围光） |

> 粉色与蜜桃原则上**只出现在背景环境光斑、渐变衔接、图表序列末端**，不进入大面积 UI。

### 2.1.5 状态色（Liquid-tuned Status）

为保持暖调统一，状态色做「降低饱和、去荧光」处理，禁止纯色 `#FF0000` 类。

| Token | Hex | 用途 |
| --- | --- | --- |
| `--lg-success-500` | `#42C7A1` | 成功 / 在线 / 通过 |
| `--lg-success-300` | `#96E6CF` | 成功浅色填充 |
| `--lg-warning-500` | `#F2B25C` | 警告 / 待处理 |
| `--lg-warning-300` | `#FAE1B3` | 警告浅色填充 |
| `--lg-danger-500` | `#EF6A7B` | 危险 / 故障 / 拦截 |
| `--lg-danger-300` | `#FAC9D0` | 危险浅色填充 |
| `--lg-info-500` | `#6D9EFF` | 信息 / 中性提示（复用蓝色） |

> 用途分层：上述 `-500` 为**填充 / 色块 / 图表强调档**；状态「文字 / 色点 / 标签」统一走 [14 · 4.4.5](14-命名与术语规范.md) 的语义 alias 深色 `--lg-sem-*`（浅底 ≥4.5:1）。

### 2.1.6 数据可视化色序（Categorical Series）

用于图表数据序列，**顺序固定**，全系统统一：

```text
1  Purple-500  #9A78FF   ← 首选 / 主角序列
2  Cyan-500    #72DDE5
3  Blue-500    #7D8CFF
4  Pink-400    #F5B8C6
5  Peach-400   #F6C0A0
6  Purple-600  #8066F0
7  Cyan-300    #A5F1EE
8  Slate-300   #A6ADB9（"其他 / 合计" 灰）
```

> 超过 8 个序列：先循环 1–8，再用同一色相的 300 / 600 级变化扩展。禁止引入色相系统之外的随机色。
> 大屏主 KPI 永远用 Purple 或数值对应状态色，青色只作辅。

### 2.1.7 环境光（Ambient Glow，背景氛围专用）

背景由「暖色底 + 漫射光斑」合成。光斑永远是**径向渐变 + 大模糊 + 低透明度**：

| Token | 值（建议） | 用途 |
| --- | --- | --- |
| `--lg-glow-purple` | `radial-gradient(closest-side, rgba(154,120,255,0.22), transparent 70%)` | 右上 / 主视觉后方 |
| `--lg-glow-cyan` | `radial-gradient(closest-side, rgba(114,221,229,0.20), transparent 70%)` | 左下 / 对侧平衡 |
| `--lg-glow-pink` | `radial-gradient(closest-side, rgba(245,184,198,0.18), transparent 70%)` | 中下 / 顶部小面积 |
| `--lg-glow-peach` | `radial-gradient(closest-side, rgba(246,192,160,0.16), transparent 70%)` | 视作补光 |
| `--lg-glow-white` | `radial-gradient(closest-side, rgba(255,255,255,0.6), transparent 70%)` | 高光补光（左上） |

### 2.1.8 渐变（Liquid Gradient）

| Token | 定义 | 用途 |
| --- | --- | --- |
| `--lg-grad-primary` | `linear-gradient(135deg, #A98BFF 0%, #9A78FF 45%, #7D66F2 100%)` | 主按钮、选中态、主强调 |
| `--lg-grad-cyan` | `linear-gradient(135deg, #A5F1EE 0%, #72DDE5 100%)` | 次按钮、高亮 |
| `--lg-grad-hero` | `linear-gradient(120deg, #F5B8C6 0%, #9A78FF 50%, #72DDE5 100%)` | 品牌渐变流（签名氛围、图表主描边、Hero） |
| `--lg-grad-slate` | `linear-gradient(180deg, rgba(255,255,255,0.85), rgba(244,240,236,0.6))` | 玻璃面自身明暗塑形 |
| `--lg-grad-glass-highlight` | `linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 50%)` | 叠加在玻璃面板顶部的白色高光 |

### 2.1.9 暗黑模式（Dark Mode）色彩映射

> 启用方式：在需要暗色的**任意容器根**加 `data-theme="dark"`（机制同 `theme.css`），变量在该子树内重定义——浅色主视觉与页面壳不受影响，支持局部暗色卡/暗色弹层。
> 定位：暗色不是「反色」也不是「纯黑」，是**夜间暖石板（Night Slate）**——保留暖调牌性与玻璃体积感，只把照明换成「低照度冷侧光」。

**三条硬口径**

1. **禁纯黑 `#000000`、禁纯白 `#FFFFFF`**：底色走 `--lg-night-*`（`#1B1A21` / `#23222A`），文字走 `#F3EFEC`。纯黑会让玻璃下的光斑变成脏灰，纯白在暗底上产生光晕（halation）。
2. **玻璃降白、加深底、提亮边**：白色叠加层由 14–60% 降到 6–16%；玻璃边缘光保留但只留顶部 1px（`inset 0 1px 0 rgba(255,255,255,.16)`），多层高光会让面板发灰。
3. **只换档位、不换色相**：品牌与状态色沿用原色相，文字档改用浅档（浅底用 `-500`、暗底用 `-300`），禁止在暗色下新造色相或提高饱和度。

**映射表 A · 底 / 文字 / 玻璃 / 阴影**

| 语义 Token | 浅色（默认） | 暗色（`[data-theme="dark"]`） | 暗底实测对比度 |
| --- | --- | --- | --- |
| `--lg-page-bg` | `#E6D9D0` Warm Ivory | `#1B1A21` Night-900 | — （页面底） |
| `--lg-surface` | `#F4F0EC` Warm White | `#23222A` Night-800 | — （次级面/实底浮层底） |
| `--lg-text-primary` | `#343A46` | `#F3EFEC` | 15.10:1（面 13.77） |
| `--lg-text-secondary` | `#4F5B6E` | `#C9C4CE` | 10.09:1（面 9.20） |
| `--lg-text-tertiary` | `#9AA2B0` | `#A6ADB9` | 7.65:1（最浅玻璃合成面 ≥5.6） |
| `--lg-text-placeholder` | `rgba(88,98,115,0.5)` | `rgba(255,255,255,0.42)` | 仅占位符，不接受为正文 |
| `--lg-text-disabled` | `rgba(88,98,115,0.4)` | `rgba(255,255,255,0.34)` | — |
| `--lg-divider` | `rgba(58,52,84,0.10)` | `rgba(255,255,255,0.10)` | 暗色分隔线用白，不用黑 |
| `--lg-link` | `#B23A63` | `#FFC4D6` | 11.61:1（03 · 3.10） |
| 主行动底（`--mmh-grad-action-hc`） | Rose-300→Rose-500 | **不变** | 品牌亮粉底在暗色下更突出 |
| `--lg-text-on-accent` | `#343A46`（亮粉底深字） | `#1B1A21` | 7.00:1（Rose-500 端）～11.61:1（Rose-300 端） |
| `--lg-glass-panel` | `rgba(255,255,255,0.14)` | `rgba(255,255,255,0.06)` | — |
| `--lg-glass-card` | `rgba(255,255,255,0.22)` | `rgba(255,255,255,0.09)` | — |
| `--lg-glass-control` | `rgba(255,255,255,0.35)` | `rgba(255,255,255,0.12)` | — |
| `--lg-glass-popover` | `rgba(255,255,255,0.60)` | `rgba(38,36,46,0.92)`（实底为主，模糊为辅） | 暗色浮层优先可读性 |
| `--lg-glass-highlight` | `inset 0 1px 0 rgba(255,255,255,0.6)` | `inset 0 1px 0 rgba(255,255,255,0.16)` | 仅顶部 1px |
| `--lg-border-white-70`（玻璃边） | `rgba(255,255,255,0.70)` | `rgba(255,255,255,0.14)` | — |
| `--lg-border-hairline` | `1px`（**长度**） | 同（宽度档不随主题变化） | 玻璃内部细分隔**宽度** |
| `--lg-divider-hairline` | `rgba(58,52,84,.10)`（**颜色**） | `rgba(255,255,255,.10)` | 与上一项配对使用的分隔**颜色** |
| `--lg-shadow-sm/md/lg/xl` | 蓝紫调 `rgba(58,52,84,.06–.16)` | `rgba(0,0,0,.35 / .42 / .50 / .58)` | 暗色阴影＝「加深 + 边缘光」 |
| `--lg-glow-purple-soft` | `0 12px 32px rgba(154,120,255,0.28)` | `0 12px 32px rgba(154,120,255,0.22)` | 暗底辉光略降，避免糊成一片 |

**映射表 B · 状态与语义色（暗色文字档）**

| 用途 | 浅底用（默认） | 暗底用（dark） | 暗底实测 |
| --- | --- | --- | --- |
| 成功 `--lg-success-300` | `#96E6CF`（浅填充） | `#96E6CF` 作文/图标 | 11.93:1 |
| 警告 `--lg-warning-300` | `#FAE1B3` | `#FAE1B3` | 13.55:1 |
| 危险 `--lg-danger-300` | `#FAC9D0` | `#FAC9D0` | 11.78:1 |
| 信息 `--lg-info-500` 亮档 | `#6D9EFF` | `#9CAEFF`（Blue-300） | 8.15:1 |
| `--lg-sem-positive` | `#2F8F76` | `#6FC9B4` | 8.79:1 |
| `--lg-sem-info` | `#4A76D0` | `#9CAEFF` | 8.15:1 |
| `--lg-sem-attention` | `#B9771C` | `#F2C14E` | 10.29:1 |
| `--lg-sem-risk` | `#D35466` | `#F79AA8` | 8.34:1 |
| `--lg-sem-neutral` | `#757E8E` | `#A6ADB9` | 7.65:1 |
| `--lg-sem-special` | `#7A5CE0` | `#B9A0FF` | 7.84:1 |

**暗色下的三条落地纪律**

- **环境光**：光斑透明度维持 16–22%，半径放大 1.2×（暗底吃光）；`--lg-glow-white` 降到 0.06，否则暗底白光发灰。
- **数据可视化**：色序 1–8 顺序不变；折线/柱保持 `-500` 档（暗底足够亮），网格线用 `rgba(255,255,255,0.08)`，坐标文字用 `--lg-text-secondary`；面积图填充透明度由 0.28 提到 0.34。
- **禁用与遮罩**：遮罩沿用 `--lg-opacity-overlay` 白色口径会「亮瞎」，暗色改为 `rgba(0,0,0,0.48)`；禁用态整体透明度由 0.4 提到 0.5（暗底本就低对比）。

> 实测口径：上表对比度按 WCAG 2.2 相对亮度公式计算（`scripts/audit.py` 的 `dark_contrast` 守门，正文项 <4.5:1 即 FAIL）；最坏情形取「12% 白玻璃合成面」，正文/次级/三级全部 ≥4.5:1。

---

## 2.2 字体 Token

### 2.2.1 字体栈

```text
英文：Inter（首选）、SF Pro Display / SF Pro Text、Helvetica Neue
中文：PingFang SC（首选）、MiSans、HarmonyOS Sans、Noto Sans SC
数字：与正文同字体，但强制 tabular-nums（等宽数字）用于 KPI 与图表
```

CSS：

```css
--lg-font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont,
                "PingFang SC", "MiSans", "HarmonyOS Sans", "Noto Sans SC",
                "Helvetica Neue", sans-serif;
--lg-font-numeric: inherit; /* 配合 font-variant-numeric: tabular-nums 使用 */
```

> 禁用过重黑体 / 标题黑；字重上限 700 且仅大屏首屏主标题可用，常规标题 ≤600。

### 2.2.2 字号层级（Type Scale）

| Token | 字号 / 行高 | 字重 | 场景 |
| --- | --- | --- | --- |
| `--lg-type-display-lg` | 40 / 48 | 600–700 | 大屏首屏主标题、超大 KPI 数字旁注 |
| `--lg-type-display` | 32 / 40 | 600 | 页面 / 大屏主标题 |
| `--lg-type-title` | 24 / 32 | 600 | 面板标题、页级标题 |
| `--lg-type-section` | 18 / 26 | 600 | 区块标题 |
| `--lg-type-body` | 15 / 22 | 400–500 | 正文（默认） |
| `--lg-type-body-sm` | 14 / 20 | 400 | 次级正文、表格正文 |
| `--lg-type-caption` | 12 / 16 | 400 | 辅助说明、轴标签、徽章 |

### 2.2.3 数字与 KPI

| Token | 字号 / 行高 | 字重 | 用途 |
| --- | --- | --- | --- |
| `--lg-num-xl` | 56 / 64（大屏）/ 40 / 48（界面） | 600–700 | 总览核心 KPI |
| `--lg-num-lg` | 32 / 40 | 600 | 卡片主数值 |
| `--lg-num-md` | 24 / 32 | 600 | 次级指标 |
| `--lg-num-sm` | 16 / 22 | 600 | 小指标、变化率 |

要求：KPI 数字 `font-variant-numeric: tabular-nums`，单位与变化率用 `--lg-type-caption` + 次级色并排，单位不缩小主数字。

### 2.2.4 字重 / 字距 / 断行

```text
字重：--lg-weight-regular 400 / --lg-weight-medium 500 / --lg-weight-semibold 600 / --lg-weight-bold 700
字距：display -0.02em；title -0.01em；正文 0；数字 0.01em
行高：正文 1.45–1.5；中文标题 1.3–1.4
```

---

## 2.3 间距 Token

### 2.3.1 基础刻度（4px 基准网格）

| Token | 值 | | Token | 值 |
| --- | --- | --- | --- | --- |
| `--lg-space-0` | 0 | | `--lg-space-6` | 24 |
| `--lg-space-1` | 4 | | `--lg-space-7` | 32 |
| `--lg-space-2` | 8 | | `--lg-space-8` | 40 |
| `--lg-space-3` | 12 | | `--lg-space-9` | 48 |
| `--lg-space-4` | 16 | | `--lg-space-10` | 64 |
| `--lg-space-5` | 20 | | `--lg-space-11` | 96 |

### 2.3.2 语义间距

| Token | 值 | 用途 |
| --- | --- | --- |
| `--lg-gutter-page` | 40（桌面）/ 24（移动） | 页面左右留白 |
| `--lg-gap-panel` | 24 | 面板之间 |
| `--lg-gap-card` | 16 | 卡片之间 |
| `--lg-pad-panel` | 24 | 玻璃面板内边距 |
| `--lg-pad-card` | 20–24 | 卡片内边距 |
| `--lg-pad-compact` | 12–16 | 紧凑控件内边距 |
| `--lg-stack-section` | 32–40 | 区块纵向间距 |

> 大屏（远距观看）建议整体内边距与字号 ×1.15–1.25；网格列数 12，栅栏间隙 24。控件最小可点区域 ≥44×44（移动/触屏基准）；桌面鼠标场景允许 ≥40；关键按钮 ≥48。

---

## 2.4 圆角 Token

**总原则：一切皆圆；层级越高圆角可略小，但永不出现 <16px 的交互组件圆角。**

| Token | 值 | 对象 |
| --- | --- | --- |
| `--lg-radius-container` | 40 | 页面主玻璃容器 / 大屏整体外框 |
| `--lg-radius-card-lg` | 28 | 大型面板 / 主 KPI 卡 |
| `--lg-radius-card` | 22 | 常规卡片 |
| `--lg-radius-control` | 20 | 输入框、下拉、搜索 |
| `--lg-radius-btn-lg` | 26 | 大按钮（h=48） |
| `--lg-radius-btn` | 22 | 中按钮（h=40） |
| `--lg-radius-btn-sm` | 18 | 小按钮（h=32） |
| `--lg-radius-chip` | 999 | 徽章 / 标签 / 开关 |
| `--lg-radius-round` | 50% | 圆形图标按钮、头像 |

---

## 2.5 玻璃材质 Token（Glass）

玻璃 = `半透明白填充 + backdrop 模糊 + 1px 白色描边 + 顶部内侧高光 + 色相阴影`。用「层级不透明度」区分空间深度：

| Token | 填充 | Blur | 描边 | 用途（对应层级） |
| --- | --- | --- | --- | --- |
| `--lg-glass-backdrop` | — | — | — | 页面环境层（暖底+光斑） |
| `--lg-glass-panel` | `rgba(255,255,255,0.14)` | 48px | `rgba(255,255,255,0.45)` | L1 主玻璃面板 |
| `--lg-glass-card` | `rgba(255,255,255,0.22)` | 32px | `rgba(255,255,255,0.55)` | L2 卡片 / 图表面板 |
| `--lg-glass-control` | `rgba(255,255,255,0.35)` | 20px | `rgba(255,255,255,0.70)` | L3 按钮 / 输入 / 开关 |
| `--lg-glass-popover` | `rgba(255,255,255,0.60)` | 40px | `rgba(255,255,255,0.85)` | L4 弹层 / 侧栏 / 顶部导航 |

配套材质变量：

```text
--lg-glass-saturate: saturate(1.2)          /* backdrop-filter 轻微增饱和，模拟折射 */
--lg-glass-highlight: inset 0 1px 0 rgba(255,255,255,0.6)   /* 顶部高光（L4 视觉） */
--lg-glass-tint-purple: rgba(154,120,255,0.05)  /* 可选折射染色：冷色面板使用 */
--lg-glass-tint-cyan:   rgba(114,221,229,0.05)  /* 可选折射染色：暖/紫面板边缘 */
--lg-border-white-45/55/70/85: 1px 白色描边（对应上表）
--lg-border-hairline: 1px;                    /* 宽度 */
--lg-divider-hairline: rgba(58,52,84,.10);    /* 颜色：border 写法为 `border:var(--lg-border-hairline) solid var(--lg-divider-hairline)` */
```

**组合公式（推荐实现）**

```css
.glass-panel {
  background: linear-gradient(160deg, rgba(255,255,255,0.30), rgba(255,255,255,0.10) 55%, rgba(255,255,255,0.16));
  -webkit-backdrop-filter: blur(48px) saturate(1.2);
  backdrop-filter: blur(48px) saturate(1.2);
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.60), var(--lg-shadow-md);
  border-radius: var(--lg-radius-container);
}
```

> 落地细节：浅色底上的玻璃模糊几乎不可见时，**保留 2–4% 的彩色光斑在面板之下**（`--lg-glow-*`），模糊才有意义；必要时给面板加 3–5% 的紫色调折射染色提升质感。

---

## 2.6 阴影 Token（Shadow）

**规则：无纯黑、无硬边、多层、带蓝紫调中性色 `rgba(58,52,84,α)`。**

| Token | 值 | 用途 |
| --- | --- | --- |
| `--lg-shadow-xs` | `0 1px 2px rgba(58,52,84,0.04), 0 2px 8px rgba(58,52,84,0.05)` | 贴地元素 / 输入框内阴 |
| `--lg-shadow-sm` | `0 4px 12px rgba(58,52,84,0.06)` | L1 玻璃面板 |
| `--lg-shadow-md` | `0 8px 24px rgba(58,52,84,0.08), 0 2px 6px rgba(58,52,84,0.05)` | L2 悬浮卡片 |
| `--lg-shadow-lg` | `0 16px 40px rgba(58,52,84,0.12), 0 4px 12px rgba(58,52,84,0.05)` | L3 控件 / hover 浮起 |
| `--lg-shadow-xl` | `0 32px 80px rgba(58,52,84,0.16), 0 8px 24px rgba(58,52,84,0.06)` | L4 弹层 / 侧栏 |
| `--lg-glow-purple-soft` | `0 12px 32px rgba(154,120,255,0.28)` | 主按钮 / 选中项辉光 |
| `--lg-glow-cyan-soft` | `0 12px 32px rgba(114,221,229,0.22)` | 青次按钮 / 在线状态辉光 |
| `--lg-shadow-inset-top` | `inset 0 1px 0 rgba(255,255,255,0.5)` | 玻璃顶部高光（并入 glass） |

> 阴影只负责「浮起感」，透明度和色相是灵魂：宁可浅到看不见，不可深到像贴纸。

---

## 2.7 其他 Token

### 2.7.1 边框宽度档（Border Width & Focus Ring）

边框宽度**只有 4 档 + 焦点环一套**，与圆角（2.4）、玻璃边（2.5）配套使用：

| Token | 值 | 用途 |
| --- | --- | --- |
| `--lg-border-hairline` | `1px` | 分隔线**宽度**（配合 `--lg-divider-hairline` 颜色） |
| `--lg-divider-hairline` | `rgba(58,52,84,.10)` | 分隔线**颜色**（暗色档 `rgba(255,255,255,.10)`） |
| `--lg-border-half` | `0.5px` | 仅 DPR≥2 高分屏的密集细线（浏览器自动对齐物理像素） |
| `--lg-border-1` | `1px` | **默认描边**：玻璃面板、卡片、输入框、芯片、按钮（描边型） |
| `--lg-border-2` | `1.5px` | 强调描边：选中态、拖拽放置区、进度槽 |
| `--lg-border-3` | `2px` | 强强调：焦点环内圈、选中指示条、分段滑块边 |
| `--lg-ring-width` | `2px` | 焦点环宽度（值同 `--lg-border-3`） |
| `--lg-ring-offset` | `2px` | 焦点环与控件之间的间隙 |
| `--lg-ring-color` | `rgba(232,93,143,0.6)` | 焦点环（品牌粉 60%） |
| `--lg-ring-color-dark` | `rgba(255,196,214,0.7)` | 暗色焦点环（2.1.9） |
| `--lg-border-width` | `1px` | **兼容别名** = `--lg-border-1`（旧代码可用，新代码用档位名） |

**边框纪律**

1. **禁 3px 以上常规描边**：>2px 的边框不是「更强调」，是旧风格残留（对比度靠颜色与阴影拿，不靠加粗）。
2. **加粗不许吃布局**：hover / 选中态把描边从 1px 变 1.5px 时，必须用 `box-shadow` 或 `outline` 实现，禁止直接改 `border-width`——否则 44×44 触控目标的实测尺寸会抖动 1px，也破坏玻璃面板的对齐基线。
3. **焦点环统一写法**：`outline: var(--lg-ring-width) solid var(--lg-ring-color); outline-offset: var(--lg-ring-offset)`；禁止裸 `outline:none`（`scripts/a11y.py` 守门，必须伴 `:focus-visible` 兜底）。
4. **行线一律 hairline**：表格行线 / 列表分隔用 `1px` + `--lg-divider`；暗色下改 `rgba(255,255,255,0.08)`。
5. **暗色可见性**：1px 白 70% 的玻璃边在暗底上不可见，暗色统一降到 `rgba(255,255,255,0.14)`（见 2.1.9）。
6. **图标描边独立**：图标 `stroke-width 1.7` 属 [09](09-图标库规范.md) 章，不受本档约束。
7. **1.5px 档在高分屏才有意义**：浏览器会把 `border-width` 吸附到整设备像素——实测 DPR 1（普通显示器）下 `1.5px` 计算值即 `1px`，DPR 2（Retina）下才呈现 1.5 物理像素的细微加强。因此**强调态不得只靠加粗**，必须同时有颜色/描边色/阴影变化（`preview/patterns.html` 边框档对照为实测证据）。

### 2.7.2 模糊 / 透明度 / 层级

```text
--lg-blur-16/20/32/48/60 px        /* backdrop blur 档位 */
--lg-opacity-disabled: 0.4         /* 禁用态整体透明度（暗色 0.5，见 2.1.9） */
--lg-opacity-overlay: 0.18         /* 弹层遮罩（浅色用白；暗色改 rgba(0,0,0,.48)） */
--lg-z-backdrop: 0
--lg-z-glass: 10                   /* L1 */
--lg-z-component: 20               /* L2 */
--lg-z-control: 30                 /* L3 */
--lg-z-overlay: 40                 /* L4 */
```

---

## 2.8 附录：可直接复制的前端 CSS 变量

```css
:root {
  /* ── 颜色：中性 ─────────────────────────── */
  --lg-warm-white: #F4F0EC;
  --lg-warm-ivory: #E6D9D0;
  --lg-soft-beige: #D7C5BC;
  --lg-cool-gray: #4F5B6E;
  --lg-deep-slate: #343A46;
  --lg-text-primary: #343A46;
  --lg-text-secondary: #4F5B6E;
  --lg-text-tertiary: #9AA2B0;
  --lg-text-placeholder: rgba(88, 98, 115, .5);
  --lg-text-disabled: rgba(88, 98, 115, .4);
  --lg-text-on-accent: #343A46;   /* D9：亮粉底配深字（全尺寸 ≥4.89:1） */
  /* D5 小字号白字实底填充（AA 达标档）；完整品牌组见 §2.9 */
  --mmh-solid-positive:#1E6B52; --mmh-solid-attention:#9A5A0E; --mmh-solid-danger:#B04052;
  --mmh-solid-info:#385CB3; --mmh-solid-special:#6242B8;
  --lg-divider: rgba(58, 52, 84, .10);
  --lg-link: #B23A63;                 /* 链接默认色（03 · 3.10）；暗色 #FFC4D6 */

  /* ── 颜色：强调 ─────────────────────────── */
  --lg-purple-600: #8066F0; --lg-purple-500: #9A78FF; --lg-purple-300: #B69AFF;
  --lg-purple-200: #D9CBFE; --lg-purple-100: #EDE7FE;
  --lg-cyan-600: #69D8D2;   --lg-cyan-500: #72DDE5;   --lg-cyan-300: #A5F1EE;
  --lg-cyan-100: #E0F8F6;
  --lg-blue-600: #6D9EFF;   --lg-blue-500: #7D8CFF;   --lg-blue-300: #9CAEFF;
  --lg-blue-100: #E4EAFF;
  --lg-pink-500: #F2A5B7;   --lg-pink-400: #F5B8C6;   --lg-pink-300: #FFD0D8;
  --lg-pink-100: #FDE9EE;
  --lg-peach-500: #F0AE86;  --lg-peach-400: #F6C0A0;  --lg-peach-300: #FBD9BE;

  /* ── 颜色：状态 / 数据 ───────────────────── */
  --lg-success-500: #42C7A1; --lg-success-300: #96E6CF;
  --lg-warning-500: #F2B25C; --lg-warning-300: #FAE1B3;
  --lg-danger-500: #EF6A7B;  --lg-danger-300: #FAC9D0;
  --lg-info-500: #6D9EFF;

  /* ── 渐变 ──────────────────────────────── */
  --lg-grad-primary: linear-gradient(135deg, #A98BFF 0%, #9A78FF 45%, #7D66F2 100%);
  --lg-grad-cyan: linear-gradient(135deg, #A5F1EE 0%, #72DDE5 100%);
  --lg-grad-hero: linear-gradient(120deg, #F5B8C6 0%, #9A78FF 50%, #72DDE5 100%);
  --lg-grad-slate: linear-gradient(180deg, rgba(255,255,255,.85), rgba(244,240,236,.6));
  --lg-grad-glass-highlight: linear-gradient(160deg, rgba(255,255,255,.95), rgba(255,255,255,0) 50%);

  /* ── 字体 ──────────────────────────────── */
  --lg-font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont,
                  "PingFang SC", "MiSans", "HarmonyOS Sans", "Noto Sans SC",
                  "Helvetica Neue", sans-serif;
  --lg-weight-regular: 400; --lg-weight-medium: 500;
  --lg-weight-semibold: 600; --lg-weight-bold: 700;

  /* ── 间距 ──────────────────────────────── */
  --lg-space-1: 4px;  --lg-space-2: 8px;  --lg-space-3: 12px;
  --lg-space-4: 16px; --lg-space-5: 20px; --lg-space-6: 24px;
  --lg-space-7: 32px; --lg-space-8: 40px; --lg-space-9: 48px;
  --lg-space-10: 64px; --lg-space-11: 96px;
  --lg-gutter-page: 40px; --lg-gap-panel: 24px; --lg-gap-card: 16px;
  --lg-pad-panel: 24px; --lg-pad-card: 20px; --lg-pad-compact: 12px;

  /* ── 圆角 ──────────────────────────────── */
  --lg-radius-container: 40px; --lg-radius-card-lg: 28px; --lg-radius-card: 22px;
  --lg-radius-control: 20px; --lg-radius-btn-lg: 26px; --lg-radius-btn: 22px;
  --lg-radius-btn-sm: 18px; --lg-radius-chip: 999px; --lg-radius-round: 50%;

  /* ── 边框宽度 / 焦点环（2.7.1） ─────────── */
  --lg-border-hairline: 1px; --lg-divider-hairline: rgba(58,52,84,.10); --lg-border-half: 0.5px;
  --lg-border-1: 1px; --lg-border-2: 1.5px; --lg-border-3: 2px;
  --lg-border-width: 1px;                 /* 兼容别名 = --lg-border-1 */
  --lg-ring-width: 2px; --lg-ring-offset: 2px;
  --lg-ring-color: rgba(232,93,143,.6);
  --lg-ring-color-dark: rgba(255,196,214,.7);

  /* ── 玻璃 ──────────────────────────────── */
  --lg-glass-panel: rgba(255,255,255,.14);
  --lg-glass-card: rgba(255,255,255,.22);
  --lg-glass-control: rgba(255,255,255,.35);
  --lg-glass-popover: rgba(255,255,255,.60);
  --lg-glass-saturate: saturate(1.2);
  --lg-glass-highlight: inset 0 1px 0 rgba(255,255,255,.6);
  --lg-border-white-45: rgba(255,255,255,.45);
  --lg-border-white-55: rgba(255,255,255,.55);
  --lg-border-white-70: rgba(255,255,255,.70);
  --lg-border-white-85: rgba(255,255,255,.85);
  --lg-divider-hairline: rgba(58,52,84,.10);
  --lg-blur-16: 16px; --lg-blur-20: 20px; --lg-blur-32: 32px;
  --lg-blur-48: 48px; --lg-blur-60: 60px;

  /* ── 阴影 ──────────────────────────────── */
  --lg-shadow-xs: 0 1px 2px rgba(58,52,84,.04), 0 2px 8px rgba(58,52,84,.05);
  --lg-shadow-sm: 0 4px 12px rgba(58,52,84,.06);
  --lg-shadow-md: 0 8px 24px rgba(58,52,84,.08), 0 2px 6px rgba(58,52,84,.05);
  --lg-shadow-lg: 0 16px 40px rgba(58,52,84,.12), 0 4px 12px rgba(58,52,84,.05);
  --lg-shadow-xl: 0 32px 80px rgba(58,52,84,.16), 0 8px 24px rgba(58,52,84,.06);
  --lg-glow-purple-soft: 0 12px 32px rgba(154,120,255,.28);
  --lg-glow-cyan-soft: 0 12px 32px rgba(114,221,229,.22);
}

/* ── 暗黑模式（2.1.9）：任意容器根加 data-theme="dark" 即局部/全局切换 ── */
[data-theme="dark"] {
  /* 底与文字 */
  --lg-page-bg: #1B1A21;          --lg-surface: #23222A;
  --lg-text-primary: #F3EFEC;     --lg-text-secondary: #C9C4CE;
  --lg-text-tertiary: #A6ADB9;
  --lg-text-placeholder: rgba(255,255,255,.42);
  --lg-text-disabled: rgba(255,255,255,.34);
  --lg-text-on-accent: #1B1A21;   --lg-divider: rgba(255,255,255,.10);
  --lg-link: #FFC4D6;
  /* 玻璃（降白、只留顶部边光） */
  --lg-glass-panel: rgba(255,255,255,.06);
  --lg-glass-card: rgba(255,255,255,.09);
  --lg-glass-control: rgba(255,255,255,.12);
  --lg-glass-popover: rgba(38,36,46,.92);
  --lg-glass-highlight: inset 0 1px 0 rgba(255,255,255,.16);
  --lg-border-white-45: rgba(255,255,255,.10); --lg-border-white-55: rgba(255,255,255,.12);
  --lg-border-white-70: rgba(255,255,255,.14); --lg-border-white-85: rgba(255,255,255,.18);
  --lg-divider-hairline: rgba(255,255,255,.10);
  /* 阴影（加深 + 边缘光）/ 遮罩 / 禁用 */
  --lg-shadow-xs: 0 1px 2px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.22);
  --lg-shadow-sm: 0 4px 12px rgba(0,0,0,.35);
  --lg-shadow-md: 0 10px 28px rgba(0,0,0,.42);
  --lg-shadow-lg: 0 18px 44px rgba(0,0,0,.50);
  --lg-shadow-xl: 0 32px 80px rgba(0,0,0,.58);
  --lg-glow-purple-soft: 0 12px 32px rgba(154,120,255,.22);
  --lg-glow-cyan-soft: 0 12px 32px rgba(114,221,229,.18);
  --lg-opacity-disabled: 0.5;     --lg-opacity-overlay: 0.48; /* 暗色遮罩改黑 */
  /* 语义 alias 暗色档（暗底 ≥4.5:1，实测见 2.1.9 表 B） */
  --lg-sem-positive: #6FC9B4;     --lg-sem-info: #9CAEFF;
  --lg-sem-attention: #F2C14E;    --lg-sem-risk: #F79AA8;
  --lg-sem-neutral: #A6ADB9;      --lg-sem-special: #B9A0FF;
  --lg-ring-color: var(--lg-ring-color-dark);
}
```

> 暗色落地要点：`data-theme="dark"` 加在 `<html>` 或 **局部容器** 上；暗色下玻璃依赖的光斑透明度维持 16–22% 但半径 ×1.2；纯图/插画（`logo.png` 类位图）在暗底上需加 `filter: brightness(.94)` 压白；正式 logo 为位图，暗底上优先垫白色/玻璃底或加压白滤镜。

> 落地时注意：`backdrop-filter` 需加 `-webkit-` 前缀（Safari）；玻璃效果依赖背景中存在彩色光斑，若页面纯色背景，可在容器下加一层 `--lg-glow-*` 径向渐变节点。

---

## 2.9 附录 B · 妈咪好 GoodMom 品牌 Token

> 本设计系统服务产品 = **妈咪好 GoodMom（妇幼儿童全生命周期管理）**。在默认主题下执行 12.3.2 的语义重映射：把“紫主”视觉换为“蜜桃粉主 + 淡紫柔光”。
> 引用：品牌定义见 [12](12-妈咪好品牌与设计语言.md)，领域组件见 [13](13-妇幼领域组件规范.md)。

```css
:root{
  /* 蜜桃粉（品牌主色系） */
  --mmh-rose-700:#B23A63; --mmh-rose-600:#E85D8F; --mmh-rose-500:#F77FA3;
  --mmh-rose-400:#FFA3BE; --mmh-rose-300:#FFC4D6; --mmh-rose-200:#FFDEE8;
  --mmh-rose-100:#FFF0F4;
  /* 蜜杏氛围 */
  --mmh-peach-400:#FFC3A0; --mmh-peach-300:#FFDCC7; --mmh-peach-100:#FFF3EA;
  /* 薄荷（儿保正向） */
  --mmh-mint-600:#4FB59C; --mmh-mint-500:#6FC9B4; --mmh-mint-300:#A9E3D4; --mmh-mint-100:#E2F6F0;
  /* 品牌渐变 */
  --mmh-grad-primary:  linear-gradient(135deg,#FFA9C2 0%,#F77FA3 45%,#E85D8F 100%);
  --mmh-grad-signature:linear-gradient(120deg,#FFD0D8 0%,#F77FA3 48%,#B69AFF 100%);
  --mmh-grad-mint:     linear-gradient(135deg,#A9E3D4 0%,#6FC9B4 100%);

  /* ── D9 主行动档（高对比）─────────────────────────────────────────
     亮粉底**必须**承载深字：白字在 #F77FA3 上仅 2.46–2.9:1，不达 AA。
     引用：docs/审查决策记录.md D9；消费方 `.gm-btn.arco-btn-primary` / `.gm-btn-hc`。 */
  --mmh-grad-action-hc: linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%);
  /* 主行动档承载的文字色。**必须用它**，不要在规则里硬编码 #343A46 —
     历史上浅色档未定义此 Token、而 9 条规则硬编码了 #343A46，
     导致"改 Token 完全没效果"。见 P1-17。 */
  --lg-text-on-accent: #343A46;

  /* ── D5 小字号白字实底填充（AA 达标档）────────────────────────────
     白字压在这些实底上 ≥4.5:1；`--lg-sem-*` 是**前景**色，不可拿来当填充底。
     引用：docs/审查决策记录.md D5；Part 03 TK-03-04 / Part 04 CL-04-03 / Part 26 TC-26-03。
     历史缺陷：这两个 Token 组被多处条款强制要求，却**从未在 02 章定义**，
     按 README 步骤"复制 02 章末尾的变量块"得到的主题连品牌色都没有。 */
  --mmh-solid-positive:#1E6B52; --mmh-solid-attention:#9A5A0E; --mmh-solid-danger:#B04052;
  --mmh-solid-info:#385CB3; --mmh-solid-special:#6242B8;

  /* ── 07 · 7.2 动效档（时长与缓动的**唯一**入口）─────────────────
     命名与数值以 07 章为准。历史上代码另有一套 `--lg-dur-fast:.14s` /
     `--lg-dur-base:.18s` / `--lg-dur-slow:.32s` 与 `--lg-ease-standard` /
     `--lg-ease-emphasized`，与 07 章同值异名或数值不同（fast 差 20ms、base 差 40ms、
     slow 差 80ms），且把**过冲曲线**当"标准"用 —— 那套命名已废弃。 */
  --lg-t-fast:120ms; --lg-t-base:220ms; --lg-t-slow:400ms;
  --lg-t-entrance:800ms; --lg-t-draw:1000ms; --lg-t-breathe:2.4s; --lg-t-float:8s;
  --lg-ease-out:cubic-bezier(.22,1,.36,1);
  --lg-ease-in-out:cubic-bezier(.65,0,.35,1);
  --lg-ease-spring:cubic-bezier(.34,1.56,.64,1);
}
```

> ⚠️ **本块是可交付的最小品牌主题**：它同时包含品牌色（`--mmh-*`）、语义色（`--lg-sem-*`，
> 见 §2.1.5/§2.8）、达标注文字色（`--lg-text-on-accent`）、D5 实底档（`--mmh-solid-*`）
> 与动效档（`--lg-t-*`/`--lg-ease-*`）。§2.8 是语义层的最小集，**两者需一起复制**才能得到
> 与仓库代码一致的主题。Token 名存在性由 `scripts/audit.py` + `scripts/check-style-parity.py` 守门。

**妈咪好模式主值速查（默认）**

| 语义位 | 使用 Token |
| --- | --- |
| 主行动渐变 / 激活 / 分段 | `--mmh-grad-primary` |
| Hero / 生长曲线主描边 / 品牌签名 | `--mmh-grad-signature` |
| 图表序列 1（宝宝/随访） | `--mmh-rose-500` |
| 数据色序 1→8 | Rose500 → Peach400 → Purple300 → Mint500 → Rose300 → Purple500 → Mint300 → Slate300（12.3.3） |
| 环境光斑 | 蜜桃粉 0.18 + 淡紫 0.14（粉主紫辅） |
| 玻璃折射染色 | `--mmh-rose-200` @ 0.05 |
| 白字对比底 | `--mmh-rose-700` 或渐变深端（≥13px/600） |

> 医护工作台可切「冷静模式」：主行动用深玫 700 或低饱和中性渐变，环境光减半，避免粉色分散专注（机制与切换只改 Token，不改结构，见 12.3.2）。

---

## 2.10 附录 C · 孕产妇五色管理 Token（妊娠风险五色分级）

> 依据孕产妇妊娠风险分级管理（绿 / 黄 / 橙 / 红 / 紫）建立**专用分级色板**。
> 与 2.9/六语义的差异：五色只用于「孕产妇妊娠风险分级」语境的对象标签与管理色，不参与通用状态语义。

```css
:root{
  /* ⚠️ 命名以**代码实现**为准：m1..m5。
     旧文本写作 g/y/o/r/p —— 那五个名字在代码里**零实现**（组件拼的是
     `var(--mmh-m5-m1…)`），规范那套对组件没有任何影响，只会让读者照抄一份
     不存在的 Token 名。Part 04 的 CL-04-04 曾引用 m1..m5，与本附录互相矛盾，现已统一。 */
  --mmh-m5-m1:#4CB98A;   /* 绿 · 低风险（常规产检随访） */
  --mmh-m5-m2:#F2C14E;   /* 黄 · 一般风险（保健机构，增加产检/随访） */
  --mmh-m5-m3:#F0954A;   /* 橙 · 较高风险（县级及以上专案管理） */
  --mmh-m5-m4:#EE5C70;   /* 红 · 高风险（市级及以上救治中心，绿色通道） */
  --mmh-m5-m5:#8F6AE0;   /* 紫 · 合并传染病（传染病管理 + 母婴阻断） */
}
```

用法：chip 底=对应色 12–18% 洗色 + 深色文字（如橙：`rgba(240,149,74,.16)` 底 / `#9A5B16` 字）；红紫两级可用白字实色 chip。仅作管理标签，不做大面积填充。
