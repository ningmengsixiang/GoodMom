#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 site/fragments/products.html —— 「产品矩阵」模块（6 大产品对接首页 + 6 个工作台）。

## 这是什么

按 `prd/zong.md`（GM-PRD-000《妈咪好 Goodmom 六大产品总体PRD》）的产品规划，
生成 **7 个页面**：

    产品矩阵首页 —— 6 大产品**对接页**：6 个产品入口 + 产品互联链路 + 统一数据标准/数据主责 + 销售组合
    6 个工作台首页 —— 每个产品一页，把该产品**最主要的功能做成可交互**：
        · 4 个 KPI 可点 → 按语义筛选待处理清单（再点一次取消）
        · 核心业务闭环步骤轴（步骤取 PRD 二级功能；点步骤切换、可标记完成）
        · 今日待处理表：状态筛选 chips + 行内动作推进状态（反馈走外壳 Toast）+ 计数联动
        · 风险/筛查队列：点某一行 → 按该行语义筛选待处理清单
        · 快捷工具：点击 → 反馈 + 写入「最新动态」（活动流看得见）
        · 生长曲线（p03/p04/p05）：母题 window.gmGrowth，可悬停读点 / 一键 P3-P97 / 框选区间

**对外落地页已按要求整体去掉** —— 产品介绍性内容不再单独成页；其中属于平台级的
（数据主责矩阵、互联链路、销售组合、单品交付）收敛到「产品矩阵首页」，
各产品的工作台页只保留与操作有关的上下文。

## 导航（外壳提供，见 build-site.py 的 NAV_MENUS）

主导航的「产品矩阵」是**下拉菜单**：点它展开 6 个产品入口，选中即跳到对应工作台
（`#products--p0N-work`）。模块内**不再自带一套切换条** —— 导航只有一处，
避免"站内导航 + 模块内切换条"两套并存（用户上一轮反馈的正是这个）。

## 为什么用生成器

7 个页面必须**结构同构**（同一页面壳、同一组合顺序、同一套交互机制）。
手写 7 份必然漂移 —— 本仓已有先例：生长曲线在三处各画一遍、表格配方在五处漂移。
内容（文案与示意数值）在 `scripts/products_data.py`，结构在本文件；
产品级差异全部走数据，页面壳与交互只有一份实现。

## 配色口径（PRD §十一「五个业务系统可以拥有不同的辅助色」）

主行动（Primary）**六个产品一律**品牌蜜桃粉档 + 深字（12 · 12.3.2「主行动渐变」属品牌语义，
不随产品变色）。产品辅助色只用于**产品标识**：产品名色条、序号徽标、KPI 主指标、侧栏选中色条。
取值全部来自 12 · 12.2.1 阶段色 / 12 · 12.3.1 色板，**不新造色相**：
p01 深玫 `#A9315B` · p02 杏桃 `#FFC3A0` · p03 蜜桃粉 `#F77FA3` ·
p04 淡紫柔光 `#B69AFF` · p05 薄荷 `#6FC9B4` · p06 粉→淡紫签名渐变 + 青。

## 用法

    python3 scripts/gen-products.py           # 生成 site/fragments/products.html
    python3 scripts/gen-products.py --check   # 只校验片段是否与生成结果一致（CI 用）
