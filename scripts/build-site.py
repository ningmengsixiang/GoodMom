#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把原本分散的多套 HTML 页面**合并成唯一首页** site/index.html。

背景：V2.6 之前站点有 9 个入口页（site/index、site/docs、site/manual、site/spec、
preview/index、preview/examples、preview/mobile、preview/patterns、preview/manual），
每页各有一套 hero / 导航 / 样式，打开哪个都像"另一个首页"。本脚本把它们合并为
`site/index.html` 单文件 + 单一主导航。

## 为什么需要脚本而不是手工粘贴

合并 6 套独立样式表 + 10 段独立脚本，存在三类真实冲突（已实测确认，见下），
手工合并必然踩雷且无法回归，所以做成幂等的构建脚本：

1. **CSS 类名冲突**：`.btn` `.chip` `.glass` `.block` `.tab` `.bx` `.kpi` `.cur` … 在
   preview/index ∩ examples ∩ mobile ∩ patterns 之间大量重名（实测 39 / 31 / 20 处交集）。
2. **CSS 自定义属性冲突**：`--t` `--t2` `--t3` `--rose` `--mint` `--danger` `--font`
   `--ease` … 多个页面在 `:root` 各自定义且**取值不同**。若原样合并，后定义的会覆盖
   先定义的，把前面模块的颜色整体改错——这类故障不报错、只是"颜色不对"。
   → 本脚本把每个模块的 `:root/html/body/*` 规则改写到模块作用域 `.gm-mod--x`，
   使同名变量在各自模块内独立生效。
3. **JS 选择器越界**：脚本里大量 `document.getElementById` 与**全局** `document.querySelector`
   （`.tab` `.chip` `.bx` `.sel` `.tg` `.view` …）。合并后这些选择器会命中别的模块的同名
   元素。→ 按模块重写 id 与选择器，使其限定在模块根内。

（keyframes 实测无重名，保持全局。）

## 用法

    python3 scripts/build-site.py --extract   # 从旧页面抽取 fragments/*.html（迁移用，一次性）
    python3 scripts/build-site.py             # 生成 site/index.html（幂等，可反复执行）
    python3 scripts/build-site.py --check     # 仅校验产物是否与构建结果一致（CI 用）

## ⚠️ 已发生的自毁事故（务必保留这两道防护）

`site/index.html` 既是**产物**又曾是**抽取源**。首次运行时 `--extract` 在 build() 覆盖
`site/index.html` **之后**才去读它，于是抽到的是刚生成的产物而不是原版落地页，
`site-index` 片段从 32014B 缩到 8.7KB（内容静默丢失，仅靠"文本保留率"统计才发现）。

由此加了两道防护，不要移除：
  1. 抽取源与产物路径相同时，**从 git HEAD 取源**（产物尚未入库时 HEAD 即原始版本）；
  2. 抽取后**自动比对 body 可见文本保留率**，低于阈值直接报错中止，不写出片段。
"""
from __future__ import annotations

import argparse
import io
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
FRAG = os.path.join(SITE, "fragments")
OUT = os.path.join(SITE, "index.html")

# ── 模块定义：键=片段名，值=(中文标题, 分组, 说明) ────────────────────────────
# 分组决定主导航里的一级项；顺序即导航顺序。
MODULES = [
    ("site-index",      "首页与总览", "start",  "品牌 · 能力 · 开源治理 · 站点地图"),
    ("preview-index",   "视觉规范",   "visual", "设计 DNA · 色彩 · 字体 · 玻璃 · 间距 · 阴影"),
    ("preview-examples","组件与状态", "comp",   "组件全量 · 状态谱 · 健康度 · 图表"),
    ("preview-mobile",  "移动端",     "mobile", "移动端组件与交互形态"),
    ("preview-patterns","交互范式",   "pattern","链接 · 级联 · 响应式容器 · 虚拟列表 · 暗色"),
    ("site-spec",       "规范全文",   "spec",   "19 份规范正文在线阅读"),
    ("site-manual",     "标准手册",   "manual", "38 部分标准手册"),
    ("site-docs",       "文档索引",   "docs",   "按角色与任务的文档导航"),
]

# 模块 CSS 作用域类名（`:root`/`body`/`*` 规则改写到它）
def scope_cls(mod: str) -> str:
    return "gm-mod--" + mod


# ══════════════════════════════════════════════════════════════════════════
# CSS 作用域改写
# ══════════════════════════════════════════════════════════════════════════

def split_top(s: str, sep: str = ",") -> list[str]:
    """按顶层分隔符切分（跳过 () / [] / 字符串内的分隔符）"""
    parts, depth, buf, q = [], 0, [], None
    for ch in s:
        if q:
            buf.append(ch)
            if ch == q:
                q = None
            continue
        if ch in "\"'":
            q = ch
            buf.append(ch)
            continue
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append("".join(buf))
            buf = []
            continue
        buf.append(ch)
    parts.append("".join(buf))
    return parts


def scope_selector(sel: str, scope: str) -> str | None:
    """把单条选择器改写到模块作用域内；返回 None 表示"丢弃该规则"。

    - `:root` / `html` / `body`  → 模块根（自定义属性与页面级样式在模块内独立生效）
    - `*`                        → 丢弃（全局 reset 会影响外壳自身的布局与颜色）
    - 其它                        → 加 `.mod ` 前缀（后代选择器），模块内外彻底隔离
    """
    s = sel.strip()
    if not s:
        return None
    # 允许模块内显式引用外壳变量
    if s in ("*", "*::before", "*::after", "*,*::before,*::after"):
        return None
    for root_sel in (":root", "html", "body"):
        if s == root_sel:
            return scope
        for prefix in (root_sel + " ", root_sel + ">", root_sel + "."):
            if s.startswith(prefix):
                rest = s[len(root_sel):]
                if rest.startswith(">"):
                    return scope + rest
                return (scope + " " + rest.lstrip()).strip()
    # `body.is-x` / `html[lang]` 等复合形式 → 作用域后代
    if re.match(r"^(?:html|body)[.:\[]", s):
        return scope + " " + s
    # 页面级主题状态（`[data-theme="dark"] …`）：必须写成**复合**而不是后代。
    #
    # 这类选择器在原独立页里作用于 `<html>` / `<body>`（全页祖先）；合并后
    # `rewrite_page_dark_css` 与 `rewrite_page_dark_js` 已把该属性改挂在**模块根自身**上。
    # 若仍按后代处理成 `.gm-mod--x [data-theme="dark"] .glass`，就要求属性挂在模块
    # **内部**的某个后代上 —— 永远不命中。
    # 实测症状：暗色开关点了之后按钮文案会变、`data-theme` 也确实挂上了，
    # 但页面纹丝不动（`--t3`、`.glass` 底纹、模块底全是浅色档）。
    # 正确形式为 `.gm-mod--x[data-theme="dark"] .glass`：既命中原生节点，特异性也更高，
    # 稳定压过同源的浅色档规则（不必依赖声明顺序）。
    m_theme = re.match(r"""^(?::where\()?\[\s*data-theme\s*=\s*["'][^"']+["']\s*\]\)?""", s)
    if m_theme:
        head = m_theme.group(0)
        rest = s[m_theme.end():].strip()
        return scope + head + ((" " + rest) if rest else "")
    # 已带模块作用域的（幂等保护）
    if s.startswith(scope):
        return s
    return scope + " " + s


def consume_comment(css: str, i: int) -> tuple[str, int] | None:
    """若 css[i:] 以 /* 注释开头，返回 (注释文本含分隔符, 结束位置)"""
    if not css.startswith("/*", i):
        return None
    end = css.find("*/", i + 2)
    end = len(css) if end < 0 else end + 2
    return css[i:end], end


