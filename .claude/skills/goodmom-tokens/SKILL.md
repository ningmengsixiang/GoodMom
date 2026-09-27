---
name: goodmom-tokens
description: Use when 需要在本仓库决定任何一个视觉数值 —— 颜色、背景、文字色、圆角、间距、字号、字重、阴影、模糊、边框、焦点环、动效时长与缓动、层级 z-index、渐变、暗色模式。也用于排查「样式写了但没生效」「颜色不跟随暗色模式」「圆角/内边距实际为 0」「改 Token 完全没效果」「对比度不够」「亮粉底白字看不清」。触发词：Token、CSS 变量、var()、颜色、色值、hex、主题、换肤、暗色、深色模式、圆角、间距、字号、字体、阴影、模糊、backdrop-filter、渐变、对比度。
---

# Token 与主题：可用清单优先

## 核心原则

**先查清单，再写数值。** 这个仓库的规范文档定义了一套**比代码实现大得多**的 Token 体系 —— `01/02/03/07/10/11/12/14/15` 章里能查到的变量名有 **216 个**，代码 Token 层真正定义的只有 **97 个**（差 **141 个**）。

写了不存在的变量，CSS **不会报错**，只会把整条声明丢掉。表现是「没生效」：0 内边距、0 圆角、16px 浏览器默认字号。这是本系统的第一号静默失败源。

| 文件 | 内容 |
| --- | --- |
| `reference/available.md` | ✅ **代码已定义的全部 97 个变量**（浅/暗双档 + 用途） |
| `reference/ghost.md` | ⛔ **文档有、代码无的幽灵变量**（13 类）+ 替代写法 |

## 三条硬规则

**R1 只用清单内的变量。** 需要清单外的档位 → **直接写字面量**，并保证值来自档位表（间距 4/8/12/16/20/24/32/40/48/64/96；圆角 0/18/20/22/26/28/40；字号 12/14/15/16/18/24/40）。

**R2 定义处唯一。** 业务页面**不得**定义 `--lg-*` / `--mmh-*`；只允许**局部作用域覆盖**：

```css
[data-region="xx"] { --mmh-m5-m1: #3FAE7E; }   /* ✅ 局部覆盖业务主题 */
:root { --lg-space-4: 16px; }                  /* ⛔ 与 Token 层抢定义权 */
```

**R3 改数值要三处一起改。** `goodmom-ui/src/theme.css`（代码唯一源）+ `02-Token规范.md` + `goodmom-vue/src/styles/base.css`（Vue 侧），应用侧镜像另需同步：

```bash
cp goodmom-ui/src/theme.css     frontend-app/packages/gm-arco-ui/src/gm.css
cp goodmom-ui/src/tokens/*.ts   frontend-app/packages/gm-arco-ui/src/tokens/
```

## 前缀含义（别混用）

| 前缀 | 含义 | 用在哪 |
| --- | --- | --- |
| `--lg-*` | 通用引擎 Token（Liquid Glass） | 语义层、圆角、边框、焦点环、动效、玻璃 |
| `--mmh-*` | 妈咪好品牌 Token | 品牌色阶、品牌渐变、D5 实底档、妊娠五色 |
| `--lg-sem-*` | 状态语义 alias | **状态文字 / 色点 / 标签一律用它** |
| `--sz-*` | 组件内尺寸类（**不在 `:root`**） | 业务代码不要引用 |
| `gm-` | CSS 类前缀 | `.gm-btn--sz-large` |

**值书写**：hex 字母**一律大写**（`#B23A63`）；变量名 kebab-case 全小写。

## 最常用的六条配方

```css
/* 主行动按钮（D9）：粉上半段 + 深字 + 无白描边 */
background: var(--mmh-grad-action-hc);
color: var(--lg-text-on-accent);
border: 0;

/* 玻璃三档（L1 面板 / L2 卡片 / L3 控件） */
background: var(--lg-glass-panel);   /* .14 / 暗 .06 */
background: var(--lg-glass-card);    /* .22 / 暗 .09 */
background: var(--lg-glass-control); /* .35 / 暗 .12 */

/* 状态淡底：混实底，绝不用 transparent */
background: color-mix(in srgb, var(--lg-sem-attention) 13%, var(--lg-tint-base));

/* 焦点环 */
outline: var(--lg-ring-width) solid var(--lg-ring-color);
outline-offset: var(--lg-ring-offset);

/* 分隔线（一律 hairline） */
border-bottom: var(--lg-border-hairline) solid var(--lg-divider);

/* 渐变 + 边框：必须自带 background-origin */
background: var(--mmh-grad-primary);
background-origin: border-box;   /* 且不得与 background-clip:padding-box 同用 */
```