"""
from __future__ import annotations

import argparse
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from products_data import (BRAND, DEMO, LINKS, PRIMARY, PRODUCT_ICON,  # noqa: E402
                            PRODUCTS, module_pages)
from products_prd import flow_steps, parse_prd, read_prd  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRD = os.path.join(ROOT, "prd", "zong.md")
OUT = os.path.join(ROOT, "site", "fragments", "products.html")

BY_PID = {p["pid"]: p for p in PRODUCTS}

CSS = r"""
/* ═══ GoodMom Tokens（精简版 · 同 02 附录 A/B 与 12.3.1）═══ */
:root{
  /* 文字与分隔（02 · 2.1.1）。小字一律次级/主色：三级色 #9AA2B0 只允许
     ≥24px 常规或 ≥18.66px 加粗（02 · 2.1.1），本模块不把它用于任何正文/注释。 */
  --lg-text-primary:#343A46; --lg-text-secondary:#4F5B6E; --lg-text-tertiary:#9AA2B0;
  --lg-text-on-accent:#343A46; --lg-divider:rgba(58,52,84,.10); --lg-link:#A9315B;
  --lg-tint-base:#FFFFFF; --lg-tint-pct:13%;
  /* 六语义（14 · 4.4.5 / 15 · 15.5）：文字用深档 alias，-500 只作填充 */
  --lg-sem-positive:#25715D; --lg-sem-info:#3261C1; --lg-sem-attention:#8D5A15;
  --lg-sem-risk:#B72F42; --lg-sem-neutral:#5E6673; --lg-sem-special:#6A48DC;
  --lg-success-500:#42C7A1; --lg-warning-500:#F2B25C; --lg-danger-500:#EF6A7B;
  --lg-info-500:#6D9EFF; --lg-purple-500:#9A78FF; --lg-purple-300:#B69AFF;
  /* 品牌（02 · 2.9 = 12.3.1） */
  --mmh-rose-700:#A9315B; --mmh-rose-600:#E85D8F; --mmh-rose-500:#F77FA3;
  --mmh-rose-300:#FFC4D6; --mmh-rose-200:#FFDEE8; --mmh-rose-100:#FFF0F4;
  --mmh-peach-400:#FFC3A0; --mmh-peach-300:#FFDCC7; --mmh-peach-100:#FFF3EA;
  --mmh-mint-600:#4FB59C; --mmh-mint-500:#6FC9B4; --mmh-mint-300:#A9E3D4; --mmh-mint-100:#E2F6F0;
  --mmh-solid-special:#6242B8;
  --lg-glass-popover:rgba(255,255,255,.60); --pm-tint-info:rgba(109,158,255,.14);
  /* 头像墨色：亮粉渐变底上必须用**同色系深墨**（02 · 2.1.5 / D35），不随主题变白 */
  --pm-av-ink:var(--mmh-rose-700);
  --mmh-grad-action-hc:linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%);
  --mmh-grad-primary:linear-gradient(135deg,#FFA9C2 0%,#F77FA3 45%,#E85D8F 100%);
  --mmh-grad-signature:linear-gradient(120deg,#FFD0D8 0%,#F77FA3 48%,#B69AFF 100%);
  /* 妊娠风险五色（02 · 2.10；仅用于孕产妇风险分级语境，与六语义并行） */
  --mmh-m5-m1:#4CB98A; --mmh-m5-m2:#F2C14E; --mmh-m5-m3:#F0954A;
  --mmh-m5-m4:#EE5C70; --mmh-m5-m5:#8F6AE0;
  /* 环境光斑（02 · 2.1.7） */
  --lg-glow-pink:radial-gradient(closest-side,rgba(245,184,198,.18),transparent 70%);
  --lg-glow-peach:radial-gradient(closest-side,rgba(246,192,160,.16),transparent 70%);
  --lg-glow-purple:radial-gradient(closest-side,rgba(154,120,255,.22),transparent 70%);
  --lg-glow-cyan:radial-gradient(closest-side,rgba(114,221,229,.20),transparent 70%);
  --lg-glow-white:radial-gradient(closest-side,rgba(255,255,255,.60),transparent 70%);
  /* 间距 / 圆角 / 阴影 / 边框（02 · 2.3–2.7） */
  --lg-space-1:4px; --lg-space-2:8px; --lg-space-3:12px; --lg-space-4:16px;
  --lg-space-5:20px; --lg-space-6:24px; --lg-space-7:32px; --lg-space-8:40px;
  --lg-space-9:48px; --lg-space-10:64px;
  --lg-radius-container:40px; --lg-radius-card-lg:28px; --lg-radius-card:22px;
  --lg-radius-control:20px; --lg-radius-btn-sm:18px; --lg-radius-pill:999px;
  --lg-shadow-xs:0 1px 2px rgba(58,52,84,.04),0 2px 8px rgba(58,52,84,.05);
  --lg-shadow-sm:0 4px 12px rgba(58,52,84,.06);
  --lg-shadow-md:0 8px 24px rgba(58,52,84,.08),0 2px 6px rgba(58,52,84,.05);
  --lg-shadow-lg:0 16px 40px rgba(58,52,84,.12),0 4px 12px rgba(58,52,84,.05);
  --lg-glass-highlight:inset 0 1px 0 rgba(255,255,255,.60);
  --lg-ring-width:2px; --lg-ring-offset:2px; --lg-ring-color:rgba(232,93,143,.6);
  /* 字阶（02 · 2.2.2 / 2.2.3） */
  --lg-fs-display:32px;--lg-lh-display:40px; --lg-fs-title:24px;--lg-lh-title:32px;
  --lg-fs-section:18px;--lg-lh-section:26px; --lg-fs-body:15px;--lg-lh-body:22px;
  --lg-fs-body-sm:14px;--lg-lh-body-sm:20px; --lg-fs-caption:12px;--lg-lh-caption:16px;
  --lg-fs-num-lg:32px;--lg-lh-num-lg:40px; --lg-fs-num-md:24px;--lg-lh-num-md:32px;
  --lg-fs-num-sm:16px;--lg-lh-num-sm:22px;
  --lg-font-sans:"Inter","SF Pro Display",-apple-system,BlinkMacSystemFont,"PingFang SC",
    "MiSans","HarmonyOS Sans","Noto Sans SC","Helvetica Neue",sans-serif;
  /* 动效（07 · 7.2） */
  --lg-t-fast:120ms; --lg-t-base:220ms; --lg-t-slow:400ms; --lg-t-breathe:2.4s;
  --lg-ease-out:cubic-bezier(.22,1,.36,1); --lg-ease-in-out:cubic-bezier(.65,0,.35,1);
  --lg-z-control:30; --lg-z-overlay:40;

  /* 填充档（V2.10 抽出）：暗色档只需换这一组 —— 页面**不写**任何暗色专属规则
     （02 · 2.1.9 口径：白色叠加层由 14–60% 降到 6–16%）。浅色取值＝抽出前的原值，观感零变化。 */
  --pm-fill-1:rgba(255,255,255,.62); --pm-fill-2:rgba(255,255,255,.55); --pm-fill-3:rgba(255,255,255,.30); --pm-fill-4:rgba(255,255,255,.78); --pm-fill-5:rgba(255,255,255,.52); --pm-fill-6:rgba(255,255,255,.58); --pm-fill-7:rgba(255,255,255,.60);
  --pm-fill-8:rgba(255,255,255,.65); --pm-fill-9:rgba(255,255,255,.85); --pm-fill-10:rgba(255,255,255,.24); --pm-fill-11:rgba(255,255,255,.32); --pm-brd-1:rgba(255,255,255,.75); --pm-brd-2:rgba(255,255,255,.70); --pm-brd-3:rgba(255,255,255,.85);
}

/* ── 产品辅助色（PRD §十一「五个业务系统可以拥有不同的辅助色」）──────────────
   只用于**产品标识**：Hero 氛围光、产品名色条、KPI 主指标、侧栏选中色条、切换条色点。
   主行动（Primary 按钮）六个产品一律走品牌蜜桃粉档 + 深字 —— 12 · 12.3.2 把
   「主行动渐变」定为品牌语义，若随产品变色，同一动作在不同产品里就是不同权重。
   ⚠️ --pm-ink 是**文字深档**（-500 亮档在浅底上不足 4.5:1，02 · 2.1.5），
      --pm-hue 只作填充/色块/光斑，两者不得互换。 */
.gm-pm--p01{--pm-hue:#A9315B;--pm-ink:#A9315B;--pm-tint:rgba(178,58,99,.10);--pm-glow:rgba(178,58,99,.14)}
.gm-pm--p02{--pm-hue:#FFC3A0;--pm-ink:#8D5A15;--pm-tint:rgba(255,195,160,.22);--pm-glow:rgba(255,195,160,.20)}
.gm-pm--p03{--pm-hue:#F77FA3;--pm-ink:#A9315B;--pm-tint:rgba(247,127,163,.14);--pm-glow:rgba(247,127,163,.18)}
.gm-pm--p04{--pm-hue:#B69AFF;--pm-ink:#6242B8;--pm-tint:rgba(182,154,255,.16);--pm-glow:rgba(182,154,255,.18)}
.gm-pm--p05{--pm-hue:#6FC9B4;--pm-ink:#25715D;--pm-tint:rgba(111,201,180,.16);--pm-glow:rgba(111,201,180,.16)}
.gm-pm--p06{--pm-hue:#9A78FF;--pm-ink:#6A48DC;--pm-tint:rgba(154,120,255,.14);--pm-glow:rgba(154,120,255,.18)}

/* ── 模块根：页面环境层（L0）。底色只走暖中性，彩色只出现在光斑与组件里
      （02 · 2.1「大面积彩色背景一律禁止」）。 ── */
.gm-pm{position:relative;font-family:var(--lg-font-sans);color:var(--lg-text-primary);line-height:1.6;
  -webkit-font-smoothing:antialiased;padding:var(--lg-space-5) var(--lg-space-5) var(--lg-space-10)}

/* 环境光斑 ≥2 处（06 · 6.2 验收）：品牌粉 + 淡紫为底，产品辅助色只出现在 Hero 内。 */
.gm-pm__amb{position:absolute;inset:0;pointer-events:none;overflow:hidden;
  border-radius:var(--lg-radius-container);z-index:0}
.gm-pm__amb i{position:absolute;display:block}
.gm-pm__amb i:nth-child(1){left:-6%;top:-4%;width:60%;height:52%;background:var(--lg-glow-pink)}
.gm-pm__amb i:nth-child(2){right:-8%;top:8%;width:56%;height:56%;background:var(--lg-glow-purple)}
.gm-pm__amb i:nth-child(3){left:24%;bottom:-18%;width:52%;height:46%;background:var(--lg-glow-white)}


/* ── 切换条（产品 × 形态）──────────────────────────────────────────────
   06 · 6.5.2「全屏 backdrop blur 节点 ≤6」：本模块只在**这一条**与工作台顶栏
   两处使用 backdrop-filter。卡片一律用「白渐变 + 受光白边 + 柔影」表达玻璃，
   不逐卡开模糊 —— 12 个页面同屏卡片数量很大，逐卡模糊既过腻又拖帧。 */





/* 产品 chip / 形态分段：均用 <button> + aria-pressed（键盘可达，且不依赖 hover） */







/* ── 品牌锁版（12 · 12.1 名称使用规范）：logo + 品牌名 + 系统名 ──────────────
   全站**只此一处实现**：logo 一律圆形裁切、尺寸只 26 / 36 / 44 三档；
   品牌名固定 `妈咪好 GoodMom`（大小写见 12.1），系统名用产品中文名。
   早先各页面各写一遍 —— logo 圆角 8/18 混用、品牌行有的写 Goodmom 有的写 GoodMom。 */
.gm-brand{display:inline-flex;align-items:center;gap:var(--lg-space-3);min-width:0}
.gm-brand img{border-radius:50%;object-fit:cover;flex:none;box-shadow:0 2px 8px rgba(178,58,99,.20)}
.gm-brand--sm img{width:26px;height:26px}
.gm-brand--md img{width:36px;height:36px}
.gm-brand--lg img{width:44px;height:44px}
.gm-brand__t{display:flex;flex-direction:column;line-height:1.3;min-width:0}
.gm-brand__t b{font-size:var(--lg-fs-caption);font-weight:600;color:var(--mmh-rose-700);letter-spacing:.01em}
.gm-brand__t strong{font-size:var(--lg-fs-body-sm);font-weight:600;color:var(--lg-text-primary)}
.gm-brand--lg .gm-brand__t strong{font-size:var(--lg-fs-section);font-weight:600}
.gm-brand__t small{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}

/* 产品语义图标（09 · 图标库领域图标）：底色用产品辅助色浅染、图形用其深档 */
.gm-prod-ico{flex:none;width:40px;height:40px;border-radius:var(--lg-radius-btn-sm);
  display:inline-flex;align-items:center;justify-content:center;
  color:var(--pm-ink,var(--mmh-rose-700));background:var(--pm-tint,rgba(247,127,163,.14))}
.gm-prod-ico svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round;stroke-linejoin:round}

/* 概览卡：把"队列 / 质量 / 动态"合成一张卡的三段 —— 三张并列小卡会显得页面很碎 */
.gm-pm-ov{margin-top:var(--lg-space-3);padding-top:var(--lg-space-3);border-top:1px solid var(--lg-divider)}
.gm-pm-ov:first-of-type{margin-top:0;padding-top:0;border-top:none}
.gm-pm-ov>h4{margin:0 0 var(--lg-space-2);font-size:var(--lg-fs-caption);font-weight:600;
  color:var(--lg-text-secondary);letter-spacing:.02em}

/* ── 卡片与面板（02 · 2.5 的 L2/L1 配方：白渐变 + 受光白边 + 柔影 + border-box 原点）── */
.gm-pm-card{border-radius:var(--lg-radius-card);padding:var(--lg-space-5);
  background:linear-gradient(160deg,var(--pm-fill-1),var(--pm-fill-3));
  border:1px solid var(--pm-brd-1);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-sm);
  background-origin:border-box;min-width:0}
.gm-pm-panel{border-radius:var(--lg-radius-card-lg);padding:var(--lg-space-6);
  background:linear-gradient(160deg,var(--pm-fill-2),var(--pm-fill-10) 55%,var(--pm-fill-11));
  border:1px solid var(--pm-brd-2);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-md);
  background-origin:border-box;min-width:0}
.gm-pm-card h3,.gm-pm-panel h3{margin:0 0 var(--lg-space-3);font-size:var(--lg-fs-section);
  line-height:var(--lg-lh-section);font-weight:600}
/* 曲线图宽度上限：外壳的 .gm-growth__svg 是 width:100%，卡片一变宽图就跟着长高
   （实测 823px 宽时单张曲线卡 724px 高，把整列顶得极高）。图本身 viewBox 只有 380 宽，
   超过 560 再放大只会变糊，故按内容宽度封顶。 */
/* ⚠️ 不能用 `.gm-pm-chart .gm-growth__svg` 封顶：外壳的 gmGrowth 会**就地替换**挂载点内容
   并改掉它的 class（挂载点的 `.gm-pm-chart` 随之消失，选择器再也匹配不到）。
   故用一个外层容器封顶 —— 容器 class 不会被外壳改写。 */
.gm-pm-chartbox{max-width:620px;margin:0 auto}
.gm-pm-cap{font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);color:var(--lg-text-secondary)}
.gm-pm-num{font-variant-numeric:tabular-nums}

/* ── 页面壳（17 · 17.1.1：① 页面标题区 ② 工具行 ③ 内容区 ④ 页脚）── */
.gm-pm-view{display:none;position:relative;z-index:1}
.gm-pm-view.is-on{display:block;animation:gmPmFade var(--lg-t-slow) var(--lg-ease-out) both}
@keyframes gmPmFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gm-pm-head{display:flex;align-items:flex-end;gap:var(--lg-space-4);flex-wrap:wrap;
  margin-bottom:var(--lg-space-6)}
.gm-pm-head h2{margin:0;font-size:var(--lg-fs-title);line-height:var(--lg-lh-title);font-weight:600;
  letter-spacing:-.01em}
.gm-pm-head .en{font-size:var(--lg-fs-body-sm);color:var(--lg-text-secondary)}
/* 序号徽标：**浅染底 + 深档字**。原写成"辅助色实底 + 深字"时，深玫档（#A9315B）
   上深字实测 2.00:1、淡紫档（#9A78FF）3.54:1 —— a11y-dom 会判为确证失败。
   深色底配白字是另一个方向，但 02 · 2.6 / D9 只允许品牌亮粉档配深字，
   产品辅助色深浅不一，统一走"浅染 + 深档"最稳（02 · 2.1.5 亮档只作填充）。 */
.gm-pm-head .no{font-size:var(--lg-fs-caption);font-weight:600;color:var(--pm-ink,var(--mmh-rose-700));
  background:var(--pm-tint,rgba(247,127,163,.14));border-radius:var(--lg-radius-pill);
  padding:var(--lg-space-1) var(--lg-space-3);flex:none}
/* ── 落地页 · Hero ─────────────────────────────────────────────────── */
.gm-pm-hero{position:relative;overflow:hidden;display:grid;
  grid-template-columns:minmax(0,1fr);gap:var(--lg-space-6);align-items:center}
.gm-pm-hero::after{content:"";position:absolute;right:-12%;top:-46%;width:62%;height:150%;
  background:var(--lg-glow-pink);pointer-events:none}
.gm-pm-hero>*{position:relative}
.gm-pm-hero h3{margin:0 0 var(--lg-space-2);font-size:var(--lg-fs-display);
  line-height:var(--lg-lh-display);font-weight:600;letter-spacing:-.02em}
.gm-pm-hero p{margin:0;font-size:var(--lg-fs-body);line-height:1.7;max-width:58ch}
.gm-pm-hero .en{display:inline-block;font-size:var(--lg-fs-body-sm);color:var(--lg-text-secondary);
  padding-left:var(--lg-space-3);border-left:2px solid var(--mmh-rose-500);margin-bottom:var(--lg-space-3)}

.gm-pm-hero>*{position:relative}










/* ── 按钮（03 · 3.2.4；每屏 Primary 唯一 —— 17 · 1.1.3）── */
.gm-pm-btn{font-family:inherit;display:inline-flex;align-items:center;justify-content:center;
  gap:var(--lg-space-2);height:40px;padding:0 var(--lg-space-5);border-radius:var(--lg-radius-pill);
  font-size:var(--lg-fs-body-sm);font-weight:600;line-height:1;cursor:pointer;white-space:nowrap;
  border:1px solid transparent;text-decoration:none;
  transition:transform var(--lg-t-fast) var(--lg-ease-out),box-shadow var(--lg-t-base) var(--lg-ease-out)}
.gm-pm-btn:active{transform:scale(.97)}
.gm-pm-btn svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round;stroke-linejoin:round}
.gm-pm-btn--pri{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);
  box-shadow:0 1px 2px rgba(178,58,99,.22),0 8px 20px rgba(240,127,163,.30);background-origin:border-box}
.gm-pm-btn--pri:hover{box-shadow:0 2px 4px rgba(178,58,99,.24),0 12px 26px rgba(240,127,163,.38)}
.gm-pm-btn--line{background:var(--pm-fill-2);color:var(--mmh-rose-700);
  border:1px solid rgba(232,93,143,.45);box-shadow:var(--lg-shadow-xs)}
.gm-pm-btn--line:hover{background:rgba(247,127,163,.10);border-color:rgba(232,93,143,.72)}

/* 文字动作（15 · 15.1.2 辅助操作 + 17 · 17.2.3「行内动作优先文字链接」） */

.gm-pm-act:hover{text-decoration:underline}
.gm-pm-acts{display:inline-flex;align-items:center;justify-content:flex-end;
  gap:var(--lg-space-3);flex-wrap:nowrap}
.gm-pm-act{font-family:inherit;font-size:var(--lg-fs-caption);font-weight:500;line-height:1.5;
  color:var(--lg-link);background:none;border:none;padding:0;cursor:pointer;white-space:nowrap}
.gm-pm-act:hover{text-decoration:underline}
.gm-pm-act[data-kind="collab"]{color:var(--lg-sem-special)}
.gm-pm-act[disabled]{color:var(--lg-text-secondary);cursor:default;text-decoration:none}

/* ── 区块（17 · 17.1.2：小节间 ≥24，大板块 32–40）── */
.gm-pm-sec{margin-top:var(--lg-space-8)}
.gm-pm-sec__h{display:flex;align-items:baseline;gap:var(--lg-space-3);flex-wrap:wrap;
  margin-bottom:var(--lg-space-4)}
.gm-pm-sec__h h3{margin:0;font-size:var(--lg-fs-section);line-height:var(--lg-lh-section);font-weight:600}
.gm-pm-sec__h span{font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);
  color:var(--lg-text-secondary)}