def scope_css(css: str, mod: str) -> str:
    """对整段 CSS 做作用域改写（递归处理 @media / @supports，跳过 @keyframes 名称）

    ⚠️ 必须显式处理注释：早先版本把 `/* 注释 */` 当成选择器前缀处理，生成
    `.mod /* 注释 */ :root{...}` —— 解析后注释吞掉了 `:root` 选择器，于是该规则的
    自定义属性根本没落到模块根上（表现为"模块内变量全空、圆角全 0"）。
    注释一律原样保留在规则之外。
    """
    scope = "." + scope_cls(mod)
    out: list[str] = []
    i, n = 0, len(css)

    while i < n:
        # 0) 注释：原样输出，不参与选择器改写
        c = consume_comment(css, i)
        if c:
            out.append(c[0])
            i = c[1]
            continue
        if css[i].isspace():
            out.append(css[i])
            i += 1
            continue

        m = re.compile(r"@(media|supports|layer|container)\b", re.I).match(css, i)
        if m:
            brace = css.find("{", m.end())
            if brace < 0:
                out.append(css[i:])
                break
            head = css[i : brace + 1]
            depth, j = 1, brace + 1
            while j < n and depth:
                if css[j] == "{":
                    depth += 1
                elif css[j] == "}":
                    depth -= 1
                j += 1
            inner = css[brace + 1 : j - 1]
            out.append(head + scope_css(inner, mod) + "}")
            i = j
            continue

        m = re.compile(r"@(?:-webkit-)?keyframes\b", re.I).match(css, i)
        if m:
            brace = css.find("{", m.end())
            if brace < 0:
                out.append(css[i:])
                break
            depth, j = 1, brace + 1
            while j < n and depth:
                if css[j] == "{":
                    depth += 1
                elif css[j] == "}":
                    depth -= 1
                j += 1
            # 关键帧名保持全局（实测各页无重名；改名会破坏引用它的 animation）
            out.append(css[i:j])
            i = j
            continue

        m = re.compile(r"@[\w-]+").match(css, i)
        if m:  # @import / @charset / @font-face 等
            end = css.find(";", m.end())
            b2 = css.find("{", m.end())
            if b2 >= 0 and (end < 0 or b2 < end):
                depth, j = 1, b2 + 1
                while j < n and depth:
                    if css[j] == "{":
                        depth += 1
                    elif css[j] == "}":
                        depth -= 1
                    j += 1
                out.append(css[i:j])
                i = j
            else:
                out.append(css[i : (end + 1) if end >= 0 else n])
                i = (end + 1) if end >= 0 else n
            continue

        # 普通规则：选择器文本中可能夹着注释，逐段收集（注释单独原样输出）
        brace = css.find("{", i)
        if brace < 0:
            out.append(css[i:])
            break
        depth, j = 1, brace + 1
        while j < n and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1

        raw = css[i:brace]
        body = css[brace + 1 : j - 1]
        pieces, k = [], 0
        while k < len(raw):
            cc = consume_comment(raw, k)
            if cc:
                pieces.append(("comment", cc[0]))
                k = cc[1]
            else:
                nxt = raw.find("/*", k)
                nxt = len(raw) if nxt < 0 else nxt
                pieces.append(("sel", raw[k:nxt]))
                k = nxt
        sel_parts, sels = [], []
        for kind, text in pieces:
            if kind == "comment":
                sel_parts.append(text)
            else:
                for one in split_top(text):
                    sc = scope_selector(one, scope)
                    if sc:
                        sels.append(sc)
        if sels:
            joined = "".join(sel_parts)
            # 注释放在选择器之前，保证选择器紧邻 "{"
            out.append((joined + ",".join(sels)) if joined.strip() else ",".join(sels))
            out.append("{" + body + "}")
        elif sel_parts:
            out.append("".join(sel_parts))
        i = j

    return "".join(out)


# ══════════════════════════════════════════════════════════════════════════
# JS 作用域改写
# ══════════════════════════════════════════════════════════════════════════

def prefix_js_ids(js: str, mod: str) -> str:
    """把脚本里"写在字符串中的 HTML id"也加上模块前缀。

    有的页面用 JS 拼 HTML 再插入（`mask.innerHTML='… id="dlgNo" …'`），
    这些 id 不由 prefix_ids 处理（它只管标记属性）；若只给 getElementById 加前缀，
    两边就对不上 → 查不到按钮 → addEventListener 抛 null（弹窗按钮点不动）。
    这里把脚本内 `id="x"` / `id='x'` 与 setAttribute("id","x") 一并加前缀。
    同理，指向 id 的 IDREF 属性（aria-labelledby / for / …）也必须一起改，
    否则 JS 拼出来的浮层会留下"引用合法但指向不存在"的空引用。
    """
    pid = f"{mod}--"
    idref = ("aria-labelledby", "aria-describedby", "aria-controls", "aria-owns",
             "aria-activedescendant", "aria-flowto", "for", "list", "form", "headers")
    if not re.search(r"\bid\s*[=:]", js) and not re.search(
            r"\b(?:%s)\s*[=:]" % "|".join(idref), js):
        return js

    def attr(m: re.Match) -> str:
        q, v = m.group(2), m.group(3)
        if v.startswith(pid):
            return m.group(0)
        return f"{m.group(1)}{q}{pid}{v}{q}"

    # id="x" / id='x'（出现在字符串里的 HTML 片段）
    js = re.sub(r"(\bid=)(['\"])([\w-]+)\2", attr, js)

    def setattr(m: re.Match) -> str:
        if m.group(3).startswith(pid):
            return m.group(0)
        return f'{m.group(1)}{m.group(2)}{pid}{m.group(3)}{m.group(2)}'

    # setAttribute("id","x") / setAttribute('id','x')
    js = re.sub(r'(setAttribute\(\s*["\']id["\']\s*,\s*)(["\'])([\w-]+)\2', setattr, js)

    # IDREF：字符串里的 aria-labelledby="x" 与 setAttribute('aria-labelledby','x')
    for a in idref:
        js = re.sub(r"(\b%s=)(['\"])([\w-]+)\2" % a, attr, js)
        js = re.sub(
            r'(setAttribute\(\s*["\']%s["\']\s*,\s*)(["\'])([\w-]+)\2' % a, setattr, js)
    return js


def scope_js(js: str, mod: str) -> str:
    """把模块脚本的 DOM 访问限定在模块根内（幂等）。

    - getElementById('x')      → getElementById('<mod>--x')
    - querySelector('.a,.b')   → querySelector('#<mod> .a,#<mod> .b')

    ⚠️ 正则必须把**结尾的引号与右括号一起匹配并回写**。
    早先版本只匹配到"开引号 + 选择器内容"，替换串写成了
    `fn("scoped`（缺右括号与闭引号），于是 `querySelector('.topnav .ng')`
    变成 `querySelector("#gm-mod-… .topnav .ng')` —— 语法错误，
    整个模块脚本静默失效（表现为该模块所有交互全死、级联无选项、虚拟列表空）。
    选择器用 [^'"()]+ 限定字符集：一旦匹配不到完整调用就整体不匹配，
    宁可少改写也不错改写。
    """
    pid = f"{mod}--"
    root = f"#gm-mod-{mod}"

    # `getElementById\('([^']+)'\)` 把**右括号一起匹配**，回写时补上恰好一个，
    # 否则会生成 `getElementById('x'))` 双括号 → 语法错误 → 整个模块脚本静默失效。
    def rid(m: re.Match) -> str:
        q, name = m.group(1), m.group(2)
        if name.startswith(pid) or name.startswith("gm-"):
            return m.group(0)
        return f"getElementById({q}{pid}{name}{q})"

    js = re.sub(r"getElementById\(\s*(['\"])([\w-]+)\1\s*\)", rid, js)

    def rqs(m: re.Match) -> str:
        fn, q, sel = m.group(1), m.group(2), m.group(3)
        # ⚠️ 必须区分布局选择器与"用来拼 HTML 的字符串"。
        # 踩过的坑：`html += '<button class="cas-o">'` 这类字符串被当成选择器加了
        # `#gm-mod-x ` 前缀，于是拼出来的 HTML 变成
        # `<button class="#gm-mod-x .cas-o">`；同时 `root.querySelector(".cas-p")`
        # 被改成 `root.querySelector("#gm-mod-x .cas-p")`，在 root 内部再找模块根 →
        # 永远为 null → buildCascader 的 panel 为 null → 级联/虚拟列表/暗色全失效。
        # 判据：含 `<`、`>` 或 `="` 的是 HTML 片段；纯类名/属性选择器才是选择器。
        if "<" in sel or ">" in sel or '="' in sel:
            return m.group(0)
        if sel.strip().startswith(root) or "[data-" in sel:
            return m.group(0)
        parts = [p.strip() for p in split_top(sel) if p.strip()]
        if not parts:
            return m.group(0)
        scoped = ",".join(f"{root} {p}" for p in parts)
        return f"{fn}({q}{scoped}{q})"

    js = re.sub(r"(querySelector(?:All)?)\(\s*(['\"])([^'\"()]+)\2\s*\)", rqs, js)
    return js


