# ⛔ 幽灵 Token 禁用清单（文档有、代码无 —— 写了就静默失效）

> **这是本设计系统最贵的坑。** `01/02/03/07/10/11/12/14/15` 章里能查到的变量名共 **216 个**（形状完整），代码 Token 层真正实现的只有 **96 个** —— 差 **142 个**。
> 写了幽灵变量，浏览器**不报错**，只是把**整条 CSS 声明丢掉**。现象是「样式没生效」：0 内边距、0 圆角、16px 默认字号、没有阴影。
> 生成口径：从上述章节提取 `--(lg|mmh)-[a-z0-9-]+`（去尾连字符碎片），减去 `theme.css` + `base.css` + `components.css` 的 `:root`/暗色段并集。

## 两个字面量替代表（背下来就够用）

| 想要 | ⛔ 不要写 | ✅ 写成 |
| --- | --- | --- |
| 内边距 16 | `var(--lg-space-4)` | `padding: 16px` |
| 页面左右留白 | `var(--lg-gutter-page)` | `padding-inline: 40px`（PC）/ `24px`（平板）/ `16px`（移动） |
| 卡片圆角 22 | `var(--lg-radius-card)` | `border-radius: 22px` |
| 正文字号 15 | `var(--lg-type-body)` | `font-size: 15px` |
| KPI 数字 28 | `var(--lg-num-lg)` | `font-size: 28px; font-variant-numeric: tabular-nums` |
| 毛玻璃 32 | `var(--lg-blur-32)` | `backdrop-filter: blur(32px)` |
| 浮层层级 | `var(--lg-z-overlay)` | `z-index: 40` |
| 禁用透明度 | `var(--lg-opacity-disabled)` | `opacity: .4`（暗色 `.5`） |
| 悬浮光晕 | `var(--lg-glow-pink)` | 用 `--lg-shadow-md` / `--lg-shadow-xl` |
| 品牌签名渐变 | `var(--mmh-grad-signature)` | `var(--mmh-grad-primary)` |
| 紫色强调 | `var(--lg-purple-500)` | `var(--mmh-purple)` |
| 成功色填充 | `var(--lg-success-500)` | `var(--lg-sem-positive)`（前景）或 `--mmh-solid-positive`（实底） |
| 动效时长 | `var(--lg-dur-base, .18s)` | `var(--lg-t-base)` |

## 完整清单（按类）

### 1. 间距系统 —— 全缺

`--lg-space-0` `--lg-space-1` `--lg-space-2` `--lg-space-3` `--lg-space-4` `--lg-space-5` `--lg-space-6` `--lg-space-7` `--lg-space-8` `--lg-space-9` `--lg-space-10` `--lg-space-11`
`--lg-gutter-page` `--lg-gap-card` `--lg-gap-panel` `--lg-pad-card` `--lg-pad-compact` `--lg-pad-panel` `--lg-stack-section`

02 · 2.3.1 给的值：`0/4/8/12/16/20/24/32/40/48/64/96`。02 · 2.3.2 语义档：页边 40/24、面板间 24、卡片间 16、卡内 20–24、紧凑 12–16、区块纵向 32–40。**写字面量。**

### 2. 排版 Token —— 全缺

`--lg-type-display` `--lg-type-display-lg` `--lg-type-title` `--lg-type-section` `--lg-type-body` `--lg-type-body-sm` `--lg-type-caption`
`--lg-num-xl` `--lg-num-lg` `--lg-num-md` `--lg-num-sm`
`--lg-weight-regular` `--lg-weight-medium` `--lg-weight-semibold` `--lg-weight-bold`
`--lg-font-sans` `--lg-font-numeric`

字号档（字面量）：display 40/48/600 · title 24/32/600 · section 18/26/600 · body 15/22/400 · body-sm 14/20/400 · caption 12/16/400 · num-xl 40/44/700 · num-lg 28/32/600。
字重：400 / 500 / 600 / **700（上限，仅大屏首屏主标题）**。

### 3. 圆角档 —— 除两个外全缺

`--lg-radius-card` `--lg-radius-card-lg` `--lg-radius-container` `--lg-radius-btn` `--lg-radius-btn-lg` `--lg-radius-btn-sm` `--lg-radius-chip` `--lg-radius-round`

存在的只有 `--lg-radius-pill:999px` 与 `--lg-radius-control:20px`。
⚠️ `--lg-radius-btn-sm` 被 `.gm-btn--square` 引用却从未定义 —— **两包同病，方角按钮圆角实际失效**。要方角就写 `border-radius: 18px`。

### 4. 层级 z-index —— 全缺

`--lg-z-backdrop` `--lg-z-glass` `--lg-z-component` `--lg-z-control` `--lg-z-overlay`
写数值：`1 / 10 / 20 / 30 / 40`。

### 5. 模糊 —— 全缺

`--lg-blur-16` `--lg-blur-20` `--lg-blur-32` `--lg-blur-48` `--lg-blur-60`
直接写 `backdrop-filter: blur(32px)`；**移动端 ≤32px**；同屏玻璃节点 **≤4**（家长端 ≤2）。

### 6. 阴影档缺 + 发光全缺

`--lg-shadow-xs` `--lg-shadow-lg` `--lg-shadow-inset-top`
`--lg-glow-white` `--lg-glow-pink` `--lg-glow-purple` `--lg-glow-purple-soft` `--lg-glow-cyan` `--lg-glow-cyan-soft` `--lg-glow-peach`
只存在 `--lg-shadow-sm` / `--lg-shadow-md` / `--lg-shadow-xl`。