.gm-pm-grid{display:grid;gap:var(--lg-space-4)}
.gm-pm-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}
.gm-pm-grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.gm-pm-grid--4{grid-template-columns:repeat(4,minmax(0,1fr))}
/* ⚠️ 轨道一律 minmax(0,·)：`1fr` 的自动最小值是 **min-content**，
   而本模块左列含宽表格（表头 6 列），min-content 可到 700px+ ——
   写成 `1.6fr 1fr` 时网格列会被表格撑开，页面横向溢出（实测移动端 +290~391px）。 */
.gm-pm-grid--wide{grid-template-columns:minmax(0,1fr)}
/* 单列档（p03 孕产妇工作台的 6 列宽表用）：**必须显式声明轨道**。
   只给 `.gm-pm-grid` 的 `display:grid` 时，隐式列是 `auto`（最小值 = min-content），
   表格把列撑到 885px：1025–1134 档（菜单列还在、内容列 757–932px）页面横向溢出
   （实测 1080 溢出 53px、1100 溢出 33px；.gm-tbl-wrap 的横滑根本轮不到生效）。 */
.gm-pm-grid--stack{grid-template-columns:minmax(0,1fr)}

/* 价值卡：序号 + 标题 + 说明（17 · 17.3.1 组合顺序） */





/* 功能架构：一级模块 + 二级功能 chips（数据来自 PRD 功能架构树） */





/* ── 状态标签（14 · 4.4.4：色点 8px + caption 文本；15 · 15.5：六语义唯一一套；
      14 · 4.4.3：标签文本 ≤6 字）颜色永不单独传义（14 · 4.4.1）。
      淡底用 --lg-tint-base + 语义色低透明，不用 color-mix（02 · 2.1.9 实测会把小字压到 4.06:1）。 ── */
.gm-pm-tag{display:inline-flex;align-items:center;gap:var(--lg-space-2);
  padding:var(--lg-space-1) var(--lg-space-3);border-radius:var(--lg-radius-pill);
  font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);font-weight:500;white-space:nowrap}
.gm-pm-tag i{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.gm-pm-tag--positive{color:var(--lg-sem-positive);background:rgba(111,201,180,.16)}
.gm-pm-tag--info{color:var(--lg-sem-info);background:var(--pm-tint-info)}
.gm-pm-tag--attention{color:var(--lg-sem-attention);background:rgba(242,178,92,.18)}
.gm-pm-tag--risk{color:var(--lg-sem-risk);background:rgba(239,106,123,.14)}
.gm-pm-tag--neutral{color:var(--lg-sem-neutral);background:rgba(88,98,115,.10)}
.gm-pm-tag--special{color:var(--lg-sem-special);background:rgba(154,120,255,.14)}
/* 五色分级：色点用 02 · 2.10 专项色板，文字仍走 AA 深档（两者不同轴，不得混用六语义色） */
.gm-pm-tag--m5{color:var(--lg-text-primary);background:var(--pm-fill-1)}
.gm-pm-tag--m5 i{background:var(--m5)}
.gm-pm-tag--m5[data-m5="1"]{--m5:var(--mmh-m5-m1)} .gm-pm-tag--m5[data-m5="1"]{color:#1F6B4F}
.gm-pm-tag--m5[data-m5="2"]{--m5:var(--mmh-m5-m2)} .gm-pm-tag--m5[data-m5="2"]{color:#7A5F0D}
.gm-pm-tag--m5[data-m5="3"]{--m5:var(--mmh-m5-m3)} .gm-pm-tag--m5[data-m5="3"]{color:#8D5A15}
.gm-pm-tag--m5[data-m5="4"]{--m5:var(--mmh-m5-m4)} .gm-pm-tag--m5[data-m5="4"]{color:var(--lg-sem-risk)}
.gm-pm-tag--m5[data-m5="5"]{--m5:var(--mmh-m5-m5)} .gm-pm-tag--m5[data-m5="5"]{color:var(--lg-sem-special)}

/* ── 全生命周期轴（13 · 13.4；阶段色按 12.2.1，填充档取最近品牌 Token，
      文字深档另取 —— 阶段色本身只做「已完成段渐变 + 当前段呼吸点」）── */



/* 连接线：从节点右侧画到下一个节点左侧。⚠️ **最后一个节点必须去掉** ——
   它后面没有节点，线会沿 `left:calc(50% + 14px)` 一直伸到自身右侧 36% 处，
   把容器撑出横向溢出（实测 1440px 视口溢出 135px，page-qa 判 P1）。
   首节点同理（前面无线），两条缺一不可。 */


/* 已完成节点：品牌**主行动档**渐变 + 深字（D9 · 06 · 6.5.3 路径②：亮粉底禁白字，
   白字实测 2.46–3.48:1）。已连线段的渐变只作装饰，不承载文字。 */





@keyframes gmPmBreathe{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.34);opacity:0}}



/* ── 工作台页面壳（17 · 17.3.4：顶栏 → 4 KPI → 左待处理表 + 右快捷工具/概览）── */
.gm-pm-pcbar{display:flex;align-items:center;gap:var(--lg-space-3);flex-wrap:wrap;
  padding:var(--lg-space-2) var(--lg-space-3);border-radius:var(--lg-radius-pill);
  background:linear-gradient(160deg,var(--pm-fill-4),var(--pm-fill-5));
  border:1px solid var(--pm-brd-3);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-md);
  -webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2);
  background-origin:border-box;margin-bottom:var(--lg-space-4)}
.gm-pm-pcbar__logo{display:inline-flex;align-items:center;gap:var(--lg-space-2);
  font-size:var(--lg-fs-body);font-weight:600;color:var(--mmh-rose-700);flex:0 1 auto;min-width:0}
.gm-pm-pcbar__logo img{width:26px;height:26px;border-radius:var(--lg-radius-pill);
  object-fit:cover;flex:none}
.gm-pm-pcbar__logo small{font-size:var(--lg-fs-caption);font-weight:500;
  color:var(--lg-text-secondary);margin-left:var(--lg-space-1)}
.gm-pm-search{margin-left:auto;display:flex;align-items:center;gap:var(--lg-space-2);
  background:var(--pm-fill-7);border:1px solid var(--lg-divider);
  border-radius:var(--lg-radius-control);padding:0 var(--lg-space-3);height:40px;
  min-width:260px;flex:1 1 220px;color:var(--lg-text-secondary)}
.gm-pm-search svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7}
.gm-pm-search input{border:none;outline:none;background:transparent;font-family:inherit;
  font-size:var(--lg-fs-body-sm);color:var(--lg-text-primary);flex:1;min-width:0}
.gm-pm-search input:focus-visible{outline:var(--lg-ring-width) solid var(--lg-ring-color);
  outline-offset:var(--lg-ring-offset);border-radius:var(--lg-radius-control)}
.gm-pm-pcbar__meta{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);white-space:nowrap}
.gm-pm-av{width:36px;height:36px;border-radius:50%;flex:none;display:inline-flex;align-items:center;
  justify-content:center;font-size:var(--lg-fs-body-sm);font-weight:600;
  color:var(--pm-av-ink);background:linear-gradient(150deg,#FFDEE8,#FFF0F4)}

/* 左业务菜单 + 右内容。默认（<1366）单列：菜单变成内容上方的两条横向 chip 带，
   内容占满整宽；≥1366 才升级成 212px 菜单列 + 内容列（见文件末 ≥1366 档）。
   为什么不做"平板也留 212px 列"：1025–1365 档内容列只剩 757–1130px，
   4 个 KPI 掉到 170~250px/张（数字与说明互相顶），宽表也要横向拖动。 */
.gm-pm-wb{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--lg-space-4);align-items:start}
/* 菜单列的**唯一**容器：里面两组菜单（对象视图 / 业务菜单）各自是一个完整 nav。
   为什么要这层：`.gm-pm-wb` 的列轨道只有一条，两个 nav 直接做子项会多出网格项 —— 右侧
   内容会被塞进菜单列。 */
.gm-pm-sidenav{display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--lg-space-2);min-width:0}
.gm-pm-sidenav>.gm-pm-side{flex:1 1 320px;min-width:0}
.gm-pm-side{padding:var(--lg-space-3);border-radius:var(--lg-radius-card);
  background:linear-gradient(160deg,var(--pm-fill-6),var(--pm-fill-3));
  border:1px solid var(--pm-brd-2);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-sm);
  background-origin:border-box}
.gm-pm-side h4{margin:0 0 var(--lg-space-2);font-size:var(--lg-fs-caption);
  line-height:var(--lg-lh-caption);color:var(--lg-text-secondary);font-weight:600;padding-left:0}
/* 窄档：菜单项是 chip（标题独占一行 + 链接按内容宽度换行）。
   ⚠️ 链接包在 `.gm-pm-sidemenu` 里，只给 nav 加 flex 只会看到那一个 div —— 仍是"一列到底" */
.gm-pm-sidemenu{display:flex;flex-wrap:wrap;gap:var(--lg-space-1)}
.gm-pm-side a{display:flex;align-items:center;gap:var(--lg-space-2);min-height:36px;
  padding:0 var(--lg-space-3);border-radius:var(--lg-radius-pill);text-decoration:none;
  font-size:var(--lg-fs-body-sm);color:var(--lg-text-primary);position:relative;
  background:var(--pm-fill-6);border:1px solid var(--pm-brd-2)}
.gm-pm-side a:hover{background:var(--pm-fill-9)}
/* 选中态 = 产品辅助色浅染 + 左侧 2px 色条（不是实心粉：实心留给主行动，17 · 1.1.3） */
.gm-pm-side a[aria-current="true"]{background:var(--pm-tint,rgba(247,127,163,.14));font-weight:600}
.gm-pm-side a[aria-current="true"]::before{display:none;content:"";position:absolute;left:0;top:50%;
  transform:translateY(-50%);width:2px;height:20px;border-radius:2px;
  background:var(--pm-hue,var(--mmh-rose-500))}
.gm-pm-side a span{margin-left:auto;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);
  font-variant-numeric:tabular-nums}

/* KPI 行（17 · 17.3.4「4 KPI」；数字 02 · 2.2.3 num-lg + tabular-nums，单位不缩小主数字） */
.gm-pm-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--lg-space-4);
  margin-bottom:var(--lg-space-4)}
.gm-pm-kpi__l{font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);
  color:var(--lg-text-secondary);display:flex;align-items:center;gap:var(--lg-space-1)}
.gm-pm-kpi__v{margin-top:var(--lg-space-2);font-size:var(--lg-fs-num-lg);line-height:var(--lg-lh-num-lg);
  font-weight:600;font-variant-numeric:tabular-nums;color:var(--lg-text-primary)}