def prefix_ids(html: str, mod: str) -> str:
    """给模块内所有 id 加 `<mod>--` 前缀，避免跨模块 id 冲突

    ⚠️ 必须**同时**改写引用这些 id 的属性（IDREF），否则合并后引用静默断链：
    `id="preview-index--pcBubTitle"` 配 `aria-labelledby="pcBubTitle"` ——
    两边都合法、都通得过任何静态检查，但读屏软件拿到的是空引用。
    （实测：V2.9 新加的 Popconfirm 气泡首个 IDREF 就踩到了这个坑。）
    IDREF 属性清单取 HTML/ARIA 规范里会指向元素 id 的那些。
    """
    pid = f"{mod}--"

    def rid(m: re.Match) -> str:
        v = m.group(2)
        return m.group(1) + (v if v.startswith(pid) else pid + v) + m.group(3)

    html = re.sub(r'(\bid\s*=\s*["\'])([^"\']+)(["\'])', rid, html)

    # IDREF 属性可能含多个空格分隔的 id（如 aria-labelledby="a b"），逐个加前缀
    idref = ("aria-labelledby", "aria-describedby", "aria-controls", "aria-owns",
             "aria-activedescendant", "aria-flowto", "for", "list", "form", "headers")

    def ridref(m: re.Match) -> str:
        vals = m.group(2).split()
        vals = [v if (v.startswith(pid) or v.startswith("#")) else pid + v for v in vals]
        return m.group(1) + " ".join(vals) + m.group(3)

    for a in idref:
        html = re.sub(r'(\b%s\s*=\s*["\'])([^"\']+)(["\'])' % a, ridref, html)
    return html


MODULE_IDS = {m[0] for m in MODULES}


def rewrite_hash_links(html: str, mod: str) -> str:
    """模块内 `href="#x"` 指向本模块锚点 → 加前缀（跨页锚点如 spec.html#ch-02 另行处理）

    ⚠️ 幂等护栏：已经是**最终形态**的跨模块锚点必须原样放过，否则会被二次加前缀
    成 `#<self>--gm-mod-<other>` 这类永不存在的目标（历史上片段被这种污染写坏过）。
    最终形态两种：
      · `#gm-mod-<mod>`      模块根
      · `#<mod>--<id>`       另一模块内的元素（`<mod>` 必须是已知模块名）
    """
    pid = f"{mod}--"

    def rh(m: re.Match) -> str:
        v = m.group(1)
        if not v or v.startswith(pid):
            return m.group(0)
        if v.startswith("gm-mod-"):
            return m.group(0)
        for other in MODULE_IDS:
            if other != mod and v.startswith(other + "--"):
                return m.group(0)
        return f'href="#{pid}{v}"'

    return re.sub(r'href="#([^"]*)"', rh, html)


# ══════════════════════════════════════════════════════════════════════════
# 旧页面抽取 → fragments/
# ══════════════════════════════════════════════════════════════════════════

# 片段名 → 源文件
SOURCES = {
    "site-index": "site/index.html",
    "preview-index": "preview/index.html",
    "preview-examples": "preview/examples.html",
    "preview-mobile": "preview/mobile.html",
    "preview-patterns": "preview/patterns.html",
    "site-spec": "site/spec.html",
    "site-manual": "site/manual.html",
    "site-docs": "site/docs.html",
}


def extract_body(src: str) -> str:
    """取 <body> 内容"""
    m = re.search(r"<body[^>]*>(.*)</body>", src, re.S | re.I)
    return m.group(1) if m else src


def extract_head_styles(src: str) -> str:
    return "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", src, re.S))


def strip_injected_helpers(js: str, mod: str) -> str:
    """移除本构建注入过的辅助块，保证 `--extract` 幂等（可反复 抽取→构建）。

    踩过的坑：把**已合并产物**当源再抽一次时，产物里带有构建期注入的
    `MODROOT_<mod>()` 辅助函数与已改写过的调用点；若不剥离，下次 `--extract`
    会把它们当作"原页面内容"写回片段，再次构建时又替换一遍 →
    生成 `function document.documentElement{...}` 这类非法 JS。
    而 `node --check` 对每个脚本单独检查又是通过的，错误只在浏览器里以
    "Unexpected token '.'" 暴露，极难定位。这里做精确逆变换。

    注入块形如（注释 + 单行函数定义，共 2 行）：
        /* 合并入单一首页的作用域适配：… */
        function MODROOT_x(){return document.getElementById("gm-mod-x")||document.body;}
    调用点两处来源，语义不同，需分别还原：
      · 挂载点（appendChild/removeChild）→ document.body
      · 其余（测量/状态类）→ document.documentElement
    """
    fn = "MODROOT_" + mod.replace("-", "_")
    # 1) 删除注释行 + 紧随其后的函数定义行（精确到行，不做贪婪跨行匹配）
    js = re.sub(r"[ \t]*/\* 合并入单一首页的作用域适配[^\n]*\*/\n"
                r"[ \t]*function " + re.escape(fn) + r"\(\)\{[^\n]*\}\n?", "", js)
    # 2) 调用点还原
    js = js.replace(fn + "().appendChild", "document.body.appendChild")
    js = js.replace(fn + "().removeChild", "document.body.removeChild")
    js = js.replace(fn + "().insertBefore", "document.body.insertBefore")
    js = re.sub(r"(?<!function )(?<![\w$])" + re.escape(fn) + r"\(\)", "document.documentElement", js)
    return js


def extract_scripts(src: str, mod: str = "") -> str:
    """取页内 <script>（不含 src 外链）内容，合并为一段；剥离构建期注入物"""
    blocks = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", src, re.S):
        body = m.group(1).strip()
        if body:
            blocks.append(body)
    js = "\n\n".join(blocks)
    if mod:
        js = strip_injected_helpers(js, mod)
    return js


def strip_own_nav(html: str, mod: str) -> str:
    """去掉模块自带的顶部导航/返回链接（外壳已提供统一导航）。

    ⚠️ 只剥离**页面级顶栏**，绝不能碰模块内的内容树。
    踩过的坑：`<nav>...</nav>` 的贪婪正则把 docs 模块的文档树侧栏
    （`<nav class="tree">`，本身就是内容导航）整块删掉，可见文本从 1276 → 1109 字。
    因此这里只按"明确的顶栏容器"精确剥离，并用文本保留率自检兜底（见 cmd_extract）。
    """
    # 1) 仅剥离"纯品牌顶栏"（顶栏内没有内容导航时）
    #    保留含章节下拉的顶栏（如规范全文的 .gp 分组菜单）——那是模块内的有效导航，
    #    删掉会让 20 章的长文档失去章节跳转能力。
    for pat in (
        r'<div class="topnav"[^>]*>.*?</div>\s*(?=<div class="layout"|<div class="wrap"|<aside|<main|$)',
        r'<header class="top"[^>]*>.*?</header>',
    ):
        new = re.sub(pat, "", html, count=1, flags=re.S)
        if new != html:
            html = new
            break

    # 1b) 顶栏里的品牌块与旧页面返回链接（保留 .gp / .drop 章节菜单）
    html = re.sub(r'(<div class="top">)\s*<img[^>]*>\s*<b>[^<]*</b>', r"\1", html, count=1, flags=re.S)
    html = re.sub(r'<span class="r">.*?</span>', "", html, count=1, flags=re.S)

    # 2) 站点级 sticky 顶栏：形如 <nav ...> 内含 <b> + 多个 top-level <a>，且不在内容区内
    def is_page_nav(m: re.Match) -> bool:
        inner = m.group(0)
        # 文档树侧栏是内容导航：含 <details> 或 class="tree"/"toc" 一律保留
        if re.search(r"<details|class=\"[^\"]*\b(tree|toc|side|menu-list)\b", inner):
            return False
        # 顶栏特征：含站点品牌 <b> 或 class 命中 top/nav-bar
        return bool(re.search(r"<b[ >]|class=\"[^\"]*\b(top|topbar|navbar|site-nav)\b", inner))

    html = re.sub(r"<nav\b[^>]*>.*?</nav>", lambda m: "" if is_page_nav(m) else m.group(0),
                  html, flags=re.S)

    # 3) 指向"已被合并掉"的旧页面的返回链接（已由统一导航取代）
    html = re.sub(
        r'<a[^>]*href="(?:\.\./)?(?:site/)?(?:index|docs|spec|manual|examples|mobile|patterns)(?:\.html)?(?:#[^"]*)?"[^>]*>'
        r'(?:返回[^<]*|主站|示例中心|文档中心|全量规范|设计系统首页|README)</a>',
        "", html)
    return html


