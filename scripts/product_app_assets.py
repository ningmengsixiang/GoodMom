#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""独立产品页（fuyouaicansai/ 下 6 页）的**外壳样式与脚本资产**。

拆成独立文件的理由：这两个字符串各占了生成器的一大半，混在一起后
「改一条 CSS」要在上千行里找位置；而生成器本身只该管「结构 + 内容」。

口径：
· `APP_CSS` 只写**外壳增量**（侧栏 / 顶栏 / 视图 / 时间线 / 对话 / 弹层 / 曲线 / 页脚）。
  组件基线（玻璃卡 / 状态标签 / 表格 / 步骤轴 / 按钮 / 筛选 / 响应式）来自
  `scripts/gen-products.py` 的唯一首页模块样式表 —— 那是已经过
  `audit.py` / `a11y-dom.py` / `page-qa.mjs` 三套门禁验证的基线，抄第二份就是漂移的开始。
· `APP_JS` 全部用 **class / data 属性**取节点，不依赖 id 前缀改写（这些页是独立文件，
  不经过 build-site.py 的合并改写）。反馈统一走本页的 `gmToast`，
  位置/时序/role 的配方与站点外壳那一份保持一致（Part 18 · MD-18-01/04）。
"""
from __future__ import annotations

APP_CSS = r"""
/* ══════════════════════════════════════════════════════════════════════════
   应用外壳增量（侧栏 / 顶栏 / 视图 / 时间线 / 对话 / 弹层 / 曲线）
   形态对齐 fuyouaicansai/goodmom-redesign.html：可收起侧栏 + 顶栏模式 + 单文件。
   ══════════════════════════════════════════════════════════════════════════ */
/* ══ 页面背景与画布（用户报"背景后面留有很大一条白色缝隙"的真实成因）══════════
   ⚠️ 这里原来**两件事都没做**：
     ① 没有重置 UA 默认的 `body{margin:8px}` —— 整个应用被内缩 8px，四周那圈没有任何元素绘制的
        区域直接露出**默认白画布**（实测左右各 8px 竖向白条）；
     ② `html` 没有背景（`rgba(0,0,0,0)`）—— 白画布没有任何兜底。
   再叠上 `.gm-app{min-height:100vh}`，文档高度恒为 100vh+16px，**底部固定留一条 8px 白缝**
   （1440 视口实测 docH=1007 / body 991 / 视口 900）。
   修法：html 上画同一套玻璃底（根元素背景会传播到画布，连过度滚动区一起覆盖），body 归零外边距。 */
html{background:linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#E6CFC6)}
body{margin:0}

.gm-app{position:relative;min-height:100vh;padding:var(--lg-space-4) var(--lg-space-5) var(--lg-space-10);
  font-family:var(--lg-font-sans);color:var(--lg-text-primary);line-height:1.6;-webkit-font-smoothing:antialiased;
  background:
    radial-gradient(1000px 600px at 90% -8%,rgba(247,127,163,.20),transparent 65%),
    radial-gradient(900px 560px at -6% 24%,rgba(182,154,255,.15),transparent 65%),
    radial-gradient(700px 500px at 30% 110%,var(--sh-w-55),transparent 70%),
    linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#E6CFC6);
  transition:padding var(--lg-t-base) var(--lg-ease-out)}
.gm-app__wrap{position:relative;z-index:1;max-width:1220px;margin:0 auto}
@media (min-width:1600px){.gm-app__wrap{max-width:1400px}}
body.mode-sider .gm-app{padding-left:calc(252px + var(--lg-space-6))}
body.mode-sider.collapsed .gm-app{padding-left:calc(80px + var(--lg-space-6))}

/* ── 侧栏（03 · 3.4.1 侧栏模式）：品牌 + 分组菜单 + 徽标 + 用户区，可收起 ── */
/* ⚠️ `box-sizing:border-box` 不是风格问题，是**导航遮挡**的根因：
   下面 `body.mode-sider .gm-app{padding-left:calc(252px + 24px)}` 的前提是
   「侧栏占 252px」。但独立页没有全局 `*{box-sizing:border-box}`，`.gm-side` 声明
   `width:252px` + 左右 padding 12×2 + 边框 1×2 = **实际占 278px**，内容列左边缘在 276px
   —— 侧栏压住内容 18px（实测 1440/1281 档：h2「工作台」的「工」、首张 KPI 卡左沿、
   档案头卡头像都被盖住）。收起档同理（80+24+2=106 vs 预留 104，压 2px）。
   显式 border-box 后侧栏真实占 252 / 80，与 `padding-left` 的算法一致，留 8px 缝。 */
.gm-side{position:fixed;left:var(--lg-space-4);top:var(--lg-space-4);bottom:var(--lg-space-4);width:252px;z-index:70;
  box-sizing:border-box;
  display:none;flex-direction:column;gap:2px;padding:var(--lg-space-3);border-radius:var(--lg-radius-card);
  overflow-y:auto;background:linear-gradient(160deg,var(--sh-w-64),var(--sh-w-30) 60%,var(--sh-w-44));
  border:1px solid var(--sh-w-85);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-lg);
  -webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2);background-origin:border-box}
body.mode-sider .gm-side{display:flex}
body.mode-sider.collapsed .gm-side{width:80px;padding:var(--lg-space-3) var(--lg-space-2)}
.gm-side__brand{display:flex;align-items:center;gap:var(--lg-space-2);
  padding:var(--lg-space-1) var(--lg-space-1) var(--lg-space-3);
  border-bottom:1px dashed var(--sh-ink-08);margin-bottom:var(--lg-space-2)}
/* 顶栏"业务菜单"下拉：仅窄屏显示（≤1280 侧栏被隐藏，它是进业务模块页的唯一入口） */
.gm-navm{position:relative;display:none}
/* 高度 ≥44：窄屏（≤1280）它是唯一模块入口，热区必须够（page-qa P1 守门，实测 36px 被抓） */
.gm-navm__btn{font-family:inherit;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 14px;
  border-radius:var(--lg-radius-pill);border:1px solid var(--sh-ink-14);background:var(--sh-w-72);
  color:var(--lg-text-primary);font-size:var(--lg-fs-body-sm);font-weight:600;cursor:pointer}
.gm-navm__btn[aria-expanded="true"]{border-color:var(--mmh-rose-500);background:var(--sh-solid)}
.gm-navm__n{font-style:normal;font-size:var(--lg-fs-caption);font-weight:600;color:var(--mmh-rose-700);
  background:var(--sh-tint-rose);border-radius:var(--lg-radius-pill);padding:1px 7px}
.gm-navm__panel{position:absolute;right:0;top:calc(100% + 8px);z-index:120;min-width:236px;max-height:60vh;
  overflow-y:auto;padding:var(--lg-space-3);border-radius:var(--lg-radius-card);
  border:1px solid var(--sh-w-85);background:linear-gradient(160deg,var(--sh-w-96),var(--sh-w-88));
  box-shadow:var(--lg-shadow-lg);background-origin:border-box}
.gm-navm__grp{display:flex;flex-direction:column;gap:2px}
.gm-navm__grp+.gm-navm__grp{margin-top:var(--lg-space-2);padding-top:var(--lg-space-2);
  border-top:1px solid var(--lg-divider)}
.gm-navm__grp b{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);font-weight:600;padding:2px 6px}
.gm-navm__it{font-family:inherit;text-align:left;padding:9px 10px;border:none;background:none;border-radius:var(--lg-radius-chip);
  font-size:var(--lg-fs-body-sm);color:var(--lg-text-primary);cursor:pointer;min-height:44px}
.gm-navm__it:hover,.gm-navm__it.is-on{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);font-weight:600}
@media (max-width:1280px){
  /* ⚠️ 顶栏必须自己带层叠上下文：卡片（`.gm-pm-card`）是定位元素、z-index:auto，
     与顶栏同层时按 DOM 顺序**盖在展开的面板上**（实测窄屏点下拉项被 KPI 卡拦截）。
     顶栏是文档流里的第一个兄弟元素，置于其后即可稳定压住内容。
     ⚠️ 这条**必须写在 CSS 最末**：`.gm-top{position:static}` 在后面的 ≤1024 断点里，
     同特异性下后者胜 —— 写在前面等于没写（实测 600 档顶栏仍是 static、面板被卡片盖住）。 */
  .gm-navm{display:inline-flex}
  .gm-tabs{order:3;width:100%;margin-left:0;flex-wrap:nowrap;overflow-x:auto}
}
@media (min-width:1281px){.gm-navm{display:none}}

