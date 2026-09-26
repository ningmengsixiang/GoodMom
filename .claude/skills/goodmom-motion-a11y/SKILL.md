---
name: goodmom-motion-a11y
description: Use when 需要给交互加动效、过渡、hover/focus/loading 状态，或要让界面无障碍达标。触发词：动效、动画、过渡、transition、animation、时长、缓动、easing、cubic-bezier、hover、active、按下、focus、焦点环、outline、键盘、Tab、Escape、读屏、screen reader、aria、aria-label、对比度、色彩对比、WCAG、AA、prefers-reduced-motion、减弱动效、加载动画、骨架、spinner、Toast 动画、弹窗动画、无障碍、a11y、热区、focus-visible、焦点陷阱。
---

# 动效与无障碍

## 动效：只动两件事

**`transform` + `opacity`。** `box-shadow` 过渡少量可用；`backdrop-filter` **不做逐帧动画**；**禁止对 layout 属性做动画**（`width`/`height`/`top`/`left`/`margin`）。

## 时长与缓动（唯一入口）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--lg-t-fast` | `120ms` | hover / 按下 / 焦点（M1） |
| `--lg-t-base` | `220ms` | 通用过渡（M2） |
| `--lg-t-slow` | `400ms` | 结构变化（M3） |
| `--lg-t-entrance` | `800ms` | 入场 |
| `--lg-t-draw` | `1000ms` | 图表绘制 |
| `--lg-t-breathe` | `2.4s` | 呼吸（骨架 / 环境） |
| `--lg-t-float` | `8s` | 漂浮（环境光斑） |

| Token | cubic-bezier | 用途 |
| --- | --- | --- |
| `--lg-ease-out` | `cubic-bezier(.22,1,.36,1)` | **默认出场曲线**（Apple 同款） |
| `--lg-ease-in-out` | `cubic-bezier(.65,0,.35,1)` | 对称过渡 |
| `--lg-ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | 开关滑块 / 勾选 / 计数等「轻盈弹动」 |

**动效分级**：M1 微动效 80–250ms · M2 转场 240–400ms · M3 结构变化 400–900ms · M4 环境动效 ≥2.4s（同屏循环 **≤5 处**）。

⛔ **旧命名已废弃**且数值不同：`--lg-dur-fast(.14s)` / `-base(.18s)` / `-slow(.32s)` / `--lg-ease-standard` / `-emphasized`。**别用。**

⚠️ `--lg-move-1/2/3`（位移档）**代码未实现** → 位移写字面量（见下表）。

## 位移与缩放：以代码为准

| 场景 | 实际值 |
| --- | --- |
| 按钮 hover | `translateY(-1px)`（⚠️ 07 章正文写 4px / -2px / 1px 三种，**代码是 -1px**） |
| 按钮 active | `translateY(0) scale(.96)` + `transition-duration:.12s` |
| 卡片 hover | `translateY(-4px)` + 阴影 md→lg |
| 卡片入场 | `translateY(16px) → 0` |
| Tooltip | `translateY(4px) → 0` |
| Popover | `scale(.96)→1` + `translateY(8px)→0` |
| Modal | `scale(.98)→1` + 下移 `12px→0` |
| Toast 进/退 | `translate(-50%,-24px) ↔ translate(-50%,0)` |
| 移动 Picker | `translateY(100%) → 0`（上滑 320ms） |
| 表单错误抖动 | `±4px × 3`，240ms |
| 箭头图标 hover | 右移 `2px` |
| 路由切换 | 上移 `12px` |

> 组件库 `.gm-btn` 的实际默认过渡用的是 **spring**（不是 ease-out）。要与之对齐就用 spring；要「标准出场」才用 `--lg-ease-out`。

## 六态矩阵

| 组件 | hover | active | disabled | focus | loading |
| --- | --- | --- | --- | --- | --- |
| Button | `-1px` + `--lg-t-fast` | `scale(.96)` | `opacity .4`（暗色 .5），**尺寸不变** | 焦点环 | spinner **替换图标位、文字保留**（宽度不变） |
| Input | 描边提亮 | — | — | 焦点环 + 描边色 | — |
| Card | `-4px` + `shadow-md` | — | — | 可聚焦时给环 | 骨架 |
| 列表项 | 底色提亮（玻璃控制档） | 压深 | — | 焦点环 | — |
| Switch | — | spring 300ms | `opacity .4` | 焦点环 | — |
| Link | 变色 + 下划线（按 `underline`） | **只改 `opacity .86`，禁位移**（行内文本会抖） | — | 焦点环 | — |
| Toast | — | — | — | — | 滑入 320 / 驻留 **2400** / 淡出 240ms |
| Modal / Drawer | — | — | — | **焦点陷阱 + 关闭后归还焦点** | — |

**三条硬要求**：① **禁用态不改变尺寸**；② **loading 保留宽度**；③ **`Escape` 关闭并把焦点还给触发元素**。

## 微交互配方（照抄）

```css
/* 骨架：胶囊 + 上下呼吸 —— ⛔ 禁左右扫光马赛克 */
@keyframes breathe { 0%,100%{opacity:.5} 50%{opacity:.85} }
.gm-skeleton i{ border-radius:999px; animation:breathe 1.6s ease-in-out infinite; }

