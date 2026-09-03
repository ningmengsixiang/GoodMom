# 01 · 设计总览与设计 DNA

> 找组件请先查 [00-组件总目录.md](00-组件总目录.md)——PC + 移动 + 妇幼 94 项一张表平铺，本文负责定义风格与 DNA。

> 本章定义这套设计系统「是什么、为什么高级、怎么分层」。先读本章，再进入 Token 与组件章节。

---

## 1.1 风格名称与定义

| 项 | 内容 |
| --- | --- |
| 风格名称（EN） | **Premium Liquid Glass UI / Ambient Liquid Glass** |
| 风格名称（CN） | **高级液态玻璃 · 柔光蜜桃 · 妇幼儿童全生命周期（妈咪好 GoodMom）** |
| 本质 | Liquid Glass + Soft 3D + Ambient Light + Premium SaaS UI |
| 气质 | 漂浮在空间中的操作系统界面（Apple Vision Pro / Spatial Computing 启发），而非传统网页 UI |

### 核心关键词

```
Liquid Glass / Glassmorphism / Soft 3D / Ambient Lighting / Floating UI /
Translucency / Refraction / Blur / Depth / Premium SaaS / Spatial Interface / Minimal / Futuristic
```

---

## 1.2 十大视觉特征

### 特征一：大面积透明玻璃容器
整个 UI 被包裹在巨大的透明玻璃面板中，而非白色卡片：

| 属性 | 建议值 |
| --- | --- |
| Glass Opacity | 15–35%（底色半透明，透光） |
| Background Blur | 25–60px |
| Border | 1–2px 半透明白 `rgba(255,255,255,0.45)` |
| Corner Radius | 28–48px |
| 折射 | 轻微，边缘与高光处体现 |

> 玻璃后面能看到环境，玻璃不是遮挡，而是「过滤光」。

### 特征二：所有元素「漂浮」
按钮、输入框、卡片、Checkbox 不是平铺在画布上，而是悬浮在玻璃空间中，每个组件有独立的空间层级。

### 特征三：中性环境 + 少量高饱和彩色光源
色彩克制：底色全部暖中性（象牙 / 米色），彩色只作为「光源」少量出现。这是高级感的来源。

### 特征四：柔和光影（Ambient + Volumetric）
紫 / 青 / 粉光晕漫射在空间里，**绝无霓虹光带、绝无硬阴影**。观感接近电影布光的 diffuse / soft / atmospheric。

### 特征五：无纯黑阴影
传统 `0 4px 10px #000` 被禁止。使用大范围、低不透明度、高模糊、多层的带色相阴影（蓝紫调）。

### 特征六：超大圆角
一切皆圆：页面容器 36–48px，卡片 22–36px，控件 16–28px。拒绝直角、小圆角与锐利边缘。

### 特征七：克制排版
大标题不超重（Weight ≤ 700 且通常 600），层级靠字号、字重与留白区分，信息密度 Medium。

### 特征八：玻璃材质图标
图标不是扁平线性，而是「用玻璃做成的小实体」：半透明、柔和高光、微 3D、圆润、内部渐变。

### 特征九：明暗与透明度分层
用玻璃不透明度区分层级：越重要的控件越「实」（透明度越低 / 更白），越底层的面板越「虚」。

### 特征十：留白与空间感
页面留白慷慨，通过 5 级景深（见 1.4）制造「空间操作系统」的纵深感。

---

## 1.3 材质系统速览

| 材质 | 用途 | 填充 | 模糊 | 描边 |
| --- | --- | --- | --- | --- |
| **Primary Glass** 主玻璃 | 页面主面板 | `rgba(255,255,255,0.15–0.30)` | 30–60px | 1px `rgba(255,255,255,0.45)` |
| **Floating Glass** 漂浮玻璃 | 卡片 / 组件 | `rgba(255,255,255,0.18–0.35)` | 20–40px | `rgba(255,255,255,0.35–0.65)` |

质感关键词：像一块非常薄、非常干净的透明亚克力玻璃。顶部 / 左侧有高光，阴影柔散。

完整数值见 [`02-Token规范.md`](02-Token规范.md)。

---

## 1.4 空间层级系统（5-Level Depth System）

这是本设计语言**最值得复用的逻辑**。任何页面都必须能回答：「我处在第几层？」

