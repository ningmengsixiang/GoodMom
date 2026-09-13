# Token 参考（CSS 变量）

**页面只允许用 CSS 变量，不允许写裸 hex**（R2/R11）。JS 侧计算（图表、canvas、动态色点）
用 `import { DesignTokens } from "@goodmom/vue"`。

## 品牌色阶

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--mmh-rose-700` | `#B23A63` | 品牌深色文字、描边 |
| `--mmh-rose-600` | `#E85D8F` | 品牌主色 |
| `--mmh-rose-500` | `#F77FA3` | 品牌中间色 |
| `--mmh-rose-400` | `#FFA3BE` | 渐变上端 |
| `--mmh-rose-300` | `#FFC4D6` | 主行动渐变起点 |
| `--mmh-rose-200/100` | `#FFDEE8` / `#FFF0F4` | 极浅底 |
| `--mmh-mint-600/500/400/300/100` | `#4FB59C` … `#E2F6F0` | 正向/达标 |
| `--mmh-info/warning/danger/purple` | `#6D9EFF` / `#F2B25C` / `#EF6A7B` / `#9A78FF` | 功能色 |

## 渐变

| 变量 | 用途 |
| --- | --- |
| `--mmh-grad-action-hc` | **主行动**（Rose-300→Rose-500），配深字 `--lg-text-on-accent` |
| `--mmh-grad-primary` | 品牌三段渐变（图表/插画） |
| `--mmh-grad-rose` / `-mint` / `-purple` | 头像等圆形渐变 |

## 实底深刻（D5：小字号白字 AA 达标）

`--mmh-solid-positive` `#1E6B52` · `--mmh-solid-attention` `#9A5A0E` · `--mmh-solid-danger` `#B04052` ·
`--mmh-solid-info` `#385CB3` · `--mmh-solid-special` `#6242B8`

> 亮色填充（Rose-500 等）上**禁止**白字。需要实底 + 白字时用上面这组深档。

## 语义层（组件默认引用）

| 变量 | 浅色 | 暗色 `[data-theme="dark"]` |
| --- | --- | --- |
| `--lg-page-bg` | `#E6D9D0` | `#1B1A21` |
| `--lg-surface` | `#F4F0EC` | `#23222A` |
| `--lg-text-primary` | `#343A46` | `#F3EFEC` |
| `--lg-text-secondary` | `#4F5B6E` | `#C9C4CE` |
| `--lg-text-tertiary` | `#9AA2B0` | `#A6ADB9` |
| `--lg-tint-base` | `#FFFFFF` | `#23222A` |
| `--lg-tint-pct` | `13%` | `8%` |
| `--lg-text-disabled` | `rgba(88,98,115,.4)` | `rgba(255,255,255,.34)` |
| `--lg-text-on-accent` | `#343A46` | `#1B1A21` |
| `--lg-divider` | `rgba(58,52,84,.10)` | `rgba(255,255,255,.10)` |
| `--lg-link` / `--lg-link-hover` | `#B23A63` / `#9E3054` | `#FFC4D6` / `#FFA9C2` |
| `--lg-glass-panel` | `rgba(255,255,255,.14)` | `rgba(255,255,255,.06)` |
| `--lg-glass-card` | `rgba(255,255,255,.22)` | `rgba(255,255,255,.09)` |
| `--lg-glass-control` | `rgba(255,255,255,.35)` | `rgba(255,255,255,.12)` |
| `--lg-glass-popover` | `rgba(255,255,255,.60)` | `rgba(38,36,46,.92)` |
| `--lg-border-white-70/75` | `rgba(255,255,255,.70/.75)` | `rgba(255,255,255,.14/.12)` |
| `--lg-shadow-md` | `0 8px 24px rgba(58,52,84,.08)` | `0 10px 28px rgba(0,0,0,.42)` |

## 状态语义（六语义，R2）