.gm-pm-kpi__v.is-accent{color:var(--pm-ink,var(--mmh-rose-700))}
.gm-pm-kpi__v.is-risk{color:var(--lg-sem-risk)} .gm-pm-kpi__v.is-att{color:var(--lg-sem-attention)}
.gm-pm-kpi__v.is-info{color:var(--lg-sem-info)}
.gm-pm-kpi__d{margin-top:var(--lg-space-1);font-size:var(--lg-fs-caption);
  line-height:var(--lg-lh-caption);color:var(--lg-text-secondary)}

/* 表格外层横滑（10 · 10.11.1；表格语义保留给读屏，不为横滑改 display） */
.gm-pm-tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.gm-pm-tblfoot{display:flex;align-items:center;gap:var(--lg-space-2);justify-content:flex-end;
  margin-top:var(--lg-space-3);font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}

/* 价值卡下的二级功能 chips（与功能架构同一套 chip 配方，避免两套外观） */


/* 卡内小节标题（h4）与 chip 列表（15 · 15.1.2 交付清单） */



/* 表格外层横滑（10 · 10.11.1：宽表在容器内横滚，不改 <table> 的 display —— 后者会把
   表格语义从无障碍树里抹掉，读屏只剩一串散字 TB-15-02）。外壳只在 ≤767 给了这条，
   桌面档由本模块补齐。 */
.gm-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}

/* 队列 / 工具 / 概览 / 动态行 */
.gm-pm-qr{display:flex;gap:var(--lg-space-2);flex-wrap:wrap;margin-bottom:var(--lg-space-3)}
.gm-pm-list{margin:0;padding:0;list-style:none}
.gm-pm-list li{display:flex;align-items:center;gap:var(--lg-space-3);
  padding:var(--lg-space-2) 0;border-top:1px solid var(--lg-divider);
  font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm)}
.gm-pm-list li:first-child{border-top:none}
.gm-pm-list li b{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:600}
/* ⚠️ 工具按钮是 `white-space:nowrap` + 左右 20px 内边距（内容盒 = 列宽 − 40px），
   固定两列时：320 档列宽 119 → 内容盒 79px 装不下 84px 的「建立妇女档案」（顶出 5px）；
   768 档右列更窄（列宽 112）时同样顶出 12px。改成按内容落列：≥300px 可容纳两列，否则单列。 */
/* ── 窄屏表格配方（17 · 17.1.3）：窄屏/平板整行合并单元（≤900 生效）─────────────────
   ⚠️ 为什么不是"表格转卡片"（`display:block`）：那会把 `<table>` 的语义整个丢掉 ——
   读屏在窄屏就读不出"这是一张表"，本仓 a11y 门禁也不接受。
   ⚠️ 为什么不是"隐藏中间列 + 摘要塞进首列"（试过，更糟）：首列被状态/操作两列挤到 ~118px，
   摘要被 `overflow-wrap:anywhere` 折成 6 行，实测单行高 **611px**，5 行表 3000px 高，还留 152px 横向滚动。
   最终做法：★ 每个数据行同时给出两套单元 —— 桌面用原列（`.gm-tbl__desk`），窄屏用
   一个 `colspan` 合并单元（`.gm-tbl__mob`）承载"对象+状态 / 详情 / 操作"三段式 ★。
   两套各自 `display` 互斥，任一视口下都只有一套在渲染（AT 不会读两遍），表格语义原样保留。
   实测数据（加这条的原因）：模块页表格 375 档宽 748px、卡片内容宽仅 ~290px，
   每看一行都要横向拖动，操作列默认在屏幕外；1024 档也还要滚 178px。 */
.gm-tbl__mob{display:none}
@media(max-width:900px){
  .gm-tbl__desk{display:none}
  .gm-tbl__mob{display:table-cell;white-space:normal;padding:12px 2px}
  .gm-tbl__mob .r1{display:flex;align-items:center;gap:var(--lg-space-2);flex-wrap:wrap}
  .gm-tbl__mob .r1 b{font-size:var(--lg-fs-body-sm);font-weight:600}
  .gm-tbl__mob .r2{margin-top:4px;font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);
    color:var(--lg-text-secondary);overflow-wrap:anywhere}
  .gm-tbl__mob .r3{margin-top:var(--lg-space-2);display:flex;gap:var(--lg-space-2);
    justify-content:flex-end;flex-wrap:wrap}
  .gm-tbl tbody tr{display:table-row}
  /* 表头在窄屏隐藏：6 个表头的文字 + 每格 24px 内边距合计 400px，是表格在 320 档仍滚 126px 的
     唯一来源（数据行已经是合并单元）。隐藏后由**行内自带列名标签**承担表头职责（自描述），
     桌面档表头原样保留、`<th scope>` 关联不变。 */
  .gm-tbl thead{display:none}
  .gm-tbl__mob .r2 i{font-style:normal;color:var(--lg-text-secondary);margin-right:6px}
  .gm-tbl th,.gm-tbl td{padding-left:6px;padding-right:6px}
}

.gm-pm-tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--lg-space-2)}
.gm-pm-tools .gm-pm-btn{width:100%}
.gm-pm-feed li{align-items:flex-start}
.gm-pm-feed .gm-pm-tag{flex:none}
.gm-pm-feed span{color:var(--lg-text-secondary)}

/* AI 边界提示条（13 · 13.5 医疗合规与视觉纪律：边界必须写清，且不靠颜色单独传义） */
.gm-pm-note{display:flex;gap:var(--lg-space-3);align-items:flex-start;
  padding:var(--lg-space-3) var(--lg-space-4);border-radius:var(--lg-radius-control);
  background:var(--pm-fill-1);border:1px solid var(--lg-divider);
  font-size:var(--lg-fs-caption);line-height:1.75;color:var(--lg-text-secondary)}
.gm-pm-note b{color:var(--lg-text-primary)}
.gm-pm-note--warn{background:rgba(242,178,92,.16);border-color:rgba(242,178,92,.35)}
.gm-pm-note i{width:8px;height:8px;border-radius:50%;flex:none;margin-top:6px;
  background:var(--lg-sem-attention)}
.gm-pm-note--info i{background:var(--lg-sem-info)}

/* 页脚（17 · 17.1.1 ⑥）：口径 + 示意数据声明 + 章节链接 */
/* ── 响应式（17 · 17.1.2：iPad 8:4 分栏 / Mobile 单列）。
   断点只用收敛档 1024 / 767（audit.py breakpoint_reg 的白名单），不新起 1023/479 这类
   相邻值 —— 相邻断点会让"同一设备不同页面换档不同"，是本仓 E 审查收口过的缺陷类。 ── */


/* 07 · 7.6 / 无障碍：系统开启"减弱动态效果"后只保留最简反馈 */

.gm-pm-kpi{font-family:inherit;text-align:left;cursor:pointer;width:100%;
  /* ⚠️ 显式 flex 列：KPI 的 label / 数字 / 说明是三个 `<span>`，按钮默认把它们当**行内**
     内容排在一条基线上 —— 于是数字与说明挤在同一行（1440 档看着像"12,849本月新增…"），
     窄档（768 的 170px 卡）说明被压成两行、溢出到相邻卡片下面。`__v` / `__d` 上的
     `margin-top` 也从未生效（行内元素不吃纵向 margin）。列布局才是这三个 span 的本意。 */
  display:flex;flex-direction:column;align-items:flex-start;
  transition:box-shadow var(--lg-t-base) var(--lg-ease-out),transform var(--lg-t-fast) var(--lg-ease-out)}
.gm-pm-kpi:hover{box-shadow:var(--lg-glass-highlight),var(--lg-shadow-md)}
.gm-pm-kpi:active{transform:scale(.99)}
.gm-pm-kpi[aria-pressed="true"]{border-color:var(--pm-hue,var(--mmh-rose-500));
  box-shadow:var(--lg-glass-highlight),var(--lg-shadow-md)}

/* ── 首页 · 产品卡（6 个产品入口）────────────────────────────────────── */
.gm-pm-prods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--lg-space-4)}
.gm-pm-prod{position:relative;overflow:hidden;display:flex;flex-direction:column}
/* 产品卡顶部一条产品色（辅助色只作场景标识；2px 落在 02 · 2.7.1 的强调档内） */
.gm-pm-prod::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;
  background:var(--pm-hue,var(--mmh-rose-500))}
.gm-pm-prod__hd{display:flex;align-items:center;gap:var(--lg-space-3);margin-bottom:var(--lg-space-3)}
.gm-pm-prod__no{flex:none;width:36px;height:36px;border-radius:var(--lg-radius-btn-sm);
  display:inline-flex;align-items:center;justify-content:center;font-size:var(--lg-fs-body-sm);
  font-weight:600;color:var(--pm-ink,var(--mmh-rose-700));background:var(--pm-tint,rgba(247,127,163,.14))}
.gm-pm-prod__hd b{display:block;font-size:var(--lg-fs-body);line-height:var(--lg-lh-body);font-weight:600}
.gm-pm-prod__hd small{display:block;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-pm-prod p{margin:0 0 var(--lg-space-3);font-size:var(--lg-fs-caption);line-height:1.75;
  color:var(--lg-text-secondary);
  /* 产品定位是 PRD 原文，整段保留（title 里有全文），但卡片上最多显示两行 ——
     目录页要"扫得动"，6 张卡各 5 行定位会把页面拉得很长、也看不出重点。 */
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.gm-pm-prod__meta{display:flex;flex-wrap:wrap;gap:var(--lg-space-2);margin-bottom:var(--lg-space-4)}
.gm-pm-prod__meta span{font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);
  color:var(--lg-text-secondary);padding:var(--lg-space-1) var(--lg-space-3);
  border-radius:var(--lg-radius-pill);background:var(--pm-fill-2);border:1px solid var(--lg-divider)}
.gm-pm-prod__cta{margin-top:auto}

/* ── 首页 · 互联链路（PRD §四「转入/贯通」把 6 个产品串起来；链路本身即可点导航）── */
.gm-pm-chain{list-style:none;margin:0;padding:0}
.gm-pm-chain li{display:flex;gap:var(--lg-space-3);align-items:flex-start;
  padding:var(--lg-space-3) 0;border-top:1px solid var(--lg-divider)}
.gm-pm-chain li:first-child{border-top:none}
.gm-pm-chain .n{flex:none;width:26px;height:26px;border-radius:50%;display:inline-flex;
  align-items:center;justify-content:center;font-size:var(--lg-fs-caption);font-weight:600;
  color:var(--lg-text-on-accent);background:var(--mmh-grad-action-hc);background-origin:border-box}
.gm-pm-chain .m{min-width:0}
.gm-pm-chain b{display:block;font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);font-weight:600}
.gm-pm-chain span{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-pm-chain a{color:var(--lg-link);text-decoration:none;font-weight:600}
.gm-pm-chain a:hover{text-decoration:underline}
/* 表格单元格里的文字链接（数据主责矩阵 → 该产品工作台）。
   ⚠️ 移动端必须给足热区：`td > a` 的实测盒子只有 56×17，page-qa 会判 P1 touch-target
   （10 · 10.4）。把盒子抬到 24 高（表内仍落在 44–52 行高档内），再用 ::after 扩到 44×44。 */
.gm-pm-link{color:var(--lg-link);text-decoration:none;font-weight:600}
.gm-pm-link:hover{text-decoration:underline}

/* ── 筛选 chips（列表页工具行，17 · 17.3.4）：点选筛选待处理清单 ── */
.gm-pm-filters{display:flex;align-items:center;gap:var(--lg-space-2);flex-wrap:wrap;
  margin-bottom:var(--lg-space-3)}
.gm-pm-filter{font-family:inherit;font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);
  font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:var(--lg-space-2);
  padding:var(--lg-space-1) var(--lg-space-3);border-radius:var(--lg-radius-pill);
  background:var(--pm-fill-2);border:1px solid var(--lg-divider);color:var(--lg-text-secondary)}
