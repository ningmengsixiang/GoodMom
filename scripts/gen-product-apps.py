#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 fuyouaicansai/ 下的 **6 个独立产品页 + 1 个索引页**。

## 这是什么

参照 `fuyouaicansai/goodmom-redesign.html`（把那套 Tailwind 原型重画成的**单文件应用外壳**）
的形态，把 `prd/zong.md` 的 6 大产品各做成一页，每页 4 个视图：

    工作台 —— 4 KPI（可点筛选）· 核心业务闭环步骤轴 · 今日待处理（筛选 + 行内推进）· 队列 · 快捷工具 · 质量概览 · 最新动态
    档案   —— 档案头卡（六语义 / 五色标签）· 关键指标 · 体重/生长曲线（p03/p04/p05）· 健康事件时间线 · 关联档案
    AI 协同 —— AI 建议待复核（置信度 + 依据 + 采纳/驳回/转人工 → 复核弹层）· AI 助手对话（打字反馈）· 协同方 · AI 边界
    详情   —— 对象头卡 · 检查检验表 · 证据链 · 结论与建议（审核状态 + 签发/退回）· 随访计划

外壳与参照项目同形态：**可收起侧栏**（分组菜单 + 徽标 + 用户区）+ 顶栏（品牌 + 页签 + 侧栏/顶栏切换），
≤1280px 自动切顶栏模式；单文件、无 CDN 依赖、双击即可打开。

## 单一出处（为什么这样取样式）

页面样式 = **唯一首页「产品矩阵」模块的样式表**（运行时从 `scripts/gen-products.py` 的 `CSS`
抽出，见 `product_app_assets.base_css()`）+ 外壳增量（`product_app_assets.APP_CSS`）。
前者已经过 `audit.py` / `a11y-dom.py` / `page-qa.mjs` 三套门禁验证；抄第二份就是两份开始漂移的那天
（本仓已有先例：生长曲线在三处各画一遍、表格配方在五处漂移）。

## 数据来源

· 产品身份 / 功能架构 / 旗舰流程 / 主责数据 / 角色：`products_prd.py`（解析 prd/zong.md）
· 工作台数值（KPI / 待处理 / 队列 / 工具 / 质量 / 动态）：`products_data.py` 的 `DEMO`
· 档案 / AI 协同 / 详情内容：`products_data.py` 的 `APP`
· 凡能派生的（一级模块菜单、旗舰流程步骤、角色、时间线、证据链、随访计划）一律派生，不手抄

## 用法

    python3 scripts/gen-product-apps.py           # 生成 6 页 + index.html
    python3 scripts/gen-product-apps.py --check   # 只校验产物是否与生成结果一致（CI 用）
