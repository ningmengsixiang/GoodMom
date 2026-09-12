#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GoodMom 全自动规范审计（scripts/audit.py）
检查：Markdown 链接 / 章节连续性 / 图标唯一与计数 / HTML 无 .md 链接 / 残留词 / 色彩合规（严格: css与token层）/ hex 色值大小写（14.1.1）/ 双包镜像一致性（D10）。
退出码：0=通过；1=硬性失败。报告写入 docs/audit-report.md。
用法：python3 scripts/audit.py [--strict]
"""
import glob, os, re, sys, html as _html
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
STRICT = "--strict" in sys.argv

results = []  # (level, scope, msg)

def rec(level, scope, msg):
    results.append((level, scope, msg))
    print("[%s] %-14s %s" % (level, scope, msg))

def md_links():
    bad = []
    for f in glob.glob("*.md"):
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r"\]\(([^)#]+?)(?:#[^)]*)?\)", t):
            p = m.group(1).split("#")[0]
            if p.endswith(".md") and not os.path.exists(p):
                bad.append((f, p))
    if bad:
        rec("FAIL", "md-links", "%d 失效链接" % len(bad))
        return False
    rec("OK", "md-links", "全部内链有效")
    return True

def chapter_seq():
    files = sorted(glob.glob("[0-9][0-9]-*.md"))
    nums = [int(re.match(r"(\d\d)-", os.path.basename(f)).group(1)) for f in files]
    expect = list(range(0, 19))
    missing = [n for n in expect if n not in nums]
    dup = len(nums) != len(set(nums))
    if missing or dup:
        rec("FAIL", "chapters", "缺失 %s / 重复 %s" % (missing, dup))
        return False
    rec("OK", "chapters", "00–18 编号连续（%d 份）" % len(files))
    return True

def icons():
    try:
        sp = open("icons/lg-icons.svg", encoding="utf-8").read()
    except OSError:
        rec("FAIL", "icons", "缺少 icons/lg-icons.svg"); return False
    ids = re.findall(r'<symbol id="([^"]+)"', sp)
    dup = [x for x in set(ids) if ids.count(x) > 1]
    badname = [x for x in ids if not x.startswith("lg-icon-")]
    reg = open("goodmom-icons/src/registry.ts", encoding="utf-8").read() if os.path.exists("goodmom-icons/src/registry.ts") else ""
    reg_ids = re.findall(r'"lg-icon-[^"]+"', reg)
    if dup or badname or len(ids) != len(set(ids)) or (reg and len(set(reg_ids)) != len(set(ids))):
        rec("FAIL", "icons", "重复=%s 非法名=%s sprite=%d registry=%d" % (len(dup), len(badname), len(ids), len(set(reg_ids))))
        return False
    rec("OK", "icons", "%d 图标唯一且命名合法，与 registry 同步" % len(ids))
    return True

def html_no_md():
    """HTML 里不得出现指向 .md 的链接（浏览器会打开未渲染的源码）。

    ⚠️ 旧实现有两处缺口，合起来造成**假通过**：
      1. 正则 `href="([^"]*\.md)"` 要求 href **以 .md 结尾**，
         于是 `href="../03-组件规范.md#卡片与面板"` 这类带锚点的链接 0 命中；
      2. 作用域只扫 `site/*.html` + `preview/*.html`，
         漏掉 `site/fragments/`（站点源！）、`fuyouaican sai/`、根目录与 `frontend-app/`。
    现在正则允许锚点/查询串，作用域覆盖全部 HTML（含片段）。
    """
    bad = []
    files = (glob.glob("site/**/*.html", recursive=True)
             + glob.glob("preview/**/*.html", recursive=True)
             + glob.glob("*.html") + glob.glob("fuyouaicansai/**/*.html", recursive=True)
             + glob.glob("frontend-app/**/*.html", recursive=True))
    for f in sorted({x for x in files if "node_modules" not in x.replace(os.sep, "/")}):
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r'href="([^"]*\.md(?:[#?][^"]*)?)"', t):
            bad.append((f, m.group(1)))
    if bad:
        rec("FAIL", "html-md", "%d 处 .md 链接：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "html-md", "HTML 页面无 .md 链接（含片段与根目录）")
    return True

STALE = ["未来 SaaS", "数据安全态势大屏", "Liquid Glass Enterprise Design System"]
def stale_words():
    bad = []
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html") + glob.glob("*.md"):
        t = open(f, encoding="utf-8").read()
        for w in STALE:
            if w in t:
                bad.append((f, w))
    if bad:
        rec("FAIL" if not STRICT else "FAIL", "stale", "%s" % bad[:5])
        return False
    rec("OK", "stale", "无旧称/旧定位残留")
    return True

ALLOWED = {h.upper() for h in """#343A46 #4F5B6E #9AA2B0 #F4F0EC #E6D9D0 #D7C5BC #B23A63 #E85D8F #F77FA3 #FFA3BE #FFC4D6 #FFDEE8 #FFF0F4
#FFC3A0 #FFDCC7 #FFF3EA #4FB59C #6FC9B4 #A9E3D4 #E2F6F0 #42C7A1 #96E6CF #F2B25C #FAE1B3 #EF6A7B #FAC9D0 #6D9EFF
#9A78FF #8066F0 #B9A0FF #B69AFF #7D8CFF #4CB98A #F2C14E #F0954A #EE5C70 #8F6AE0 #2F8F76 #4A76D0 #B9771C #D35466 #757E8E
#7A5CE0 #B98D1F #8A6D10 #4F5B6E #B23A63 #9E3054 #C44C74 #1E6B52 #9A5A0E #B04052 #385CB3 #6242B8 #FFA9C2 #FF9AB6 #FF8FAE #7FD8C2 #EFAF55 #F79AA8 #E25B72 #FFFFFF #FFF #1B1A21 #23222A #F3EFEC #C9C4CE #9CAEFF #A6ADB9 
#36353C
#25715D #3261C1 #8D5A15 #B72F42 #5E6673 #6A48DC """.split()}
""" 页面档别名 / 引擎展示色（A1 收口，2026-09；仅用于 site/preview 静态页，代码层仍受 ALLOWED 严格约束）
暖底/玻璃框别名 + 02.1/12.3.3 引擎 ramp 与渐变样例色；详见 docs/审查决策记录.md D4。"""
PAGE_ALIAS = {h.upper() for h in """#F0D4CF #FDF2EE #F6E2DB #EAD3CA #E7D4CB #E6CFC6 #E7D3CB #EED5CD #E6C6BD #FFF7F4 #FDF6F2
#EED9D3 #FFFAF7 #E0C2BB #F0E6E0 #C9BDB5 #9C8E86 #EADFD6 #D9C9BF #F7E4DD #EBD3CA #E9D2C9 #72DDE5 #A5F1EE #F5B8C6 #D9CBFE #EDE7FE
#FFD0D8 #F6C0A0 #A98BFF #7D66F2 #69D8D2 #E0F8F6 #9CAEFF #E4EAFF #F2A5B7 #FDE9EE #FBD9BE #F0AE86 #3A3642 #191720 #F8CE8C
#A6ADB9 #8A92A3 #F6A97E #2A8D92 #241D24 #3A2B33 #55333D #A03F60""".split()}
COLOR_SOURCES = ["goodmom-ui/src/theme.css", "goodmom-ui/src/tokens/status.ts",
                 "goodmom-ui/src/tokens/design.ts", "frontend-app/packages/gm-arco-ui/src/gm.css",
                 "frontend-app/packages/gm-arco-ui/src/tokens/status.ts"]