### 7. 透明度 —— 全缺

`--lg-opacity-disabled` `--lg-opacity-overlay`
写 `opacity:.4`（暗色 `.5`）；遮罩浅色白 `.18`、暗色 `rgba(0,0,0,.48)`。

### 8. 玻璃材质 —— 大部分缺

`--lg-glass-saturate` `--lg-glass-highlight` `--lg-glass-backdrop` `--lg-glass-tint-purple` `--lg-glass-tint-cyan`
`--lg-border-white-45` `--lg-border-white-55` `--lg-border-white-85`
存在的玻璃变量只有 `--lg-glass-panel/-card/-control/-popover` 与 `--lg-border-white-70/-75`。

### 9. 通用渐变 —— 全缺（已整体重映射为品牌渐变）

`--lg-grad-primary` `--lg-grad-cyan` `--lg-grad-hero` `--lg-grad-slate` `--lg-grad-glass-highlight`
用 `--mmh-grad-action-hc`（主行动）/ `--mmh-grad-primary` / `--mmh-grad-rose` / `--mmh-grad-mint` / `--mmh-grad-purple`。

### 10. 通用色阶 —— 全缺

`--lg-purple-100/200/300/500/600` · `--lg-cyan-100/300/500/600` · `--lg-blue-100/300/500/600` · `--lg-pink-100/300/400/500` · `--lg-peach-300/400/500` · `--lg-success-300/500` · `--lg-warning-300/500` · `--lg-danger-300/500` · `--lg-info-500` · `--lg-warm-ivory` `--lg-warm-white` `--lg-soft-beige` `--lg-cool-gray` `--lg-deep-slate` `--lg-night-*` `--lg-color-purple-500`

用 `--mmh-*` 品牌色阶或 `--lg-sem-*`。⚠️ 14 · 4.4.5 与 15 · 15.5 指定的「填充档」`--lg-*-500/300` **同样不存在**。

### 11. 旧动效命名 —— 已废弃（且数值不同）

`--lg-dur-fast` `--lg-dur-base` `--lg-dur-slow` `--lg-ease-standard` `--lg-ease-emphasized`
旧值 fast `.14s` / base `.18s` / slow `.32s`，与新档 `120/220/400ms` **不相等**；且把**过冲曲线**当「标准」用。一律用 `--lg-t-*` / `--lg-ease-*`。

### 11b. 位移档 —— 全缺

`--lg-move-1` `--lg-move-2` `--lg-move-3`（07 章的 `translateY(-1px)` / 4–6px / 12–16px）
**代码零实现**，位移一律写裸值：按钮 hover `translateY(-1px)`、卡片 hover `-4px`、卡片入场 `16px→0`、Tooltip `4px→0`、Modal `12px→0`。

### 12. 移动端 Token —— 全缺（三包 grep 命中 0 次）

`--lg-m-gutter-page` `--lg-m-touch` `--lg-m-touch-critical` `--lg-m-blur-max`
`--lg-m-display` `--lg-m-title` `--lg-m-section` `--lg-m-body` `--lg-m-body-sm` `--lg-m-caption` `--lg-m-num-xl` `--lg-m-num-lg`
`--lg-m-radius-btn` `--lg-m-radius-card` `--lg-m-radius-control` `--lg-m-pad-card` `--lg-m-pad-panel` `--lg-m-gap-card`

移动端写实现值：热区 **44**（关键 48）· 页边 **16**（平板 20）· 卡间隙 **12** · 正文字号 **16** · 按钮高 48/44/36 · blur **≤32**。

### 13. 品牌未实现

`--mmh-grad-signature`（品牌签名渐变）· `--mmh-peach-100/300/400`（蜜杏）· `--mmh-solid-neutral`

⚠️ `SEMANTIC_SOLID.neutral` 在 JS 里有值 `#4F5B6E`，但 CSS **没有** `--mmh-solid-neutral` —— 需要中性实底时写字面量或不用实底。

### 附：尺寸类不在 `:root`

`--sz-default` `--sz-mini` `--sz-small` `--sz-large` 是**组件内部**变量，业务代码不要引用。

---

## 唯一合法的幽灵引用写法

如果确实需要用文档档位值、又想保留「将来组件库补上就自动生效」的意图，**必须带兜底值并注释**：

```css
/* ⚠️ --lg-space-4 代码未实现（见 ghost.md §1），此处取 02 · 2.3.1 档位值 */
padding: var(--lg-space-4, 16px);
```

理由：门禁 `B9`（`check-module-boundary.py`）要求 `var()` 引用的变量**要么有定义、要么带兜底值**；`B10` 进一步要求兜底值**必须等于 `theme.css` 真源**。没兜底 = 整条声明消失且门禁会拦。

**默认做法是直接写字面量** —— 不要为了「语义化」制造幽灵引用。

## 反向清单：代码有、文档无

这些能用，但文档里查不到，不要以为是笔误：

`--lg-font`（仅 Vue）· `--lg-track` · `--lg-text-on-inverse`（仅 React）· `--lg-tint-pct`（仅 React）· `--mmh-grad-rose` · `--mmh-mint-400`
Arco 覆盖：`--primary-1…7` · `--success-5/6` · `--warning-6` · `--danger-6`（`theme.css` 第 33–36 行）