```
LEVEL 0  Background（环境层）
│          暖象牙背景 + 环境光斑（紫 / 青 / 粉 / 白，漫射）
│
LEVEL 1  Main Glass Surface（主玻璃层）
│          巨大半透明玻璃面板，包裹整块内容
│
LEVEL 2  Floating Components（组件层）
│          卡片 / 输入框 / 按钮 / 图表面板 —— 悬浮于主玻璃之上
│
LEVEL 3  Floating Controls（控件层）
│          图标按钮 / 徽章 / 开关 / 气泡 —— 最接近用户手指
│
LEVEL 4  Light & Reflection（光效层）
│          高光边缘、折射高光、渐变辉光 —— 负责「材质真实感」
```

层级规则：

1. **层级越高，玻璃越实、越白、模糊越弱、阴影越紧**（Level 1 → Level 3 递减不透明度区间）。
2. **层级越高，圆角可以越小**（但仍 ≥16px）。
3. 光效层（L4）只做加法：永远表现为白色高光 + 彩色漫射辉光，不出现硬轮廓光。
4. 任意两个相邻层级之间保持清晰的视觉间距（阴影 + 留白）。

---

## 1.5 渐变系统（Liquid Gradient）

不使用普通的两端渐变，使用「液体渐变」——像光在玻璃内部流动：

```text
推荐（3 段柔流）：
  Purple ──▶ Blue ──▶ Cyan
  Peach ──▶ Pink ──▶ Purple ──▶ Cyan
```

要求：

- 色相过渡柔和，不出现生硬的色阶断带；
- 渐变通常配合 **白色高光 overlay** 使用（`linear-gradient(160deg, rgba(255,255,255,0.9), transparent 45%)`）；
- 大面积渐变仅限：主背景氛围、品牌主视觉、图表高亮描边、图标内部。

---

## 1.6 禁止清单（风格红线）

| 禁止 | 替代 |
| --- | --- |
| 赛博朋克 / 黑底科幻 | 暖中性底 + 柔光 |
| 霓虹发光（neon glow 描边光） | 漫射环境光 |
| 硬阴影、纯黑阴影 | 大模糊、低透明、带色相阴影 |
| 直角 / 小圆角 | 24–48px 圆角体系 |
| 扁平卡片 / 普通 Dashboard | 玻璃面板 + 5 级景深 |
| 金属 / 镀铬材质 | 半透明亚克力玻璃 |
| 信息堆砌、密排文字 | 克制排版 + 慷慨留白 |
| 过重的黑体、伪 3D、卡通感 | Inter / PingFang SC 常规字重 |

---

## 1.7 L.Glass Design DNA 总表

| 维度 | 设计原则 | Token 章节 |
| --- | --- | --- |
| 材质 | Translucent Liquid Glass | [02 · 5](02-Token规范.md) 玻璃材质 |
| 结构 | Floating / Layered | [01 · 1.4](#14-空间层级系统5-level-depth-system) |
| 圆角 | 24–48px | [02 · 4](02-Token规范.md) 圆角 |
| 边框 | 1px translucent white | [02 · 5](02-Token规范.md) |
| 阴影 | Large / Soft / Diffused | [02 · 6](02-Token规范.md) 阴影 |
| 背景 | Warm Neutral | [02 · 1](02-Token规范.md) 颜色 |
| 主色 | Purple | [02 · 2](02-Token规范.md) |
| 辅色 | Cyan / Blue | [02 · 2](02-Token规范.md) |
| 点缀 | Pink / Peach | [02 · 2](02-Token规范.md) |
| 光效 | Ambient / Volumetric | [02 · 5/6](02-Token规范.md) |
| 图标 | Liquid Glass 3D | [03 · 8](03-组件规范.md) |
| 字体 | Inter / SF Pro；中文 PingFang SC / MiSans | [02 · 3](02-Token规范.md) |
| 信息密度 | Medium | [01 · 1.2](#特征七克制排版) |
| 空间感 | Very High | [01 · 1.4](#14-空间层级系统5-level-depth-system) |
| 视觉关键词 | Premium / Soft / Futuristic | 本章 |
| 禁止 | Cyberpunk / Neon / Flat / Clutter | [01 · 1.6](#16-禁止清单风格红线) |

> 设计红线一句话：**宁可更淡，不可更艳；宁可更柔，不可更硬。**