def visible_text(html: str) -> str:
    """取可见文本（去 script/style/注释/标签），用于内容保留率校验"""
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", "", s)


def source_from_git(rel: str) -> str | None:
    """产物路径与抽取源重合时，从 git HEAD 取原始版本（防护 1，见文件头事故说明）"""
    try:
        out = subprocess.run(["git", "show", "HEAD:" + rel], cwd=ROOT,
                             capture_output=True, check=True)
        return out.stdout.decode("utf-8")
    except Exception:
        return None


def cmd_extract() -> int:
    os.makedirs(FRAG, exist_ok=True)
    staged: dict[str, str] = {}

    for mod, rel in SOURCES.items():
        path = os.path.join(ROOT, rel)
        src = None
        note = ""

        # 防护 1：site/index.html 是产物，已被 build() 覆盖过 → 从 HEAD 取原版
        if os.path.abspath(path) == os.path.abspath(OUT):
            src = source_from_git(rel)
            note = "（自 git HEAD 取原版）"
            if src is None:
                print(f"  ERROR {rel} 是构建产物且 git HEAD 无原版，无法抽取。"
                      f"请先 git stash/restore 恢复原始页面。")
                return 1
        elif os.path.exists(path):
            src = io.open(path, encoding="utf-8").read()
        else:
            print(f"  跳过（源不存在）：{rel}")
            continue

        css = extract_head_styles(src)
        body = strip_own_nav(extract_body(src), mod)
        js = extract_scripts(src, mod)

        # 防护 2：内容保留率自检（防导航剥离正则误伤正文）
        before = visible_text(extract_body(src))
        after = visible_text(body)
        keep = 100 * len(after) / max(1, len(before))
        if keep < 90:
            print(f"  ERROR {rel} → 可见文本仅保留 {keep:.1f}%（阈值 90%）。"
                  f"导航剥离正则可能误伤正文，已中止，未写出片段。")
            print(f"        剥离前 {len(before)} 字 → 剥离后 {len(after)} 字")
            return 1

        parts = []
        if css.strip():
            parts.append("<!--@css-->\n" + css.strip())
        parts.append("<!--@body-->\n" + body.strip())
        if js.strip():
            parts.append("<!--@js-->\n" + js.strip())
        staged[mod] = "\n\n".join(parts) + "\n"
        print(f"  抽取 {rel} → site/fragments/{mod}.html  "
              f"(css {len(css)}B, body {len(body)}B, js {len(js)}B, 文本保留 {keep:.1f}%) {note}")

    # 全部通过校验后才落盘，避免半成品污染 fragments
    for mod, text in staged.items():
        io.open(os.path.join(FRAG, mod + ".html"), "w", encoding="utf-8").write(text)
    print(f"  已写出 {len(staged)} 个片段")
    return 0


# ══════════════════════════════════════════════════════════════════════════
# 组装
# ══════════════════════════════════════════════════════════════════════════

def parse_fragment(text: str) -> dict[str, str]:
    """把片段切成 css / body / js 三段（按 <!--@css--> 等标记）

    另有 `<!--@passthrough-->` 形态：内容**已完成作用域改写**，构建时原样内联，
    不再做任何变换。用于"从既有产物回填片段"的场景（迁移时页面原件已缺失），
    避免二次改写（重复加前缀 / 双括号 / 双包裹）造成静默损坏。
    """
    if text.lstrip().startswith("<!--@passthrough-->"):
        marker = "<!--@passthrough-->"
        body = text.lstrip()[len(marker):].lstrip("\n")
        return {"css": "", "body": body, "js": "", "passthrough": True}
    parts = {"css": "", "body": "", "js": ""}
    cur = None
    for line in text.split("\n"):
        if line.strip() == "<!--@css-->":
            cur = "css"; continue
        if line.strip() == "<!--@body-->":
            cur = "body"; continue
        if line.strip() == "<!--@js-->":
            cur = "js"; continue
        if cur:
            parts[cur] += line + "\n"
    return parts


SHELL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>妈咪好 GoodMom · 开源设计系统（单一入口）</title>
<link rel="icon" type="image/png" href="../brand/logo-192.png">
<meta name="theme-color" content="#F77FA3">
<meta name="description" content="妈咪好 GoodMom · 妇幼儿童全生命周期开源设计系统：规范 19 份 · 组件 98 项 · 图标 77 枚 · 组件库 2 个（@goodmom/ui · @goodmom/vue）· 本站为唯一入口">
<style>
/* ══ 外壳样式（唯一一份，模块样式全部作用域隔离在各自 .gm-mod--x 内）══ */
/* D9 主行动档：品牌粉上半段 + 深字 #343A46（白字在亮粉上仅 2.9:1，不合格） */
:root{
  --sh-rose:#F77FA3;--sh-rose-d:#E85D8F;--sh-rose-deep:#B23A63;
  --sh-t:#343A46;--sh-t2:#4F5B6E;--sh-t3:#9AA2B0;
  --sh-bg:#F4F0EC;
  --sh-grad-action:linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%);
  --sh-font:"Inter","SF Pro Display",-apple-system,"PingFang SC","MiSans","Noto Sans SC",sans-serif;
  --sh-ring:2px;--sh-ease:cubic-bezier(.22,1,.36,1);
  /* Part 18 · MD-18-04「Toast 顶部偏上」。
     合并为单一首页后，外壳多了一条 sticky 吸顶导航（桌面 60px / 移动 144px，z-index 200）。
     模块内的 Toast 若沿用独立页的 top:20px，会被这条导航整条盖住——
     实测：节点存在于 20px 处、样式全部生效，但**视觉完全不可见**（无任何静态检查能发现）。
     故由外壳统一给出避让值，模块侧只读 --gm-toast-top（缺省 20px，供未套外壳的独立页）。 */
  --gm-toast-top:76px;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sh-font);color:var(--sh-t);line-height:1.7;-webkit-font-smoothing:antialiased;
  background:
   radial-gradient(1100px 640px at 88% -8%,rgba(247,127,163,.22),transparent 65%),
   radial-gradient(980px 600px at -6% 26%,rgba(182,154,255,.16),transparent 65%),
   radial-gradient(900px 620px at 52% 116%,rgba(255,214,226,.2),transparent 65%),
   linear-gradient(165deg,#FDF2EE,#F6E2DB 52%,#EAD3CA);
  min-height:100vh}
.sh-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
/* ── 唯一主导航 ── */
.sh-top{position:sticky;top:0;z-index:200;padding:10px 16px;
  background:linear-gradient(180deg,rgba(253,242,238,.92),rgba(253,242,238,.78));
  border-bottom:1px solid rgba(232,93,143,.16);
  -webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2)}