"""
from __future__ import annotations

import argparse
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from product_app_assets import (APP_CSS, APP_JS, base_css, shell_sr_only_css,  # noqa: E402
                                shell_table_css)
from products_data import (APP, BRAND, DEMO, LINKS, PRIMARY, PRODUCT_ICON,  # noqa: E402
                            PRODUCTS, module_pages)
from products_prd import flow_steps, parse_prd, read_prd  # noqa: E402
# 表格行的两套单元（桌面列 / 窄屏合并单元）与模块侧共用同一实现
import importlib.util as _ilu  # noqa: E402
_spec = _ilu.spec_from_file_location("gen_products", os.path.join(HERE, "gen-products.py"))
_gp = _ilu.module_from_spec(_spec); _spec.loader.exec_module(_gp)
tbl_row = _gp.tbl_row

ROOT = os.path.dirname(HERE)
OUTDIR = os.path.join(ROOT, "fuyouaicansai")

# 责任人（与工作台示意数据里的署名一致：同一个人在同一套演示里就是同一个人）
ORG = "望京妇幼保健院"          # 示意机构（与工作台顶栏一致）
DOCTOR = {"p01": "王立", "p02": "赵敏", "p03": "王立", "p04": "李静", "p05": "孙倩", "p06": "王立"}
# 时间线用的示意日期序列（示意数据，页脚已声明）
DATES = ["2025-05-06", "2025-05-12", "2025-05-20", "2025-06-02", "2025-06-08"]

TONE_KEY = {"accent": "all", "risk": "risk", "att": "attention", "info": "info"}
# AI 边界四条（PRD §八「AI 不负责」）的**短文案**：给界面用的胶囊标签。
# ⚠️ 不要用字符串裁剪从长句里现造（试过：'替代医生诊疗' → '不医生诊疗'，
#    '无审核自动修改核心病历' → '不无审核修改核' —— 语义直接被裁坏）。文案必须是人写的。
AI_BOUNDARY_SHORT = ["不替代诊疗", "不下达结论", "不改核心病历", "不取跨机构隐私"]
TONE_CN = {"all": "全部", "risk": "风险 / 异常", "attention": "注意 / 待办",
           "info": "信息 / 进行", "neutral": "中性 / 未动", "positive": "正向 / 已完成",
           "special": "特殊 / 协作"}

ICO = ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="%s"/></svg>')
ICONS = {
    "board": ICO % "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    "archive": ICO % "M12 4.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4M5 20c.6-3.6 3.4-5.4 7-5.4s6.4 1.8 7 5.4",
    "ai": ICO % "M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z",
    "detail": ICO % "M5 3.5h14v17H5zM8.5 8h7M8.5 12h7M8.5 16h4",
    "flow": ICO % "M4 6h6M4 12h10M4 18h16",
    "shield": ICO % "M12 3.5l7 3v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9v-5z",
    "search": ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
               '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 21 21"/></svg>'),
    "collapse": ICO % "M15 6l-6 6 6 6M4 6v12",
}


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tag(spec: str, status: bool = False, extra: str = "") -> str:
    """状态标签（14 · 4.4.4：色点 8px + caption 文本；颜色永不单独传义）。
    spec = `六语义|文案` 或 `m5|级别|文案`；status=True 加 data-status（行内动作只改这一个标签）。"""
    parts = spec.split("|")
    attr = ' data-status="1"' if status else ""
    attr += (" " + extra) if extra else ""
    if parts[0] == "m5":
        return ('<span class="gm-pm-tag gm-pm-tag--m5" data-m5="%s"%s><i></i>%s</span>'
                % (parts[1], attr, esc(parts[2])))
    return ('<span class="gm-pm-tag gm-pm-tag--%s"%s><i></i>%s</span>'
            % (parts[0], attr, esc(parts[1])))



def tag_spec(t) -> str:
    """把 APP 数据里的标签写法归一为 `六语义|文案` / `m5|级别|文案`。

    数据层为了可读性混用两种写法：`("risk", "检查异常")` 与 `("m5|4|红 · 高风险",)`。
    归一集中在这一处 —— 散在模板里各自判断，迟早漏一处（漏了就是标签渲染成空）。
    """
    if isinstance(t, str):
        return t
    if len(t) == 1 or "|" in t[0]:
        return t[0]
    return "%s|%s" % (t[0], t[1])

def head(p: dict, title: str, desc: str = "") -> str:
    """视图标题区：视图名（+ 可选一句话说明）。

    界面里**不放规范口径**：口径是给评审与研发查的，不是给用户读的。
    章节出处改记在各个 head() 调用点的注释与 CHANGELOG（评审仍可逐条追溯）。
    """
    d = ('<p class="gm-pm-head__d">%s</p>' % esc(desc)) if desc else ""
    return ('<div class="gm-pm-head"><h2>%s</h2>%s</div>\n' % (esc(title), d))


def timeline(items: list[tuple[str, str, str, str]]) -> str:
    return ('<ul class="gm-tl">%s</ul>'
            % "".join('<li data-tone="%s"><div class="d">%s</div><div class="t">%s</div>'
                      '<div class="s">%s</div></li>' % (t, esc(d), esc(x), esc(s))
                      for d, x, s, t in items))


# ══════════════════════════════════════════════════════════════════════════
# 四个视图
# ══════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════
# 四个视图（版式统一：内容区两栏 = 左主数据 / 右工具与概览；曲线全宽）
#   · 界面上只放业务信息与可点操作：不放标题序号、不放规范口径、不放说明性小字、
#     不放不可点的假控件、不放销售/架构类字段（判定原则见 CHANGELOG）。
#   · 卡片数量按"每块承担一件事"来定，避免一屏十几张卡把页面切碎。
# ══════════════════════════════════════════════════════════════════════════

def _kpis(d: dict) -> str:
    """4 个 KPI：可点击 → 按语义筛选待处理清单。"""
    return "".join(
        '<button type="button" class="gm-pm-card gm-pm-kpi" data-tone-filter="%s" aria-pressed="false" '
        'title="按「%s」筛选待处理清单">'
        '<span class="gm-pm-kpi__l">%s</span>'
        '<span class="gm-pm-kpi__v is-%s gm-num-roll">%s</span>'
        '<span class="gm-pm-kpi__d">%s</span></button>'
        % (TONE_KEY[t], esc(TONE_CN[TONE_KEY[t]]), esc(l), t, esc(v), esc(dt))
        for l, v, dt, t in d["kpis"])


def _todos(p: dict, d: dict) -> str:
    """今日待处理：状态筛选 chips（带条数）+ 玻璃表格 + 行内动作 + 空状态。"""
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
    rows = []
    for r in d["rows"]:
        acts = ['<button type="button" class="gm-pm-act" data-act="view">查看</button>',
                '<button type="button" class="gm-pm-act" data-act="advance" data-after="%s">%s</button>'
                % (esc(r["after"]), esc(r["act"]))]
        if r.get("free"):
            acts.append('<button type="button" class="gm-pm-act" kind="collab" data-kind="collab" '
                        'data-act="collab" data-after="special|%s">%s</button>'
                        % (esc("转诊" if r["free"] in ("发起转诊", "转诊") else "已驳回"), esc(r["free"])))
        mids = [esc(r["item"])]
        if has_m5:
            mids.append(tag("m5|%s|%s" % r["m5"]))
        mids.append(esc(r["when"]))
        labels = ["事项"] + (["风险分级"] if has_m5 else []) + ["时限"]
        rows.append(tbl_row(r["tag"].split("|")[0], r["who"], mids, tag(r["tag"], status=True),
                            "".join(acts), 5 + (1 if has_m5 else 0), labels))
    return (
        '<div class="gm-pm-card">\n'
        '  <h3>今日待处理</h3>\n'
        '  <div class="gm-pm-filters">%s<span class="gm-pm-count" data-count>共 %d / %d 条</span></div>\n'
        '  <div class="gm-tbl-wrap gm-pm-todos"><table class="gm-tbl">\n'
        '    <thead><tr><th scope="col">%s</th><th scope="col">事项</th>%s<th scope="col">状态</th>'
        '<th scope="col">时限</th><th scope="col" class="col-ops">操作</th></tr></thead>\n'
        '    <tbody>%s</tbody>\n'
        '  </table></div>\n'
        '  <div class="gm-pm-empty gm-pm-off" data-empty>当前筛选下暂无事项。</div>\n'
        '</div>' % ("".join(chips), len(d["rows"]), len(d["rows"]), esc(d["obj_col"]),
                    '<th scope="col">风险分级</th>' if has_m5 else "", "".join(rows)))


def view_work(p: dict, prd: dict, app: dict) -> str:
    """工作台：KPI →（左）今日待处理 · 风险队列（右）快捷工具 · 概览 →（全宽）曲线。"""
    d = DEMO[p["pid"]]
    qbtns = "".join(
        '<button type="button" class="gm-pm-qbtn" data-tone-filter="%s" aria-pressed="false">%s<b>%s</b></button>'
        % (t, esc(a), esc(b)) for a, b, t in d["queue"]["rows"])
    tools = "".join('<button type="button" class="gm-pm-btn gm-pm-btn--line" data-tool="%s">%s</button>'
                    % (esc(t), esc(t)) for t in d["tools"])
    quality = "".join("<li>%s<b>%s</b></li>" % (esc(a), esc(b)) for a, b in d["quality"])
    feed = "".join("<li>%s<span>%s</span></li>" % (tag(t), esc(x)) for t, x in d["feed"])
    chart = ("" if not d.get("chart") else
             '<div class="gm-pm-card" style="margin-top:var(--lg-space-4)">'
             '<div class="gm-chartbox"><div data-chart="%s"></div></div></div>' % p["pid"])
    return (
        '<div class="gm-pm-view is-on" data-v="work" aria-label="工作台">\n'
        + head(p, "工作台") + '\n'
        + '<div class="gm-pm-kpis">%s</div>\n' % _kpis(d)
        + '<div class="gm-pm-grid gm-pm-grid--%s">\n' % ("stack" if any("m5" in r for r in d["rows"]) else "wide")
        + '  <div>\n' + _todos(p, d) + '\n'
          '    <div class="gm-pm-card" style="margin-top:var(--lg-space-4)">\n'
          '      <h3>%s</h3>\n      %s\n    </div>\n' % (esc(d["queue"]["title"]), qbtns) +
          '  </div>\n'
          '  <div>\n'
          '    <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
          '      <h3>快捷工具</h3>\n      <div class="gm-pm-tools">%s</div>\n    </div>\n' % tools +
          '    <div class="gm-pm-card">\n'
          '      <div class="gm-pm-ov"><h4>质量</h4><ul class="gm-pm-list">%s</ul></div>\n' % quality +
          '      <div class="gm-pm-ov"><h4>动态</h4>'
          '<ul class="gm-pm-list gm-pm-feed" data-feed>%s</ul></div>\n' % feed +
          '    </div>\n'
          '  </div>\n'
          '</div>\n'
        + chart +
        '</div>\n')


def _kv_val(v: str) -> str:
    """`128（风险分级 46 · 随访 52 · 报告 30）` 这类「主值 + 括号补充」拆成两个行内盒。

    ⚠️ 为什么要拆：整串写在**一个行内盒**里时，Chromium 对「Inter + CJK 回退」这条字形运行
    找不到断行点 —— `overflow-wrap:anywhere` 与 `word-break:break-all` 都无效（实测 320 档
    单行 253px、顶出内容盒 7px，而同一段文字放进 `sans-serif` 或包一层 `<b>` 就正常换行）。
    拆成两个行内盒后断行点在边界处自然出现，顺带把补充信息降为次级色，层级更清楚。
    """
    i = v.find("（")
    if i <= 0 or not v.endswith("）"):
        return esc(v)
    return esc(v[:i]) + '<span class="gm-kv__sub">' + esc(v[i + 1:-1]) + "</span>"


def _obj_head(s: dict) -> str:
    """对象头卡：头像 + 名称 + 身份一行 + 归属一行。

    ⚠️ 这里原来是 `s["who"] + " · " + s["meta"]` 直接拼成一串，最长 53 字，例如
    「孕 12 周 + 3 天 · 档案 MMH-2025-0301 · 产科 · 王立医生 · 高危专案责任人」——
    一眼看过去就是"一坨字"（用户的反馈原话：文字居多、非常乱）。拆成两行：
    身份（who · 档案号）+ 归属（科室 · 医生 · 角色），语义标签仍单独一行。
    信息不丢，只是分行；读屏顺序不变。
    """
    segs = [x for x in s["meta"].split(" · ") if x]
    line2 = ('<span class="gm-obj__ln">%s</span>' % esc(" · ".join(segs[1:]))) if len(segs) > 1 else ""
    return ('<div class="gm-obj"><span class="gm-pm-av" style="width:44px;height:44px">%s</span>'
            '<span class="gm-obj__t"><strong>%s</strong><small>%s · %s</small>%s</span></div>'
            % (esc(s["avatar"]), esc(s["name"]), esc(s["who"]), esc(segs[0]), line2))


def view_archive(p: dict, prd: dict, app: dict) -> str:
    """档案：对象头卡 →（左）关键指标 · 健康事件（右）曲线 · 关联档案。"""
    pid = p["pid"]
    pd = prd["products"][pid]
    s = app["subject"]
    _, steps = flow_steps(p, pd)
    events = [(DATES[i], steps[i], "%s · %s" % (pd["owns"][0], DOCTOR[pid]),
               "attention" if i == min(3, len(steps) - 1) else "positive")
              for i in range(min(4, len(steps)))]
    rel = "".join("<li>%s<b>%s</b></li>" % (esc(a), esc(b)) for a, b in app["relations"])
    # ⚠️ 这里曾再挂一份 `data-chart`：同一张生长曲线在「工作台」和「档案」各渲染一次，
    # 于是每页有 2 个 .gm-gx__svg（其中一个宽度 0，藏在未激活视图里）。曲线属于**工作台**的
    # 主视觉（默认视图，也让独立页与站内模块保持一致）；档案视图不再重复第二份。
    return (
        '<div class="gm-pm-view" data-v="archive" aria-label="档案">\n'
        + head(p, "档案") + '\n'
        + '<div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">'
        + _obj_head(s) +
          '<div class="gm-pm-qr" style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap;margin-top:var(--lg-space-3)">%s</div>'
          '</div>\n' % ("".join(tag(tag_spec(x)) for x in s["tags"]))
        + '<div class="gm-pm-grid gm-pm-grid--wide">\n'
          '  <div>\n'
          '    <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
          '      <h3>关键指标</h3><dl class="gm-kv">%s</dl>\n    </div>\n'
          '    <div class="gm-pm-card"><h3>关联档案</h3><ul class="gm-pm-list">%s</ul></div>\n'
          '  </div>\n'
          '  <div>\n'
          '    <div class="gm-pm-card"><h3>健康事件</h3>%s</div>\n'
          '  </div>\n'
          '</div>\n'
        '</div>\n'
        % ("".join('<div><dt>%s</dt><dd>%s</dd></div>' % (esc(k), _kv_val(v)) for k, v in app["metrics"]),
           rel, timeline(events)))


def view_ai(p: dict, prd: dict, app: dict) -> str:
    """AI 协同：（左）AI 建议待复核（右）AI 助手 · 边界与协同。"""
    cards = "".join(
        '<div class="gm-ai"><div class="gm-ai__hd"><b data-ai-title="1">%s</b>%s</div>'
        '<p class="gm-ai__basis">%s</p>'
        '<div class="gm-ai__acts">'
        '<button type="button" class="gm-pm-btn gm-pm-btn--pri" data-ai-act="adopt">采纳</button>'
        '<button type="button" class="gm-pm-btn gm-pm-btn--line" data-ai-act="reject">驳回</button>'
        '<button type="button" class="gm-pm-btn gm-pm-btn--line" data-ai-act="human">转人工复核</button>'
        '<span class="gm-pm-tag gm-pm-tag--info"><i></i>建议动作 %s</span>'
        '</div></div>'
        % (esc(a["t"]), tag("attention|待审核", extra='data-ai-tag="1"'), esc(a["basis"]), esc(a["act"]))
        for a in app["ai"])
    qa_chips = "".join('<button type="button" class="gm-pm-filter" data-qa="%s" data-a="%s">%s</button>'
                       % (esc(q), esc(a), esc(q)) for q, a in app["qa"])
    roles = "".join('<span class="gm-pm-tag gm-pm-tag--info"><i></i>%s</span>' % esc(r) for r in p["roles"])
    boundary = "".join('<span class="gm-pm-tag gm-pm-tag--neutral"><i></i>%s</span>' % esc(x)
                       for x in AI_BOUNDARY_SHORT)
    return (
        '<div class="gm-pm-view" data-v="ai" aria-label="AI 协同">\n'
        + head(p, "AI 协同") + '\n'
        + '<div class="gm-pm-grid gm-pm-grid--wide">\n'
          '  <div>\n'
          '    <div class="gm-sec__h" style="margin-bottom:var(--lg-space-3)"><h3>AI 建议待复核</h3></div>\n'
          '    %s\n'
          '  </div>\n'
          '  <div>\n'
          '    <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
          '      <h3>AI 助手</h3>\n'
          '      <div class="gm-chat" role="log" aria-label="AI 助手对话">'
          '<div class="gm-bubble gm-bubble--ai">可问流程与处置口径；结论仅供参考。</div></div>\n'
          '      <div class="gm-qa">%s</div>\n'
          '      <div class="gm-chatbar"><input type="text" aria-label="向 AI 助手提问" '
          'placeholder="输入问题，或点上方常用问题">'
          '<button type="button" class="gm-pm-btn gm-pm-btn--line" data-chat-send="1">发送</button></div>\n'
          '    </div>\n'
          '    <div class="gm-pm-card">\n'
          '      <h3>协同与边界</h3>\n'
          '      <div class="gm-pm-ov"><h4>协同方</h4>'
          '<div class="gm-pm-qr" style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap">%s</div></div>\n'
          '      <div class="gm-pm-ov"><h4>AI 不负责</h4>'
          '<div class="gm-pm-qr" style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap">%s</div>'
          '<p class="gm-pm-cap" style="margin-top:var(--lg-space-2)">'
          '建议须经医生审核后写入业务系统。</p></div>\n'
          '    </div>\n'
          '  </div>\n'
          '</div>\n'
        '</div>\n' % (cards, qa_chips, roles, boundary))


def view_detail(p: dict, prd: dict, app: dict) -> str:
    """详情：对象头卡 →（左）检查检验 · 结论与建议（右）证据链 · 随访计划。"""
    pid = p["pid"]
    pd = prd["products"][pid]
    doc = DOCTOR[pid]
    s = app["subject"]
    _, steps = flow_steps(p, pd)
    exams = "".join(tbl_row("info", n, [esc(d), esc(v)], tag(t), "", 4, ["日期", "结果"])
                    for n, d, v, t in app["exams"])
    evidence = [(DATES[i], st, "%s · %s" % ("业务系统接口" if i % 2 else "人工录入", doc), "positive")
                for i, st in enumerate(steps[:3])]
    plan = [("%s（计划）" % DATES[min(i + 3, len(DATES) - 1)], st, "待随访 · %s" % doc, "attention")
            for i, st in enumerate(steps[3:5])] or \
           [(DATES[3], steps[-1], "待随访 · %s" % doc, "attention")]
    return (
        '<div class="gm-pm-view" data-v="detail" aria-label="详情">\n'
        + head(p, "详情") + '\n'
        + '<div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">'
        + _obj_head(s) +
          '<div class="gm-pm-qr" style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap;margin-top:var(--lg-space-3)">%s</div>'
          '<div style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap;margin-top:var(--lg-space-3)">'
          '<button type="button" class="gm-pm-btn gm-pm-btn--line" data-tool="发起转诊">发起转诊</button>'
          '<button type="button" class="gm-pm-btn gm-pm-btn--pri" data-tool="签发结论">签发结论</button>'
          '</div></div>\n' % ("".join(tag(tag_spec(x)) for x in s["tags"]))
        + '<div class="gm-pm-grid gm-pm-grid--wide">\n'
          '  <div>\n'
          '    <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">\n'
          '      <h3>检查检验</h3><div class="gm-tbl-wrap"><table class="gm-tbl">\n'
          '        <thead><tr><th scope="col">项目</th><th scope="col">日期</th>'
          '<th scope="col">结果</th><th scope="col">状态</th></tr></thead>\n'
          '        <tbody>%s</tbody>\n'
          '      </table></div>\n'
          '    </div>\n'
          '    <div class="gm-pm-card"><h3>结论与建议</h3>'
          '<div class="gm-pm-qr" style="display:flex;gap:var(--lg-space-2);flex-wrap:wrap">%s%s</div>'
          '</div>\n'
          '  </div>\n'
          '  <div>\n'
          '    <div class="gm-pm-card" style="margin-bottom:var(--lg-space-4)">'
          '<h3>证据链</h3>%s</div>\n'
          '    <div class="gm-pm-card"><h3>随访计划</h3>%s</div>\n'
          '  </div>\n'
          '</div>\n'
        '</div>\n'
        % (exams, tag("attention|待审核"), tag("neutral|草稿"),
           timeline(evidence), timeline(plan)))

VIEWS = [("work", "工作台", "board"), ("archive", "档案", "archive"),
         ("ai", "AI 协同", "ai"), ("detail", "详情", "detail")]


def sidebar(p: dict, prd: dict) -> str:
    """左侧栏：品牌 + 视图菜单（带徽标）+ 该产品的业务菜单（一级模块）+ 用户区。"""
    pd = prd["products"][p["pid"]]
    d = DEMO[p["pid"]]
    # ⚠️ 业务菜单原来是 6 个 `data-tool` 按钮：点了只弹一句提示、**没有页面**（假控件）。
    # 现在每一项都对应一个真实模块页（PRD 一级模块 → data-go="mod-<key>"）。
    mods = module_pages(p["pid"], pd, d, pd.get("caps") or [], DOCTOR[p["pid"]])
    menu = "".join(
        '<button type="button" class="nv" data-go="mod-%s">%s<span>%s</span>%s</button>'
        % (esc(m["key"]), ICONS["flow"], esc(m["name"]),
           '<em class="bdg">%d</em>' % pending if (pending := sum(
               1 for r in m["rows"] if r[2].split("|")[0] in ("risk", "attention"))) else "")
        for m in mods)
    views_nav = "".join(
        '<button type="button" class="nv%s" data-go="%s">%s<span>%s</span>%s</button>'
        % (" is-on" if v == "work" else "", v, ICONS[ic], esc(label),
           '<em class="bdg">%d</em>' % len(d["rows"]) if v == "work" else
           ('<em class="bdg">%d</em>' % len(APP[p["pid"]]["ai"]) if v == "ai" else ""))
        for v, label, ic in VIEWS)
    return (
        '<nav class="gm-side" aria-label="产品导航">'
        '<div class="gm-side__brand"><span class="gm-brand gm-brand--md">'
        '<img src="../brand/logo-512.png" alt="">'
        '<span class="gm-brand__t"><b>%s</b><strong>%s</strong></span></span>'
        '<button type="button" class="gm-iconb" data-act="collapse" aria-label="收起 / 展开侧栏">%s</button></div>'
        '<div class="gm-side__gt">%s</div>%s'
        '<div class="gm-side__gt">业务菜单</div>%s'
        '<div class="gm-side__foot"><span class="gm-pm-av">王</span>'
        '<div class="who"><b>%s · 主任医师</b><span>%s</span></div></div>'
        '</nav>'
        % (BRAND, esc(p["cn"]), ICONS["collapse"], esc(p["short"] + "工作台"),
           views_nav, menu, esc(DOCTOR[p["pid"]]), esc(p["audience"])))



def _kpis_from(spec: dict) -> str:
    """模块页 KPI 行：与工作台同结构（`.gm-pm-kpi`）。

    ⚠️ 只有**能映射到表格行语义**的 KPI 才做成可点筛选（`data-tone-filter`，与筛选 chips 同一机制）；
    纯聚合数字（育龄期在管、筛查完成数这类 accent 卡）渲染成**不可点的统计卡** ——
    否则点一下只弹一句"已打开（示例）"，就是用户明确否掉的假控件。
    """
    # 语气 → 表格行语义（只有能对上行的才做筛选；`accent` 是聚合数字，不进这张表）
    filt = {"risk": "risk", "attention": "attention", "att": "attention", "info": "info",
            "positive": "positive", "special": "special", "neutral": "neutral"}
    out = []
    for lab, val, note, tone in spec["kpis"]:
        if tone in filt:
            out.append('<button type="button" class="gm-pm-card gm-pm-kpi" data-tone-filter="%s" '
                       'aria-pressed="false" title="按「%s」筛选本页记录">'
                       '<span class="gm-pm-kpi__l">%s</span>'
                       '<span class="gm-pm-kpi__v is-%s gm-num-roll">%s</span>'
                       '<span class="gm-pm-kpi__d">%s</span></button>'
                       % (filt[tone], esc(TONE_CN[filt[tone]]), esc(lab), tone, esc(val), esc(note)))
        else:
            out.append('<div class="gm-pm-card gm-pm-kpi is-static">'
                       '<span class="gm-pm-kpi__l">%s</span>'
                       '<span class="gm-pm-kpi__v is-%s">%s</span>'
                       '<span class="gm-pm-kpi__d">%s</span></div>'
                       % (esc(lab), tone, esc(val), esc(note)))
    return '<div class="gm-pm-kpis">%s</div>\n' % "".join(out)


def _module_table(p: dict, spec: dict, d: dict) -> str:
    """模块主表：状态筛选 chips + 玻璃表格 + 行内动作 + 空状态（与工作台同一套交互约定）。

    ⚠️ 交互是**按视图作用域**绑定的（见 APP_JS 的 bindBlocks）：`[data-count]` / `[data-empty]`
    都取本视图内的元素，所以一页里放多张表也不会串。
    """
    tones = ["risk", "attention", "info", "neutral", "positive", "special"]
    counts = {x: sum(1 for r in spec["rows"] if r[2].split("|")[0] == x) for x in tones}
    chips = ['<button type="button" class="gm-pm-filter" data-tone-filter="all" aria-pressed="true">'
             '全部 <span class="gm-pm-filter__n">%d</span></button>' % len(spec["rows"])]
    for x in tones:
        if counts[x]:
            chips.append('<button type="button" class="gm-pm-filter" data-tone-filter="%s" '
                         'aria-pressed="false">%s <span class="gm-pm-filter__n">%d</span></button>'
                         % (x, esc(TONE_CN[x]), counts[x]))
    body = []
    for who, mids, tagv, act, after in spec["rows"]:
        ops = ('<button type="button" class="gm-pm-act" data-act="view">查看</button>'
               '<button type="button" class="gm-pm-act" data-act="advance" data-after="%s">%s</button>'
               % (esc(after), esc(act)))
        body.append(tbl_row(tagv.split("|")[0], who, [esc(m) for m in mids], tag(tagv, status=True),
                            ops, 2 + len(mids), spec["cols"]))
    cols = "".join('<th scope="col">%s</th>' % esc(c) for c in spec["cols"])
    return (
        '<div class="gm-pm-card">\n'
        '  <h3>%s</h3>\n'
        '  <div class="gm-pm-filters">%s<span class="gm-pm-count" data-count>共 %d / %d 条</span></div>\n'
        '  <div class="gm-tbl-wrap gm-pm-todos"><table class="gm-tbl">\n'
        '    <thead><tr><th scope="col">%s</th>%s<th scope="col">状态</th>'
        '<th scope="col" class="col-ops">操作</th></tr></thead>\n'
        '    <tbody>%s</tbody>\n'
        '  </table></div>\n'
        '  <div class="gm-pm-empty gm-pm-off" data-empty>当前筛选下暂无记录。</div>\n'
        '</div>' % (esc(spec["name"]), "".join(chips), len(spec["rows"]), len(spec["rows"]),
                    esc(d["obj_col"]), cols, "".join(body)))


def module_page(p: dict, spec: dict, d: dict) -> str:
    """业务模块页：标题 + 一句话 + KPI + 主表（左）+ 子模块 / 待办（右）。

    PRD 一级模块 → 真实页面。此前侧栏「业务菜单」是 6 个只有 `data-tool` 的按钮（点了只弹提示），
    用户明确要求"把菜单里边的这些页面全部完善"。内容全部来自 `prd/zong.md` 的模块树
    （名称 / 子模块）+ 该产品的演示数据，界面不出现规范口径。
    """
    side_title, side_items = spec["side"]
    side = "".join("<li>%s<b>%s</b></li>" % (esc(a), esc(b)) for a, b in side_items)
    todo_title, todos = spec["todo"]
    todo = "".join("<li>%s</li>" % esc(x) for x in todos)
    return (
        '<div class="gm-pm-view" data-v="mod-%s" aria-label="%s">\n'
        % (esc(spec["key"]), esc(spec["name"]))
        + head(p, spec["name"], spec["desc"]) + "\n"
        + _kpis_from(spec)
        # ⚠️ 布局：主表**整宽**，侧卡在下方两列 —— 原来是 `--wide`（1.6fr/1fr）两列，
        # 实测 1440 档主表卡片只有 652px、而 6 列宽表需要 772px（滚 120px）；1024 档滚 218px。
        # 表格行必须保持单行 44–52px（03 · 3.7，page-qa P2 守门），不能靠折行缩短 →
        # 只能把承载它的卡片放宽。这样做完 1200 及以下档完全无横向滚动，1440 也只剩最宽的表。
          + _module_table(p, spec, d) + '\n'
        + '<div class="gm-pm-grid gm-pm-grid--2" style="margin-top:var(--lg-space-4)">\n'
          '  <div class="gm-pm-card"><h3>%s</h3><ul class="gm-pm-list">%s</ul></div>\n'
          '  <div class="gm-pm-card"><h3>%s</h3><ul class="gm-pm-list">%s</ul></div>\n'
          '</div>\n'
          '</div>\n'
        % (esc(side_title), side, esc(todo_title), todo))

def navm_links(p: dict, pd: dict, d: dict) -> str:
    """顶栏"业务菜单"下拉的内容：对象视图 4 条 + 业务模块页 N 条（与侧栏同一份数据源）。

    窄屏（≤1280 切顶栏模式）侧栏被隐藏，这里是**唯一**能进业务模块页的入口；
    桌面宽度下这个下拉整体 `display:none`（用侧栏即可），避免两套导航同时露出。
    """
    out = ['<div class="gm-navm__grp"><b>对象视图</b>']
    for v, label, _ic in VIEWS:
        out.append('<button type="button" class="gm-navm__it" data-go="%s">%s</button>' % (v, esc(label)))
    out.append("</div>")
    out.append('<div class="gm-navm__grp"><b>业务模块</b>')
    for m in module_pages(p["pid"], pd, d, pd.get("caps") or [], DOCTOR[p["pid"]]):
        out.append('<button type="button" class="gm-navm__it" data-go="mod-%s">%s</button>'
                   % (esc(m["key"]), esc(m["name"])))
    out.append("</div>")
    return "".join(out)


def pid_of(p: dict) -> str:
    return p["pid"]


def page(p: dict, prd: dict, css: str) -> str:
    pid = pid_of(p)
    app = APP[pid]
    d = DEMO[pid]
    pd = prd["products"][pid]
    tabs = "".join('<button type="button" class="gm-tab%s" data-go="%s">%s</button>'
                   % (" is-on" if v == "work" else "", v, esc(label)) for v, label, _ic in VIEWS)
    charts = "" if not d.get("chart") else (
        '<script>window.__GM_CHARTS__={"%s":%s};</script>\n' % (pid, chart_literal(d["chart"])))
    return (
        '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>%s · 妈咪好 GoodMom</title>\n'
        '<link rel="icon" type="image/png" href="../brand/logo-192.png">\n'
        '<meta name="theme-color" content="#F77FA3">\n'
        '<meta name="description" content="%s">\n'
        '<style>\n%s\n%s\n</style>\n</head>\n<body class="mode-sider">\n'
        # ⚠️ 英文名一律取 `en_display`：PRD 里写的是 `Goodmom`，而 12 · 12.1 规定品牌英文
        # 名是 `GoodMom`（大写 M）。数据层已归一，这里原来错取了 PRD 原值 `en`，
        # 于是**每页的 meta description 都把品牌名写错**（seo/分享卡片上都是 Goodmom）。
        % (esc(p["cn"]), esc("%s（%s）· 妈咪好 GoodMom 产品矩阵：工作台 / 档案 / AI 协同 / 详情"
                             % (p["cn"], p["en_display"])), css, APP_CSS.strip())
        + sidebar(p, prd) + '\n'
        + '<div class="gm-app">\n<div class="gm-app__wrap">\n'
        + '<header class="gm-top">'
          '<span class="gm-brand gm-brand--sm"><img src="../brand/logo-512.png" alt="">'
          '<span class="gm-brand__t"><b>%s</b><strong>%s</strong></span></span>'
          '<div class="gm-tabs" role="tablist" aria-label="页面视图">%s</div>'
          # ⚠️ ≤1280 会切顶栏模式并隐藏侧栏 —— 没有这个下拉的话，**手机上根本进不去业务模块页**
          # （实测：侧栏隐藏后 37 个模块页在窄屏完全不可达）。内容与侧栏同一份数据源。
          '<span class="gm-navm">'
          '<button type="button" class="gm-navm__btn" data-act="navm" aria-expanded="false" '
          'aria-controls="gm-navm-panel">业务菜单<em class="gm-navm__n">%d</em></button>'
          '<div class="gm-navm__panel" id="gm-navm-panel" hidden>%s</div></span>'
          '<span class="gm-seg" role="group" aria-label="导航形态">'
          '<button type="button" data-mode="sider" class="is-on">侧栏</button>'
          '<button type="button" data-mode="top">顶栏</button></span></header>\n'
          % (BRAND, esc(p["cn"]), tabs,
             len(module_pages(p["pid"], pd, d, pd.get("caps") or [], DOCTOR[p["pid"]])),
             navm_links(p, pd, d))
        + view_work(p, prd, app) + "\n" + view_archive(p, prd, app) + "\n"
        + view_ai(p, prd, app) + "\n" + view_detail(p, prd, app) + "\n"
        + "".join(module_page(p, m, d) for m in module_pages(p["pid"], pd, d, pd.get("caps") or [], DOCTOR[p["pid"]])) + "\n"
        + '</div>\n</div>\n'
        + '<div class="gm-mask" role="dialog" aria-modal="true" aria-label="复核">'
          '<div class="gm-modal"><h3 class="gm-modal__title"></h3>'
          '<div class="gm-modal__body"></div><div class="gm-modal__foot"></div></div></div>\n'
        + charts
        + '<script>\n' + APP_JS.strip() + '\n</script>\n</body>\n</html>\n')


def chart_literal(ch: dict) -> str:
    def arr(k):
        return "[" + ",".join(str(v) for v in ch[k]) + "]"
    adv = ""
    if ch.get("advisories"):
        adv = (',"advisories":[' + ",".join('{"x":%s,"tone":"%s","text":"%s"}'
                                            % (x, t, txt.replace('"', '\\"')) for x, t, txt in ch["advisories"]) + "]")
    return ('{"title":"%s","tone":"%s","source":"%s","bandLabel":"%s","xName":"%s","xUnit":"%s",'
            '"yName":"%s","yUnit":"%s","x":%s,"xTicks":%s,"yTicks":%s,"p3":%s,"p50":%s,"p97":%s,'
            '"actual":%s,"focus":%s%s}'
            % (ch["title"], ch.get("tone", "rose"), ch["source"], ch["bandLabel"], ch["xName"], ch["xUnit"],
               ch["yName"], ch["yUnit"], arr("x"), arr("xTicks"), arr("yTicks"),
               arr("p3"), arr("p50"), arr("p97"), arr("actual"), ch["focus"], adv))


def index_page(prd: dict, css: str) -> str:
    cards = "".join(
        '<div class="gm-pm-card gm-pm-prod gm-pm--%s">'
        '<div class="gm-pm-prod__hd"><span class="gm-prod-ico">%s</span>'
        '<span><b>%s</b><small>%s</small></span></div>'
        '<p title="%s">%s</p>'
        '<div class="gm-pm-prod__cta"><a class="gm-pm-btn gm-pm-btn--line" href="%s">打开产品页</a></div></div>'
        % (p["pid"], "<svg viewBox=\"0 0 24 24\">" + PRODUCT_ICON[p["pid"]] + "</svg>",
           esc(p["cn"]), esc(p["en_display"]),
           esc(p["position"]), esc(p["position"]), APP[p["pid"]]["slug"] + ".html")
        for p in PRODUCTS)
    return (
        '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>妈咪好 GoodMom · 6 大产品页</title>\n'
        '<link rel="icon" type="image/png" href="../brand/logo-192.png">\n'
        '<meta name="theme-color" content="#F77FA3">\n'
        '<meta name="description" content="妈咪好 GoodMom 六大产品独立页索引：工作台 / 档案 / AI 协同 / 详情">\n'
        '<style>\n%s\n%s\n</style>\n</head>\n<body class="mode-top">\n'
        '<div class="gm-app"><div class="gm-app__wrap">\n'
        '<header class="gm-top"><span class="gm-brand gm-brand--sm">'
        '<img src="../brand/logo-512.png" alt="">'
        '<span class="gm-brand__t"><b>%s</b><strong>6 大产品</strong></span></span>'
        '<div class="gm-tabs"><a class="gm-tab" href="goodmom-redesign.html">妇幼智能辅助诊疗 Demo</a>'
        '<a class="gm-tab" href="../site/index.html#gm-mod-products">产品矩阵模块</a></div></header>\n'
        '<div class="gm-pm-panel gm-pm-hero" style="margin-bottom:var(--lg-space-6)">'
        '<div><span class="gm-brand gm-brand--lg" style="margin-bottom:var(--lg-space-3)">'
        '<img src="../brand/logo-512.png" alt="">'
        '<span class="gm-brand__t"><b>%s</b><strong>妇幼全生命周期健康管理</strong></span></span>'
        '<h3>6 大产品，每页 4 个视图</h3>'
        '<p>工作台 / 档案 / AI 协同 / 详情 —— 与 <b>goodmom-redesign.html</b> 同一套应用外壳形态：'
        '可收起侧栏、顶栏页签、AI 建议待复核与助手对话；数据取自 <b>prd/zong.md</b>。'
        '页面均为单文件、无 CDN 依赖，双击即可打开。</p></div>'
        '<div class="gm-pm-card"><h3>怎么看</h3>'
        '<ul class="gm-pm-list"><li>左侧<b>侧栏</b>切视图</li><li>窄屏自动切<b>顶栏</b></li>'
        '<li>KPI / 队列<b>可点筛选</b></li><li>AI 建议<b>可采纳/驳回</b></li></ul>'
        '<p class="gm-pm-cap" style="margin-top:var(--lg-space-3)">'
        '全部数值为示意数据，不作为医疗依据（13 · 13.5）。</p></div></div>\n'
        '<div class="gm-pm-prods">%s</div>\n'
        '</div></div>\n</body>\n</html>\n'
        % (css, APP_CSS.strip(), BRAND, BRAND, cards))


def build() -> dict[str, str]:
    prd = parse_prd(read_prd())
    # 设计系统基线（模块样式）+ 外壳的数据呈现层配方（表格）+ 本页外壳增量
    css = base_css() + "\n" + shell_table_css() + "\n" + shell_sr_only_css()
    out = {}
    for p in PRODUCTS:
        out[APP[p["pid"]]["slug"] + ".html"] = page(p, prd, css)
    out["index.html"] = index_page(prd, css)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="生成 fuyouaicansai/ 下 6 个独立产品页")
    ap.add_argument("--check", action="store_true", help="只校验产物是否与生成结果一致（CI 用）")
    args = ap.parse_args()

    files = build()
    bad = []
    for name, html in sorted(files.items()):
        path = os.path.join(OUTDIR, name)
        cur = io.open(path, encoding="utf-8").read() if os.path.exists(path) else ""
        if cur != html:
            bad.append(name)
    if args.check:
        if bad:
            print("FAIL 以下产品页与生成结果不一致，请执行 python3 scripts/gen-product-apps.py：%s"
                  % "、".join(bad))
            return 1
        print("OK fuyouaicansai/ 下 %d 个页面均已是最新（%s）"
              % (len(files), "、".join(sorted(files))))
        return 0

    for name, html in sorted(files.items()):
        io.open(os.path.join(OUTDIR, name), "w", encoding="utf-8").write(html)
        print("  写出 %-28s %6.1f KB" % (name, len(html.encode("utf-8")) / 1024.0))
    print("fuyouaicansai/ 已生成 %d 个页面（6 个产品页 + 1 个索引页）" % len(files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