## 暗色模式

- **机制**：`document.documentElement[data-theme="dark"]`（可加在任意局部容器上做局部暗色）+ `useTheme()`。
- **页面不写任何暗色专属规则。** 写下 `[data-theme="dark"] .card{…}` 就是给自己开了个永久维护缺口。
- 暗色**只换档位、不换色相**：浅底用 `-500`、暗底用 `-300`；禁止新造色相或提高饱和度。
- 玻璃降白加深底，边缘光**只留顶部 1px**；位图加 `filter: brightness(.94)`。
- **禁纯黑 `#000000`、禁纯白 `#FFFFFF`。**
- 验收：`python3 scripts/audit.py --only dark`（组件库侧）+ `node scripts/page-qa.mjs --ci` 的暗色档。

## 暗色档两个已实测的坑（别踩）

| 坑 | 实测 | 处置 |
| --- | --- | --- |
| ✅ **已修（V2.9）** `.gm-btn--secondary` / `--default` 暗色档曾白底白字 | 修前 ≈1.09:1 → 修后 **9.15:1** | 两库已加同一份暗色配方（Token 化 + 逐字节一致），正常使用即可 |
| ⚠️ **待裁决**：`--mmh-rose-700`（`#B23A63`）作**文字**直接压在**页面底色** `--lg-page-bg` 上 | **4.13:1**（14px 需 4.5）；落在玻璃卡/近白面上 5.39:1 ✅；暗色档 8.67:1 ✅ | 只影响「**文字型按钮 / 链接直接放在页面底色上**」这一种用法 —— 加玻璃卡承载即达标，或等品牌色裁决（见 20 · 20.12.3 第 24 条） |
| `--lg-link`（`#B23A63`）压在页面品牌渐变上 | **4.18:1**，14px 正文不达 AA | 渐变底上的面包屑/次级链接改 `--lg-text-secondary` |

## 对比度红线（写颜色前先看）

| 场景 | 阈值 |
| --- | --- |
| 主文字 on 页面底 | ≥7:1（`#343A46` on `#E6D9D0` = 8.26:1） |
| 正文 | ≥4.5:1 —— ⚠️ `--lg-text-secondary` 只有 **4.46:1**，**不能当正文**（仅大字号/图形伴文） |
| 大字号（≥24px 或 ≥18.66px 加粗） | ≥3:1 |
| 非文本（边框、图标、色点） | ≥3:1 |
| **亮粉底 + 白字** | ⛔ 禁止（2.46–2.9:1）。必须配 `--lg-text-on-accent` 深字 |
| `--lg-text-tertiary` | 仅 ≥24px 常规 / ≥18.66px 加粗；**永不作可点击主标签** |

需要「实底 + 白字」时只能用 `--mmh-solid-*` 五个深刻档（AA 达标），**不能**拿 `--lg-sem-*` 当填充底 —— 它是前景色。

## 常见错误

| 写法 | 后果 | 改成 |
| --- | --- | --- |
| `padding: var(--lg-space-4)` | 声明被丢弃，实际 0 | `padding: 16px` |
| `border-radius: var(--lg-radius-card)` | 变量不存在 | `border-radius: 22px` |
| `font-size: var(--lg-type-body)` | 变量不存在 | `font-size: 15px` |
| `color: var(--lg-text-secondary)` 用在 12px 正文 | 4.46:1 不达 AA | `var(--lg-text-primary)` |
| `color-mix(in srgb, var(--lg-sem-risk) 13%, transparent)` | 玻璃透出，12px 字只剩 4.06:1 | 混 `var(--lg-tint-base)` |
| `background: var(--lg-grad-primary)` | `--lg-grad-*` 全缺 | `var(--mmh-grad-primary)` |
| `var(--lg-dur-base, .18s)` | 旧命名已废弃且值与新档不同 | `var(--lg-t-base)` |
| 在 `:root` 里补一个缺失的 Token | 与 Token 层抢定义权，且门禁 B10 会拦兜底值不一致 | 写字面量，或让组件库补 |