.sh-top-in{max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sh-brand{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:var(--sh-rose-deep);
  text-decoration:none;margin-right:6px;flex:none}
.sh-brand img{width:26px;height:26px;border-radius:50%;object-fit:cover;
  box-shadow:0 2px 8px rgba(178,58,99,.22)}
.sh-brand span{display:flex;flex-direction:column;line-height:1.15}
.sh-brand small{font-size:10.5px;font-weight:500;color:var(--sh-t3);letter-spacing:.02em}
.sh-tabs{display:flex;gap:2px;flex-wrap:wrap;align-items:center;min-width:0}
.sh-tab{font-family:inherit;font-size:13px;font-weight:600;color:var(--sh-t2);cursor:pointer;
  border:1px solid transparent;background:none;border-radius:999px;padding:8px 14px;white-space:nowrap;
  transition:background .18s var(--sh-ease),color .18s var(--sh-ease)}
.sh-tab:hover{background:rgba(255,255,255,.75);color:var(--sh-rose-deep)}
.sh-tab[aria-selected="true"]{background:var(--sh-grad-action);color:var(--sh-t);border-color:transparent;
  box-shadow:0 6px 16px rgba(240,127,163,.3)}
.sh-tab:focus-visible{outline:var(--sh-ring) solid rgba(232,93,143,.6);outline-offset:2px}
.sh-ext{margin-left:auto;display:flex;gap:8px;align-items:center;flex:none}
.sh-ext a{font-size:12.5px;font-weight:600;text-decoration:none;padding:8px 14px;border-radius:999px;
  color:var(--sh-rose-deep);background:#FFF;border:1px solid rgba(232,93,143,.3);white-space:nowrap}
.sh-ext a.pri{background:var(--sh-grad-action);color:var(--sh-t);border-color:transparent;
  box-shadow:0 6px 16px rgba(240,127,163,.3)}
.sh-ext a:focus-visible{outline:var(--sh-ring) solid rgba(232,93,143,.6);outline-offset:2px}
.sh-note{font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:999px;white-space:nowrap;
  color:var(--sh-rose-deep);background:rgba(255,255,255,.6);border:1px solid rgba(232,93,143,.22)}
/* ── 模块容器：同一时刻只显示一个（不做双渲染后隐藏）── */
.gm-mod{display:none}
.gm-mod.is-on{display:block}
/* 文档型模块（规范全文 / 标准手册）自带的固定侧栏改为模块内定位，避免溢出到外壳 */
.gm-mod--site-spec aside,.gm-mod--site-manual aside{position:sticky;top:70px}
/* 模块内的锚点跳转留出吸顶导航高度 */
.gm-mod [id]{scroll-margin-top:78px}
/* ══════════════════════════════════════════════════════════════════════════
   Part 18 · MD-18-01/04 —— 全局反馈层：Toast（唯一一份实现，属于外壳而非某个模块）
   为什么放外壳：Toast 是**跨模块的浮层**。若每个模块各写一份，
   ① 三处实现漂移（实测旧站：bottom:34px / bottom:26px / top:20px，320/240/250ms 各不相同，
      驻留 1500 / 1600 / 2300 / 2400ms 四种都有，全部缺 role/aria-live）；
   ② 合并成单一首页后，模块内的 `top:20px` 会被 60px（移动 144px）的吸顶导航整条盖住。
   放进外壳 → 一份配方 + 一个 window.gmToast()，挂载点由 .gm-mod.is-on 决定，
   既拿到模块作用域，又不必每个模块复制一遍。
   ⛔ 不套白描边：白边落在浅色提示底上等于「没有边」，形状会糊（V2.9 已收口的缺陷类）。
   ⚠️ 进出场都用**动画**而非 transition：`.gm-toast` 的静态态即"已显示"，
      进场靠 gmToastIn 的 both 填充、退场靠 gmToastOut 的 forwards 填充。
      改为 transition 时，取消动画那一瞬计算值先跳回静态态、过渡取不到起点 → 退场闪一下。
   ══════════════════════════════════════════════════════════════════════════ */
.gm-toast{position:fixed;left:50%;top:var(--gm-toast-top,20px);z-index:250;
  display:inline-flex;align-items:center;gap:9px;max-width:min(84vw,420px);
  padding:10px 18px;border-radius:999px;pointer-events:none;
  background:linear-gradient(160deg,rgba(255,255,255,.97),rgba(255,255,255,.9));
  border:1px solid var(--lg-divider,rgba(58,52,84,.10));
  color:var(--lg-text-primary,#343A46);
  font-family:var(--sh-font);font-size:13px;font-weight:600;line-height:1.6;
  box-shadow:0 1px 2px rgba(58,52,84,.06),0 12px 30px rgba(58,52,84,.14);
  animation:gmToastIn 320ms cubic-bezier(.22,1,.36,1) both}
.gm-toast.is-leaving{animation:gmToastOut 240ms ease-in forwards}
@keyframes gmToastIn{from{opacity:0;transform:translate(-50%,-24px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes gmToastOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-24px)}}
/* 语义双通道：色点（14 · 4.4.5 alias）+ 文案，不靠颜色单独传义 */
.gm-toast__dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--lg-sem-neutral,#5E6673)}
.gm-toast--success .gm-toast__dot{background:var(--lg-sem-positive,#25715D)}
.gm-toast--error   .gm-toast__dot{background:var(--lg-sem-risk,#B72F42)}
.gm-toast--warning .gm-toast__dot{background:var(--lg-sem-attention,#8D5A15)}
.gm-toast--info    .gm-toast__dot{background:var(--lg-sem-info,#3261C1)}
.gm-toast__t{min-width:0}
/* 暗色档（02 · 2.1.9）：模块根挂 data-theme="dark" 时提示底必须跟着翻 ——
   否则 `var(--lg-text-primary)` 取到暗色档的浅色字，压在 97% 白的底上实测 1.14:1（看不见）。 */
[data-theme="dark"] .gm-toast{
  background:linear-gradient(160deg,rgba(38,36,46,.97),rgba(38,36,46,.9));
  box-shadow:0 1px 2px rgba(0,0,0,.35),0 12px 30px rgba(0,0,0,.5)}
@media (prefers-reduced-motion: reduce){
  /* 全局 reduce-motion 规则已把动画压到 0.01ms；这里只补"退场后仍占位"的兜底 */
  .gm-toast.is-leaving{opacity:0}
}
/* ── 移动端：导航横向滚动，不换行挤压 ── */
@media (max-width:767px){
  .sh-top-in{gap:8px}
  .sh-tabs{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px;
    -webkit-overflow-scrolling:touch;scrollbar-width:none}
  .sh-tabs::-webkit-scrollbar{display:none}
  .sh-ext{margin-left:0;order:2}
  .sh-brand{order:1}
  /* 移动端吸顶导航换成两行（实测 144px），Toast 的避让值随之抬高 */
  :root{--gm-toast-top:160px}
}
@media (prefers-reduced-motion: reduce){
  .sh-tab{transition:none}
}
</style>
</head>
<body>
<a class="sh-sr" href="#gm-main">跳到主要内容</a>
<header class="sh-top">
  <div class="sh-top-in">
    <a class="sh-brand" href="#gm-main" data-mod="site-index">
      <img src="../brand/logo-512.png" alt="">
      <span>妈咪好 GoodMom<small>妇幼儿童全生命周期开源设计系统</small></span>
    </a>
    <nav class="sh-tabs" id="shTabs" role="tablist" aria-label="站点主导航">__TABS__</nav>
    <div class="sh-ext">
      <span class="sh-note" title="见仓库 goodmom-vue/README.md">Vue 组件库</span>
      <a class="pri" href="#gm-mod-site-spec" data-mod="site-spec">规范全文</a>
    </div>
  </div>
</header>
<main id="gm-main">
__MODULES__
</main>
<script>
/* 单一外壳逻辑：只在模块之间切换显示，不重复渲染。
   用 display 切换（而非 hidden 属性）——模块内已有大量 display/grid 规则，
   hidden 会被这些规则压过，导致"隐藏"失效。 */
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#shTabs .sh-tab'));
  var mods = Array.prototype.slice.call(document.querySelectorAll('.gm-mod'));
  if(!tabs.length || !mods.length) return;

  function activate(id, push){
    /* ⚠️ 必须先判定目标模块是否存在，再动 DOM。
       旧实现把 `classList.toggle('is-on', on)` 放在 `found` 判定**之前**，
       于是 `activate('spec')`（历史死锚点 #gm-mod-spec）会先把 8 个模块的
       is-on 全部摘掉、再返回 false —— 表现为"点了分享链接整页空白"。 */
    var target = 'gm-mod-' + id;
    var found = false;
    mods.forEach(function(m){ if(m.id === target) found = true; });
    if(!found) return false;
    mods.forEach(function(m){
      m.classList.toggle('is-on', m.id === target);
    });
    tabs.forEach(function(t){
      var sel = t.getAttribute('data-mod') === id;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.setAttribute('tabindex', sel ? '0' : '-1');
    });
    if(push && location.hash !== '#' + id){
      try{ history.replaceState(null, '', '#' + id); }catch(e){ location.hash = id; }
    }
    return true;
  }

  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ activate(t.getAttribute('data-mod'), true); });
    t.addEventListener('keydown', function(e){
      /* tablist 键盘惯例：左右方向键切换，Home/End 到首尾 */
      var next = -1;
      if(e.key === 'ArrowRight') next = i + 1;
      else if(e.key === 'ArrowLeft') next = i - 1;
      else if(e.key === 'Home') next = 0;
      else if(e.key === 'End') next = tabs.length - 1;
      else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(t.getAttribute('data-mod'), true); return; }
      else return;
      e.preventDefault();
      if(next < 0 || next >= tabs.length) return;
      tabs[next].focus();
      activate(tabs[next].getAttribute('data-mod'), true);
    });
  });

  /* 任何指向模块锚点的链接（含模块内交叉引用）都能切换模块。
     ⚠️ 必须 preventDefault：这是"模块内路由"，绝不能把控制权交还浏览器。
     历史上漏了这一句，畸形 href（`href="href="#x"`）被浏览器解析为字面量
     `href=` 后默认导航到 /site/href= → 404，而门禁只看"模块切没切"，全绿。
     纵深防御：即使将来再出现非法 href，也不会跳出本页。 */
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[data-mod], a[href^="#gm-mod-"]') : null;
    if(!a) return;
    var href = a.getAttribute('href') || '';
    var id = a.getAttribute('data-mod') || href.replace('#gm-mod-','');
    if(!activate(id, false)) return;
    if(href.charAt(0) === '#'){
      /* 模块内路由：绝不把控制权交还浏览器（纵深防御，见上） */
      e.preventDefault();
      /* 广播"模块已显示 + 目标锚点"，让模块自行切到对应的内部状态
         （如组件与状态模块的示例页切换）。模块脚本先于外壳脚本执行，
         故监听器此时一定已注册。 */
      try{
        document.dispatchEvent(new CustomEvent('gm:module-shown', {detail:{mod:id, anchor:href}}));
      }catch(err){}
      if(href !== '#gm-main'){
        var target = document.querySelector(href);
        /* 只有当目标已可见时才滚动：隐藏元素（display:none 的示例页）滚动无意义 */
        if(target && target.offsetParent !== null) target.scrollIntoView({block:'start'});
      }
    }
  });

  /* 初始模块：优先 URL hash，支持三种形态
       #gm-mod-<mod>      模块根
       #<mod>--<id>       模块内元素（跨模块深链）
       #<mod>             裸模块名                                        */
  function resolveHash(){
    var x = (location.hash || '').replace(/^#/, '');
    if(!x) return null;
    if(x.indexOf('gm-mod-') === 0) return {mod:x.replace('gm-mod-',''), el:null};
    for(var i=0;i<tabs.length;i++){
      var m = tabs[i].getAttribute('data-mod');
      if(!m) continue;
      if(x === m) return {mod:m, el:null};
      if(x.indexOf(m + '--') === 0) return {mod:m, el:'#' + x};
    }
    return null;
  }
  function applyHash(){
    var r = resolveHash();
    if(!r) return false;
    if(!activate(r.mod, false)) return false;
    if(r.el){
      var t = document.querySelector(r.el);
      if(t) t.scrollIntoView({block:'start'});
    }
    return true;
  }
  /* 回退：未知/失效的 hash（如 #gm-mod-spec 这类历史死锚点）必须落回首模块，
     否则 8 个模块全部未激活 → 整页空白。 */
  applyHash() || activate(tabs[0].getAttribute('data-mod'), false);

  window.addEventListener('hashchange', function(){
    /* 失效 hash 时保留当前模块（applyHash 返回 false 且不会动 DOM）；
       仍无模块可见则兜底回首模块。 */
    if(!applyHash() && !document.querySelector('.gm-mod.is-on')){
      activate(tabs[0].getAttribute('data-mod'), false);
    }
  });
})();

/* ══════════════════════════════════════════════════════════════════════════
   Part 18 · MD-18-01/04 —— 全局轻提示 window.gmToast(msg, status)
   全站**唯一**实现：模块侧只调用它，不再各自造 Toast。
   · 同类仅 1 条：每次先摘掉上一个节点（MD-18-04）
   · 驻留 2.4s 在此内置，调用点不写 setTimeout —— 否则每个调用点都会写错一次
   · role：error → alert + assertive（失败必须立刻被读到）；其余 → status + polite
   · 挂载点取当前可见模块：模块 CSS 是作用域化的（.gm-mod--x .gm-toast），
     挂到 body 上虽然看得见，但拿不到模块内定义的 Token 与样式。
   ══════════════════════════════════════════════════════════════════════════ */
window.gmToast = (function(){
  var DWELL = 2400, LEAVE = 240;   /* MD-18-01：驻留 2.4s · 淡出上滑 240ms */
  var node = null, t1 = null, t2 = null;
  return function(msg, status){
    status = status || 'info';
    if(node && node.parentNode) node.parentNode.removeChild(node);
    clearTimeout(t1); clearTimeout(t2);
    var n = document.createElement('div');
    n.className = 'gm-toast gm-toast--' + status;
    n.setAttribute('role', status === 'error' ? 'alert' : 'status');
    n.setAttribute('aria-live', status === 'error' ? 'assertive' : 'polite');
    var dot = document.createElement('i');
    dot.className = 'gm-toast__dot'; dot.setAttribute('aria-hidden', 'true');
    var txt = document.createElement('span');
    txt.className = 'gm-toast__t'; txt.textContent = msg;
    n.appendChild(dot); n.appendChild(txt);
    (document.querySelector('.gm-mod.is-on') || document.body).appendChild(n);
    node = n;
    t1 = setTimeout(function(){
      if(!n.parentNode) return;
      n.classList.add('is-leaving');
      t2 = setTimeout(function(){
        if(n.parentNode) n.parentNode.removeChild(n);
        if(node === n) node = null;
      }, LEAVE);
    }, DWELL);
  };
})();
</script>
</body>
</html>
"""


def scope_body_scripts(html: str, mod: str) -> str:
    """对 body 内联的 <script> 做作用域改写。

    有的模块（如规范全文）把脚本内嵌在顶栏块里而不是单独区块，
    只处理 fr['js'] 会漏掉它们 —— 表现是"同一段脚本一份加了前缀、一份没加"，
    没加前缀的那份找不到元素并抛 null 错误。
    """
    def rewrite(html_text: str) -> str:
        def one(m: re.Match) -> str:
            open_tag, inner = m.group(1), m.group(2)
            inner = rewrite_page_dark_js(
                body_to_root_js(scope_js(prefix_js_ids(inner, mod), mod), mod), mod)
            return f"{open_tag}{inner}</script>"

        # 只在片段拥有的范围内替换，不跨 </script> 继续匹配（否则会误改后面的脚本）
        return re.sub(r"(<script(?![^>]*\bsrc=)[^>]*>)((?:(?!</script>)[\s\S])*?)</script>",
                      one, html_text)

    # 先按脚本块切分，逐块处理，避免处理结果被后续匹配再次改写
    parts = re.split(r"(<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>)", html)
    out = []
    for idx, seg in enumerate(parts):
        out.append(rewrite(seg) if idx % 2 == 1 else seg)
    return "".join(out)


def body_to_root_js(js: str, mod: str) -> str:
    """把脚本里的 `document.body` 改为模块根。

    合并前每个页面独占 <body>，所以"弹窗/浮层挂到 body""给 body 加状态类"都等价于
    挂到/作用于页面根。合并后 <body> 是外壳的，不再属于任何模块，于是：
      - 挂到 body 的动态节点落在模块作用域之外 → 命中不到模块内的作用域样式
        （级联 picker 的遮罩/底部弹层、各页 toast 会消失或错位）；
      - 给 body 加的类名（如规范全文的 `reader`）不会作用于模块，
        而模块 CSS 已写成 `.gm-mod--site-spec .reader ...` → 阅读模式整体失效。
    统一改指向模块根即可恢复等价语义。
    """
    # 幂等保护：已改写过（或已被其它模块改写）就不要再加一层。
    # 踩过的坑：只判断 `document.body` 是否存在，而改写结果里
    # `||document.body` 仍含该串 → 后面的模块又包一层 → 变成
    # `MOD_ROOT()||MOD_ROOT()||…`，而外层 MOD_ROOT 属于**别的模块**（函数声明提升 + 同名覆盖），
    # 结果 MOD_ROOT() 返回了错误的模块根，暗色开关直接失效。
    fn = "MODROOT_" + mod.replace("-", "_")
    if fn + "()" in js:
        return js
    helper = (
        "\n/* 合并入单一首页的作用域适配：本模块原先独占 <body>，"
        "动态节点与状态类都挂在 body 上；合并后 body 属于外壳，"
        "改挂模块根以保持与原页面等价的作用域。 */\n"
        f'function {fn}(){{return document.getElementById("gm-mod-{mod}")||document.body;}}\n'
    )
    js = helper + js
    return js.replace("document.body", fn + "()")


def rewrite_page_dark_css(css: str, mod: str) -> str:
    """把"页面级暗色"选择器改写到模块根。

    原页面用 `html[data-theme="dark"] body{…}` 做整页暗色（示例页的暗色演示）。
    合并后 <html> 是**整站共享**的，若原样保留：
      · 选择器里的 body 在模块内不存在 → 规则永远不命中；
      · 更糟的是开关会给 <html> 加 data-theme，把整站（含外壳）都变暗。
    这里统一改成"模块根自带 data-theme 时生效"，并在 JS 侧改挂模块根，
    让暗色演示只影响本模块，语义与原页面等价。

    必须在 scope_css **之前**执行：先变成 `[data-theme="dark"]`，
    再被统一加上 `.gm-mod--x` 前缀（自带前缀的选择器不会被重复加）。
    """
    css = re.sub(r"""html\s*\[\s*data-theme\s*=\s*["']dark["']\s*\]""",
                 '[data-theme="dark"]', css)
    # `… [data-theme="dark"] body{…}` 原本作用于整页 body；模块内没有 body，
    # 规则会永远不命中 → 暗色演示看着"开关有效但页面不变"。
    # 改为 `…:where([data-theme="dark"]){…}`：命中模块根自身，且 :where 零特异性，
    # 不会压过模块原有底纹规则。
    css = re.sub(r"""(\[\s*data-theme\s*=\s*["']dark["']\s*\])\s*(?:body|html)\b""",
                 r""":where(\1)""", css)
    return css


def rewrite_page_dark_js(js: str, mod: str) -> str:
    """把脚本里对 <html> 的 data-theme 读写改到模块根（配合 rewrite_page_dark_css）

    注意用**按模块唯一**的函数名：若统一叫 MOD_ROOT，六个模块会互相覆盖同名函数声明，
    后声明的那个赢，于是前置模块调用 MOD_ROOT() 拿到的是别的模块根
    （实测：patterns 模块拿到 site-docs 的根，暗色开关写到了错误节点上）。
    """
    return js.replace("document.documentElement", "MODROOT_" + mod.replace("-", "_") + "()")


def rewrite_root_scope(css: str, mod: str) -> str:
    """把被 JS 加上状态类的"页面根"选择器改写到模块根。

    对应 body_to_root_js：脚本改成给模块根加 `.reader`，而 CSS 已写成
    `.gm-mod--site-spec .reader …`（后代），永远匹配不到根自身。
    这里补一条 `.gm-mod--site-spec:where(.reader) …` 形式，使既有规则继续生效。
    """
    if mod != "site-spec":
        return css
    return re.sub(r"\.reader\b", f".gm-mod--{mod}:where(.reader)", css)


# ══════════════════════════════════════════════════════════════════════════
# 链接改写：旧页面链接 → 模块切换
# ══════════════════════════════════════════════════════════════════════════

# 旧页面 → 目标模块（合并后被取代的页面）；None = 保留为独立页，不改写
LEGACY_PAGE = {
    "site/index.html": "site-index",
    "site/docs.html": "site-docs",
    "site/spec.html": "site-spec",
    "site/manual.html": "site-manual",
    "preview/index.html": "preview-index",
    "preview/examples.html": "preview-examples",
    "preview/mobile.html": "preview-mobile",
    "preview/patterns.html": "preview-patterns",
    "preview/manual.html": None,   # 打印版手册保留为独立页
}

# 规范各章锚点所在的模块（spec.html#ch-02 → #gm-mod-site-spec--ch-02）
SPEC_ANCHOR_MOD = "site-spec"

# 链接文案微调：旧页面名 → 新模块名（让导航语义自洽）
LINK_TEXT = {
    "主站": "首页与总览",
    "返回首页": "首页与总览",
    "返回官网首页": "首页与总览",
    "文档中心": "文档索引",
    "示例中心": "组件与状态",
    "示例中心 · 7 页": "组件与状态",
    "全量规范": "规范全文",
    "设计系统首页": "视觉规范",
    "体验设计系统首页": "视觉规范",
}


def rewrite_legacy_links(html: str, self_mod: str) -> str:
    """把指向被合并旧页面的链接改写为"切换模块 + 跳到模块内锚点"。

    合并后旧页面只剩重定向，站内链接继续指向它们会白屏一跳；
    这里统一改成本页 `#gm-mod-xx` 形式，由外壳脚本切换模块并滚动定位。
    `data-mod` 让外壳脚本无需解析锚点即可确定目标模块。
    """
    def one(m: re.Match) -> str:
        pre, href, post = m.group(1), m.group(2), m.group(3)
        if href.startswith(("http://", "https://", "mailto:", "#", "javascript:")):
            return m.group(0)
        path, frag = href.split("#", 1) if "#" in href else (href, "")
        path = path.strip()
        while path.startswith("../"):
            path = path[3:]
        if path.startswith("./"):
            path = path[2:]
        base = os.path.basename(path)
        if not base.endswith(".html"):
            return m.group(0)

        mod = LEGACY_PAGE.get(path)
        if mod is None:
            for k, v in LEGACY_PAGE.items():
                if os.path.basename(k) == base:
                    mod = v
                    break
        if mod is None:
            return m.group(0)          # 打印版手册等独立页：原样保留
        # 注：**不再**对 `mod == self_mod and not frag` 提前返回。旧的提前返回会把
        # "回到本模块顶部"这类链接原样留成 `preview/index.html`（已被合并掉的重定向桩），
        # 点击即白屏一跳；现在统一改写为 `#gm-mod-<mod>`，由外壳完成模块切换与定位。

        # 锚点目标合同（P0-4）：
        #   · 模块根            → `#gm-mod-<mod>`（由外壳脚本 activate 识别）
        #   · 模块内具体元素    → `#<mod>--<id>`（prefix_ids 已给元素 id 加过 `<mod>--`）
        # 曾经写成 `#gm-mod-<mod>--<frag>`：前置的 `gm-mod-` 让目标 id 永远不存在，
        # 于是点击后模块切了、滚动落空（悬空锚点）。`SPEC_ANCHOR_MOD` 分支与 else
        # 分支产出相同结果，故合并为一条。
        if not frag:
            target = f"#gm-mod-{mod}"
        else:
            target = f"#{mod}--{frag}"
        # ⚠️ `pre` 本身已以 `href="` 结尾（见下方 re.sub 的第 1 组），
        # 因此这里绝不能再写一次 `href="` —— 否则产出 `href="href="#…"`，
        # 浏览器把属性值解析为字面量 `href=`，点击后导航到 /site/href= → 404。
        return f'{pre}{target}" data-mod="{mod}"{post}'

    return re.sub(r'(<a\b[^>]*?\shref=")([^"]+)(")', one, html)


def rewrite_link_text(html: str) -> str:
    """按新模块名调整链接文案（"主站/文档中心/示例中心/全量规范" → 模块名）"""
    def one(m: re.Match) -> str:
        new = LINK_TEXT.get(m.group(2).strip())
        return m.group(0) if not new else f"{m.group(1)}{new}{m.group(3)}"

    return re.sub(r"(>)([^<>]{1,24})(</a>)", one, html)


def drop_body_scripts(html: str, has_section_js: bool) -> tuple[str, int]:
    """当片段另有 `<!--@js-->` 区块时，删除 body 内联脚本。

    抽取时同一段脚本可能既出现在 body 里、又被收进 `<!--@js-->` 区块；
    两处都保留会让同一段初始化代码**执行两次** —— 事件监听被绑定两遍，
    于是"点击展开"变成"展开又立刻收起"（级联面板、暗色开关等全部失灵，
    且不报任何错，极难排查）。以 `<!--@js-->` 区块为唯一出处。
    """
    if not has_section_js:
        return html, 0
    n = len(re.findall(r"<script(?![^>]*\bsrc=)[^>]*>.*?</script>", html, flags=re.S))
    if not n:
        return html, 0
    cleaned = re.sub(r"<script(?![^>]*\bsrc=)[^>]*>.*?</script>", "", html, flags=re.S)
    return cleaned, n


def build() -> tuple[str, dict]:
    """组装完整首页；返回 (html, 统计)"""
    frag_path = os.path.join(FRAG, "shell.html")
    shell = io.open(frag_path, encoding="utf-8").read() if os.path.exists(frag_path) else SHELL

    tab_html, mod_html, stats = [], [], {}
    stats_dropped: dict[str, int] = {}
    for mod, title, group, desc in MODULES:
        p = os.path.join(FRAG, mod + ".html")
        if not os.path.exists(p):
            print(f"  WARN 缺少片段 site/fragments/{mod}.html，跳过")
            continue
        fr = parse_fragment(io.open(p, encoding="utf-8").read())

        passthrough = bool(fr.get("passthrough"))
        if passthrough:
            # 原样内联：内容已是完成态，任何二次改写都会破坏它
            tab_html.append(
                f'<button type="button" class="sh-tab" role="tab" data-mod="{mod}" '
                f'aria-selected="false" tabindex="-1" title="{desc}">{title}</button>'
            )
            mod_html.append(
                f'<section class="gm-mod {scope_cls(mod)}" id="gm-mod-{mod}" role="tabpanel" '
                f'aria-label="{title}" data-title="{title}">\n{fr["body"].strip()}\n</section>'
            )
            stats[mod] = {"css": 0, "body": len(fr["body"]), "js": 0,
                          "ids": len(re.findall(r'\bid\s*=\s*"', fr["body"])), "scripts": 0,
                          "dropped": 0, "passthrough": True}
            continue

        css = fr["css"].strip()
        if css:
            css = rewrite_page_dark_css(css, mod)
            css = scope_css(css, mod)
            css = rewrite_root_scope(css, mod)
        # 顺序要紧：先给 id 加前缀，再改 #锚点，最后才改写脚本里的选择器，
        # 这样脚本读到的 id 与 DOM 中的 id 始终一致。
        body, dropped = drop_body_scripts(fr["body"], bool(fr["js"].strip()))
        if dropped:
            stats_dropped[mod] = dropped
        body = prefix_ids(body, mod)
        body = rewrite_hash_links(body, mod)
        body = rewrite_legacy_links(body, mod)
        body = rewrite_link_text(body)
        body = scope_body_scripts(body, mod)
        js = ""
        if fr["js"].strip():
            js = rewrite_page_dark_js(
                body_to_root_js(scope_js(prefix_js_ids(fr["js"], mod), mod), mod), mod)

        stats[mod] = {"css": len(css), "body": len(body), "js": len(js),
                      "ids": len(re.findall(r'\bid\s*=\s*"', body)),
                      "scripts": len(re.findall(r"<script", body)) + (1 if js.strip() else 0),
                      "dropped": stats_dropped.get(mod, 0)}

        tab_html.append(
            f'<button type="button" class="sh-tab" role="tab" data-mod="{mod}" '
            f'aria-selected="false" tabindex="-1" title="{desc}">{title}</button>'
        )
        parts = [f'<section class="gm-mod {scope_cls(mod)}" id="gm-mod-{mod}" role="tabpanel" '
                 f'aria-label="{title}" data-title="{title}">']
        if css.strip():
            parts.append(f"<style>{css}</style>")
        parts.append(body)
        if js.strip():
            parts.append(f"<script>{js}</script>")
        parts.append("</section>")
        mod_html.append("\n".join(parts))

    html = shell.replace("__TABS__", "\n    ".join(tab_html)).replace("__MODULES__", "\n".join(mod_html))
    return html, stats


def markup_only(html: str) -> str:
    """去掉不参与渲染的区段，只留真实标记。

    必须剔除的区段（否则断言会把"文档里写的示例"当成"页面里的属性"）：
      · `<script>` / `<style>` —— 注释与字符串里可能引用 href 写法
      · `<!-- … -->` 注释
      · `<pre>` / `<code>` —— 站内文档代码块，本身就是用来展示写法的
    """
    s = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    s = re.sub(r"<style\b[^>]*>.*?</style>", "", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<pre\b[^>]*>.*?</pre>", "", s, flags=re.S | re.I)
    return s


def validate_html(html: str) -> list[str]:
    """产物级断言（P0-4）：属性合法性与锚点可解析性。

    历史缺陷之所以能一路绿灯上线，是因为门禁只证明"产物 == 片段"、
    冒烟只断言"模块切换成功"，**没有任何一步校验属性值本身合法、
    也没有任何一步校验锚点目标存在**。这里把两件事都补上。
    """
    errs = []
    markup = markup_only(html)

    bad = re.findall(r'href="href="', markup)
    if bad:
        errs.append('畸形 href：%d 处 `href="href=`（生成器重复输出 href="）' % len(bad))

    ids = set(re.findall(r'\bid\s*=\s*"([^"]+)"', markup))
    dead: dict[str, int] = {}
    for href in re.findall(r'\bhref\s*=\s*"([^"]*)"', markup):
        if not href.startswith("#") or href == "#":
            continue
        if href[1:] not in ids:
            dead[href] = dead.get(href, 0) + 1
    if dead:
        top = ", ".join(f"{k}×{v}" for k, v in sorted(dead.items(), key=lambda kv: -kv[1])[:6])
        errs.append("悬空锚点：%d 处（%s）" % (sum(dead.values()), top))

    # IDREF 完整性：`aria-labelledby="x"` 这类引用必须指向真实存在的 id。
    # 合并成单一首页后 id 会加模块前缀，若只改 id 不改引用，两边都"合法"、
    # 静态检查全绿，但读屏拿到的是空引用（实测 Popconfirm 气泡踩过）。
    idref_attrs = ("aria-labelledby", "aria-describedby", "aria-controls", "aria-owns",
                   "aria-activedescendant", "aria-flowto", "for", "list", "form", "headers")
    unresolved: dict[str, int] = {}
    for a in idref_attrs:
        for m in re.finditer(r'\b%s\s*=\s*"([^"]+)"' % a, markup):
            for tok in m.group(1).split():
                if tok and not tok.startswith("#") and tok not in ids:
                    unresolved[f"{a}={tok}"] = unresolved.get(f"{a}={tok}", 0) + 1
    if unresolved:
        top = ", ".join(f"{k}×{v}" for k, v in sorted(unresolved.items(), key=lambda kv: -kv[1])[:6])
        errs.append("断链 IDREF（aria-labelledby / for 等指向不存在的 id）：%d 处（%s）"
                    % (sum(unresolved.values()), top))
    return errs


def main() -> int:
    ap = argparse.ArgumentParser(description="合并站点为唯一首页 site/index.html")
    ap.add_argument("--extract", action="store_true", help="从旧页面抽取 fragments（迁移用）")
    ap.add_argument("--check", action="store_true", help="只校验产物是否最新（CI 用）")
    args = ap.parse_args()

    if args.extract:
        os.makedirs(FRAG, exist_ok=True)
        return cmd_extract()

    if not os.path.isdir(FRAG):
        print("ERROR 未找到 site/fragments/，先执行：python3 scripts/build-site.py --extract")
        return 1

    html, stats = build()

    # 断言先于写盘：任何非法属性/悬空锚点都不允许产出
    errs = validate_html(html)
    if errs:
        for e in errs:
            print("FAIL " + e)
        print("FAIL 构建产物未通过锚点/属性断言，已拒绝写出 site/index.html")
        return 1

    if args.check:
        cur = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if cur != html:
            print("FAIL site/index.html 与构建结果不一致，请执行 python3 scripts/build-site.py")
            return 1
        print("OK site/index.html 已是最新（%d 模块；锚点/属性断言通过）" % len(stats))
        return 0

    io.open(OUT, "w", encoding="utf-8").write(html)
    print("site/index.html 已生成  %.1f KB  模块 %d 个" % (len(html) / 1024, len(stats)))
    for mod, title, _g, _d in MODULES:
        s = stats.get(mod)
        if s:
            if s.get("passthrough"):
                print("  %-20s 原样内联（passthrough） body %d" % (mod, s["body"]))
                continue
            extra = "  丢弃重复脚本 %d 段" % s["dropped"] if s.get("dropped") else ""
            print("  %-20s css %-7d body %-7d js %-6d ids %d%s"
                  % (mod, s["css"], s["body"], s["js"], s["ids"], extra))
    return 0


if __name__ == "__main__":
    sys.exit(main())