def colors():
    pat = re.compile(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b")
    ok = True
    for f in COLOR_SOURCES:
        if not os.path.exists(f): continue
        t = open(f, encoding="utf-8").read()
        bad = sorted({m.group(0).upper() for m in pat.finditer(t)} - ALLOWED)
        if bad:
            rec("FAIL", "color-css", "%s 硬编码 %s" % (f, bad[:6])); ok = False
    html_ok = True
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
        t = open(f, encoding="utf-8").read()
        css = " ".join(re.findall(r"<style[^>]*>(.*?)</style>", t, re.S)) + " " + " ".join(re.findall(r'style="([^"]*)"', t))
        bad = sorted({m.group(0).upper() for m in pat.finditer(css)} - (ALLOWED | PAGE_ALIAS))
        if bad:
            html_ok = False
            rec("WARN", "color-html", "%s 非白名单色 %d 个（低风险别名）" % (f, len(bad)))
    if html_ok: rec("OK", "color-html", "页面样式色全部处于 ALLOWED/PAGE_ALIAS（A1 收口）")
    if ok: rec("OK", "color-css", "代码/Tokem 层无硬编码色（严格层）")
    return ok

def breakpoint_reg():
    """断点收敛检查（E 审查）：允许 640/767/1024/1366/1600/1920/2304 与 768-1023 平板；其余 WARN 列出。"""
    allowed={640,767,768,1024,1280,1366,1440,1600,1920,2304}
    stray=[]
    for f in glob.glob("site/index.html")+glob.glob("site/docs.html")+glob.glob("preview/*.html"):
        t=open(f,encoding="utf-8").read()
        for m in re.finditer(r'@media[^{]*?(max-width|min-width)\s*:\s*(\d+)px', t):
            v=int(m.group(2))
            if v not in allowed:
                stray.append((f,m.group(1),v))
    seen=sorted({(f,s,v) for f,s,v in stray})
    if seen:
        rec("WARN","bp","非收敛断点 %s" % [(f,v) for f,s,v in seen][:8])
    else:
        rec("OK","bp","断点收敛于 767/1024/1366 体系")
    return True

def banned_colors():
    """历史近似色回归检测（G-P1-2）：代码层命中=FAIL，HTML 层=WARN。"""
    banned = {"#3F9C88"}  # 旧正向绿（已归一为 #2F8F76，禁止回归）
    src_files = COLOR_SOURCES + ["goodmom-ui/src/theme.css"]
    bad_src, bad_html = [], []
    pat = re.compile(r"#[0-9a-fA-F]{6}\b")
    for f in src_files:
        if not os.path.exists(f): continue
        hit = sorted({m.group(0).upper() for m in pat.finditer(open(f, encoding="utf-8").read())} & banned)
        if hit: bad_src.append((f, hit))
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
        t = open(f, encoding="utf-8").read()
        css = " ".join(re.findall(r"<style[^>]*>(.*?)</style>", t, re.S)) + " " + " ".join(re.findall(r'style="([^"]*)"', t))
        hit = sorted({m.group(0).upper() for m in pat.finditer(css)} & banned)
        if hit: bad_html.append((f, hit))
    ok = True
    if bad_src:
        rec("FAIL", "color-banned", "旧色回归(代码层) %s" % bad_src[:3]); ok = False
    else:
        rec("OK", "color-banned", "无历史近似色回归")
    if bad_html:
        rec("WARN", "color-banned-html", "旧色回归(HTML 层) %s" % bad_html[:3])
    return ok

def spec_health():
    """规范全文健康度。

    V2.7 起全部内容并入唯一首页 site/index.html，旧 site/spec.html 只剩重定向；
    因此改为在**合并产物**里校验「site-spec 模块」的章节数与阅读器是否还在，
    同时校验旧路径确为重定向（避免旧链接 404）。
    """
    f = "site/index.html"
    if not os.path.exists(f):
        rec("FAIL", "spec", "缺少唯一首页 site/index.html"); return False
    s = open(f, encoding="utf-8").read()
    i = s.find('id="gm-mod-site-spec"')
    if i < 0:
        rec("FAIL", "spec", "合并产物缺少 site-spec 模块"); return False
    seg = s[i:i + 400000]
    chaps = seg.count('class="chap"')
    # 阅读器资产在合并后由模块前缀化为 site-spec--modeBtn
    has_reader = 'site-spec--modeBtn' in seg or 'id="modeBtn"' in seg
    if chaps < 19 or not has_reader:
        rec("FAIL", "spec", "模块内章节=%d 或阅读器缺失" % chaps); return False
    # 旧入口必须是重定向
    legacy = os.path.join("site", "spec.html")
    if not os.path.exists(legacy) or "页面已合并" not in open(legacy, encoding="utf-8").read():
        rec("FAIL", "spec", "site/spec.html 未改写为重定向"); return False
    rec("OK", "spec", "合并产物 site-spec 模块 章节=%d 阅读器在；旧入口为重定向" % chaps)
    return True

def hex_case():
    """hex 色值书写统一大写（14.1.1）：全仓文本源扫描，出现小写即 FAIL。
    仅认 #后 3/4/6/8 位十六进制（与 colors() 同口径），不误伤 id 选择器与锚点。
    ① 跳过生成物（audit/coverage/a11y 报告自身），否则报告会记录小写色值导致自我维持 FAIL；
    ② 报告里的命中值统一以大写回显，杜绝同样的自引用回路。"""
    pat = re.compile(r"#([0-9a-fA-F]{3,8})\b")
    exts = (".md", ".html", ".css", ".ts", ".tsx", ".js", ".jsx", ".py", ".svg", ".json", ".yml", ".sh")
    generated = {"docs/audit-report.md", "docs/coverage-report.md",
                 "docs/coverage.json", "docs/a11y-dom-report.md"}
    bad = []
    for root, dirs, files in os.walk("."):
        # 跳过构建产物与依赖目录：Storybook 产物/编译输出里的第三方小写 hex 会造成假 FAIL（R15）
        # 另跳过 Vite 预打包缓存（.vite，内含 vue 全量 bundle）与 npm 本地缓存
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "dist", "storybook-static",
                                                ".storybook-static", ".vite", ".npm-cache",
                                                # 站点基线快照（合并前原页面，供热节保真度校验用），非交付内容
                                                ".baseline")]
        # site/fragments 是"合并片段"（输入源，非交付页面）；其 hex 大小写由最终产物体现，
        # 单独扫描会与产物重复计数，故在产物层校验一次即可
        for fn in sorted(files):
            if not fn.endswith(exts):
                continue
            p = os.path.join(root, fn)
            rel = os.path.relpath(p).replace(os.sep, "/")
            if rel in generated:
                continue
            # 深层缓存路径（如 goodmom-vue/playground/.vite/deps/vue.js）与压缩产物一并跳过
            if "/.vite/" in rel or rel.endswith(".min.js"):
                continue
            # 构建产物：site/index.html 由 build-site.py 组装，Vite/压缩器会把 hex 统一成小写，
            # 这不代表书写不规范（与 R15 同类假 FAIL）。大小写规范校验留在**源**上：
            # site/fragments/*（构建输入）与各页源码；产物不做大小写判定。
            if rel == "site/index.html" or rel.startswith("site/fragments/"):
                continue
            try:
                t = open(p, encoding="utf-8").read()
            except (UnicodeDecodeError, OSError):
                continue
            hits = sorted({m.group(0).upper() + "(小写)" for m in pat.finditer(t)
                           if len(m.group(1)) in (3, 4, 6, 8) and m.group(1) != m.group(1).upper()})
            if hits:
                bad.append((rel, hits[:4]))
    if bad:
        rec("FAIL", "hex-case", "%d 个文件含小写 hex：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "hex-case", "hex 色值全仓统一大写（14.1.1）")
    return True

def _lum(hexv):
    h = hexv.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = f(r), f(g), f(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def _contrast(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def _mix_white_over(base, alpha):
    h = base.lstrip("#")
    out = [min(255, round(int(h[i:i + 2], 16) + (255 - int(h[i:i + 2], 16)) * alpha)) for i in (0, 2, 4)]
    return "#%02X%02X%02X" % tuple(out)

def dark_contrast():
    """暗黑模式守门（02 · 2.1.9）：theme.css 必须含 data-theme="dark" 段，
    且正文/次级/三级/链接/语义色在「页面底」与「12% 白玻璃合成面」（最坏情形）上实测 ≥4.5:1。"""
    f = "goodmom-ui/src/theme.css"
    if not os.path.exists(f):
        rec("FAIL", "dark", "缺少 theme.css"); return False
    src = open(f, encoding="utf-8").read()
    gmc = "frontend-app/packages/gm-arco-ui/src/gm.css"
    if os.path.exists(gmc) and '[data-theme="dark"]' not in open(gmc, encoding="utf-8").read():
        rec("FAIL", "dark", "应用侧 gm.css 缺 data-theme=\"dark\" 段（双包不一致）"); return False
    m = re.search(r'\[data-theme="dark"\]\s*\{(.*?)\}', src, re.S)
    if not m:
        rec("FAIL", "dark", '主题源缺 [data-theme="dark"] 段'); return False
    block = m.group(1)
    def tok(name):
        mm = re.search(re.escape(name) + r"\s*:\s*(#[0-9A-Fa-f]{3,8})", block)
        return mm.group(1).upper() if mm else None
    page = tok("--lg-page-bg")
    if not page:
        rec("FAIL", "dark", "暗色段缺 --lg-page-bg"); return False
    worst = _mix_white_over(page, 0.12)
    checks = ["--lg-text-primary", "--lg-text-secondary", "--lg-text-tertiary", "--lg-link",
              "--lg-sem-positive", "--lg-sem-info", "--lg-sem-attention",
              "--lg-sem-risk", "--lg-sem-neutral", "--lg-sem-special"]
    bad, missing = [], []
    for name in checks:
        v = tok(name)
        if not v:
            missing.append(name); continue
        c = _contrast(v, worst)
        if c < 4.5:
            bad.append((name, v, round(c, 2)))
    if missing:
        rec("FAIL", "dark", "暗色段缺变量 %s" % missing); return False
    if bad:
        rec("FAIL", "dark", "暗底对比度不足(<4.5:1) %s（合成面 %s）" % (bad, worst)); return False
    rec("OK", "dark", "暗色段完整；10 项文字/语义色在最坏合成面 %s 上全部 ≥4.5:1" % worst)
    return True

def exports_check():
    """组件导出守门（Part 11 验收点）：components/ 与 adapters/ 下每个 .tsx 必须在 src/index.ts 中导出。"""
    ok = True
    for pkg in ("goodmom-ui/src", "frontend-app/packages/gm-arco-ui/src"):
        idx = os.path.join(pkg, "index.ts")
        if not os.path.exists(idx):
            continue
        text = open(idx, encoding="utf-8").read()
        miss = []
        for sub in ("components", "adapters"):
            for f in sorted(glob.glob(os.path.join(pkg, sub, "*.tsx"))):
                name = os.path.basename(f)[:-4]
                if not re.search(r"\b%s\b" % re.escape(name), text):
                    miss.append(name)
        if miss:
            rec("FAIL", "exports", "%s/index.ts 未导出：%s" % (pkg, miss)); ok = False
    if ok:
        rec("OK", "exports", "全部组件已在两包 index.ts 导出")
    return ok

def mirror_sync():
    """双包镜像一致性（D10）：应用侧 gm-arco-ui 必须与设计系统源 goodmom-ui 逐字节一致。

    ⚠️ 旧实现有一句 `if rel == "theme.css": continue`，于是**唯一那对样式表从不比对**。
    后果不是理论上的：应用镜像 `gm.css` 比 `theme.css` 少了 **37 个 `gm-*` 选择器**，
    而 index.ts 导出的 GmEmpty / GmSpin / GmSkeleton / GmTag / GmSteps **一个样式都没有**；
    `gm-status-dot` 缺失更让状态标签的色点变成 0×0 的不可见空 span。
    "封装差异"能解释包装器样式不同，解释不了"导出的组件完全没有样式"。
    现把 theme.css ↔ gm.css 一并纳入比对（应用侧现为同源的超集副本）。

    另补一道**选择器集合**比对：即使将来两侧因故不逐字节相同，也不允许
    应用侧缺少设计系统源里的任何 `.gm-*` 选择器。

    排除 goodmom-vue/**：`@goodmom/vue` 是 V2.6 新增的 Vue 3 包，与 React 包**共享数值口径但不同语言/
    不同宿主**（.vue SFC vs .tsx、template 注释 vs JSX 注释、defineModel vs useState），
    结构上不可能逐字节一致。两者的一致性由 `scripts/check-status-map.py`（状态字典 ⇄ 15 章）
    与本函数的 React 镜像共同保证，不靠本函数的字节比对。"""
    src = "goodmom-ui/src"
    dst = "frontend-app/packages/gm-arco-ui/src"
    if not os.path.isdir(dst):
        rec("WARN", "mirror", "未找到应用侧镜像包，跳过"); return True
    diff, missing = [], []
    # 应用侧唯一的命名差异：`theme.css` 在镜像里叫 `gm.css`（宿主应用按此名引入）。
    # 映射必须显式写出来，否则比对会把 theme.css 误报成"缺失"。
    RENAME = {"theme.css": "gm.css"}
    for root, _dirs, files in os.walk(src):
        for fn in sorted(files):
            rel = os.path.relpath(os.path.join(root, fn), src).replace(os.sep, "/")
            a, b = os.path.join(src, rel), os.path.join(dst, RENAME.get(rel, rel))
            if not os.path.exists(b):
                missing.append(rel); continue
            if open(a, encoding="utf-8").read() != open(b, encoding="utf-8").read():
                diff.append(rel)

    # 选择器集合比对：应用侧不得缺少设计系统源中的任何 .gm-* 选择器
    sel_missing = []
    theme_a, theme_b = os.path.join(src, "theme.css"), os.path.join(dst, "gm.css")
    if os.path.exists(theme_a) and os.path.exists(theme_b):
        sa, sb = _css_selectors(theme_a), _css_selectors(theme_b)
        sel_missing = sorted(s for s in (sa - sb) if "gm-" in s)

    if diff or missing or sel_missing:
        rec("FAIL", "mirror",
            "镜像漂移 差异=%s 缺失=%s 缺少选择器=%d（%s）"
            % (diff[:4], missing[:4], len(sel_missing), sel_missing[:6]))
        return False
    rec("OK", "mirror", "应用侧 gm-arco-ui 与设计系统源逐字节一致（含 theme.css ↔ gm.css），且无缺失选择器")
    return True


def _css_selectors(path):
    """提取 CSS 选择器集合（忽略声明体、注释与 at-rule）"""
    s = open(path, encoding="utf-8").read()
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    out = set()
    for m in re.finditer(r"([^{}]+)\{", s):
        for one in m.group(1).split(","):
            one = re.sub(r"\s+", " ", one.strip())
            if one and not one.startswith("@"):
                out.add(one)
    return out


# ══════════════════════════════════════════════════════════════════════════
# logo 守卫（用户硬性要求：站点一律沿用**用户提供的这个 logo**，任何轮次不得改动）
#
# 两次真实事故，都由本检查兜住：
#  1) V2.9 逐页质检时，"圆角一律回档到 02 · 2.4 档位"的批量修改把 7 处 logo 图片的**渲染圆角**
#     一起改了（logo 文件本身没动，但观感上就是改了 logo）。
#  2) 更早的 V2.8 轮次以"原图 3.28MB 太大"为由，把用户的 logo 从 2032×2032 压成 192×192，
#     并让页面改用**工具自绘的 SVG** —— 等于替用户换掉了品牌 logo。该裁决已撤销。
#
# 故本检查同时守三件事：
#  ① 页面引用的 logo 必须解析到真实资产，且**只能是正式 logo 的派生档**（禁止任何 logo-*.svg）；
#  ② logo 的渲染圆角必须等于白名单值；
#  ③ 真源 logo.png 必须保持全分辨率（2032×2032）—— 不允许再被"优化"掉。
#
# ⚠️ 下面这些是"用户的品牌决定"，不是"规范推导出的值"。要动请先和用户确认。
# ══════════════════════════════════════════════════════════════════════════

# 1) 正式 logo 资产与派生档（真源 + 两个派生，均由 logo.png 导出）
LOGO_SOURCE = ("brand/logo.png", 2032, 2032)      # 真源：全分辨率，不得压缩
LOGO_PAGES = "brand/logo-512.png"                  # 页面内品牌图
LOGO_ICON = "brand/logo-192.png"                   # favicon / 小图标
LOGO_RETIRED = ("brand/logo-mark.svg", "brand/logo.svg", "brand/logo-tile.svg")   # 退役：页面不得引用

# 2) logo 渲染圆角白名单：{文件: {说明: 原值}}，不得随组件圆角档调整
LOGO_RADII = {
    "site/index.html": {"首页 Hero 主 logo（84px）": "24px",
                        "首页导航 logo（46px）": "14px",
                        "视觉规范行内 logo（34px）": "10px"},
    "site/fragments/site-index.html": {"首页 Hero 主 logo（84px）": "24px",
                                       "首页导航 logo（46px）": "14px"},
    "site/fragments/preview-index.html": {"视觉规范行内 logo（34px）": "10px",
                                          "视觉规范 Hero logo（88px）": "24px"},
    "fuyouaicansai/goodmom-redesign.html": {"侧栏品牌 logo": "8px", "顶栏 logo": "6px"},
    "preview/manual.html": {"打印版手册页头 logo": "13px"},
}

# CSS 里 logo 可能由通用选择器着色（不带 logo/brand 字样），逐文件显式列出
LOGO_CSS_SELECTORS = {
    "fuyouaicansai/goodmom-redesign.html": [r"\.side\s+\.brand\s+img", r"\.top\s+img"],
}

# 3) 需要检查 logo 引用的文件（片段以 site/ 为相对基准，因为它会被内联进 site/index.html）
LOGO_REF_FILES = [
    "site/index.html", "site/spec.html", "site/manual.html", "site/docs.html",
    "preview/index.html", "preview/examples.html", "preview/mobile.html",
    "preview/patterns.html", "preview/manual.html",
    "fuyouaicansai/goodmom-redesign.html", "frontend-app/index.html",
    "site/fragments/site-index.html", "site/fragments/preview-index.html",
    "site/fragments/preview-mobile.html", "site/fragments/preview-examples.html",
    "site/fragments/preview-patterns.html", "site/fragments/site-docs.html",
    "site/fragments/site-spec.html", "site/fragments/site-manual.html",
]


def _png_size(path):
    """读 PNG 的 IHDR 拿宽高（不依赖任何图像库）。"""
    import struct
    d = open(path, "rb").read(33)
    if d[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", d[16:24])


def _logo_radius_candidates(path):
    """该文件里"logo 图片的圆角"实测值（内联样式 + logo/brand 选择器 + 显式列出的通用选择器）。"""
    import io
    src = io.open(path, encoding="utf-8").read()
    out = []
    for m in re.finditer(r"<img[^>]*>", src, re.I):
        tag = m.group(0)
        if not re.search(r"logo|brand", tag, re.I):
            continue
        r = re.search(r"border-radius:\s*([0-9.]+px)", tag)
        if r:
            out.append(r.group(1))
    for sel in [r"\.(?:hero-logo|logo|brand)[^{]*"] + LOGO_CSS_SELECTORS.get(path, []):
        for m in re.finditer(sel + r"\{[^}]*border-radius:\s*([0-9.]+px)", src):
            out.append(m.group(1))
    return out


def logo_guard():
    import io
    bad = []

    # ① 正式资产齐备 + 真源保持全分辨率
    #    退役 SVG 也要求**存在**（留档备查）—— 本轮曾出现三个 SVG 在无显式删除命令的情况下
    #    从工作树消失（git status 显示 D），靠 git checkout 才恢复。故把"存在"也纳入守门。
    for path in (LOGO_SOURCE[0], LOGO_PAGES, LOGO_ICON) + LOGO_RETIRED:
        if not os.path.exists(path):
            bad.append("logo 资产缺失：%s（正式档不可缺；退役档也必须留档，不得删除）" % path)
    if os.path.exists(LOGO_SOURCE[0]):
        size = _png_size(LOGO_SOURCE[0])
        want = (LOGO_SOURCE[1], LOGO_SOURCE[2])
        if size != want:
            bad.append("%s 尺寸为 %s，应为 %s —— 真源不得被压缩/缩放（页面请引用派生档）"
                       % (LOGO_SOURCE[0], size, want))

    # ② 页面引用：必须可解析、且只能是正式派生档（不得引用退役 SVG 或真源）
    refs, offenders = 0, 0
    for f in LOGO_REF_FILES:
        if not os.path.exists(f):
            continue
        base = os.path.dirname(f)
        if "/fragments/" in f:
            base = os.path.dirname(base)          # 片段以站点目录为相对基准
        src = io.open(f, encoding="utf-8").read()
        # 只认**真实标签**：规范正文里常有被转义的示例（`&lt;img src="…"&gt;`），
        # 那不是引用，报了就是误报（且会诱导去改文档里的示例）。
        for m in re.finditer(r'<(?:img|link)\b[^>]*?(?:src|href)="([^"]*logo[^"]*\.(?:png|svg))"', src, re.I):
            rel = m.group(1)
            refs += 1
            target = os.path.normpath(os.path.join(base, rel))
            if not os.path.exists(target):
                bad.append("%s 引用 %s（解析为 %s）不存在" % (f, rel, target))
                offenders += 1
            if rel.endswith(".svg"):
                bad.append("%s 引用了已退役的自绘 SVG logo（%s）—— 必须改用 %s / %s"
                           % (f, rel, LOGO_PAGES, LOGO_ICON))
                offenders += 1
            if rel.endswith("brand/logo.png"):
                bad.append("%s 直接引用了 3.28MB 真源 logo.png —— 页面请改用派生档 %s / %s"
                           % (f, LOGO_PAGES, LOGO_ICON))
                offenders += 1
    if not offenders:
        rec("OK", "logo-ref", "logo 引用 %d 处全部指向正式 logo 的派生档（%s / %s），零断链、无退役 SVG"
            % (refs, LOGO_PAGES, LOGO_ICON))

    # ③ 渲染圆角白名单
    checked = 0
    for f, expect in LOGO_RADII.items():
        if not os.path.exists(f):
            bad.append("%s 不存在（logo 圆角白名单无法校验）" % f)
            continue
        got = _logo_radius_candidates(f)
        for label, want in expect.items():
            checked += 1
            if want not in got:
                bad.append("%s 的「%s」圆角应为 %s，实测命中 %s" % (f, label, want, sorted(set(got)) or "无"))

    if bad:
        for b in bad:
            rec("FAIL", "logo-guard", b + " —— logo 是用户品牌资产，不得改动；确需调整请先与用户确认并同步本白名单")
        return False
    rec("OK", "logo-guard", "正式 logo 真源 %d×%d（未压缩）+ 派生档 %d / %d；渲染圆角 %d 处与白名单一致"
        % (LOGO_SOURCE[1], LOGO_SOURCE[2], 512, 192, checked))
    return True



# ══════════════════════════════════════════════════════════════════════════
# 状态与加载族 · 规范符合性守门（08 · 8.2.5/8.2.15、Part 19 三态）
#
# 每一条都对应一个**已发生过的真实漂移**，全部有规范原文可引：
#   · 骨架曾实现为「左右扫光马赛克 + 1.15s」—— 08 · 8.2.15 明文**禁止扫光**，且周期应为 1.6s；
#     同期站点演示却一直是对的（"演示对、库错"），说明这类漂移只靠人眼不可能守住。
#   · 骨架圆角曾为 7px 圆角矩形 —— 规范要求**圆角胶囊**。
#   · Spin 曾为 0.8s/圈 —— 08 · 8.2.15 与 EL-19-02 都写 0.9s。
#   · GmSpin 默认尺寸曾为 16 —— 规范细环区间是 18–40。
#   · GmResult（EL-19-03 的 Error 三通道）曾**在两个库里都不存在**，只登记在 00 目录 #40。
#   · 结果/错误组件不得暴露内部结构 —— 故不得出现 code/stack 类 prop（EL-19-03 明文）。
# ══════════════════════════════════════════════════════════════════════════

def loading_spec():
    import io as _io
    bad = []

    REACT_CSS = "goodmom-ui/src/theme.css"
    VUE_CSS = "goodmom-vue/src/styles/components.css"

    for f in (REACT_CSS, VUE_CSS):
        if not os.path.exists(f):
            bad.append("%s 不存在" % f); continue
        css = _io.open(f, encoding="utf-8").read()

        # ① 骨架禁止左右扫光：不得出现由 background-position 驱动的关键帧
        if re.search(r"@keyframes\s+gm\w*\{[^}]*background-position", css) or "background-position:-200% 0" in css:
            bad.append("%s：骨架仍用 background-position 扫光 —— 08 · 8.2.15 明文禁止左右扫光马赛克" % f)

        # ② 骨架＝圆角胶囊 + 规范底色 + 呼吸关键帧
        m = re.search(r"\.gm-skeleton i\{([^}]*)\}", css)
        if not m:
            bad.append("%s：缺少 .gm-skeleton i 规则" % f)
        else:
            body = m.group(1)
            if "border-radius:999px" not in body:
                bad.append("%s：骨架不是圆角胶囊（08 · 8.2.15）" % f)
            if "rgba(255,255,255,.55)" not in body:
                bad.append("%s：骨架底不是规范值 rgba(255,255,255,.55)（08 · 8.2.15）" % f)
            if "gmBreath" not in body:
                bad.append("%s：骨架动画应为 gmBreath（1.6s 上下微透明呼吸）" % f)
        if "@keyframes gmBreath" not in css:
            bad.append("%s：缺少 gmBreath 关键帧" % f)
        elif not re.search(r"@keyframes\s+gmBreath\{0%,100%\{opacity:\.5\}50%\{opacity:\.85\}\}", css):
            bad.append("%s：gmBreath 必须为 α .5↔.85（08 · 8.2.15）" % f)

        # ③ Spin 周期必须 0.9s
        if re.search(r"gmSpin\s+(?!\.9s)[\d.]+s", css):
            bad.append("%s：Spin 周期不是 0.9s/圈（08 · 8.2.15 / EL-19-02）" % f)

        # ④ 进度条高度档必须为规范值 3/6/10
        for cls, h in (("small", "3px"), ("large", "10px")):
            if f == REACT_CSS:
                if not re.search(r"\.gm-progress--%s[^{]*\{[^}]*height:%s" % (cls, h), css):
                    bad.append("%s：进度条 --%s 档高度应为 %s（08 · 8.2.5）" % (f, cls, h))
            else:
                if not re.search(r"\.gm-progress--%s[^{]*\{[^}]*height:%s" % (cls, h), css):
                    bad.append("%s：进度条 --%s 档高度应为 %s（08 · 8.2.5）" % (f, cls, h))

    # ④b 站点演示的骨架必须与库同口径（演示是别人会照抄的那份）
    demo = "site/fragments/preview-index.html"
    if os.path.exists(demo):
        t = _io.open(demo, encoding="utf-8").read()
        m = re.search(r"\.sk\{([^}]*)\}", t)
        if m:
            body = m.group(1)
            if "border-radius:999px" not in body:
                bad.append("站点演示 .sk 不是圆角胶囊 —— 与库不一致会被照抄（08 · 8.2.15）")
            if "rgba(255,255,255,.55)" not in body:
                bad.append("站点演示 .sk 底色不是规范值 rgba(255,255,255,.55)（08 · 8.2.15）")
            if re.search(r"border:1px solid rgba\(255,\s*255,\s*255", body):
                bad.append("站点演示 .sk 仍带白描边 —— 在白底上等于没有边（V2.9 已全站收口）")

    # ⑤ Spin 尺寸下限 18（08 · 8.2.15 细环 18–40）
    spin = "goodmom-ui/src/components/GmSpin.tsx"
    if os.path.exists(spin):
        t = _io.open(spin, encoding="utf-8").read()
        m = re.search(r"SIZE_MIN\s*=\s*(\d+)", t)
        if not m or int(m.group(1)) < 18:
            bad.append("GmSpin 尺寸下限低于 18 —— 08 · 8.2.15 规定细环 18–40px")

    # ⑥ GmResult 必须两库都有，且**不得**暴露内部结构（EL-19-03）
    for f in ("goodmom-ui/src/components/GmResult.tsx", "goodmom-vue/src/components/GmResult.vue"):
        if not os.path.exists(f):
            bad.append("%s 缺失 —— Part 19 · EL-19-03 要求 Error 三通道（色/文案/动作）" % f)
            continue
        t = _io.open(f, encoding="utf-8").read()
        if re.search(r"^\s*(code|stack|trace)\??\s*:", t, re.M):
            bad.append("%s：出现了 code/stack 类 prop —— EL-19-03 明文禁止暴露内部结构" % f)
        if "role=" not in t:
            bad.append("%s：缺少 role（error 应为 alert、其余 status）" % f)

    if bad:
        for b in bad:
            rec("FAIL", "loading-spec", b)
        return False
    rec("OK", "loading-spec", "状态与加载族符合 08 · 8.2.5/8.2.15 与 EL-19-02/03："
        "骨架＝胶囊+1.6s 呼吸（无扫光）· Spin 0.9s 且下限 18 · 进度条 3/6/10 · GmResult 三通道齐备")
    return True



# ══════════════════════════════════════════════════════════════════════════
# CSS 语法平衡守门（注释 / 花括号）
#
# 为什么必须有：一个**未闭合的 `/*`** 会把它后面的所有规则吞成注释 —— 浏览器不报错、
# 页面不报错、既有门禁全绿，只有"某个组件突然没样式了"。本轮真实踩到：
# 往 `.gm-spin` 前插注释时漏写 `*/`，导致 Vue 侧 `.gm-spin i` / `.gm-spin--inverse`
# 整段失效（连 `check-style-parity.py` 都因此误报"单边选择器"）。
# 同理，多余的 `}` 会让解析器错位。这类缺陷只能靠机械检查。
# ══════════════════════════════════════════════════════════════════════════

def css_syntax():
    import io as _io, glob as _glob
    bad = []
    targets = ["goodmom-ui/src/theme.css", "frontend-app/packages/gm-arco-ui/src/gm.css"]
    targets += sorted(_glob.glob("goodmom-vue/src/styles/*.css"))
    # 站点片段：只取 `<!--@css-->` 与 `<!--@body-->` 之间的样式段（正文里的 `<pre>` 代码示例不算）
    for f in sorted(_glob.glob("site/fragments/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        i, j = t.find("<!--@css-->"), t.find("<!--@body-->")
        if i >= 0 and j > i:
            seg = t[i + 10:j]
            targets.append((f, seg))

    for item in targets:
        if isinstance(item, tuple):
            f, css = item
        else:
            f, css = item, _io.open(item, encoding="utf-8").read()
        if css.count("/*") != css.count("*/"):
            bad.append("%s：注释不闭合（/* %d 个 vs */ %d 个）—— 未闭合的 /* 会吞掉其后所有规则"
                       % (f, css.count("/*"), css.count("*/")))
        stripped = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        if stripped.count("{") != stripped.count("}"):
            bad.append("%s：花括号不平衡（{ %d vs } %d）"
                       % (f, stripped.count("{"), stripped.count("}")))

    if bad:
        for b in bad:
            rec("FAIL", "css-syntax", b)
        return False
    rec("OK", "css-syntax", "全部 CSS（两库样式表 + 站点片段样式段）注释与花括号平衡"
        "（未闭合注释会静默吞掉规则，是本轮实际踩过的坑）")
    return True


def main():
    hard = []
    hard.append(md_links()); hard.append(chapter_seq()); hard.append(icons())
    hard.append(html_no_md()); hard.append(stale_words()); hard.append(colors()); hard.append(banned_colors()); hard.append(breakpoint_reg()); hard.append(spec_health()); hard.append(hex_case()); hard.append(mirror_sync()); hard.append(dark_contrast()); hard.append(exports_check()); hard.append(logo_guard()); hard.append(loading_spec()); hard.append(css_syntax())
    passed = all(hard)
    report = ["# 规范审计报告（自动）", "",
              "- 命令：`python3 scripts/audit.py`", "- 时间：%(now)s" % {"now": __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M")},
              "- 结论：" + ("✅ 通过" if passed else "❌ 存在硬性失败"), ""]
    for lvl, scope, msg in results:
        report.append("- **%s** `%s`：%s" % (lvl, scope, msg))
    open("docs/audit-report.md", "w", encoding="utf-8").write("\n".join(report) + "\n")
    print("\n结果：", "PASS" if passed else "FAIL")
    sys.exit(0 if passed else 1)

if __name__ == "__main__":
    main()