/* 模块页标题区的一句话说明（模块"是什么"），以及不可点的聚合统计卡 */
.gm-pm-head__d{margin:6px 0 0;font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);
  color:var(--lg-text-secondary);max-width:72ch}
/* ⚠️ 这里必须显式声明 box-sizing：KPI 卡有一条 `width:100%`（来自工作台的按钮版），
   而 **按钮的 UA 默认是 border-box、div 不是** —— 于是"不可点的统计卡"（div）算出
   136 + 40(padding) + 2(border) = 178px，比栅格轨道宽 42px，直接把页面顶出横向滚动
   （实测 p01 两癌筛查 320 档溢出 26px、p06 六个模块页在 1440 档也溢出 22px）。
   独立页没有全局 `*{box-sizing}` 重置，所以这一类"给 div 加 width:100%" 的写法都要自己带上。 */
.gm-pm-kpi{box-sizing:border-box}
.gm-pm-kpi.is-static{cursor:default}
.gm-pm-kpi.is-static:hover{box-shadow:var(--lg-glass-highlight),var(--lg-shadow-sm)}
.gm-pm-kpi.is-static:active{transform:none}

.gm-side__brand b{display:block;font-size:var(--lg-fs-body-sm);line-height:1.35;color:var(--mmh-rose-700)}
.gm-side__brand small{display:block;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-side__gt{font-size:var(--lg-fs-caption);letter-spacing:.08em;color:var(--lg-text-secondary);
  padding:var(--lg-space-2) var(--lg-space-3) var(--lg-space-1)}
.nv{display:flex;align-items:center;gap:var(--lg-space-2);width:100%;min-height:44px;cursor:pointer;
  font-family:inherit;font-size:var(--lg-fs-body-sm);font-weight:500;color:var(--lg-text-secondary);
  border:none;border-radius:var(--lg-radius-control);padding:0 var(--lg-space-3);text-align:left;background:transparent;
  transition:background var(--lg-t-fast) var(--lg-ease-out),color var(--lg-t-fast) var(--lg-ease-out)}
.nv svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.nv:hover{background:var(--sh-w-65);color:var(--lg-text-primary)}
.nv.is-on{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);font-weight:600;
  box-shadow:0 8px 18px rgba(240,127,163,.30);background-origin:border-box}
.nv .bdg{margin-left:auto;min-width:20px;height:20px;padding:0 var(--lg-space-1);display:inline-flex;
  align-items:center;justify-content:center;border-radius:var(--lg-radius-pill);font-size:var(--lg-fs-caption);
  font-weight:600;color:var(--mmh-rose-700);background:var(--sh-w-9);border:1px solid rgba(232,93,143,.25)}
.nv.is-on .bdg{color:var(--mmh-rose-700);background:var(--sh-solid);border-color:var(--sh-solid)}
.gm-side__foot{margin-top:auto;padding-top:var(--lg-space-3);border-top:1px dashed var(--sh-ink-08);
  display:flex;align-items:center;gap:var(--lg-space-2)}
.gm-side__foot .who{flex:1;min-width:0}
.gm-side__foot .who b{display:block;font-size:var(--lg-fs-caption);line-height:1.3}
.gm-side__foot .who span{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
body.mode-sider.collapsed .gm-side__brand div,body.mode-sider.collapsed .gm-side__gt,
body.mode-sider.collapsed .nv span,body.mode-sider.collapsed .nv .bdg,
body.mode-sider.collapsed .gm-side__foot .who{display:none}
body.mode-sider.collapsed .nv{justify-content:center;padding:0}
body.mode-sider.collapsed .gm-side__brand{justify-content:center;border-bottom:none}
.gm-iconb{width:32px;height:32px;flex:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  border-radius:var(--lg-radius-btn-sm);border:1px solid var(--lg-divider);background:var(--sh-w-6);
  color:var(--lg-text-secondary)}
.gm-iconb:hover{background:var(--sh-w-95)}
.gm-iconb svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* ── 顶栏（吸顶胶囊）：品牌 + 页签 + 侧栏/顶栏切换 ── */
.gm-top{position:sticky;top:var(--lg-space-3);z-index:60;display:flex;align-items:center;gap:var(--lg-space-3);
  flex-wrap:wrap;padding:var(--lg-space-2) var(--lg-space-3);border-radius:var(--lg-radius-pill);
  margin-bottom:var(--lg-space-4);background:linear-gradient(160deg,var(--sh-w-80),var(--sh-w-54));
  border:1px solid var(--sh-w-85);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-md);
  -webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2);background-origin:border-box}
.gm-top__brand{display:flex;align-items:center;gap:var(--lg-space-2);font-size:var(--lg-fs-body-sm);
  font-weight:600;color:var(--mmh-rose-700);min-width:0;flex:0 1 auto}
.gm-top__brand img{width:28px;height:28px;border-radius:var(--lg-radius-btn-sm);object-fit:cover;flex:none}
.gm-tabs{display:flex;gap:var(--lg-space-1);flex-wrap:wrap}
.gm-tab{font-family:inherit;font-size:var(--lg-fs-caption);font-weight:500;color:var(--lg-text-secondary);cursor:pointer;
  padding:0 var(--lg-space-3);min-height:32px;border-radius:var(--lg-radius-pill);white-space:nowrap;
  background:var(--sh-w-5);border:1px solid var(--lg-divider)}
.gm-tab:hover{background:var(--sh-w-9)}
.gm-tab.is-on{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);border-color:transparent;
  font-weight:600;box-shadow:0 1px 2px rgba(178,58,99,.22);background-origin:border-box}
/* 导航形态（侧栏 / 顶栏）固定在顶栏最右侧：它是视图偏好，不是主内容。 */
.gm-seg{margin-left:auto;display:inline-flex;gap:2px;padding:2px;border-radius:var(--lg-radius-pill);background:var(--sh-w-5);
  border:1px solid var(--lg-divider);flex:none}
.gm-seg button{font-family:inherit;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);cursor:pointer;
  border:none;background:none;padding:0 var(--lg-space-3);min-height:32px;border-radius:var(--lg-radius-pill)}
.gm-seg button.is-on{background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);font-weight:600;
  background-origin:border-box}
body.mode-sider .gm-tabs{display:none}
body.mode-sider.collapsed .gm-top__brand span{display:none}

