# ✅ 可用 Token 全表（代码已定义，共 97 个）

> 来源：`goodmom-ui/src/theme.css`（浅/暗）+ `goodmom-vue/src/styles/base.css`（Vue 侧 Token 层）。
> **V2.9 起两张表逐项相同**（由 `scripts/check-style-parity.py` 的严格不变量守门：浅色与暗色两张表都必须两侧同名同值）。
> 前端能用的变量就是这张表，表外一律不许写进 `var()` —— 见 `ghost.md`。暗色列 `—` 表示暗色档不重新声明（沿用浅色值）。

### 品牌色阶

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--mmh-danger` | `#EF6A7B` | — |
| `--mmh-info` | `#6D9EFF` | — |
| `--mmh-mint-100` | `#E2F6F0` | — |
| `--mmh-mint-300` | `#A9E3D4` | — |
| `--mmh-mint-400` | `#7FD8C2` | — |
| `--mmh-mint-500` | `#6FC9B4` | `#7FD8C2` |
| `--mmh-mint-600` | `#4FB59C` | — |
| `--mmh-purple` | `#9A78FF` | — |
| `--mmh-rose-100` | `#FFF0F4` | `rgba(247,127,163,.14)` |
| `--mmh-rose-200` | `#FFDEE8` | — |
| `--mmh-rose-300` | `#FFC4D6` | — |
| `--mmh-rose-400` | `#FFA3BE` | — |
| `--mmh-rose-500` | `#F77FA3` | `#F77FA3` |
| `--mmh-rose-600` | `#E85D8F` | `#FF8FAE` |
| `--mmh-rose-700` | `#A9315B` | `#FF9AB6` |
| `--mmh-warning` | `#F2B25C` | — |