| 语义 | 浅色 | 暗色 | 含义 | 典型文案 |
| --- | --- | --- | --- | --- |
| `--lg-sem-positive` | `#25715D` | `#6FC9B4` | 正常/正向 | 正常、已完成、阴性、未见异常 |
| `--lg-sem-info` | `#3261C1` | `#9CAEFF` | 信息/进行 | 已建档、管理中、已预约、进行中 |
| `--lg-sem-attention` | `#8D5A15` | `#F2C14E` | 注意/待办 | 待随访、待复查、待审核、待转诊 |
| `--lg-sem-risk` | `#B72F42` | `#F79AA8` | 风险/异常 | 高危、阳性、检查异常、失访、已驳回 |
| `--lg-sem-neutral` | `#5E6673` | `#A6ADB9` | 中性/未动 | 未随访、已结案、草稿、已关闭 |
| `--lg-sem-special` | `#6A48DC` | `#B9A0FF` | 特殊/协作 | 已转诊、重点关注、暂停管理 |

映射实现：`goodmom-vue/src/tokens/{status,business}.ts`（与 `goodmom-ui` 同表，改一处必须改两处）。

## 孕产妇五色（02.10）

`--mmh-m5-m1` 绿 `#4CB98A` · `--mmh-m5-m2` 黄 `#F2C14E` · `--mmh-m5-m3` 橙 `#F0954A` ·
`--mmh-m5-m4` 红 `#EE5C70` · `--mmh-m5-m5` 紫 `#8F6AE0`

业务可按区域覆盖，例如 `[data-region="xx"] { --mmh-m5-m1: … }`。五色与六语义是**两个维度**，不要混用。

## 圆角（02.4）

卡片 `22` · 中按钮 `22` · 大按钮 `26` · 小按钮 `18` · 小号按钮 `16` · 控件 `20` · 胶囊 `999`。
**相互作用组件圆角下限 16。**

## 边框宽度与焦点环（02.7.1）

`--lg-border-hairline:1px` · `--lg-border-half:.5px` · `--lg-border-1:1px` · `--lg-border-2:1.5px` · `--lg-border-3:2px`
`--lg-ring-width:2px` · `--lg-ring-offset:2px` · `--lg-ring-color`（暗色自动切 `--lg-ring-color-dark`）

加粗/强调用 `box-shadow`/`outline`，**不要改 `border-width`**（R9，会引发布局回流）。

## 动效（07 章）

`--lg-dur-fast:.14s` · `--lg-dur-base:.18s` · `--lg-dur-slow:.32s`
`--lg-ease-standard:cubic-bezier(.2,.8,.3,1.1)` · `--lg-ease-emphasized:cubic-bezier(.22,1,.36,1)`

## 字体

`--lg-font: "Inter","PingFang SC","MiSans","Noto Sans SC",sans-serif`

## 暗色模式

在任意容器根节点加 `data-theme="dark"` 即整体切换（变量级，无需改组件）：

```vue
<div :data-theme="isDark ? 'dark' : undefined">…</div>
```

**禁止**为暗色单独写组件样式分支 —— 变量已全部覆盖；写了就会出现两套真相。

## 两条实测铁律（V2.9：都是踩过的坑，门禁已固化）

1. **`--lg-text-tertiary` 只能用于 ≥24px 文字**（02 · 2.1.1）。真值 `#9AA2B0` 压在玻璃卡上
   12px 实测 **2.30:1**；小字一律用 `--lg-text-secondary`。
   占位符用 `--lg-text-placeholder`，禁用态（WCAG 1.4.3 豁免）可用 tertiary。
   门禁：`audit.py --only tertiary-size`。
   历史坑：`site/fragments/preview-index.html` 曾把 tertiary **本地改写成 secondary 的值**
   （`#4F5B6E`）来"达标" —— 改名掩盖违规，门禁/规范/真源从此各说各话。
   门禁：`audit.py --only text-token-parity`。

2. **语义淡底必须混实底**：`color-mix(in srgb, 语义色 var(--lg-tint-pct), var(--lg-tint-base))`。
   写成 `color-mix(…, transparent)` 会把玻璃卡与品牌渐变透出来，
   12px 语义字实测只剩 **4.06:1**（浅/暗两档皆然）；混实底后浅色档 4.86:1、暗色档 4.9:1。
   暗色档透明度必须降到 8%：浅色墨混进暗底会把底抬亮，13% 只有 4.3:1。
   门禁：`audit.py --only tint-base`（同时断言两档 token 都在位）。