/* ── 视图内排版块 ── */
.gm-sec{margin-top:var(--lg-space-8)}
.gm-sec__h{display:flex;align-items:baseline;gap:var(--lg-space-3);flex-wrap:wrap;margin-bottom:var(--lg-space-4)}
.gm-sec__h h3{margin:0;font-size:var(--lg-fs-section);line-height:var(--lg-lh-section);font-weight:600}
.gm-sec__h span{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-2{display:grid;gap:var(--lg-space-4);grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.gm-2e{display:grid;gap:var(--lg-space-4);grid-template-columns:repeat(2,minmax(0,1fr))}
.gm-3{display:grid;gap:var(--lg-space-4);grid-template-columns:repeat(3,minmax(0,1fr))}

/* 档案指标（caption 键 + body-sm 值） */
/* 对象卡头（档案 / 详情）：头像 + 名称 + 档案信息。
   ⚠️ 不复用 `.gm-brand`：品牌锁版是"logo + 品牌名 + 系统名"的语义，
   对象卡头用的是头像与对象名，混用会让对象名继承品牌色（也会让读屏读出错误的层级）。 */
.gm-obj{display:flex;align-items:center;gap:var(--lg-space-3);min-width:0}
.gm-obj__t{display:flex;flex-direction:column;line-height:1.35;min-width:0}
.gm-obj__t strong{font-size:var(--lg-fs-body);font-weight:600;color:var(--lg-text-primary)}
.gm-obj__t small{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-obj__ln{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}

.gm-kv{display:grid;gap:var(--lg-space-3) var(--lg-space-4);grid-template-columns:repeat(2,minmax(0,1fr))}
.gm-kv>div{min-width:0}
.gm-kv dt{font-size:var(--lg-fs-caption);line-height:var(--lg-lh-caption);color:var(--lg-text-secondary)}
/* ⚠️ 档案「关键指标」的值含「128（风险分级 46 · 随访 52 · 报告 8）」这类长串，
   不允许断行时 320 档顶出内容盒 7px（Range 实测文本宽 > 内容盒）。 */
.gm-kv__sub{font-weight:400;color:var(--lg-text-secondary)}
.gm-kv dd{overflow-wrap:anywhere;margin:2px 0 0;font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);font-weight:600;
  overflow-wrap:anywhere}

/* 时间线（健康事件 / 证据链 / 随访计划）：13 · 13.4 的竖版轴 */
.gm-tl{list-style:none;margin:0;padding:0}
.gm-tl li{position:relative;padding:0 0 var(--lg-space-4) var(--lg-space-6);
  border-left:2px solid var(--lg-divider);margin-left:6px}
.gm-tl li:last-child{border-left-color:transparent;padding-bottom:0}
.gm-tl li::before{content:"";position:absolute;left:-7px;top:4px;width:12px;height:12px;border-radius:50%;
  background:var(--sh-solid);border:2px solid var(--mmh-rose-500)}
.gm-tl li[data-tone="positive"]::before{border-color:var(--lg-sem-positive);background:var(--lg-sem-positive)}
.gm-tl li[data-tone="attention"]::before{border-color:var(--lg-sem-attention);background:var(--lg-sem-attention)}
.gm-tl li[data-tone="risk"]::before{border-color:var(--lg-sem-risk);background:var(--lg-sem-risk)}
.gm-tl .d{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-tl .t{font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);font-weight:600;margin-top:2px}
.gm-tl .s{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);margin-top:2px}

/* AI 建议待复核卡（置信度 = 数字 + 文案双通道，不靠颜色单独传义） */
.gm-ai{border-radius:var(--lg-radius-card);padding:var(--lg-space-4);margin-bottom:var(--lg-space-3);
  background:linear-gradient(160deg,var(--sh-w-66),var(--sh-w-32));
  border:1px solid var(--sh-w-78);box-shadow:var(--lg-glass-highlight),var(--lg-shadow-sm);
  background-origin:border-box}
.gm-ai__hd{display:flex;align-items:flex-start;gap:var(--lg-space-3);flex-wrap:wrap}
.gm-ai__hd b{overflow-wrap:anywhere;font-size:var(--lg-fs-body-sm);line-height:var(--lg-lh-body-sm);flex:1;min-width:200px}
.gm-ai__basis{margin:var(--lg-space-2) 0 var(--lg-space-3);font-size:var(--lg-fs-caption);line-height:1.75;
  color:var(--lg-text-secondary)}
.gm-ai__acts{display:flex;gap:var(--lg-space-2);flex-wrap:wrap;align-items:center}
.gm-ai.is-done{opacity:.72}

/* AI 助手对话 */
.gm-chat{display:flex;flex-direction:column;gap:var(--lg-space-2);max-height:280px;overflow-y:auto;
  padding:var(--lg-space-3);border-radius:var(--lg-radius-control);background:var(--sh-w-5);
  border:1px solid var(--lg-divider)}
.gm-bubble{max-width:86%;padding:var(--lg-space-2) var(--lg-space-3);border-radius:var(--lg-radius-control);
  font-size:var(--lg-fs-body-sm);line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
.gm-bubble--ai{align-self:flex-start;background:var(--sh-solid);border:1px solid var(--lg-divider)}
.gm-bubble--me{align-self:flex-end;background:var(--mmh-grad-action-hc);color:var(--lg-text-on-accent);
  background-origin:border-box}
.gm-typing{display:inline-flex;gap:4px;align-items:center;padding:var(--lg-space-2) var(--lg-space-3);
  border-radius:var(--lg-radius-control);background:var(--sh-solid);border:1px solid var(--lg-divider);align-self:flex-start}
.gm-typing i{width:6px;height:6px;border-radius:50%;background:var(--lg-text-secondary);
  animation:gmTyping 1.2s ease-in-out infinite}
.gm-typing i:nth-child(2){animation-delay:.16s} .gm-typing i:nth-child(3){animation-delay:.32s}
@keyframes gmTyping{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
.gm-chatbar{display:flex;gap:var(--lg-space-2);margin-top:var(--lg-space-3)}
.gm-chatbar input{flex:1;min-width:0;height:40px;border-radius:var(--lg-radius-control);padding:0 var(--lg-space-3);
  font-family:inherit;font-size:var(--lg-fs-body-sm);color:var(--lg-text-primary);
  background:var(--sh-w-7);border:1px solid var(--lg-divider);outline:none}
.gm-chatbar input:focus-visible{outline:var(--lg-ring-width) solid var(--lg-ring-color);outline-offset:2px}
.gm-qa{display:flex;flex-wrap:wrap;gap:var(--lg-space-2);margin-top:var(--lg-space-3)}

/* 弹层（Part 18 · MD-18-02：role=dialog + aria-modal + Esc 关闭 + 焦点归还） */
.gm-mask{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:var(--lg-space-4);
  background:var(--sh-ink-28);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.gm-mask.is-on{display:flex}
.gm-modal{width:100%;max-width:520px;max-height:86vh;overflow:auto;border-radius:var(--lg-radius-card-lg);
  padding:var(--lg-space-5);background:linear-gradient(160deg,var(--sh-w-96),var(--sh-w-9));
  border:1px solid var(--sh-w-9);box-shadow:var(--lg-shadow-lg);background-origin:border-box}
.gm-modal h3{margin:0 0 var(--lg-space-3);font-size:var(--lg-fs-section);line-height:var(--lg-lh-section);font-weight:600}
.gm-modal__foot{display:flex;gap:var(--lg-space-2);justify-content:flex-end;margin-top:var(--lg-space-5);flex-wrap:wrap}
.gm-lbl{display:block;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary);margin:var(--lg-space-3) 0 var(--lg-space-2)}
.gm-inp{width:100%;min-height:80px;border-radius:var(--lg-radius-control);padding:var(--lg-space-3);
  font-family:inherit;font-size:var(--lg-fs-body-sm);line-height:1.7;color:var(--lg-text-primary);
  background:var(--sh-w-75);border:1px solid var(--lg-divider);outline:none;resize:vertical}
.gm-inp:focus-visible{outline:var(--lg-ring-width) solid var(--lg-ring-color);outline-offset:2px}
.gm-opts{display:flex;gap:var(--lg-space-2);flex-wrap:wrap}
.gm-opt{display:inline-flex;align-items:center;gap:var(--lg-space-2);padding:var(--lg-space-2) var(--lg-space-3);
  border-radius:var(--lg-radius-pill);background:var(--sh-w-7);border:1px solid var(--lg-divider);
  font-size:var(--lg-fs-caption);cursor:pointer;min-height:40px}
.gm-opt input{accent-color:var(--mmh-rose-500)}

/* 轻提示（Part 18 · MD-18-01/04：顶部偏上 · 320ms 入 / 2.4s 驻留 / 240ms 出 · 同类仅 1 条） */
.gm-toast{position:fixed;left:50%;top:var(--lg-space-5);z-index:250;display:inline-flex;align-items:center;
  gap:var(--lg-space-2);max-width:min(86vw,440px);padding:var(--lg-space-3) var(--lg-space-4);
  border-radius:var(--lg-radius-pill);pointer-events:none;font-size:var(--lg-fs-body-sm);font-weight:600;
  color:var(--lg-text-primary);background:linear-gradient(160deg,rgba(255,255,255,.97),rgba(255,255,255,.9));
  border:1px solid var(--lg-divider);box-shadow:var(--lg-shadow-md);
  animation:gmToastIn 320ms var(--lg-ease-out) both;background-origin:border-box}
.gm-toast.is-leaving{animation:gmToastOut 240ms ease-in forwards}
.gm-toast__dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--lg-sem-neutral)}
.gm-toast--success .gm-toast__dot{background:var(--lg-sem-positive)}
.gm-toast--error .gm-toast__dot{background:var(--lg-sem-risk)}
.gm-toast--warning .gm-toast__dot{background:var(--lg-sem-attention)}
.gm-toast--info .gm-toast__dot{background:var(--lg-sem-info)}
@keyframes gmToastIn{from{opacity:0;transform:translate(-50%,-24px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes gmToastOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-24px)}}

/* 生长 / 体重曲线（13 · 13.2 母题的单页版，与站点外壳 window.gmGrowth 同口径：
   参考带 alpha .12 + 细白描边上界 · 主曲线 Rose-500 2.5px · P3/P97 虚线 1.5px ·
   网格 --lg-divider 1px · 刻度 caption 12px 等宽 · 白玻璃 Tooltip） */
/* 曲线封顶：外壳/本页的渲染器都会就地替换挂载点并改其 class，
   故用**外层容器**限宽（380 viewBox 的图放大超过 ~620 只会变糊、还把卡片顶得很高）。 */
.gm-chartbox{max-width:620px;margin:0 auto}
.gm-gx{position:relative}
.gm-gx__head{display:flex;align-items:baseline;gap:var(--lg-space-3);flex-wrap:wrap;margin-bottom:var(--lg-space-2)}
.gm-gx__head b{font-size:var(--lg-fs-body-sm)}
.gm-gx__src{font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-gx__val{margin-left:auto;font-size:var(--lg-fs-body-sm);font-weight:600;font-variant-numeric:tabular-nums}
.gm-gx__val i{font-style:normal;font-weight:400;font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-gx__svg{display:block;width:100%;height:auto;overflow:visible;touch-action:pan-y}
.gm-gx__grid{stroke:var(--lg-divider);stroke-width:1;shape-rendering:crispEdges}
.gm-gx__band{fill:rgba(169,227,212,.12)}
.gm-gx__bandtop{fill:none;stroke:rgba(255,255,255,.9);stroke-width:1}
.gm-gx__p50{fill:none;stroke:rgba(255,255,255,.9);stroke-width:1;stroke-dasharray:3 3}
.gm-gx__warn{fill:none;stroke:#9AA2B0;stroke-width:1.5;stroke-dasharray:4 4}
.gm-gx__line{fill:none;stroke:#F77FA3;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.gm-gx__dot{fill:#FFFFFF;stroke:#F77FA3;stroke-width:2}
.gm-gx__pt{fill:#F77FA3;stroke:#FFFFFF;stroke-width:1.5}
.gm-gx__pt[data-tone="attention"]{fill:var(--lg-sem-attention)}
.gm-gx__tick{font-size:12px;fill:var(--lg-text-secondary);font-variant-numeric:tabular-nums}
.gm-gx__legend{display:flex;gap:var(--lg-space-3);flex-wrap:wrap;align-items:center;margin-top:var(--lg-space-2);
  font-size:var(--lg-fs-caption);color:var(--lg-text-secondary)}
.gm-gx__legend span{display:inline-flex;align-items:center;gap:var(--lg-space-2);
  padding:var(--lg-space-1) var(--lg-space-3);border-radius:var(--lg-radius-pill);
  /* ⚠️ 亮面一律走填充档 Token：字面量 rgba(255,255,255,.6) 在暗色档仍是亮片，
     而文字已换成 #C9C4CE —— 实测 1.31:1（page-qa P1）。 */
  background:var(--lg-glass-popover,rgba(255,255,255,.6));border:1px solid var(--lg-divider)}
.gm-gx__legend i{width:8px;height:8px;border-radius:50%;flex:none}
.gm-gx__tip{position:absolute;z-index:3;pointer-events:none;opacity:0;transform:translate(-50%,-100%);
  padding:var(--lg-space-2) var(--lg-space-3);border-radius:var(--lg-radius-btn-sm);white-space:nowrap;
  background:var(--lg-glass-popover,rgba(255,255,255,.75));-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);
  border:1px solid var(--lg-divider);box-shadow:var(--lg-shadow-md);transition:opacity 140ms ease}
.gm-gx__tip.is-on{opacity:1}
.gm-gx__tip b{display:block;font-size:var(--lg-fs-caption);font-weight:500;color:var(--lg-text-secondary)}
.gm-gx__tip span{display:block;font-size:var(--lg-fs-body-sm);font-weight:600;color:var(--mmh-rose-700);
  font-variant-numeric:tabular-nums}
.gm-gx__note{display:flex;gap:var(--lg-space-2);align-items:flex-start;margin-top:var(--lg-space-2);
  padding:var(--lg-space-2) var(--lg-space-3);border-radius:var(--lg-radius-btn-sm);
  font-size:var(--lg-fs-caption);line-height:1.75;
  /* 同上：亮面走 Token，暗色档换成深玻璃 —— 否则琥珀文字压在亮片上实测 1.07:1 */
  background:var(--lg-glass-popover,rgba(255,255,255,.75));
  border:1px solid var(--lg-divider);color:var(--lg-sem-attention)}
.gm-gx__note i{width:8px;height:8px;border-radius:50%;flex:none;margin-top:6px;background:currentColor}

/* ── 响应式：≤1280 自动切顶栏模式（与参照项目同口径）；≤1024 单列；≤767 热区 ≥44 ── */
@media (max-width:1280px){
  body.mode-sider .gm-app{padding-left:var(--lg-space-5)}
  body.mode-sider .gm-side{display:none}
  body.mode-sider .gm-tabs{display:flex}
  /* 导航形态切换（侧栏 / 顶栏）在 ≤1280 是**失效控件**：侧栏已被强制隐藏，
     点「侧栏」不会有任何变化。藏掉后顶栏从三行降到两行（手机档实测 156 → 106px），
     也去掉一个"点了没反应"的控件（与"不要假控件"的既有裁决一致）。 */
  .gm-seg{display:none}
}
@media (max-width:1024px){
  .gm-2,.gm-2e,.gm-3{grid-template-columns:minmax(0,1fr)}
  .gm-kv{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:767px){
  .gm-app{padding:var(--lg-space-4) var(--lg-space-4) var(--lg-space-8)}
  .gm-top{position:static}
  .gm-tabs{width:100%;margin-left:0;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch}
  /* 窄屏：页签占满一行（形态切换在窄屏已隐藏，见 ≤1280 档） */
  .gm-tab{flex:none}
  .gm-tab,.nv,.gm-iconb,.gm-opt{position:relative}
  .gm-tab::after,.nv::after,.gm-iconb::after,.gm-opt::after{
    content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:100%;min-width:44px;height:100%;min-height:44px}
  .gm-chatbar input{height:44px}
}
@media (prefers-reduced-motion:reduce){
  .gm-app{transition:none}
  .gm-typing i{animation:none}
}
/* ── 顶栏层叠（写在 APP_CSS 最末，避免被更后面的断点覆盖）：≤1280 顶栏是「业务菜单」下拉的宿主，
   而卡片（`.gm-pm-card`）是定位元素且 z-index:auto —— 同层时按 DOM 顺序盖住展开的面板（实测点击被拦截）。
   给顶栏一个正 z-index 的层叠上下文即可稳定压住内容。 */
@media (max-width:1280px){
  .gm-top{position:relative;z-index:90}
}

/* ── 外壳填充档 Token + 暗色档（02 · 2.1.9）────────────────────────────────────
   独立产品页没有站点外壳，这里自带一套「白色叠加 / 墨色描边」档位。
   浅色取值＝抽出前的原值（观感零变化）；暗色只换**档位**（白叠加 14–60% → 6–16%），
   色相不变、禁纯黑纯白。文字/语义/品牌档由 base_css()（gen-products.py 样式表）带来的
   `[data-theme="dark"]` 段统一换档，此处不重复声明 —— 同一份口径只写一次。 */
:root{ --sh-w-30:rgba(255,255,255,.30); --sh-w-32:rgba(255,255,255,.32); --sh-w-44:rgba(255,255,255,.44); --sh-w-5:rgba(255,255,255,.5); --sh-w-54:rgba(255,255,255,.54); --sh-w-55:rgba(255,255,255,.55); --sh-w-6:rgba(255,255,255,.6); --sh-w-64:rgba(255,255,255,.64); --sh-w-65:rgba(255,255,255,.65); --sh-w-66:rgba(255,255,255,.66); --sh-w-7:rgba(255,255,255,.7); --sh-w-72:rgba(255,255,255,.72); --sh-w-75:rgba(255,255,255,.75); --sh-w-78:rgba(255,255,255,.78); --sh-w-80:rgba(255,255,255,.80); --sh-w-85:rgba(255,255,255,.85); --sh-w-88:rgba(255,255,255,.88); --sh-w-9:rgba(255,255,255,.9); --sh-w-95:rgba(255,255,255,.95); --sh-w-96:rgba(255,255,255,.96); --sh-ink-08:rgba(58,52,84,.08); --sh-ink-14:rgba(58,52,84,.14); --sh-ink-28:rgba(58,52,84,.28); --sh-solid:#FFFFFF; }
[data-theme="dark"]{
  /* 画布：html 与 .gm-app 共用一套暗底（暖石板，非纯黑、非浅底反色） */
  background:linear-gradient(165deg,#1B1A21,#221F29 55%,#2A2731);
  /* 同上：html 自身不写 color 时会落到 UA 默认**纯黑**，暗底上完全不可读
     （实测侧栏用户名 rgb(0,0,0) / 2.17:1）。 */
  color:var(--lg-text-primary);
  --sh-w-30:rgba(255,255,255,.08); --sh-w-32:rgba(255,255,255,.09); --sh-w-44:rgba(255,255,255,.10); --sh-w-5:rgba(255,255,255,.11); --sh-w-54:rgba(255,255,255,.12); --sh-w-55:rgba(255,255,255,.12); --sh-w-6:rgba(255,255,255,.12); --sh-w-64:rgba(255,255,255,.13); --sh-w-65:rgba(255,255,255,.13); --sh-w-66:rgba(255,255,255,.13); --sh-w-7:rgba(255,255,255,.14); --sh-w-72:rgba(255,255,255,.14); --sh-w-75:rgba(255,255,255,.15); --sh-w-78:rgba(255,255,255,.15); --sh-w-80:rgba(255,255,255,.15); --sh-w-85:rgba(255,255,255,.16); --sh-w-88:rgba(255,255,255,.16); --sh-w-9:rgba(255,255,255,.16); --sh-w-95:rgba(255,255,255,.16); --sh-w-96:rgba(255,255,255,.16); --sh-ink-08:rgba(255,255,255,.14); --sh-ink-14:rgba(255,255,255,.20); --sh-ink-28:rgba(255,255,255,.22); --sh-tint-rose:rgba(247,127,163,.12); --sh-solid:rgba(255,255,255,.14);
}
[data-theme="dark"] .gm-app{background:
    radial-gradient(1000px 600px at 90% -8%,rgba(247,127,163,.16),transparent 65%),
    radial-gradient(900px 560px at -6% 24%,rgba(182,154,255,.13),transparent 65%),
    radial-gradient(700px 500px at 30% 110%,rgba(255,255,255,.06),transparent 70%),
    linear-gradient(165deg,#1B1A21,#221F29 55%,#2A2731)}

/* ── 暗色档里「底仍是亮片」的两处特例 ─────────────────────────────────────────
   ① 侧栏选中项的底是**品牌主行动档渐变（固定亮粉，不随主题变暗）**。其上的徽标文字
      若跟着 --mmh-rose-700 一起换成浅粉，就是浅字压亮粉 —— 实测 1.46:1。
      徽标底 --sh-solid 在暗色档是白色 14%，透出来仍是亮粉 → 文字必须用深墨。
   ② 顶栏「业务菜单 N」计数徽标：底是 12% 粉，文字换成暗色档浅粉后只有 4.20:1；
      用同色系更亮的 --mmh-rose-200（色相不变，只换档位）。
   ③ 顶栏业务菜单的下拉面板：底色是白色填充档（暗色档 16%），叠在亮色按钮上仍偏亮，
      组标题（次级文字 #C9C4CE）只有 3.91:1 → 面板改用深玻璃 Token。 */
[data-theme="dark"] .nv.is-on .bdg{color:var(--lg-text-on-accent)}
[data-theme="dark"] .gm-navm__n{color:var(--mmh-rose-200)}
[data-theme="dark"] .gm-navm__panel{background:linear-gradient(160deg,var(--lg-glass-popover),var(--lg-glass-popover))}
"""

APP_JS = r"""
/* ══════════════════════════════════════════════════════════════════════════
   独立产品页外壳脚本（视图切换 / 侧栏 / 筛选 / 推进 / 步骤轴 / AI 审核 / 助手 / 曲线）
   · 一律用 class / data 属性取节点（这些页不经过站点构建期的 id 前缀改写，
     但仍沿用同一约定：挂载点不用 id，避免"改了 id 忘了改脚本"这类静默失效）。
   · 反馈统一走下面的 gmToast（顶部偏上 · 320ms 入 / 2.4s 驻留 / 240ms 出 · 同类仅 1 条）。
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  var q = function(s, r){ return (r || document).querySelector(s); };
  var qa = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── 轻提示：驻留时长写在这里，调用点不写 setTimeout（否则每个调用点都会写错一次） ── */
  var DWELL = 2400;
  function gmToast(msg, status){
    var old = q('.gm-toast');
    if(old && old.parentNode) old.parentNode.removeChild(old);      /* 同类仅 1 条 */
    var el = document.createElement('div');
    el.className = 'gm-toast gm-toast--' + (status || 'info');
    el.setAttribute('role', status === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', status === 'error' ? 'assertive' : 'polite');
    var dot = document.createElement('i');
    dot.className = 'gm-toast__dot';
    var t = document.createElement('span');
    t.textContent = msg;
    el.appendChild(dot); el.appendChild(t);
    document.body.appendChild(el);
    setTimeout(function(){
      el.classList.add('is-leaving');
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 240);
    }, DWELL);
  }
  window.gmToast = gmToast;

  /* ── 视图切换（含 hash 深链：#work / #archive / #ai / #detail） ── */
  function go(v, push){
    var views = qa('.gm-pm-view');
    var target = views.filter(function(x){ return x.getAttribute('data-v') === v; })[0];
    if(!target) return false;
    views.forEach(function(x){ x.classList.toggle('is-on', x === target); });
    qa('.nv').forEach(function(b){ b.classList.toggle('is-on', b.getAttribute('data-go') === v); });
    qa('.gm-tab').forEach(function(b){ b.classList.toggle('is-on', b.getAttribute('data-go') === v); });
    if(push && location.hash !== '#' + v){
      try{ history.replaceState(null, '', '#' + v); }catch(e){ location.hash = v; }
    }
    window.scrollTo({top: 0, behavior: 'auto'});
    return true;
  }
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest ? e.target.closest('[data-go]') : null;
    if(!b) return;
    e.preventDefault();
    go(b.getAttribute('data-go'), true);
  });
  window.addEventListener('hashchange', function(){
    go((location.hash || '').replace(/^#/, '') || 'work', false);
  });

  /* ── 顶栏「业务菜单」下拉（≤1280 的唯一模块入口）── */
  var navmBtn = q('[data-act="navm"]');
  var navmPanel = q('.gm-navm__panel');
  function closeNavm(){
    if(!navmPanel) return;
    navmPanel.hidden = true;
    if(navmBtn) navmBtn.setAttribute('aria-expanded', 'false');
  }
  if(navmBtn && navmPanel){
    navmBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var open = navmPanel.hidden;
      navmPanel.hidden = !open;
      navmBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navmPanel.addEventListener('click', function(e){ if(e.target.closest('[data-go]')) closeNavm(); });
    document.addEventListener('click', function(e){ if(!e.target.closest('.gm-navm')) closeNavm(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNavm(); });
  }

  /* ── 侧栏：收起 / 展开 + 侧栏↔顶栏模式（记住选择；窄屏自动切顶栏） ── */
  var body = document.body;
  var MODE_KEY = 'gm-app-mode', COL_KEY = 'gm-app-collapsed';
  /* ⚠️ 只有**用户的显式选择**才写 localStorage：自动切换（窄屏切顶栏）也写的话，
     下次在任何宽度打开都会停在顶栏模式 —— 实测第二次进入时侧栏整条不见了。
     参照项目同样只在显式切换时记忆。 */
  function setMode(m, save){
    body.classList.remove('mode-sider', 'mode-top');
    body.classList.add('mode-' + m);
    qa('.gm-seg button').forEach(function(b){ b.classList.toggle('is-on', b.getAttribute('data-mode') === m); });
    if(save){ try{ localStorage.setItem(MODE_KEY, m); }catch(e){} }
  }
  var saved = null;
  try{ saved = localStorage.getItem(MODE_KEY); }catch(e){}
  setMode(saved === 'sider' || saved === 'top' ? saved : (window.innerWidth >= 1281 ? 'sider' : 'top'), false);
  if(!saved){
    window.addEventListener('resize', function(){
      var want = window.innerWidth >= 1281 ? 'sider' : 'top';
      if(!body.classList.contains('mode-' + want)) setMode(want, false);
    });
  }
  qa('.gm-seg button').forEach(function(b){
    b.addEventListener('click', function(){ setMode(b.getAttribute('data-mode'), true); });
  });
  var colBtn = q('[data-act="collapse"]');
  if(colBtn) colBtn.addEventListener('click', function(){
    body.classList.toggle('collapsed');
    try{ localStorage.setItem(COL_KEY, body.classList.contains('collapsed') ? '1' : ''); }catch(e){}
  });
  try{ if(localStorage.getItem(COL_KEY)) body.classList.add('collapsed'); }catch(e){}

  /* ── 每个视图各自绑定：筛选 chips / KPI 卡 / 行内动作 / 计数 / 空状态 / 动态 ──
     ⚠️ 必须**按视图作用域**绑定：业务模块页上线后，一页里有 4~8 张表（工作台 1 张 + 每个模块 1 张）。
     原来用文档级 `q('[data-count]')` / `q('[data-feed]')` 取"第一个"，会让模块页的计数与动态
     写进工作台那张卡（实测：点模块页的行内动作，工作台卡片的计数跟着变、动态栏被模块的事件刷屏）。 */
  function bindBlocks(scope){
    var rows = qa('.gm-pm-todos tbody tr', scope);
    if(!rows.length) return;
    var filters = qa('[data-tone-filter]', scope);
    var countEl = q('[data-count]', scope);
    var emptyEl = q('[data-empty]', scope);
    var tone = 'all';
    function feed(spec, text){
      var ul = q('[data-feed]', scope);
      if(!ul) return;
      var p = spec.split('|');
      var li = document.createElement('li');
      var t = document.createElement('span');
      t.className = 'gm-pm-tag gm-pm-tag--' + p[0];
      t.innerHTML = '<i></i>';
      t.appendChild(document.createTextNode(p[1]));
      var sp = document.createElement('span');
      sp.textContent = text;
      li.appendChild(t); li.appendChild(sp);
      ul.insertBefore(li, ul.firstChild);
      while(ul.children.length > 6) ul.removeChild(ul.lastChild);
    }
    function setTag(el, spec){
      var p = spec.split('|');
      el.className = 'gm-pm-tag gm-pm-tag--' + p[0];
      el.innerHTML = '<i></i>';
      el.appendChild(document.createTextNode(p[1]));
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
    filters.forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-tone-filter');
        applyFilter(tone === t ? 'all' : t);
      });
    });
    rows.forEach(function(tr){
      /* ⚠️ 一行里有**两份**状态标签：桌面列那份（`.gm-tbl__desk`）与窄屏合并单元那份（`.gm-tbl__mob`）。
         只更新第一份的话，窄屏点"记录结果"后可见的那份纹丝不动（用户看不到反馈）。故两份都改。 */
      var tagEls = qa('[data-status]', tr);
      var tagEl = tagEls[0];
      var whoEl = tr.querySelector('td b');
      var who = whoEl ? whoEl.textContent : '该对象';
      qa('.gm-pm-act', tr).forEach(function(btn){
        btn.addEventListener('click', function(){
          var kind = btn.getAttribute('data-act');
          var after = btn.getAttribute('data-after');
          if(kind === 'view'){ gmToast('已打开 ' + who + ' 的记录', 'info'); return; }
          if(!after || !tagEls.length) return;
          var lbl = btn.textContent;
          tagEls.forEach(function(el){ setTag(el, after); });
          tr.setAttribute('data-tone', after.split('|')[0]);
          btn.disabled = true;
          gmToast(who + ' · ' + lbl + '：' + after.split('|')[1], kind === 'advance' ? 'success' : 'info');
          feed(after, who + ' · ' + lbl + '（' + after.split('|')[1] + '）');
          applyFilter(tone);
        });
      });
    });
    applyFilter('all');
  }
  qa('.gm-pm-view').forEach(bindBlocks);

  /* ── 快捷工具 / 顶栏主行动（真实动作，反馈写入本视图动态） ── */
  qa('[data-tool]').forEach(function(b){
    b.addEventListener('click', function(){
      var name = b.getAttribute('data-tool');
      var scope = b.closest('.gm-pm-view') || document;
      gmToast(name + '：已执行', 'info');
      var ul = q('[data-feed]', scope);
      if(ul){
        var li = document.createElement('li');
        var t = document.createElement('span');
        t.className = 'gm-pm-tag gm-pm-tag--info';
        t.innerHTML = '<i></i>';
        t.appendChild(document.createTextNode('进行中'));
        var sp = document.createElement('span');
        sp.textContent = '执行「' + name + '」';
        li.appendChild(t); li.appendChild(sp);
        ul.insertBefore(li, ul.firstChild);
        while(ul.children.length > 6) ul.removeChild(ul.lastChild);
      }
    });
  });
  /* ── 搜索：回车给出反馈（工作台顶栏搜索框） ── */
  var input = q('.gm-pm-search input');
  if(input) input.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && input.value.trim()){
      gmToast('搜索「' + input.value.trim() + '」', 'info');
      input.value = '';
    }
  });

  /* ── 弹层（复核意见等）：Esc 关闭 · 点遮罩关闭 · 关闭后焦点归还 ── */
  var mask = q('.gm-mask');
  var lastFocus = null;
  function openModal(title, bodyHTML, footHTML, onOk){
    if(!mask) return;
    lastFocus = document.activeElement;
    q('.gm-modal__title', mask).textContent = title;
    q('.gm-modal__body', mask).innerHTML = bodyHTML;
    q('.gm-modal__foot', mask).innerHTML = footHTML;
    mask.classList.add('is-on');
    var first = q('textarea, input, button', q('.gm-modal__body', mask)) || q('.gm-modal__foot button', mask);
    if(first) first.focus();
    var ok = q('[data-modal-ok]', mask);
    if(ok) ok.onclick = function(){
      var r = onOk ? onOk(mask) : true;
      if(r !== false) closeModal();
    };
    qa('[data-modal-close]', mask).forEach(function(b){ b.onclick = closeModal; });
  }
  function closeModal(){
    if(!mask) return;
    mask.classList.remove('is-on');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if(mask){
    mask.addEventListener('click', function(e){ if(e.target === mask) closeModal(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && mask.classList.contains('is-on')) closeModal(); });
  }

  /* ── AI 建议待复核：采纳 / 驳回 / 转人工 → 复核弹层 → 结果写回卡片与动态 ── */
  qa('.gm-ai').forEach(function(card){
    var done = false;
    function mark(act, label, spec){
      if(done) return;
      done = true;
      card.classList.add('is-done');
      var tagBox = q('[data-ai-tag]', card);
      if(tagBox){
        tagBox.className = 'gm-pm-tag gm-pm-tag--' + spec.split('|')[0];
        tagBox.innerHTML = '<i></i>' + spec.split('|')[1];
      }
      qa('button', q('.gm-ai__acts', card)).forEach(function(b){ b.disabled = true; });
      gmToast(label + '：' + act + '（示例）', spec.split('|')[0] === 'risk' ? 'warning' : 'success');
      var ul = q('[data-feed]');
      if(ul){
        var li = document.createElement('li');
        var t = document.createElement('span');
        t.className = 'gm-pm-tag gm-pm-tag--' + spec.split('|')[0];
        t.innerHTML = '<i></i>' + spec.split('|')[1];
        var s = document.createElement('span');
        s.textContent = label + ' · ' + act + '（审核人 王立）';
        li.appendChild(t); li.appendChild(s);
        ul.insertBefore(li, ul.firstChild);
        while(ul.children.length > 6) ul.removeChild(ul.lastChild);
      }
    }
    qa('button', q('.gm-ai__acts', card)).forEach(function(b){
      b.addEventListener('click', function(){
        var act = b.getAttribute('data-ai-act');
        var label = q('[data-ai-title]', card) ? q('[data-ai-title]', card).textContent.trim() : 'AI 建议';
        if(act === 'adopt'){ mark('已采纳', label, 'positive|审核通过'); return; }
        if(act === 'reject'){ mark('已驳回', label, 'risk|已驳回'); return; }
        openModal(
          '转人工复核 · ' + label,
          '<label class="gm-lbl" for="rv-note">复核意见（写清依据，便于回溯）</label>'
          + '<textarea class="gm-inp" id="rv-note" placeholder="例：需补充心脏功能评估后再定级"></textarea>'
          + '<span class="gm-lbl">处理结果</span>'
          + '<div class="gm-opts"><label class="gm-opt"><input type="radio" name="rv" value="ok">采纳</label>'
          + '<label class="gm-opt"><input type="radio" name="rv" value="no">驳回</label>'
          + '<label class="gm-opt"><input type="radio" name="rv" value="hum" checked>转人工复核</label></div>',
          '<button type="button" class="gm-pm-btn gm-pm-btn--line" data-modal-close="1">取消</button>'
          + '<button type="button" class="gm-pm-btn gm-pm-btn--pri" data-modal-ok="1">提交复核</button>',
          function(m){
            var v = (q('input[name="rv"]:checked', m) || {}).value || 'hum';
            mark({ ok: '已采纳', no: '已驳回', hum: '已转人工复核' }[v], label,
                 v === 'no' ? 'risk|已驳回' : (v === 'ok' ? 'positive|审核通过' : 'attention|待审核'));
            return true;
          });
      });
    });
  });

  /* ── AI 助手对话：预设问答（点常用问题或直接输入）→ 打字点 → 回复气泡 ── */
  var chat = q('.gm-chat');
  if(chat){
    var QA = {};
    qa('[data-qa]').forEach(function(b){ QA[b.getAttribute('data-qa')] = b.getAttribute('data-a'); });
    function bubble(cls, text){
      var d = document.createElement('div');
      d.className = 'gm-bubble gm-bubble--' + cls;
      d.textContent = text;
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
      return d;
    }
    function typing(){
      var d = document.createElement('div');
      d.className = 'gm-typing';
      d.innerHTML = '<i></i><i></i><i></i>';
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
      return d;
    }
    function ask(text, answer){
      if(!text) return;
      bubble('me', '医生：' + text);
      var t = typing();
      setTimeout(function(){
        if(t.parentNode) t.parentNode.removeChild(t);
        var a = answer || QA[text] ||
          '（示意回答）已按该产品的主流程与 15 · 15.2 状态词表生成建议：'
          + '请先确认对象与风险分级，再执行对应动作；AI 只产出建议，须经医生审核后写入业务系统。';
        bubble('ai', '妈咪好助手：' + a);
      }, 900);
    }
    qa('[data-qa]').forEach(function(b){
      b.addEventListener('click', function(){ ask(b.getAttribute('data-qa'), b.getAttribute('data-a')); });
    });
    var bar = q('.gm-chatbar');
    if(bar){
      var inp = q('input', bar);
      var send = q('[data-chat-send]', bar);
      function submit(){ var v = inp.value.trim(); if(!v) return; inp.value = ''; ask(v, QA[v]); }
      if(send) send.addEventListener('click', submit);
      inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); submit(); } });
    }
  }

  /* ── 生长 / 体重曲线（13 · 13.2）：单页版渲染器，口径与外壳 window.gmGrowth 一致 ── */
  function pctl(d, x, v){
    var i = d.x.indexOf(x);
    if(i < 0) return null;
    var lo = d.p3[i], mid = d.p50[i], hi = d.p97[i];
    if(!(lo < mid && mid < hi)) return null;
    var p = v <= mid ? 3 + (v - lo) / (mid - lo) * 47 : 50 + (v - mid) / (hi - mid) * 47;
    return Math.max(1, Math.min(99, Math.round(p)));
  }
  function renderGrowth(host, d){
    var W = 380, H = 168, M = {t: 10, r: 12, b: 26, l: 34};
    var iw = W - M.l - M.r, ih = H - M.t - M.b;
    var xmin = d.x[0], xmax = d.x[d.x.length - 1];
    var ymin = Math.min.apply(null, d.p3), ymax = Math.max.apply(null, d.p97);
    var pad = (ymax - ymin) * 0.18; ymin -= pad; ymax += pad;
    var X = function(v){ return M.l + (v - xmin) / (xmax - xmin) * iw; };
    var Y = function(v){ return M.t + (1 - (v - ymin) / (ymax - ymin)) * ih; };
    var line = function(vals){ return vals.map(function(v, i){ return (i ? 'L' : 'M') + X(d.x[i]).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' '); };
    var band = function(){
      var up = d.p97.map(function(v, i){ return (i ? 'L' : 'M') + X(d.x[i]).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
      var back = d.x.map(function(x, i){ return 'L' + X(d.x[d.x.length - 1 - i]).toFixed(1) + ',' + Y(d.p3[d.p3.length - 1 - i]).toFixed(1); }).join(' ');
      return up + ' ' + back + ' Z';
    };
    var fi = d.x.indexOf(d.focus), fp = fi >= 0 ? pctl(d, d.focus, d.actual[fi]) : null;
    var parts = [];
    parts.push('<div class="gm-gx__head"><b>' + d.title + '</b>'
      + '<span class="gm-gx__src">' + d.source + (d.bandLabel ? ' · ' + d.bandLabel : '') + '</span>'
      + '<span class="gm-gx__val">' + (fp ? 'P' + fp : '—')
      + ' <i>' + d.focus + ' ' + d.xName + ' · ' + d.yName + ' ' + d.actual[fi] + d.yUnit + '</i></span></div>');
    parts.push('<svg class="gm-gx__svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="'
      + d.title + '：' + d.source + '，' + d.xName + ' ' + d.focus + ' 时 ' + d.yName + ' '
      + d.actual[fi] + d.yUnit + '，约 P' + fp + '">');
    (d.yTicks || []).forEach(function(v){
      if(v <= ymin || v >= ymax) return;
      parts.push('<line class="gm-gx__grid" x1="' + X(xmin) + '" y1="' + Y(v).toFixed(1) + '" x2="' + X(xmax) + '" y2="' + Y(v).toFixed(1) + '"/>');
      parts.push('<text class="gm-gx__tick" x="' + (M.l - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + '</text>');
    });
    parts.push('<path class="gm-gx__band" d="' + band() + '"/>');
    parts.push('<path class="gm-gx__bandtop" d="' + line(d.p97) + '"/>');
    parts.push('<path class="gm-gx__warn" d="' + line(d.p3) + '"/>');
    parts.push('<path class="gm-gx__warn" d="' + line(d.p97) + '"/>');
    parts.push('<path class="gm-gx__p50" d="' + line(d.p50) + '"/>');
    parts.push('<path class="gm-gx__line" d="' + line(d.actual) + '"/>');
    parts.push('<circle class="gm-gx__dot" cx="' + X(d.focus).toFixed(1) + '" cy="' + Y(d.actual[fi]).toFixed(1) + '" r="3"/>');
    d.x.forEach(function(x, i){
      var off = d.actual[i] < d.p3[i] || d.actual[i] > d.p97[i];
      parts.push('<circle class="gm-gx__pt" data-i="' + i + '"' + (off ? ' data-tone="attention"' : '')
        + ' cx="' + X(x).toFixed(1) + '" cy="' + Y(d.actual[i]).toFixed(1) + '" r="4"/>');
    });
    (d.xTicks || d.x).forEach(function(x){
      parts.push('<text class="gm-gx__tick" x="' + X(x).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + x + '</text>');
    });
    parts.push('</svg>');
    /* 读屏等价数据表（13 · 13.2：图形对 AT 不可见，必须给出同一份数据）。
       隐藏配方与模块侧同源（shell_sr_only_css），不要另写一套 clip 值。 */
    parts.push('<table class="gm-sr-only"><caption>' + d.title + ' ' + d.source
      + '</caption><thead><tr><th scope="col">' + d.xName + '</th><th scope="col">' + d.yName
      + '</th><th scope="col">P3</th><th scope="col">P97</th><th scope="col">百分位</th></tr></thead><tbody>');
    d.x.forEach(function(x, i){
      parts.push('<tr><td>' + x + '</td><td>' + d.actual[i] + d.yUnit + '</td><td>' + d.p3[i]
        + '</td><td>' + d.p97[i] + '</td><td>P' + pctl(d, x, d.actual[i]) + '</td></tr>');
    });
    parts.push('</tbody></table>');
    parts.push('<div class="gm-gx__legend"><span><i style="background:rgba(169,227,212,.85)"></i>P3–P97 参考带</span>'
      + '<span><i style="background:#F77FA3"></i>实测</span>'
      + '<span><i style="background:#9AA2B0"></i>P3 / P97 警戒线</span></div>');
    if(d.advisories && d.advisories.length){
      d.advisories.forEach(function(a){
        parts.push('<div class="gm-gx__note"><i></i><span>' + a.text + '</span></div>');
      });
    }
    parts.push('<div class="gm-gx__tip" role="presentation"><b></b><span></span></div>');
    host.className = 'gm-gx';
    host.innerHTML = parts.join('');
    /* 悬停读点：数据点 → 白玻璃气泡（13 · 13.2） */
    var tip = q('.gm-gx__tip', host);
    qa('.gm-gx__pt', host).forEach(function(pt){
      pt.style.cursor = 'pointer';
      pt.addEventListener('mouseenter', function(){
        var i = parseInt(pt.getAttribute('data-i'), 10);
        var p = pctl(d, d.x[i], d.actual[i]);
        q('b', tip).textContent = d.xName + ' ' + d.x[i] + d.xUnit + ' · ' + d.yName + ' ' + d.actual[i] + d.yUnit;
        q('span', tip).textContent = (p ? '约 P' + p : '—');
        var box = host.getBoundingClientRect();
        var cx = pt.getBoundingClientRect().left - box.left + 4;
        var cy = pt.getBoundingClientRect().top - box.top - 6;
        tip.style.left = cx + 'px';
        tip.style.top = cy + 'px';
        tip.classList.add('is-on');
      });
      pt.addEventListener('mouseleave', function(){ tip.classList.remove('is-on'); });
    });
  }
  qa('[data-chart]').forEach(function(el){
    var cfg = window.__GM_CHARTS__ && window.__GM_CHARTS__[el.getAttribute('data-chart')];
    if(cfg) renderGrowth(el, cfg);
  });

  /* ── KPI 数字滚动（04 · 4.6：600ms ease-out，仅数字文本） ── */
  qa('.gm-num-roll').forEach(function(el){
    var target = parseFloat(String(el.textContent).replace(/[^\d.]/g, ''));
    if(isNaN(target)) return;
    var suffix = String(el.textContent).replace(/[\d.,]/g, '');
    var t0 = null;
    function step(ts){
      if(t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 600);
      var v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = (target >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(target % 1 ? 1 : 0)) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* 首屏：按 hash 定位视图，缺省工作台 */
  go((location.hash || '').replace(/^#/, '') || 'work', false);
})();
"""

def base_css() -> str:
    """从 `gen-products.py` 抽出唯一首页「产品矩阵」模块的样式表（设计系统基线，单一出处）。

    运行时抽取而不是复制：那份样式已经过 audit.py / a11y-dom.py / page-qa.mjs 三套门禁，
    复制粘贴出去的第二份，就是"两份开始漂移"的那天（本仓已有先例：生长曲线三处各画一遍）。
    """
    import io as _io, os as _os
    here = _os.path.dirname(_os.path.abspath(__file__))
    src = _io.open(_os.path.join(here, "gen-products.py"), encoding="utf-8").read()
    i = src.index('CSS = r"""') + len('CSS = r"""')
    j = src.index('"""', i)
    css = src[i:j]
    if ".gm-pm-card{" not in css or ".gm-tbl" not in css:
        raise SystemExit("ERROR 未能从 gen-products.py 抽到模块样式表（结构变了？）")
    return css

def shell_css_for(needles: tuple, label: str) -> str:
    """从外壳（build-site.py 的 SHELL）抽出**数据呈现层**配方：`.gm-tbl` / `.gm-tbl-wrap`。

    为什么必须抽：数据呈现层配方按本仓架构放在**外壳**（唯一实现 + audit.py 的
    data_present 守门），模块与独立页只写 `class="..."` 取用。独立产品页没有外壳，
    于是这些配方会完全没样式 —— 实测 page-qa 一次报了 30 条 tbl-row-height /
    tbl-head-type / tbl-body-type / tbl-ops-align / tbl-tabular（行高 28、表头 16px、
    无 tabular-nums）。这里只抽 `needles` 命中的规则（含 ≤767 档的子规则），
    不把外壳整段搬过来。
    """
    import io as _io, os as _os, re as _re
    here = _os.path.dirname(_os.path.abspath(__file__))
    src = _io.open(_os.path.join(here, "build-site.py"), encoding="utf-8").read()
    shell = src[src.index('SHELL = """') + len('SHELL = """'):]
    shell = shell[:shell.index('\n"""')]

    def chunks(text):
        out, i, n = [], 0, len(text)
        while i < n:
            if text.startswith("/*", i):
                j = text.find("*/", i + 2)
                j = n if j < 0 else j + 2
                out.append(["comment", text[i:j]]); i = j; continue
            if text[i].isspace():
                j = i
                while j < n and text[j].isspace():
                    j += 1
                out.append(["ws", text[i:j]]); i = j; continue
            b = text.find("{", i)
            if b < 0:
                out.append(["ws", text[i:]]); break
            depth, j = 1, b + 1
            while j < n and depth:
                if text[j] == "{":
                    depth += 1
                elif text[j] == "}":
                    depth -= 1
                j += 1
            out.append(["rule", text[i:j]]); i = j
        return out

    keep = []
    for kind, text in chunks(shell):
        if kind != "rule":
            continue
        sel = text.split("{", 1)[0].strip()
        head = sel.split()[0] if sel else ""
        if head.startswith("@media"):
            inner = text[text.index("{") + 1:text.rindex("}")]
            sub = [t for k, t in chunks(inner)
                   if k == "rule" and any(n in t.split("{", 1)[0] for n in needles)]
            if sub:
                keep.append(sel + "{" + "".join(sub) + "}")
            continue
        if any(n in sel for n in needles):
            keep.append(text)
    if not keep:
        raise SystemExit("ERROR 未能从外壳抽到 %s 配方（build-site.py 结构变了？）" % label)
    return "\n".join(keep)


def shell_table_css() -> str:
    """数据表格配方（`.gm-tbl*`）。"""
    return shell_css_for((".gm-tbl",), ".gm-tbl")


def shell_sr_only_css() -> str:
    """读屏用隐藏配方（`.gm-sr-only`）：生长曲线的等价数据表靠它隐藏。

    独立产品页的曲线此前**没有**这张等价数据表（13 · 13.2 要求"图形必须为 AT 提供等价数据"），
    只有一句 aria-label 摘要；模块侧早就有。这里连同隐藏配方一起补齐，保持同一个母组件语义。
    """
    return shell_css_for((".gm-sr-only",), ".gm-sr-only")