### 品牌渐变与实底档

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--mmh-grad-action-hc` | `linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%)` | — |
| `--mmh-grad-mint` | `linear-gradient(150deg,#7FD8C2,#4FB59C)` | — |
| `--mmh-grad-primary` | `linear-gradient(135deg,#FFA9C2,#F77FA3 45%,#E85D8F)` | — |
| `--mmh-grad-purple` | `linear-gradient(150deg,#B9A0FF,#8066F0)` | — |
| `--mmh-grad-rose` | `linear-gradient(150deg,#FFA9C2,#E85D8F)` | — |
| `--mmh-solid-attention` | `#9A5A0E` | — |
| `--mmh-solid-danger` | `#B04052` | — |
| `--mmh-solid-info` | `#385CB3` | — |
| `--mmh-solid-positive` | `#1E6B52` | — |
| `--mmh-solid-special` | `#6242B8` | — |

### 妊娠风险五色

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--mmh-m5-m1` | `#4CB98A` | — |
| `--mmh-m5-m2` | `#F2C14E` | — |
| `--mmh-m5-m3` | `#F0954A` | — |
| `--mmh-m5-m4` | `#EE5C70` | — |
| `--mmh-m5-m5` | `#8F6AE0` | — |

### 语义层：文字

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-text-disabled` | `rgba(88,98,115,.4)` | `rgba(255,255,255,.34)` |
| `--lg-text-on-accent` | `#343A46` | `#1B1A21` |
| `--lg-text-on-inverse` | `#FFFFFF` | `#1B1A21` |
| `--lg-text-placeholder` | `rgba(88,98,115,.5)` | `rgba(255,255,255,.42)` |
| `--lg-text-primary` | `#343A46` | `#F3EFEC` |
| `--lg-text-secondary` | `#4F5B6E` | `#C9C4CE` |
| `--lg-text-tertiary` | `#9AA2B0` | `#A6ADB9` |

### 语义层：背景与底色

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-page-bg` | `#E6D9D0` | `#1B1A21` |
| `--lg-surface` | `#F4F0EC` | `#23222A` |
| `--lg-tint-base` | `#FFFFFF` | `#23222A` |
| `--lg-tint-pct` | `13%` | `8%` |
| `--lg-track` | `rgba(58,52,84,.08)` | `rgba(255,255,255,.12)` |

### 语义层：分隔与链接

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-divider` | `rgba(58,52,84,.10)` | `rgba(255,255,255,.10)` |
| `--lg-divider-hairline` | `rgba(58,52,84,.10)` | `rgba(255,255,255,.10)` |
| `--lg-link` | `#A9315B` | `#FFC4D6` |
| `--lg-link-hover` | `#9E3054` | `#FFA9C2` |

### 语义层：玻璃与描边

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-border-white-70` | `rgba(255,255,255,.70)` | `rgba(255,255,255,.14)` |
| `--lg-border-white-75` | `rgba(255,255,255,.75)` | `rgba(255,255,255,.12)` |
| `--lg-glass-card` | `rgba(255,255,255,.22)` | `rgba(255,255,255,.09)` |
| `--lg-glass-control` | `rgba(255,255,255,.35)` | `rgba(255,255,255,.12)` |
| `--lg-glass-panel` | `rgba(255,255,255,.14)` | `rgba(255,255,255,.06)` |
| `--lg-glass-popover` | `rgba(255,255,255,.60)` | `rgba(38,36,46,.92)` |

### 语义层：阴影

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-shadow-md` | `0 8px 24px rgba(58,52,84,.08)` | `0 10px 28px rgba(0,0,0,.42)` |
| `--lg-shadow-sm` | `0 4px 12px rgba(58,52,84,.10)` | `0 6px 16px rgba(0,0,0,.34)` |
| `--lg-shadow-xl` | `0 24px 60px rgba(58,52,84,.16)` | `0 24px 60px rgba(0,0,0,.55)` |

### 圆角

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-radius-btn-sm` | `18px` | — |
| `--lg-radius-control` | `20px` | — |
| `--lg-radius-pill` | `999px` | — |

### 边框宽度与焦点环

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-border-1` | `1px` | — |
| `--lg-border-2` | `1.5px` | — |
| `--lg-border-3` | `2px` | — |
| `--lg-border-hairline` | `1px` | — |
| `--lg-border-half` | `.5px` | — |
| `--lg-border-width` | `1px` | — |
| `--lg-ring-color` | `rgba(232,93,143,.6)` | `var(--lg-ring-color-dark)` |
| `--lg-ring-color-dark` | `rgba(255,196,214,.7)` | — |
| `--lg-ring-offset` | `2px` | — |
| `--lg-ring-width` | `2px` | — |

### 状态语义六色

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-sem-attention` | `#8D5A15` | `#F2C14E` |
| `--lg-sem-info` | `#3261C1` | `#9CAEFF` |
| `--lg-sem-neutral` | `#5E6673` | `#A6ADB9` |
| `--lg-sem-positive` | `#25715D` | `#6FC9B4` |
| `--lg-sem-risk` | `#B72F42` | `#F79AA8` |
| `--lg-sem-special` | `#6A48DC` | `#B9A0FF` |

### 动效

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-ease-in-out` | `cubic-bezier(.65,0,.35,1)` | — |
| `--lg-ease-out` | `cubic-bezier(.22,1,.36,1)` | — |
| `--lg-ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | — |
| `--lg-t-base` | `220ms` | — |
| `--lg-t-breathe` | `2.4s` | — |
| `--lg-t-draw` | `1000ms` | — |
| `--lg-t-entrance` | `800ms` | — |
| `--lg-t-fast` | `120ms` | — |
| `--lg-t-float` | `8s` | — |
| `--lg-t-slow` | `400ms` | — |

### 字体

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--lg-font` | `"Inter","PingFang SC","MiSans","Noto Sans SC",sans-serif` | — |

### 其它（Arco 覆盖等）

| 变量 | 浅色 | 暗色 |
| --- | --- | --- |
| `--danger-6` | `#E25B72` | — |
| `--primary-1` | `#FFF0F4` | — |
| `--primary-2` | `#FFDEE8` | — |
| `--primary-3` | `#FFC4D6` | — |
| `--primary-4` | `#FFA3BE` | — |
| `--primary-5` | `#F77FA3` | — |
| `--primary-6` | `#E85D8F` | — |
| `--primary-7` | `#B23A63` | — |
| `--success-5` | `#6FC9B4` | — |
| `--success-6` | `#4FB59C` | — |
| `--warning-6` | `#EFAF55` | — |


---

## 使用提示

**圆角只有三个变量**：`--lg-radius-pill`(999) / `--lg-radius-control`(20) / `--lg-radius-btn-sm`(18，V2.9 补入，方角按钮用)。
其余圆角写字面量，取值只能来自档位：

| 值 | 用途 |
| --- | --- |
| `999px` | 按钮、分段控件端头、级联按钮、结果页动作按钮（**一律用它**） |
| `40` | 页面容器 / 大面板 |
| `28` | 浮层、弹层 |
| `26` | 大按钮形（仅字面量） |
| `22` | 卡片（`GmCard` 默认）、TabBar、分段端头 |
| `20` | 控件档（= `--lg-radius-control`） |
| `18` | 小控件 / 方角按钮（= `--lg-radius-btn-sm`；交互组件**下限 16px**） |

**间距没有 Token**，字面量只能取：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 96`（4px 基准网格）。
最常用语义档：页边 40(PC)/24(平板)/16(移动)、面板间 24、卡片间 16、卡内边距 20–24、区块纵向 32–40、大板块 48–72。

**字号没有 Token**，字面量取：

| 层级 | 字号 / 行高 / 字重 |
| --- | --- |
| display | 40 / 48 / 600（大屏首屏） |
| title | 24 / 32 / 600（H1 ≤26） |
| section | 18 / 26 / 600 |
| body | 15 / 22 / 400（**移动端 ≥16**） |
| body-sm | 14 / 20 / 400 |
| caption | 12 / 16 / 400 |
| num-xl | 40 / 44 / 700 |
| num-lg | 28 / 32 / 600 |

字重上限 **700**（仅大屏首屏主标题），常规标题 **≤600**；正文行高 ≥1.5（中文 1.6–1.7）；数字一律 `font-variant-numeric: tabular-nums`。

**模糊**没有 Token，直接写 `blur(16px)` / `blur(20px)` / `blur(32px)` / `blur(48px)` / `blur(60px)`；**移动端 ≤32px**。

**层级**没有 Token，写数值：内容 1 / 主玻璃 10 / 卡片 20 / 控件 30 / 浮层 40。

## 两库一致性的现状（V2.9）

Token 层、组件 CSS、暗色覆盖集合、props/默认值/类名**全部两侧一致**，由四条门禁守护：

| 门禁 | 守什么 |
| --- | --- |
| `check-style-parity.py --ci` | 共享选择器写法逐字节 · 暗色覆盖集合 · **浅/暗两张 Token 表** |
| `check-component-contract.py --ci` | props / 事件 / 默认值 / 契约类名 / 惯用写法映射的能力对等 |
| `audit.py mirror` | React 包 ↔ 应用镜像逐字节 |
| `audit.py undefined-token` | 两库 CSS + 站点片段里 `var(--x)` 无兜底引用未定义变量 |

> 历史缺陷（现已修，别再照抄）：React `theme.css` 曾 7 处引用**从未定义**的 `--lg-font`（全库字体声明失效、回落浏览器默认衬线）；Vue `base.css` 暗色 `--lg-tint-base` 曾是纯黑 `#000000`（撞「禁纯黑」）且漏了 `--lg-tint-pct` / `--lg-text-on-inverse`。