.gm-pm-filter:hover{background:var(--pm-fill-9)}
.gm-pm-filter[aria-pressed="true"]{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);
  border-color:transparent;font-weight:600;box-shadow:0 1px 2px rgba(178,58,99,.22);
  background-origin:border-box}
.gm-pm-filter__n{font-variant-numeric:tabular-nums}
.gm-pm-count{margin-left:auto;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-pm-empty{padding:var(--lg-space-5);text-align:center;font-size:var(--lg-fs-body-sm);
  color:var(--lg-text-secondary)}
/* 被筛掉的行：用 class 而不是 [hidden] —— 任何 display 规则都可能压过 UA 的 [hidden] */
.gm-pm-off{display:none}

/* 队列行可点：按该行语义筛选待处理清单（把"风险队列"与"待处理清单"连成一条动线） */
.gm-pm-qbtn{display:flex;align-items:center;gap:var(--lg-space-3);width:100%;
  font-family:inherit;font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);
  color:var(--lg-text-primary);background:none;border:none;cursor:pointer;text-align:left;
  padding:var(--lg-space-2) 0;border-top:1px solid var(--lg-divider)}
.gm-pm-qbtn:hover{color:var(--mmh-rose-700)}
.gm-pm-qbtn b{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:600;
  color:var(--lg-text-primary)}
.gm-pm-qbtn[aria-pressed="true"]{color:var(--mmh-rose-700);font-weight:600}

/* ── 响应式（17 · 17.1.2：iPad 8:4 分栏 / Mobile 单列）。
   断点只用收敛档 1024 / 767（audit.py breakpoint_reg 白名单），不新起 1023/479 这类相邻值。 ── */
@media (max-width:1024px){
  .gm-pm-hero{grid-template-columns:minmax(0,1fr)}
  .gm-pm-prods{grid-template-columns:repeat(2,minmax(0,1fr))}
}
/* 大屏档（≥1366）：恢复「212px 菜单列 + 内容列」的桌面形态。
   ⚠️ 门槛是 1366 而不是 1200/1280：1201–1365 档内容列只有 933–1130px，
   4 个 KPI 4×217~253、宽表还要横向拖动；单列反而更稳（内容 933–1130 全给主区）。 */
@media (min-width:1366px){
  .gm-pm-wb{grid-template-columns:212px minmax(0,1fr)}
  .gm-pm-sidenav{flex-direction:column;flex-wrap:nowrap;gap:var(--lg-space-3)}
  .gm-pm-sidenav>.gm-pm-side{flex:none;width:100%}
  .gm-pm-side h4{margin:0 0 var(--lg-space-2);padding-left:var(--lg-space-3)}
  .gm-pm-sidemenu{display:block}
  .gm-pm-side a{min-height:40px;padding:0 var(--lg-space-3);
    border-radius:var(--lg-radius-control);background:transparent;border:none}
  .gm-pm-side a:hover{background:var(--pm-fill-8)}
  .gm-pm-side a[aria-current="true"]::before{display:block}
}
/* 平板档（768–1023，规范第二档）：4 个 KPI 挤成 170–234px 宽，数字与说明互相顶；
   规范 17 · 17.1.2 的平板形态是 2×2，这里按规范档位落 2 列（≤767 手机档仍 2 列）。 */
@media (min-width:768px) and (max-width:1023px){
  .gm-pm-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
}
/* 两列（主表 + 侧卡）只在 ≥1366 生效：`.gm-tbl td` 的 `white-space:nowrap` 是既有裁决
   （page-qa 要求表格行高 44–52px，不能靠折行缩短表格），所以主表侧必须**给够宽度**：
   `minmax(780px,…)` 保证 5/6 列表不需要横向拖动（实测「今日待处理」5 列需 726px）。
   1366 以下一律单列（内容 933–1325px 全给主区），避免 1201–1365 档主表被压到 560px 要拖动。 */
@media (min-width:1366px){
  .gm-pm-grid--wide{grid-template-columns:minmax(780px,1.85fr) minmax(0,1fr)}
}
@media (max-width:900px){
  /* 768~900 档：整宽后仍差几十像素，靠收单元格内边距补上 */
  .gm-tbl th,.gm-tbl td{padding-left:8px;padding-right:8px}
}
@media (max-width:767px){
  .gm-pm{padding:var(--lg-space-4) var(--lg-space-4) var(--lg-space-8)}
  .gm-pm-prods,.gm-pm-grid--2,.gm-pm-grid--wide{grid-template-columns:minmax(0,1fr)}
  .gm-pm-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gm-pm-head h2{font-size:var(--lg-fs-section);line-height:var(--lg-lh-section)}
  .gm-pm-hero h3{font-size:var(--lg-fs-title);line-height:var(--lg-lh-title)}
  /* 顶栏品牌块：`flex:none` + 长机构名会把顶栏撑到比视口还宽（实测 375px 下 +290~391px 溢出）。
     小屏改为可收缩 + 机构名换行到独立一行。 */
  .gm-pm-pcbar__logo{flex:0 1 auto;min-width:0;flex-wrap:wrap}
  .gm-pm-pcbar__logo small{width:100%;margin-left:0;line-height:1.5}
  /* 页脚内联链接：11 · 11.2.18 要求行内链接热区高 ≥24 */
  /* 表格内文字链接：盒子抬到 24 高，并由 ::after 扩到 44×44 热区（10 · 10.4） */
  .gm-pm-link{position:relative;display:inline-flex;align-items:center;min-height:24px}
  /* 10 · 10.4：≤767px 可点目标热区 ≥44×44（视觉盒子不动，::after 扩热区）。
     ⚠️ 选择器与按钮集合必须同步维护：漏一处即"热区静默失联"。 */
  .gm-pm-btn,.gm-pm-act,.gm-pm-filter,.gm-pm-side a,.gm-pm-qbtn,.gm-pm-chain a,.gm-pm-link{position:relative}
  .gm-pm-btn::after,.gm-pm-act::after,.gm-pm-filter::after,.gm-pm-side a::after,
  .gm-pm-qbtn::after,.gm-pm-chain a::after,.gm-pm-link::after{
    content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:100%;min-width:44px;height:100%;min-height:44px}
  /* 搜索框：<input> 是替换元素，::after 不渲染，只能把盒子本身做够 44（10 · 10.4） */
  .gm-pm-search,.gm-pm-search input{height:44px}
}
/* 07 · 7.6 / 无障碍：系统开启"减弱动态效果"后只保留最简反馈 */
@media (prefers-reduced-motion:reduce){
  .gm-pm-view.is-on{animation:none}
}

/* ── 暗色档（02 · 2.1.9 夜间暖石板）────────────────────────────────────────────
   合并页里 `:root` / `[data-theme="dark"]` 都会被 build-site.py 改写到**模块根**
   （`.gm-mod--products[data-theme="dark"]`），独立产品页则直接命中 `<html>`。
   这里**只换变量档位**：模块内没有一条 `.gm-pm-*` 暗色专属规则 —— 那是
   「暗色不漂移」的唯一保障。禁纯黑/纯白，色相不变，只换档位。 */
[data-theme="dark"]{
  /* 画布：暗底暖石板（不是纯黑，也不是浅底反色） */
  background:linear-gradient(165deg,#1B1A21,#221F29 55%,#2A2731);
  /* ⚠️ 必须显式给 color：模块根自身不写 color 时，文字会继承**外壳 body 的深墨**，
     暗底上就是「深字压深底」（实测 h2 1.13:1）。这一条是 81 条暗色失败里最多的一类。 */
  color:var(--lg-text-primary);
  /* 文字与分隔（映射表 A） */
  --lg-text-primary:#F3EFEC; --lg-text-secondary:#C9C4CE; --lg-text-tertiary:#A6ADB9;
  --lg-text-on-accent:#1B1A21; --lg-divider:rgba(255,255,255,.12); --lg-link:#FFC4D6;
  --lg-tint-base:#23222A; --lg-tint-pct:8%;
  /* 六语义：暗底用浅档（映射表 B） */
  --lg-sem-positive:#6FC9B4; --lg-sem-info:#9CAEFF; --lg-sem-attention:#F2C14E;
  --lg-sem-risk:#F79AA8; --lg-sem-neutral:#A6ADB9; --lg-sem-special:#B9A0FF;
  /* 品牌文字档：色相不变，改用 -300 亮档 */
  --mmh-rose-700:#FFC4D6; --mmh-rose-600:#FF9AB6; --mmh-mint-600:#A9E3D4;
  /* 填充档：白色叠加 14–60% → 6–16%（映射表 A 第 2 条） */
--pm-fill-1:rgba(255,255,255,.10); --pm-fill-2:rgba(255,255,255,.09); --pm-fill-3:rgba(255,255,255,.06); --pm-fill-4:rgba(255,255,255,.14); --pm-fill-5:rgba(255,255,255,.10); --pm-fill-6:rgba(255,255,255,.10); --pm-fill-7:rgba(255,255,255,.09);
  --pm-fill-8:rgba(255,255,255,.13); --pm-fill-9:rgba(255,255,255,.16); --pm-fill-10:rgba(255,255,255,.06); --pm-fill-11:rgba(255,255,255,.07); --pm-brd-1:rgba(255,255,255,.14); --pm-brd-2:rgba(255,255,255,.12); --pm-brd-3:rgba(255,255,255,.16);
  /* 玻璃与阴影：边缘光只留顶部 1px，阴影换深档 */
  --lg-glass-highlight:inset 0 1px 0 rgba(255,255,255,.16);
  --lg-shadow-xs:0 1px 2px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.30);
  --lg-shadow-sm:0 4px 12px rgba(0,0,0,.35);
  --lg-shadow-md:0 8px 24px rgba(0,0,0,.42),0 2px 6px rgba(0,0,0,.30);
  --lg-shadow-lg:0 16px 40px rgba(0,0,0,.50),0 4px 12px rgba(0,0,0,.30)
}