/* Spin：0.9s/圈；全系统只允许这一个旋转元素 */
.gm-spin i{ animation:spin .9s linear infinite; }

/* 进度条：填充用品牌玫渐变 */
linear-gradient(90deg, var(--mmh-rose-300), var(--mmh-rose-500))
```

## ⛔ 禁止的动效（31 条里最常犯的）

| ⛔ | 说明 |
| --- | --- |
| 霓虹发光 / 描边光 / 霓虹扫描 | 只能漫射环境光 |
| 硬阴影 / 纯黑阴影 | 用大模糊、低透明、带色相阴影 |
| 对 layout 属性做动画 | 只动 `transform` / `opacity` |
| 逐帧 `blur()` | 全屏同时 `blur` 节点 ≤6；`backdrop-filter` 不做逐帧 |
| **无限 `sheen` 扫光** | sheen 每次 hover **只 1 次** |
| **骨架左右扫光马赛克** | 用呼吸 |
| 整卡呼吸 / 整图扫描线 / 卡片内容整体位移 | |
| 翻转卡 / 弹簧进弹 / 伪 3D | |
| 全屏粒子 / 旋转加载大转盘 / 按钮整钮旋转 | |
| `will-change` 常驻 | 只在动画开始瞬间加、结束即删 |
| 闪烁 >3Hz | 任何动画周期 **>330ms**（癫痫安全） |
| 无限循环 >5 处 | 周期 ≥2.4s |
| 虚拟列表逐行 `backdrop-blur` | 滚动中只允许 `transform`/`opacity` |
| 形态切换做转场动画 | `GmResponsiveView` 切形态**不做动画** |
| `ResizeObserver` 回调内同步写布局 | 必须 `requestAnimationFrame` 推迟一帧 |
| 触屏「粘 hover」 | hover 效果包在 `@media (hover:hover)` 里 |
| **医疗结果类庆祝动效** | 诊断/筛查/风险结果**无彩带、无鼓掌** |
| 用动画承载唯一信息 | 危险/禁用必须**颜色 + 文字**双通道 |

## `prefers-reduced-motion`

- **全局兜底**在 `goodmom-ui/src/theme.css`（`*` + `.01ms` + `iteration-count:1` + `scroll-behavior:auto`）与应用侧 `gm.css` 同段。
- ⚠️ **Vue 包的 `base.css` 是「组件白名单」而非全局** —— 白名单外的自绘动画**不会降级**，自写动画必须自己加：

```css
@media (prefers-reduced-motion: reduce){
  .my-thing{ animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
}
```

**四条纪律**

1. 新动画**不得**写在更高特异性且带 `!important` 的规则里去规避全局兜底。
2. **不要给单个组件另写 reduce-motion 覆盖** —— Toast 依赖 `animation` 的 `both`/`forwards` 填充，覆盖会让「退场闪一下」。**Toast 故意不写覆盖，是已裁决项，不要"顺手修好"。**
3. 进出场用 `animation`（而非 `transition`），退场用 `forwards`。
4. 虚拟长列表在 reduced-motion 下**关闭惯性滚动与错峰入场**。

---

# 无障碍基线

## 对比度

| 场景 | 阈值 | 陷阱 |
| --- | --- | --- |
| 主文字 on 页面底 | ≥7:1 | `#343A46` on `#E6D9D0` = 8.26:1 ✅ |
| 正文 | ≥4.5:1 | ⚠️ `--lg-text-secondary` 仅 **4.46:1** —— **不能当正文** |
| 大字号（≥24px 或 ≥18.66px 加粗） | ≥3:1 | |
| 非文本（边框 / 图标 / 色点） | ≥3:1 | 步骤条描边曾用白 → 压在亮粉渐变上仅 1.79:1 |
| 亮粉底 + 白字 | ⛔ 禁止（2.46–2.9:1） | 必须配 `--lg-text-on-accent` 深字 |
| `--lg-text-tertiary` | ≥24px 常规 / ≥18.66px 加粗才可用 | **永不作可点击主标签**；小字号辅助改回次级色 |
| 语义淡底 | 必须混 `--lg-tint-base` | 混 `transparent` 时 12px 只剩 **4.06:1** |
| 暗色档 | 正文 <4.5:1 即 FAIL | 取「12% 白玻璃合成面」为最坏情形 |

## 焦点可见

```css
:focus-visible{
  outline: var(--lg-ring-width) solid var(--lg-ring-color);   /* 2px */
  outline-offset: var(--lg-ring-offset);                       /* 2px */
}
```

- 暗色档 `--lg-ring-color` 自动切为 `rgba(255,196,214,.7)`。
- ⛔ **禁止裸 `outline:none`**。压制焦点必须伴**同选择器**的 `:focus-visible` 兜底（`a11y.py` 按**选择器级**判据守门）。
- 唯一登记例外：`.gm-risk-it:focus-visible` 用紫色 `rgba(143,106,224,.7)`。
- 焦点环内联元素圆角 ≤6px 属历史越界值，新代码别仿。

## 键盘可达

| 要求 | 细节 |
| --- | --- |
| 全部交互元素可 Tab | `<button>` / `<a href>` / 表单控件；⛔ 非交互元素挂点击（`a11y.py` FAIL） |
| 组内方向键 | `←/→/Home/End`（分段、Tab、RiskPicker）；Cascader 另有 `→` 进列 / `←` 回列 |
| roving tabindex | 选中项 `0`，其余 `-1` |
| `Escape` | 关闭浮层并**归还焦点**给触发元素 |
| 焦点陷阱 | Modal / Drawer / BottomSheet 内部循环，关闭后归还 |
| 长列表 | `PageDown/PageUp` 翻 0.9 屏、`Home/End`、`↑/↓` ±itemHeight |
| 根页导航 | 返回键**整键移除**而非置灰（置灰按钮不可聚焦 → 同时触发「焦点不可见」与「禁用无理由」） |

## ARIA

- 进度：`role="progressbar"` + `aria-valuemin/max/now/valuetext`；**`indeterminate` 不报 `aria-valuenow`**（未知进度报具体值 = 给读屏假数据）。
- 提示：`error` → `role="alert"` + `aria-live="assertive"`；其余 → `role="status"` + `aria-live="polite"`。
- 加载：`role="status"` + `aria-busy="true"`（骨架）；`GmSpin` `role="status"`。
- 单选组：`role="radiogroup"` + `role="radio"` + `aria-checked`（分段控件、RiskPicker）。
- 仅图标按钮**必填** `ariaLabel`（组件缺失会 `console.warn`）。
- 头像：有 `label` → `role="img"` + `aria-label`；无 → **`aria-hidden`**（否则读屏把「张」当孤立文字念）。
- 状态标签内部自带 `<span class="gm-sr-only">{语义名}：</span>` —— **颜色之外的第二通道**。

## 热区与语义

| 项 | 值 |
| --- | --- |
| 移动热区 | ≥44×44（关键按钮 ≥48）；`layout-gate` 容差 **43.5** |
| 桌面热区 | ≥40×40 |
| 圆点图标按钮 | 视觉 24，外包 44 热区（可用 `::after`/`::before` 扩） |
| 行内链接 | ≥24 |
| 语义标签 | 动作用 `<button>`、导航用 `<a href>`；⛔ **禁 `href="#"` 假链接** |
| 结构 | 标题层级有序；表单控件必须有 label；`img` 必须有 `alt`；`id` 不重复 |

## 验收

```bash
python3 scripts/a11y.py --ci         # 静态：焦点环压制无兜底 + 非交互元素挂点击
python3 scripts/a11y-dom.py          # 渲染级逐文本节点对比度（阈值 = 基线 failN，当前 0）
node scripts/page-qa.mjs --ci        # 渲染级：对比度/焦点可见/热区/溢出/emoji/heading-order/img-alt/accessible-name
python3 scripts/audit.py --only dark # 暗色档对比度（组件库侧）
```

> `a11y-dom.py` 实测口径：大字 = ≥24px 或 ≥18.66px+700 → 阈值 3；其余 4.5。渐变/图片背景无法取样 → 只计 INFO 不参与阈值。当前报告：**确证失败 0，INFO 19532**（INFO 是渐变底无法取样，不是失败）。