/* 每产品墨色/淡底：**同色相**提亮到暗底可读档（02 · 2.1.9「只换档位不换色相」） */
[data-theme="dark"] .gm-pm--p01{--pm-ink:#FFC4D6;--pm-tint:rgba(247,127,163,.22);--pm-glow:rgba(247,127,163,.10)}
[data-theme="dark"] .gm-pm--p02{--pm-ink:#FFDCC7;--pm-tint:rgba(255,195,160,.26);--pm-glow:rgba(255,195,160,.12)}
[data-theme="dark"] .gm-pm--p03{--pm-ink:#FFC4D6;--pm-tint:rgba(247,127,163,.22);--pm-glow:rgba(247,127,163,.10)}
[data-theme="dark"] .gm-pm--p04{--pm-ink:#C4B0FF;--pm-tint:rgba(182,154,255,.24);--pm-glow:rgba(182,154,255,.12)}
[data-theme="dark"] .gm-pm--p05{--pm-ink:#6FC9B4;--pm-tint:rgba(111,201,180,.22);--pm-glow:rgba(111,201,180,.12)}
[data-theme="dark"] .gm-pm--p06{--pm-ink:#B9A0FF;--pm-tint:rgba(154,120,255,.22);--pm-glow:rgba(154,120,255,.12)}
[data-theme="dark"]{--pm-av-ink:#1B1A21}

/* 暗底上的「亮片」类：L4 浮层改实底、信息淡底降透明度（02 · 2.1.9 映射表 A） */
[data-theme="dark"]{
  --lg-glass-popover:rgba(38,36,46,.92); --pm-tint-info:rgba(109,158,255,.10)
}
/* 五色标签：文字改用**同色相亮档**（色点 `i` 仍承载五色本身，D35 口径） */
[data-theme="dark"] .gm-pm-tag--m5[data-m5="1"]{color:#96E6CF}
[data-theme="dark"] .gm-pm-tag--m5[data-m5="2"]{color:#FAE1B3}
[data-theme="dark"] .gm-pm-tag--m5[data-m5="3"]{color:#FFD1A3}
"""

# ══════════════════════════════════════════════════════════════════════════
# 三、模板
#     ⚠️ 约定（构建期断言 + 门禁共同要求，改动前先读 build-site.py:1872-1927）：
#       · id / href / for / aria-*ref 一律**双引号**：断言的正则只认双引号；
#       · 静态 href 绝不指向"JS 生成的 id"（断言看不见 JS 建的节点 → 误报悬空锚点）；
#       · 挂载点用 **class + data 属性**，不用 id：构建期会因为 `id="x"` 加模块前缀，
#         而脚本里 `getElementById(变量)` 不会被一起改写 —— 那是静默失效（本轮实测踩到）；
#       · 跨模块引用用 `site/spec.html#ch-17`（构建期改写成 `#site-spec--ch-17` + data-mod）；
#       · 不使用 `.html` 结尾的站内链接（site-smoke 会判失败，只有打印版手册豁免）。
# ══════════════════════════════════════════════════════════════════════════

ICO = ('<svg class="gm-pm-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
       '<path d="%s"/></svg>')
ICO_ARROW = ICO % "M5 12h14M13 6l6 6-6 6"
SEARCH_ICO = ('<svg class="gm-pm-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
              '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 21 21"/></svg>')

TONE_CN = {"all": "全部", "risk": "风险 / 异常", "attention": "注意 / 待办",
           "info": "信息 / 进行", "neutral": "中性 / 未动", "positive": "正向 / 已完成",
           "special": "特殊 / 协作"}
TONE_KEY = {"accent": "all", "risk": "risk", "att": "attention", "info": "info"}


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tag(spec: str, status: bool = False) -> str:
    """状态标签。spec = `六语义|文案` 或 `m5|级别|文案`。

    六语义（15 · 15.5）与妊娠风险五色（02 · 2.10）是**两套并行**的色轴：
    前者表状态，后者表孕产妇风险分级，绝不互相替代（14 · 4.4.5 专项分级说明）。
    色点 + 文字双通道，颜色永不单独传义（14 · 4.4.1）。
    status=True 时加 data-status 标记 —— 行内动作推进状态时只改这一个标签，
    不会误改同一行里的五色分级标签。
    """
    parts = spec.split("|")
    attr = ' data-status="1"' if status else ""
    if parts[0] == "m5":
        return ('<span class="gm-pm-tag gm-pm-tag--m5" data-m5="%s"%s><i></i>%s</span>'
                % (parts[1], attr, esc(parts[2])))
    return ('<span class="gm-pm-tag gm-pm-tag--%s"%s><i></i>%s</span>'
            % (parts[0], attr, esc(parts[1])))


def head(p: dict | None, title: str, en: str) -> str:
    """页面标题区（17 · 17.1.1 ②）：标题 + 英文名。

    ⚠️ 界面里**不放序号徽标**（如「01 工作台」）：编号是 PRD 的产品编号，
       不是用户界面里的业务信息 —— 用户只需要知道"这是什么、能做什么"。
       同样不放"规范口径"：口径给评审与研发查，记在生成器注释与 CHANGELOG 里。
    """
    return ('<div class="gm-pm-head">\n  <h2>%s</h2>\n  <span class="en">%s</span>\n</div>\n'
            % (esc(title), esc(en)))


def foot(text: str) -> str:
    return '<p class="gm-pm-foot">%s</p>\n' % text


def home(prd: dict) -> str:
    """产品矩阵首页 = 6 大产品**对接页**。

    内容全部是平台级的（不重复各产品工作台里已有的操作上下文）：
    6 个产品入口 · 互联链路（PRD §四 转入/贯通）· 统一数据标准与数据主责（PRD §5.2）·
    销售组合与单品交付（PRD §7.1/§7.2）。
    """
    cards = []
    for p in PRODUCTS:
        cards.append(
            '<div class="gm-pm-card gm-pm-prod gm-pm--%s">\n'
            '  <div class="gm-pm-prod__hd"><span class="gm-prod-ico">%s</span>'
            '<span><b>%s</b><small>%s</small></span></div>\n'
            '  <p title="%s">%s</p>\n'
            '  <div class="gm-pm-prod__cta"><a class="gm-pm-btn gm-pm-btn--line" href="#%s-work">'
            '进入工作台 %s</a></div>\n'
            '</div>' % (p["pid"], "<svg viewBox=\"0 0 24 24\">" + PRODUCT_ICON[p["pid"]] + "</svg>",
                        esc(p["cn"]), esc(p["en_display"]),
                        esc(p["position"]), esc(p["position"]),
                        p["pid"], ICO_ARROW))

    chain = []
    for i, (name, desc, pid, nxt) in enumerate(LINKS, 1):
        target = ""
        if nxt:
            target = ('<a href="#%s-work">前往 %s 工作台 %s</a>'
                      % (nxt, esc(BY_PID[nxt]["short"]), ICO_ARROW))
        elif pid == "p06":
            target = '<a href="#p06-work">前往 AI 智能体工作台 %s</a>' % ICO_ARROW
        chain.append('<li><span class="n">%d</span><span class="m"><b>%s</b>'
                     '<span>%s</span>%s</span></li>' % (i, esc(name), esc(desc), target))

    rows = []
    for datum, who in prd["datamap"]:
        mine = prd["owner_of"].get(who)
        link = ('<a class="gm-pm-link" href="#%s-work">%s</a>' % (mine, esc(who))) if mine else esc(who)
        rows.append("<tr><td>%s</td><td>%s</td></tr>" % (esc(datum), link))

    return (
        '<div class="gm-pm-view gm-pm--home" id="home" data-p="home" data-k="home" '
        'aria-label="产品矩阵首页 · 6 大产品对接">\n'
        '%s'
        '<div class="gm-pm-panel gm-pm-hero">\n'
        '  <div>\n'
        '    <span class="gm-brand gm-brand--lg" style="margin-bottom:var(--lg-space-3)">'
        '<img src="../brand/logo-512.png" alt="妈咪好">'
        '<span class="gm-brand__t"><b>%s</b><strong>妇幼全生命周期健康管理</strong></span></span>\n'
        '    <h3>6 大产品，一套统一数据标准</h3>\n'
        '    <p>五个业务系统可单独销售、独立部署，通过统一档案标准互联互通；'
        'AI 智能体平台后置叠加，建议<b>经医生审核后</b>写回业务系统。</p>\n'
        '  </div>\n'
        '</div>\n'
        '<section class="gm-pm-sec">\n'
        '  <div class="gm-pm-sec__h"><h3>产品入口</h3><span>也可用顶部「产品矩阵」下拉切换</span></div>\n'
        '  <div class="gm-pm-prods">%s</div>\n'
        '</section>\n'
        '<section class="gm-pm-sec">\n'
        '  <div class="gm-pm-sec__h"><h3>数据互联链路</h3>'
        '<span>PRD §四「转入/贯通」· §五 数据互联互通</span></div>\n'
        '  <div class="gm-pm-grid gm-pm-grid--wide">\n'
        '    <div class="gm-pm-card"><ul class="gm-pm-chain">%s</ul></div>\n'
        '    <div class="gm-pm-card">\n'
        '      <h3>数据主责原则</h3>\n'
        '      <div class="gm-tbl-wrap"><table class="gm-tbl">\n'
        '        <caption>每类数据只有一个主责产品（PRD §5.2）。</caption>\n'
        '        <thead><tr><th scope="col">数据对象</th><th scope="col">主责产品</th></tr></thead>\n'
        '        <tbody>%s</tbody>\n'
        '      </table></div>\n'
        '    </div>\n'
        '  </div>\n'
        '</section>\n'
        '</div>\n'
        % (head(None, "产品矩阵首页", "GoodMom Product Matrix · 6 大产品对接"), BRAND,
           "".join(cards), "".join(chain), "".join(rows),
))


# 产品页文件名（与 gen-product-apps.py 产出的 fuyouaicansai/*.html 一致）
SLUG_BY_PID = {"p01": "p01-women-health", "p02": "p02-preconception", "p03": "p03-maternity",
               "p04": "p04-newborn", "p05": "p05-child-health", "p06": "p06-ai-care"}


def tbl_row(tone: str, who: str, mids: list, status_html: str, ops_html: str, ncols: int,
            labels: list | None = None) -> str:
    """数据行：桌面一套单元（`.gm-tbl__desk`）+ 窄屏一套合并单元（`.gm-tbl__mob`）。

    ★ 单一实现，两套标记一起出 ★ —— 各处表格（模块待处理 / 独立页待处理 / 业务模块页主表 /
    检查检验表）都调它，避免"每张表各写一遍窄屏适配"。
    窄屏三段式：① 对象 + 状态标签 ② 每个中间列「列名 + 值」（`labels` 给列名，自描述，
    所以窄屏可以安全隐藏表头）③ 操作按钮（右对齐、可换行）。
    两套互斥显示，任一视口只有一套进渲染树（读屏不会重复读），表格语义保留。
    """
    # ⚠️ 桌面这一套的**每一格**都要带 `.gm-tbl__desk`：状态/操作格漏了的话，
    # 窄屏会与合并单元里的同名内容同时渲染 —— 一屏里出现两个状态标签、两组按钮。
    desk = ('<td class="gm-tbl__desk"><b>%s</b></td>' % esc(who)
            + "".join('<td class="gm-tbl__desk">%s</td>' % m for m in mids)
            + '<td class="gm-tbl__desk">%s</td>'
              '<td class="gm-tbl__desk col-ops"><span class="gm-pm-acts">%s</span></td>'
              % (status_html, ops_html))
    # 列名不足时补空（表头隐藏后行内标签是唯一来源，长度不匹配会让整页生成失败）
    labs = list(labels or [])
    labs += [""] * max(0, len(mids) - len(labs))
    detail = "".join('<div class="r2">%s%s</div>'
                     % (('<i>%s</i>' % esc(labs[i])) if labs[i] else "", m)
                     for i, m in enumerate(mids))
    mob = ('<td class="gm-tbl__mob" colspan="%d">'
           '<div class="r1"><b>%s</b>%s</div>%s'
           '<div class="r3"><span class="gm-pm-acts">%s</span></div></td>'
           % (ncols, esc(who), status_html, detail, ops_html))
    return '<tr data-tone="%s">%s%s</tr>' % (tone, desk, mob)


def workbench(p: dict, prd: dict) -> str:
    """工作台首页（17 · 17.3.4 的工作台组合，按用户要求做过一轮去噪与版式整理）。

    版式（三段式，不随"有没有曲线"而失衡）：

        顶栏（品牌锁版 + 搜索 + 唯一 Primary + 机构日期 + 用户）
        4 KPI（可点 → 按语义筛选下方待处理清单）
        ┌ 左（1.6fr）今日待处理表 · 风险队列
        └ 右（1fr）  快捷工具 · 概览（质量 / 动态）
        生长·体重曲线（仅 p03/p04/p05，全宽、按内容宽度封顶）
        AI 边界提示（仅 p06）

    每个区块只承担一件事，说明性文案一律不写在界面上（口径记在本文件注释与 CHANGELOG）。
    """
    pid = p["pid"]
    pd = prd["products"][pid]
    d = DEMO[pid]

    # ── 业务菜单 ──────────────────────────────────────────────────────────────
    # ⚠️ 这里原来是 `[n for n, _ in pd["tree"]]` 直接铺开 9 个 `<a href="#p01-work">` ——
    # **每一项都指向同一个工作台锚点**，等于 9 个死链（用户："不要假控件""把菜单里的页面完善"）。
    # 现在与独立产品页**同一份数据源**（`module_pages`），每组都指向真实页面：
    #   · 对象视图 → 该产品页的 4 个视图（#work / #archive / #ai / #detail）
    #   · 业务菜单 → PRD 一级模块页（#mod-<key>）
    # 跨文件带锚点链接在本仓已有先例（site-index 模块 → `../preview/index.html#icons`）。
    # slug 与独立产品页文件名一致：p01 → p01-women-health（见 products_data.APP 的 slug 字段）
    app_slug = SLUG_BY_PID[pid]
    mods = module_pages(pid, pd, d, pd.get("caps") or [], "")
    # ⚠️ 两个菜单组必须包在**同一个**列容器（`.gm-pm-sidenav`）里：`.gm-pm-wb` 是
    # `212px minmax(0,1fr)` 两列网格，直接放两个 <nav> 会让它多出网格项（实测工作台内容区
    # 塌到 212px、表格横向滚 641px）。容器内再**各自**是一个完整 <nav>，标签分别是
    # 对象视图 / 业务菜单 —— 两个组各带标题与描边卡，视觉上仍是「菜单列」。
    # ⚠️ 这里的标签闭合**必须成对**：上一版漏了对象视图组的 `</div>`，HTML 解析器把
    # 第二个 <nav> 顶成兄弟节点、把右侧内容整块吞进业务菜单 nav 里（站点 6 个工作台
    # 全部命中：菜单两组并排铺满、内容被塞进 212px 列、各断点下都错位）。
    menu_html = (
        '<div class="gm-pm-sidenav">\n'
        '  <nav class="gm-pm-side" aria-label="对象视图">\n'
        '    <h4>对象视图</h4>\n'
        '    <div class="gm-pm-sidemenu">'
        + "".join('<a href="../fuyouaicansai/%s.html#%s">%s</a>' % (app_slug, v, esc(label))
                  for v, label in (("work", "工作台"), ("archive", "档案"),
                                   ("ai", "AI 协同"), ("detail", "详情")))
        + '</div>\n'
        '  </nav>\n'
        '  <nav class="gm-pm-side" aria-label="业务菜单">\n'
        '    <h4>业务菜单</h4>\n'
        '    <div class="gm-pm-sidemenu">'
        + "".join('<a href="../fuyouaicansai/%s.html#mod-%s">%s</a>'
                  % (app_slug, esc(m["key"]), esc(m["name"])) for m in mods)
        + '</div>\n'
        '  </nav>\n'
        '</div>')

    # ── 4 KPI：可点击，按语义筛选待处理清单（accent 档 = 全部）──
    kpis = "".join(
        '<button type="button" class="gm-pm-card gm-pm-kpi" data-tone-filter="%s" '
        'aria-pressed="false" title="按「%s」筛选待处理清单">'
        '<span class="gm-pm-kpi__l">%s</span>'
        '<span class="gm-pm-kpi__v is-%s">%s</span>'
        '<span class="gm-pm-kpi__d">%s</span></button>'
        % (TONE_KEY[tone], esc(TONE_CN[TONE_KEY[tone]]), esc(l), tone, esc(v), esc(dt))
        for l, v, dt, tone in d["kpis"])

    # ── 今日待处理：状态筛选 chips（带真实条数）+ 表格 + 行内动作 ──
    tones = ["risk", "attention", "info", "neutral", "positive", "special"]
    counts = {t: sum(1 for r in d["rows"] if r["tag"].split("|")[0] == t) for t in tones}
    chips = ['<button type="button" class="gm-pm-filter" data-tone-filter="all" aria-pressed="true">'
             '全部 <span class="gm-pm-filter__n">%d</span></button>' % len(d["rows"])]
    for t in tones:
        if counts[t]:
            chips.append('<button type="button" class="gm-pm-filter" data-tone-filter="%s" '
                         'aria-pressed="false">%s <span class="gm-pm-filter__n">%d</span></button>'
                         % (t, esc(TONE_CN[t]), counts[t]))

    has_m5 = any("m5" in r for r in d["rows"])
    # 6 列宽表（含五色分级列）在 ≤1600 用单列布局，否则表格需要横向拖动（见 CSS 注释）
    grid_cls = "stack" if has_m5 else "wide"
    rows_html = []
    for r in d["rows"]:
        tone = r["tag"].split("|")[0]
        acts = ['<button type="button" class="gm-pm-act" data-act="view">查看</button>',
                '<button type="button" class="gm-pm-act" data-act="advance" data-after="%s">%s</button>'
                % (esc(r["after"]), esc(r["act"]))]
        if r.get("free"):
            acts.append('<button type="button" class="gm-pm-act" data-kind="collab" data-act="collab" '
                        'data-after="special|%s">%s</button>'
                        % (esc("转诊" if r["free"] in ("发起转诊", "转诊") else "已驳回"), esc(r["free"])))
        mids = [esc(r["item"])]
        if has_m5:
            mids.append(tag("m5|%s|%s" % r["m5"]))     # `r["m5"]` 是 (档位, 文案) 元组
        mids.append(esc(r["when"]))
        labels = ["事项"] + (["风险分级"] if has_m5 else []) + ["时限"]
        rows_html.append(tbl_row(tone, r["who"], mids, tag(r["tag"], status=True), "".join(acts),
                                 5 + (1 if has_m5 else 0), labels))

    # ── 队列（点行 → 按该行语义筛选）；快捷工具；概览（质量 / 动态）──
    qbtns = "".join(
        '<button type="button" class="gm-pm-qbtn" data-tone-filter="%s" aria-pressed="false">%s<b>%s</b></button>'
        % (tone, esc(label), esc(value)) for label, value, tone in d["queue"]["rows"])
    tools = "".join('<button type="button" class="gm-pm-btn gm-pm-btn--line" data-tool="%s">%s</button>'
                    % (esc(t), esc(t)) for t in d["tools"])
    quality = "".join("<li>%s<b>%s</b></li>" % (esc(a), esc(b)) for a, b in d["quality"])
    feed = "".join('<li>%s<span>%s</span></li>' % (tag(t), esc(x)) for t, x in d["feed"])

    chart = ""
    if d.get("chart"):
        chart = ('<div class="gm-pm-card" style="margin-top:var(--lg-space-4)">'
                 '<div class="gm-pm-chartbox"><div class="gm-pm-chart" data-chart="%s"></div></div>'
                 '</div>' % pid)

    boundary = ""
    if d.get("boundary"):
        boundary = ('<div class="gm-pm-note" style="margin-top:var(--lg-space-4)"><i></i><div>'
                    '<b>AI 不负责：</b>%s。AI 只产出建议，须经医生审核后写入业务系统。'
                    '</div></div>' % esc("、".join(pd["no_do"])))

    return (
        '<div class="gm-pm-view gm-pm--%(pid)s" id="%(pid)s-work" data-p="%(pid)s" data-k="work" '
        'aria-label="%(cn)s · 工作台首页">\n'
        '%(head)s'
        '<div class="gm-pm-pcbar">\n'
        '  <span class="gm-brand gm-brand--sm"><img src="../brand/logo-512.png" alt="妈咪好">'
        '<span class="gm-brand__t"><b>%(brand)s</b><strong>%(cn)s</strong></span></span>\n'
        '  <span class="gm-pm-search">%(ico)s'
        '<input type="search" aria-label="搜索档案 / 姓名 / 档案号" '
        'placeholder="搜索档案 / 姓名 / 档案号"></span>\n'
        '  <button type="button" class="gm-pm-btn gm-pm-btn--pri" data-tool="%(primary)s">'
        '%(primary)s</button>\n'
        '  <span class="gm-pm-pcbar__meta">望京妇幼保健院 · 2025-06-02</span>\n'
        '  <span class="gm-pm-av" aria-hidden="true">王</span>\n'
        '</div>\n'
        '<div class="gm-pm-wb">\n'
        '%(menu)s\n'
        '  <div>\n'
        '    <div class="gm-pm-kpis">%(kpis)s</div>\n'
        '    <div class="gm-pm-grid gm-pm-grid--%(grid)s">\n'
        '      <div>\n'
        '        <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
        '          <h3>今日待处理</h3>\n'
        '          <div class="gm-pm-filters">%(chips)s'
        '<span class="gm-pm-count" data-count>共 %(n)d / %(n)d 条</span></div>\n'
        '          <div class="gm-tbl-wrap gm-pm-todos"><table class="gm-tbl">\n'
        '            <thead><tr><th scope="col">%(obj)s</th><th scope="col">事项</th>%(m5)s'
        '<th scope="col">状态</th><th scope="col">时限</th>'
        '<th scope="col" class="col-ops">操作</th></tr></thead>\n'
        '            <tbody>%(rows)s</tbody>\n'
        '          </table></div>\n'
        '          <div class="gm-pm-empty gm-pm-off" data-empty>当前筛选下暂无事项。</div>\n'
        '        </div>\n'
        '        <div class="gm-pm-card">\n'
        '          <h3>%(qtitle)s</h3>\n'
        '          %(qbtns)s\n'
        '        </div>\n'
        '      </div>\n'
        '      <div>\n'
        '        <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
        '          <h3>快捷工具</h3>\n'
        '          <div class="gm-pm-tools">%(tools)s</div>\n'
        '        </div>\n'
        '        <div class="gm-pm-card">\n'
        '          <div class="gm-pm-ov"><h4>质量</h4><ul class="gm-pm-list">%(quality)s</ul></div>\n'
        '          <div class="gm-pm-ov"><h4>动态</h4>'
        '<ul class="gm-pm-list gm-pm-feed" data-feed>%(feed)s</ul></div>\n'
        '        </div>\n'
        '      </div>\n'
        '    </div>\n'
        '    %(chart)s\n'
        '    %(boundary)s\n'
        '  </div>\n'
        '</div>\n'
        '</div>\n'
        % dict(pid=pid, cn=esc(p["cn"]), brand=BRAND, ico=SEARCH_ICO,
               head=head(p, "%s工作台" % p["short"], p["en_display"] + " · Workbench"),
               primary=esc(PRIMARY[pid]), menu=menu_html, kpis=kpis, grid=grid_cls,
               chips="".join(chips), n=len(d["rows"]), obj=esc(d["obj_col"]),
               m5='<th scope="col">风险分级</th>' if has_m5 else "",
               rows="".join(rows_html), qtitle=esc(d["queue"]["title"]), qbtns=qbtns,
               tools=tools, quality=quality, feed=feed, chart=chart, boundary=boundary))

# ══════════════════════════════════════════════════════════════════════════
# 四、模块脚本
#     ⚠️ 全部用 **class / data 属性**取节点，绝不 `getElementById(变量)`：
#        构建期会给标记里的 id 加模块前缀（`id="chartP03"` → `products--chartP03`），
#        而脚本里的变量调用不会被一起改写 —— 查不到节点且**不报错**（本轮实测踩到过两次）。
#     反馈一律走外壳的 window.gmToast（Part 18 · MD-18-01/04 的唯一实现），
#        模块侧不另造 Toast，也不自己写 setTimeout 驻留时间。
# ══════════════════════════════════════════════════════════════════════════
JS = r"""
/* ══ 1. 视图切换：首页 + 6 个工作台（深链 #products--p0N-work）══
   模块内**没有**自己的切换条 —— 导航只有顶部那一个下拉菜单（见 build-site.py 的 NAV_MENUS），
   避免"站内导航 + 模块内切换条"两套并存。 */
(function(){
  var views = [].slice.call(document.querySelectorAll('.gm-pm-view'));
  if(!views.length) return;
  function vid(v){ return (v.id || '').replace(/^products--/, ''); }
  function show(id, scroll){
    var found = false;
    views.forEach(function(v){ if(vid(v) === id) found = true; });
    if(!found) return false;
    views.forEach(function(v){ v.classList.toggle('is-on', vid(v) === id); });
    if(scroll){
      /* 吸顶导航高度由外壳实测写入 --sh-nav-h，模块根的 scroll-margin-top 已按它留白 */
      var root = document.getElementById('gm-mod-products');
      if(root && root.scrollIntoView) root.scrollIntoView({block: 'start'});
    }
    return true;
  }
  function fromAnchor(anchor){
    var x = (anchor || '').replace(/^#/, '');
    if(/^gm-mod-/.test(x)) return false;         /* 点主导航页签：保持当前视图 */
    x = x.replace(/^products--/, '').replace(/^products$/, '');
    if(!x) return false;
    return show(x, true);
  }
  /* ⚠️ 首屏必须**兜底显示一个视图**：`#gm-mod-products` 这类"只点模块根"的 hash
     在 fromAnchor 里是被跳过的（它不该改视图），若不兜底，模块首次显示时
     7 个视图全都没有 .is-on → 整块空白（实测踩到过）。 */
  if(!fromAnchor(location.hash)) show(vid(views[0]), false);
  window.addEventListener('hashchange', function(){ fromAnchor(location.hash); });
  /* 外壳在"模块内路由"时广播（点主导航下拉里的产品、点首页产品卡等） */
  document.addEventListener('gm:module-shown', function(e){
    var d = e.detail || {};
    if(d.mod === 'products') fromAnchor(d.anchor);
  });
})();

/* ══ 2. 工作台交互：KPI/筛选/队列 → 筛选待处理清单；行内动作推进状态；步骤轴；工具 ══
   每个视图各自一份状态（7 个视图同存于 DOM），互不干扰。 */
(function(){
  function toast(msg, status){ if(window.gmToast) window.gmToast(msg, status || 'info'); }

  [].slice.call(document.querySelectorAll('.gm-pm-view')).forEach(function(view){
    if(!view.querySelector('.gm-pm-todos')) return;      /* 首页无待处理清单，跳过 */
    var rows = [].slice.call(view.querySelectorAll('.gm-pm-todos tbody tr'));
    /* ⚠️ 一行两份状态标签（桌面列 / 窄屏合并单元），推进时两份都要更新，否则窄屏看不到反馈。 */
    var filters = [].slice.call(view.querySelectorAll('[data-tone-filter]'));
    var countEl = view.querySelector('[data-count]');
    var emptyEl = view.querySelector('[data-empty]');
    var tone = 'all';

    function feed(spec, text){
      var ul = view.querySelector('[data-feed]');
      if(!ul) return;
      var parts = spec.split('|');
      var li = document.createElement('li');
      var t = document.createElement('span');
      t.className = 'gm-pm-tag gm-pm-tag--' + parts[0];
      t.innerHTML = '<i></i>';
      t.appendChild(document.createTextNode(parts[1]));
      var s = document.createElement('span');
      s.textContent = text;
      li.appendChild(t); li.appendChild(s);
      ul.insertBefore(li, ul.firstChild);
      while(ul.children.length > 6) ul.removeChild(ul.lastChild);   /* 只留最近 6 条 */
    }
    function setTag(el, spec){
      var parts = spec.split('|');
      el.className = 'gm-pm-tag gm-pm-tag--' + parts[0];
      el.innerHTML = '<i></i>';
      el.appendChild(document.createTextNode(parts[1]));
    }
    function applyFilter(next){
      tone = next || 'all';
      var n = 0;
      rows.forEach(function(tr){
        var on = tone === 'all' || tr.getAttribute('data-tone') === tone;
        tr.classList.toggle('gm-pm-off', !on);
        if(on) n++;
      });
      filters.forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-tone-filter') === tone ? 'true' : 'false');
      });
      if(countEl) countEl.textContent = '共 ' + n + ' / ' + rows.length + ' 条';
      if(emptyEl) emptyEl.classList.toggle('gm-pm-off', n !== 0);
    }
    function label(el){ return el.textContent.replace(/^\d+/, '').trim(); }

    /* KPI / 筛选 chips / 队列行：同一套语义筛选（再点一次取消） */
    filters.forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-tone-filter');
        applyFilter(tone === t ? 'all' : t);
      });
    });

    /* 行内动作：查看 / 推进 / 协作（推进后本动作置灰，避免重复推进） */
    rows.forEach(function(tr){
      var tagEls = [].slice.call(tr.querySelectorAll('[data-status]'));
      var tagEl = tagEls[0];
      var whoEl = tr.querySelector('td b');
      var who = whoEl ? whoEl.textContent : '该对象';
      [].slice.call(tr.querySelectorAll('.gm-pm-act')).forEach(function(btn){
        btn.addEventListener('click', function(){
          var kind = btn.getAttribute('data-act');
          var after = btn.getAttribute('data-after');
          if(kind === 'view'){ toast('已打开 ' + who + ' 的记录', 'info'); return; }
          if(!after || !tagEls.length) return;
          var lbl = btn.textContent;
          /* ⚠️ 一份行里两份状态标签（桌面列 `.gm-tbl__desk` / 窄屏合并单元 `.gm-tbl__mob`）：
             只改第一份的话，窄屏点下去可见的那份不变 —— 用户看不到任何反馈。两份都改。 */
          tagEls.forEach(function(el){ setTag(el, after); });
          tr.setAttribute('data-tone', after.split('|')[0]);
          /* 只置灰被点的那一颗；同一行的另一份（另一视口那份）也一起置灰，避免切尺寸后还能再点 */
          [].slice.call(tr.querySelectorAll('.gm-pm-act')).forEach(function(b){
            if(b.getAttribute('data-act') === kind && b !== btn) b.disabled = true;
          });
          btn.disabled = true;
          toast(who + ' · ' + lbl + '：' + after.split('|')[1],
                kind === 'advance' ? 'success' : 'info');
          feed(after, who + ' · ' + lbl + '（' + after.split('|')[1] + '）');
          applyFilter(tone);          /* 语义变了就按新语义重新归类 */
        });
      });
    });

    /* 快捷工具 / 顶栏主行动：反馈 + 写入最新动态 */
    [].slice.call(view.querySelectorAll('[data-tool]')).forEach(function(b){
      b.addEventListener('click', function(){
        var name = b.getAttribute('data-tool');
        toast(name + '：已打开（示例）', 'info');
        feed('info|进行中', '执行「' + name + '」（示例）');
      });
    });

    /* 顶栏搜索：回车给一次示意反馈（不接后端，也不假装搜出结果） */
    var input = view.querySelector('.gm-pm-search input');
    if(input) input.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && input.value.trim()){
        toast('搜索「' + input.value.trim() + '」：示意反馈', 'info');
        input.value = '';
      }
    });

    applyFilter('all');
  });
})();

/* ══ 3. 生长曲线（13 · 13.2 母题）══
   图形与交互都在外壳的 window.gmGrowth：本模块只给数据（X 轴节点 / P3 / P50 / P97 /
   实测值 / 数据源版本）。挂载点用 class + data 属性，不用 id（见文件头说明）。
   ⚠️ 必须等 DOMContentLoaded：模块脚本在文档里位于外壳脚本之前，
      外壳的 window.gmGrowth 此刻还没定义，直接调用会被守卫静默吞掉（图不出现）。 */
(function(){
  var CHARTS = {
__CHARTS__
  };
  function boot(){
    if(!window.gmGrowth) return;
    [].slice.call(document.querySelectorAll('.gm-pm-chart')).forEach(function(el){
      var cfg = CHARTS[el.getAttribute('data-chart')];
      if(cfg) window.gmGrowth(el, cfg);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
"""


def js_chart_literal(ch: dict, key: str) -> str:
    """把一张曲线卡的配置写成 JS 字面量（键用产品 id，与 data-chart 属性一致）。"""
    def arr(k):
        return "[" + ",".join(str(v) for v in ch[k]) + "]"
    extra = ""
    if ch.get("seriesName"):
        extra += ',\n        seriesName:"%s"' % ch["seriesName"]
    if ch.get("advisories"):
        extra += (",\n        advisories:[" + ",".join(
            '{x:%s,tone:"%s",text:"%s"}' % (x, tone, txt.replace('"', '\\"'))
            for x, tone, txt in ch["advisories"]) + "]")
    return ('    %s: {\n'
            '        title:"%s", tone:"%s", source:"%s", bandLabel:"%s",\n'
            '        xName:"%s", xUnit:"%s", yName:"%s", yUnit:"%s",\n'
            '        x:%s, xTicks:%s, yTicks:%s,\n'
            '        p3:%s, p50:%s, p97:%s,\n'
            '        actual:%s, focus:%s%s\n    }'
            % (key, ch["title"], ch.get("tone", "rose"), ch["source"], ch["bandLabel"],
               ch["xName"], ch["xUnit"], ch["yName"], ch["yUnit"],
               arr("x"), arr("xTicks"), arr("yTicks"),
               arr("p3"), arr("p50"), arr("p97"), arr("actual"), ch["focus"], extra))


def build_fragment() -> str:
    prd = parse_prd(read_prd())

    # 环境光斑（06 · 6.2 验收：页面 = 暖底 + ≥2 个彩色环境光斑）。
    # 外层 .gm-pm 是定位容器，光斑absolute inset:0 落在它里面；视图另置 z-index:1 之上。
    body = ('<div class="gm-pm">\n'
            '<div class="gm-pm__amb" aria-hidden="true"><i></i><i></i><i></i></div>\n'
            + home(prd) + "\n"
            + "".join(workbench(p, prd) + "\n" for p in PRODUCTS)
            + '</div>\n')

    views = ["home"] + ["%s-work" % p["pid"] for p in PRODUCTS]
    charts = ",\n".join(js_chart_literal(DEMO[p["pid"]]["chart"], p["pid"])
                        for p in PRODUCTS if DEMO[p["pid"]].get("chart"))
    js = JS.replace("__CHARTS__", charts)

    assert "__CHARTS__" not in js
    return ("<!--@css-->\n" + CSS.strip()
            + "\n\n<!--@body-->\n" + body
            + "\n<!--@js-->\n" + js.strip() + "\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="生成 site/fragments/products.html（产品矩阵模块）")
    ap.add_argument("--check", action="store_true", help="只校验片段是否与生成结果一致（CI 用）")
    args = ap.parse_args()

    frag = build_fragment()
    if args.check:
        cur = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if cur != frag:
            print("FAIL site/fragments/products.html 与生成结果不一致，"
                  "请执行 python3 scripts/gen-products.py")
            return 1
        print("OK site/fragments/products.html 已是最新（7 页 · %d 字符）" % len(frag))
        return 0

    io.open(OUT, "w", encoding="utf-8").write(frag)
    print("site/fragments/products.html 已生成  %.1f KB（对接首页 1 + 工作台 6 = 7 页）"
          % (len(frag.encode("utf-8")) / 1024.0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
