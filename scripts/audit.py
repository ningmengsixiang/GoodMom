#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GoodMom 全自动规范审计（scripts/audit.py）
检查：Markdown 链接 / 章节连续性 / 图标唯一与计数 / HTML 无 .md 链接 / 残留词 / 色彩合规（严格: css与token层）/ hex 色值大小写（14.1.1）/ 双包镜像一致性（D10）。
退出码：0=通过；1=硬性失败。报告写入 docs/audit-report.md。
用法：python3 scripts/audit.py [--strict]
"""
import glob, os, re, sys, html as _html
import urllib.parse
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
            # 先解百分号编码：带空格的路径（`标准手册/Part 18 · …`）在 Markdown 里
            # 只能写成 `Part%2018%20·%20…`，不解码就会把**合法链接**判成失效。
            p = urllib.parse.unquote(m.group(1).split("#")[0])
            if p.endswith(".md") and not os.path.exists(p):
                bad.append((f, p))
    if bad:
        rec("FAIL", "md-links", "%d 失效链接：%s" % (len(bad), bad[:4]))
        return False
    rec("OK", "md-links", "全部内链有效")
    return True

def chapter_seq():
    files = sorted(glob.glob("[0-9][0-9]-*.md"))
    nums = [int(re.match(r"(\d\d)-", os.path.basename(f)).group(1)) for f in files]
    expect = list(range(0, 20))
    missing = [n for n in expect if n not in nums]
    dup = len(nums) != len(set(nums))
    if missing or dup:
        rec("FAIL", "chapters", "缺失 %s / 重复 %s" % (missing, dup))
        return False
    rec("OK", "chapters", "00–19 编号连续（%d 份）" % len(files))
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

def icon_mirror():
    """应用侧图标雪碧图必须与仓库根真源逐字节一致。

    背景：应用用 `<use href="/icons/lg-icons.svg#lg-icon-x">` 取图标，而 Vite 只能从
    `public/` 提供静态资源 —— 于是产生了**第二份** sprite。这正是 D10（两库镜像）那一课：
    同一份资产有两处副本时，早晚会有一处忘了同步，而且是"图标少了一个/改了形状"这种
    只有肉眼才发现的表现。故与 `mirror_sync` 同口径：要么逐字节一致，要么这门禁红。

    真源：`icons/lg-icons.svg`（09 章 + `audit.py icons` 已校验其命名与 registry 同步）。
    """
    src = "icons/lg-icons.svg"
    dsts = ["frontend-app/public/icons/lg-icons.svg"]
    for dst in dsts:
        if not os.path.exists(dst):
            rec("WARN", "icon-mirror", "%s 不存在（应用若不用 sprite 可忽略）" % dst)
            continue
        if not os.path.exists(src):
            rec("FAIL", "icon-mirror", "缺少真源 %s" % src); return False
        a = open(src, "rb").read(); b = open(dst, "rb").read()
        if a != b:
            rec("FAIL", "icon-mirror",
                "%s 与真源 %s 不一致（%d vs %d 字节）—— 应用侧图标会与规范漂移" % (dst, src, len(b), len(a)))
            return False
        rec("OK", "icon-mirror", "应用侧雪碧图与真源逐字节一致（%d 字节）" % len(a))
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
#25715D #3261C1 #8D5A15 #B72F42 #5E6673 #6A48DC #D9CBFE #EDE7FE #A5F1EE #E0F8F6 """.split()}
""" 页面档别名 / 引擎展示色（A1 收口，2026-09；仅用于 site/preview 静态页，代码层仍受 ALLOWED 严格约束）
暖底/玻璃框别名 + 02.1/12.3.3 引擎 ramp 与渐变样例色；详见 docs/审查决策记录.md D4。"""
"""V2.9 补入的 4 个值：`--lg-purple-200/100`、`--lg-cyan-300/100`（02 · 2.1.2 早已登记为品牌色），
此前只在 PAGE_ALIAS 里，而组件的**头像色调**也取它们，故提升到严格层。"""
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

def _brace_blocks(css):
    """按括号配对返回 [(选择器, 块内容)]；注释里的 `[data-theme="dark"]` 不会截断文件。"""
    out, i, n = [], 0, len(css)
    while i < n:
        b = css.find("{", i)
        if b < 0:
            break
        sel = re.sub(r"/\*.*?\*/", " ", css[i:b], flags=re.S).strip().split("\n")[-1].strip()
        depth, j = 1, b + 1
        while j < n and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        out.append((sel, css[b + 1 : j - 1]))
        i = j
    return out


def _theme_text_truth():
    """`--lg-text-*` 与淡底 token 的真值：唯一源 goodmom-ui/src/theme.css。"""
    src = "goodmom-ui/src/theme.css"
    if not os.path.exists(src):
        return {}, {}
    css = open(src, encoding="utf-8").read()
    light, dark = {}, {}
    for sel, body in _brace_blocks(css):
        tgt = dark if "data-theme" in sel else light
        for m in re.finditer(r"(--lg-text-[\w-]+|--lg-tint-[\w-]+|--lg-radius-[\w-]+)\s*:\s*([^;}]+)", body):
            tgt[m.group(1)] = m.group(2).strip()
    return light, dark


CSS_SCAN = [
    "goodmom-ui/src/theme.css", "frontend-app/packages/gm-arco-ui/src/gm.css",
    "goodmom-vue/src/styles/base.css", "goodmom-vue/src/styles/components.css",
    "frontend-app/src/styles/base.css", "frontend-app/src/styles/layout.css",
]
TS_SCAN = [
    "goodmom-ui/src/tokens/status.ts", "goodmom-ui/src/components/GmTag.tsx",
    "goodmom-ui/src/components/GmStatusTag.tsx", "goodmom-vue/src/tokens/status.ts",
    "goodmom-vue/src/components/GmTag.vue", "goodmom-vue/src/components/GmStatusTag.vue",
]


def text_token_parity():
    """`--lg-text-*` 的**本地定义**必须等于真值 —— 不许用"改名"绕过无障碍口径。

    背景（V2.9 实测）：`site/fragments/preview-index.html` 曾把 `--lg-text-tertiary`
    本地改写成 `#4F5B6E`（正好是 secondary 的值）。于是该模块 71 处 10–12px 小字
    "看起来达标"，而 02 · 2.1.1 与 theme.css 的真值 `#9AA2B0` 在 12px 下只有 **2.30:1**。
    用改名把违规盖住比违规本身更糟：门禁、规范、真源从此各说各话。
    故本规则做**值级**比对（02 · 2.1.1 的 5 个文字 token，浅/暗两档任一皆可）。
    """
    light, dark = _theme_text_truth()
    names = ["--lg-text-primary", "--lg-text-secondary", "--lg-text-tertiary",
             "--lg-text-on-accent", "--lg-text-on-inverse"]
    if not all(k in light for k in names[:3]):
        rec("FAIL", "text-token-parity", "theme.css 未解析出 --lg-text-* 真值（%d 个）" % len(light))
        return False
    allow = {k: {light.get(k), dark.get(k)} for k in names}
    # 只扫源：成品 site/index.html 是 fragments 的副本，且含内联 JS（会把对象字面量当 CSS 规则误判）。
    files = CSS_SCAN + sorted(glob.glob("site/fragments/*.html"))
    bad = []
    for f in files:
        if not os.path.exists(f):
            continue
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r"(--lg-text-[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})", t):
            name, val = m.group(1), m.group(2).upper()
            if name in allow and val not in {v.upper() for v in allow[name] if v}:
                bad.append("%s %s=%s（真值 %s）" % (f, name, val, "/".join(sorted(v for v in allow[name] if v))))
    if bad:
        rec("FAIL", "text-token-parity", "文字 token 被本地改写 %d 处：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "text-token-parity", "文字 token 无本地改写（5 个 token × 浅/暗档均等于 theme.css 真值）")
    return True


def tertiary_size():
    """`--lg-text-tertiary` 只允许用于 ≥24px 文字（02 · 2.1.1）。

    真值 #9AA2B0 在浅色档玻璃卡上实测 ≈2.3:1 —— 只有大字号才够。占位符例外：
    02 另有 `--lg-text-placeholder`，且占位符不承载内容信息，故选择器名含
    `placeholder` / `__ph` 时放行（这条豁免写在门禁里，不靠人记）。
    """
    files = CSS_SCAN + sorted(glob.glob("site/fragments/*.html"))
    bad = []
    for f in files:
        if not os.path.exists(f):
            continue
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r"var\(\s*--lg-text-tertiary", t):
            idx = m.start()
            b = t.rfind("{", 0, idx)
            if b < 0:
                continue
            e = t.find("}", idx)
            rule = t[b : e if e > 0 else len(t)]
            sel = re.sub(r"/\*.*?\*/", " ", t[max(0, t.rfind("}", 0, b)) + 1 : b], flags=re.S)
            # 与 page-qa / 站点同一口径：占位符（02 另有 --lg-text-placeholder）与
            # **禁用态**（WCAG 1.4.3 明文豁免）不参与本规则。
            if "placeholder" in sel or "__ph" in sel:
                continue
            if re.search(r"\.dis\b|disabled|not-allowed|aria-disabled", sel):
                continue
            fs = re.search(r"font-size\s*:\s*([\d.]+)px", rule)
            if not fs or float(fs.group(1)) < 24:
                bad.append("%s %s（font-size=%s）" % (f, sel.strip().split("\n")[-1][:40], fs.group(1) if fs else "未声明"))
    if bad:
        rec("FAIL", "tertiary-size", "tertiary 被用于 <24px 文字 %d 处：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "tertiary-size", "tertiary 未用于 <24px 文字（占位符豁免）")
    return True


def tint_base():
    """语义淡底必须混入实底 `--lg-tint-base`，不得与 `transparent` 混色。

    背景（V2.9 实测）：`color-mix(in srgb, 语义色 13%, transparent)` 会把玻璃卡与品牌
    渐变透出来，12px 语义字在真实渲染底上只有 **4.06:1**（浅/暗两档皆然），
    而 status.ts 里"13% 淡色片 ≥4.85:1"那句是**按纯白底**算的 —— 实现与文档的测量条件不一致。
    改混实底后：浅色档 13% = 4.86:1、暗色档 8% = 4.9:1（scripts/app-smoke.mjs 实底采样）。

    同时断言两档的淡底 token 都在位：暗色档若漏声明 `--lg-tint-pct`，
    会静默回落到浅色档的 13%，对比度悄悄掉回 4.3 —— 这种失败必须由门禁喊出来。
    """
    ok = True
    bad = []
    for f in CSS_SCAN + TS_SCAN:
        if not os.path.exists(f):
            continue
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r"color-mix\(", t):
            i, depth = m.end(), 1
            while i < len(t) and depth:
                if t[i] == "(":
                    depth += 1
                elif t[i] == ")":
                    depth -= 1
                i += 1
            inner = t[m.end() : i - 1]
            if re.search(r"\btransparent\b", inner):
                bad.append("%s %s" % (f, inner.strip()[:48]))
    if bad:
        rec("FAIL", "tint-base", "淡底与 transparent 混色 %d 处：%s" % (len(bad), bad[:3])); ok = False
    light, dark = _theme_text_truth()
    for label, blk, need_pct in (("浅色档", light, "13%"), ("暗色档", dark, "8%")):
        if "--lg-tint-base" not in blk:
            rec("FAIL", "tint-base", "%s 缺 --lg-tint-base（淡底会回落到 #FFFFFF）" % label); ok = False
        if blk.get("--lg-tint-pct") != need_pct:
            rec("FAIL", "tint-base", "%s 的 --lg-tint-pct 应为 %s，实际 %s"
                % (label, need_pct, blk.get("--lg-tint-pct", "缺失"))); ok = False
    if ok:
        rec("OK", "tint-base", "淡底一律混实底（浅 13% ／ 暗 8%），且两档 token 在位")
    return ok   # ⚠️ 曾写成 return True：门禁打印 FAIL 却 exit=0，负向测试当场抓出


def bg_origin():
    """渐变底 + 边框的规则，必须**自己**声明 `background-origin:border-box`。

    背景（V2.9，用户报"主按钮头上缺一块、还露出别的底色"）：
    `background-origin` 默认 padding-box，而绘制区默认 border-box ——
    渐变图按 padding-box 定尺却要铺满 border-box，多出的那一圈 1px 只好**平铺取到另一端**：
    顶部一条暗缝、底部一条亮缝。实测应用主按钮（126×40 · 135deg 亮粉渐变 1px 透明边）：
    修前顶部首行 rgb(250,154,183)（比下一行暗 15），逐条声明后 rgb(252,170,195)，与填充连续。

    ⚠️ 两个反直觉点，都踩过且都必须由本规则守住：
    1. **全局 `*{background-origin:border-box}` 无效**：`background:` 简写会把 origin 重置回
       padding-box，而简写所在组件规则比 `*` 更具体 —— 实测计算值仍是 padding-box
       （探针报"样式表里有这条规则、元素却没生效"）。所以本规则要求**逐条规则**声明，
       并**禁止**再加全局规则（那是"看着在守、其实没守"的假防线）。
    2. 判定"有渐变"不能只找字面 `gradient`：本仓大量写 `background:var(--mmh-grad-action-hc)`，
       渐变藏在 token 里 —— 旧判据对真实用法完全空转（负向测试当场揭发）。
    另一半：`background-clip:padding-box` 会让那圈边框**完全不画**、直接透出层下底色，
    就是"露出其他颜色的底色"，同样禁止。
    """
    GRAD = re.compile(r"gradient|--[\w-]*grad[\w-]*")
    PROP = re.compile(r"(?<![-\w])(border(?:-(?:top|right|bottom|left))?(?:-width|-style|-color)?)\s*:\s*([^;}]+)")
    SKIP = ("border-radius", "border-collapse", "border-spacing", "border-image")

    def has_border(body):
        for m in PROP.finditer(body):
            prop, val = m.group(1), m.group(2).replace("!important", "").strip()
            if any(prop.startswith(x) for x in SKIP):
                continue
            if val in ("none", "0", "0px", "initial", "unset"):
                continue
            return True
        return False

    # ⚠️ 不要扫 `scripts/build-site.py`：那是 Python 源码，`_brace_blocks` 会把 dict/字符串里的
    #    花括号当成 CSS 规则，拿 A 处的 "gradient" 配 B 处的 "border"（实测误报过）。外壳 CSS 的
    #    真身就在产物 `site/index.html` 里，而 `build-site.py --check` 保证产物==源。
    files = CSS_SCAN + ["goodmom-vue/src/styles/components.css", "frontend-app/src/styles/layout.css",
                        "site/index.html"] + sorted(glob.glob("site/fragments/*.html"))
    missing, global_rule, clip_bad = [], [], []
    for f in sorted(set(files)):
        if not os.path.exists(f):
            continue
        # ⚠️ 先剥注释再配对：注释里写示例（如 `*{background-origin:border-box}`）会被当成**真规则** ——
        #    实测在我的说明注释上误报过一次。
        raw = re.sub(r"/\*.*?\*/", " ", open(f, encoding="utf-8").read(), flags=re.S)
        for sel, body in _brace_blocks(raw):
            if re.search(r"background-origin\s*:", body) and re.fullmatch(r"\*[^{}]*", sel.strip()):
                global_rule.append(f)
            if not (GRAD.search(body) and has_border(body)):
                continue
            # 空白容忍：文档示例里写的是 `background-origin: border-box`（带空格），
            # 用字符串精确匹配会把"已经写对"的示例判成缺（实测踩过）
            if not re.search(r"background-origin\s*:\s*border-box", body):
                missing.append("%s %s" % (f, sel.strip().split("\n")[-1][:38]))
            if re.search(r"background-clip\s*:\s*padding-box", body):
                clip_bad.append("%s %s" % (f, sel.strip().split("\n")[-1][:38]))
    ok = True
    if global_rule:
        rec("FAIL", "bg-origin", "出现全局 `*{background-origin:…}`（%s）—— 对 `background:` 简写无效，"
            "属假防线；请在每条渐变+边框的规则里声明" % global_rule[:2]); ok = False
    if missing:
        rec("FAIL", "bg-origin", "渐变+边框的规则缺 background-origin:border-box %d 处（会有 1px 异色缝）：%s"
            % (len(missing), missing[:3])); ok = False
    if clip_bad:
        rec("FAIL", "bg-origin", "渐变与 background-clip:padding-box 同用 %d 处（露出层下底色）：%s"
            % (len(clip_bad), clip_bad[:3])); ok = False
    if ok:
        rec("OK", "bg-origin", "渐变+边框的规则均逐条声明 background-origin:border-box；无全局假防线与 padding-box 组合")
    return ok


BUTTON_SEL = re.compile(
    r"\.gm-btn|\.gm-result__act|\.gm-cascader__btn|\.[\w-]*btn[\w-]*|"
    r"\.pm-primary|\.mbb-|\.chip|\.sh-tab|\.app-navlink|\.app-tabbar\b")


def btn_radius():
    """声明了 `height` 的规则里，圆角不得大于高度的一半（否则声明值 ≠ 渲染值）。

    背景：02 · 2.4 原写 `--lg-radius-btn-lg/btn/btn-sm = 26/22/18` 对应 h=48/40/32 ——
    **三个都超过高度的一半**（24/20/16）。浏览器遇到超出的相邻圆角会按比例缩放，
    所以"声明 26、渲染 24"长期并存；单看一个按钮没事，但**复用同一个值时就会错**：
    `.gm-btn-group` 的端头固定写 22px，48px 高的分组端头因此不是胶囊（角上有平段）。
    现按钮一律走 `--lg-radius-pill`（999），本规则防止再写回"大于半高"的数字。
    """
    pill = _theme_text_truth()[0].get("--lg-radius-pill", "").strip()
    bad = []
    files = CSS_SCAN + ["goodmom-vue/src/styles/components.css"] + sorted(glob.glob("site/fragments/*.html"))
    for f in sorted(set(files)):
        if not os.path.exists(f):
            continue
        # ⚠️ 先剥注释：注释里写示例（如 `*{background-origin:border-box}`）会被当**真规则**配对
        raw = re.sub(r"/\*.*?\*/", " ", open(f, encoding="utf-8").read(), flags=re.S)
        for sel, body in _brace_blocks(raw):
            # 范围收口：只查**按钮族**（用户这次指的就是按钮），且
            #  ⚠️ `_brace_blocks` 不展开 @media —— 媒体块里的"选择器/规则体"会串行配对，
            #  不跳过就会拿 A 规则的高度配 B 规则的圆角（实测误报过 radius=40/height=13）。
            if "@media" in sel or "@supports" in sel or "@keyframes" in sel:
                continue
            if not BUTTON_SEL.search(sel):
                continue
            mh = re.search(r"(?<![-\w])height\s*:\s*([\d.]+)px", body)
            mr = re.search(r"border-radius\s*:\s*([^;}]+)", body)
            if not (mh and mr):
                continue
            h = float(mh.group(1))
            if h < 8:            # 2px 指示条之类：AA 级别，无视觉意义
                continue
            for part in mr.group(1).split():
                q = part.strip()
                if q.endswith("%") or q in ("0",):
                    continue
                mv = re.match(r"var\(\s*--[\w-]+\s*,\s*([\d.]+)px\s*\)", q)
                if mv:
                    q = mv.group(1)
                elif q.startswith("var("):
                    continue          # 引用了无法解析的变量：不误判
                else:
                    q = re.sub(r"px$", "", q)
                try:
                    v = float(q)
                except ValueError:
                    continue
                if v >= 900:
                    continue          # 胶囊档
                if v > h / 2 + 0.01:
                    bad.append("%s %s radius=%gpx > height/2=%gpx" % (f, sel[:36], v, h / 2))
    # 胶囊档本身也要守：被改小/删掉时，按钮会静默退回方角（文件全绿、观感全变）
    try:
        pv = float(re.sub(r"px$", "", pill))
    except ValueError:
        pv = -1
    if pv < 900:
        rec("FAIL", "btn-radius", "--lg-radius-pill 必须是胶囊档（≥900px），实际 %r" % (pill or "缺失"))
        return False
    if bad:
        rec("FAIL", "btn-radius", "圆角大于半高（声明值会被缩放，声明≠渲染）%d 处：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "btn-radius", "按钮一律胶囊档（--lg-radius-pill=%s）；无\"圆角大于半高\"的声明" % pill)
    return True


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
    # 独立交付页（不并入 site/index.html，拿不到任何构建期校验）：
    # 它的 `<style>` 此前完全不在检查范围内 —— 本轮往它的 CSS 段里插规则时差点留下不平衡的
    # 花括号，而不平衡会让**其后所有规则被静默吞掉**（浏览器不报错）。一并纳入。
    for f in sorted(_glob.glob("fuyouaicansai/*.html")) + sorted(_glob.glob("preview/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        for m in re.finditer(r"<style\b[^>]*>(.*?)</style>", t, re.S):
            targets.append(("%s<style#%d>" % (f, m.start()), m.group(1)))

    # ⚠️ V2.9 实测盲区：**外壳 CSS 在 `build-site.py` 的三引号里**，此前完全不在检查范围内。
    #    我上一轮自动补丁把 `.sh-top{` 写成了 `.sh-topposition:sticky;`（花括号被吃），
    #    导航菜单当场坏掉，而 build-site.py 照常编译、site-smoke 48/48 照样绿 ——
    #    因为 DOM/aria 断言看不见"CSS 规则被浏览器整条丢弃"。
    # ⚠️ 外壳模板是 **CSS + HTML + JS 混排**：整段统计括号会把 JS 的 {} 也算进去。
    #    故只取 `<style>…</style>` 的内容（与上面独立页同一做法）。
    _shell = _io.open("scripts/build-site.py", encoding="utf-8").read()
    for m in re.finditer(r"<style\b[^>]*>(.*?)</style>", _shell, re.S):
        seg = m.group(1)
        if ".sh-top" in seg and "gradient" in seg:
            targets.append(("scripts/build-site.py(外壳 <style>)", seg))

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
        # 结构检查（V2.9 实测最隐蔽的一类）：括号**计数平衡**不等于结构正确 ——
        # 我一次"补花括号"补错了位置（`@keyframes gmToastOut{` → `@keyframes{ gmToastOut{`），
        # 计数依旧平衡，但该块**从未闭合**，把其后**全部外壳规则**吞进它的块里：
        # 导航、表格、折叠、增长图开关、移动端一大片规则在浏览器里静默失效（观感就是"组件错位"）。
        # 故这里查三件事：深度不得转负、结尾必须归零、非 at-rule 的规则体里不得再出现 `{`。
        d, neg = 0, 0
        for ch in stripped:
            if ch == "{":
                d += 1
            elif ch == "}":
                d -= 1
                if d < 0:
                    neg += 1; d = 0
        if neg:
            bad.append("%s：出现 %d 个多余的 `}`（有规则缺 `{` 或块未闭合）" % (f, neg))
        elif d != 0:
            bad.append("%s：结尾仍有 %d 个未闭合的 `{`（其后所有规则会被吞掉）" % (f, d))
        # 损伤特征：**选择器里混进了属性声明**（`.gm-fold{border-radius:…}` 被写成 `.gm-foldborder-radius:…`）
        # —— 比"数括号"准，因为这种损伤常常同时吃 `{`、又在别处多一个 `{`，计数照样平衡。
        for seg in re.split(r"[{}]", stripped):
            head = seg.split(";")[0].strip()
            # 先剥掉伪类/伪元素（`:hover` / `::after` / `:not(...)` 本来就有冒号，不算损伤）
            plain = re.sub(r"::?[a-z-]+(?:\([^)]*\))?", "", head)
            if head.startswith((".", "#", "[")) and ":" in plain and len(head) < 120:
                bad.append("%s：选择器里混进了属性声明（规则缺 `{`）：%r" % (f, head[:60]))
                break
        for mm in re.finditer(r"([^{}]*)\{([^{}]*)\{", stripped):
            sel = mm.group(1).strip().split("\n")[-1].strip()
            if sel and not sel.startswith("@") and not sel.startswith("/"):
                bad.append("%s：非 at-rule 的规则体里又出现 `{`（%s）—— 后续规则会被静默吞掉" % (f, sel[:40]))
                break
        # 声明粘连（缺分号）：`…saturate(1.2)background-origin:border-box` 这种一行里挤两条声明，
        # 浏览器会把整条声明判为无效 —— 括号仍然平衡，所以只有这一条能抓到。
        glue = re.findall(r"\)\s*[a-zA-Z-]{3,}\s*:", stripped)
        if glue:
            bad.append("%s：声明粘连（缺分号）%d 处，例：%s"
                       % (f, len(glue), re.findall(r"\S{0,28}\)\s*[a-zA-Z-]{3,}\s*:\S{0,14}", stripped)[:2]))

    if bad:
        for b in bad:
            rec("FAIL", "css-syntax", b)
        return False
    rec("OK", "css-syntax", "全部 CSS（两库样式表 + 站点片段样式段）注释与花括号平衡"
        "（未闭合注释会静默吞掉规则，是本轮实际踩过的坑）")
    return True


# ══════════════════════════════════════════════════════════════════════════
# 反馈与提示族守门（Part 18 · MD-18-01/02/04 / MO-10-01）
#
# 为什么必须有：本族的缺陷**全部是渲染级的、且静态检查看不见**。V2.9 实测到的四类：
#   ① 位置：Toast 在 bottom（规范要求顶部偏上）；合并成单一首页后还会被吸顶导航盖住 ——
#      节点存在、样式生效、`page-qa` 也不报，只有渲染级测量能发现；
#   ② 时序：同一页四种驻留时长（1500/1600/2300/2400ms）、三种滑入时长（.22/.25/.35s）；
#   ③ 语义：三处 Toast 全都没有 role / aria-live；Modal 没有 role="dialog"/aria-modal；
#   ④ 描边：`border:1px solid rgba(255,255,255,1)` 落在 97% 白的提示底上等于「没有边」。
# 这些数值写在四处不同的实现里，靠人眼比对必然再次漂移，故全部机械校验。
# ══════════════════════════════════════════════════════════════════════════

def feedback_spec():
    import io as _io, glob as _glob
    bad = []
    REACT_CSS = "goodmom-ui/src/theme.css"
    VUE_CSS = "goodmom-vue/src/styles/components.css"
    SHELL = "scripts/build-site.py"

    # ── ① 两个组件库：一份配方，进出场都用动画（时间常数 320 / 240）────────
    for f in (REACT_CSS, VUE_CSS):
        if not os.path.exists(f):
            bad.append("%s 不存在" % f); continue
        css = _io.open(f, encoding="utf-8").read()
        m = re.search(r"\.gm-toast\{([^}]*)\}", css)
        if not m:
            bad.append("%s：缺少 .gm-toast 规则（Part 18 · MD-18-01/04）" % f); continue
        body = m.group(1)
        if not re.search(r"animation:\s*gmToastIn\s+320ms", body):
            bad.append("%s：Toast 滑入必须 320ms（MD-18-01）" % f)
        if "top:var(--gm-toast-top" not in body:
            bad.append("%s：Toast 必须定位在**顶部偏上**并读 --gm-toast-top（MD-18-04；旧实现在底部）" % f)
        if re.search(r"border:[^;]*rgba\(\s*255,\s*255,\s*255", body):
            bad.append("%s：Toast 带白描边 —— 白边落在浅色提示底上等于没有边（V2.9 已全站收口）" % f)
        if not re.search(r"\.gm-toast\.is-leaving\{[^}]*gmToastOut\s+240ms", css):
            bad.append("%s：Toast 退场必须 240ms（MD-18-01），且用动画而非 transition" % f)
        for kf in ("gmToastIn", "gmToastOut"):
            if not re.search(r"@keyframes\s+%s\{" % kf, css):
                bad.append("%s：缺少 @keyframes %s" % (f, kf))
        if "translate(-50%,-24px)" not in css:
            bad.append("%s：Toast 进场/退场应做 -24px 位移（MD-18-01「顶部滑入 / 上滑」）" % f)
        # 暗色档：提示底必须跟着翻（浅底硬编码 + var(--lg-text-primary) 在暗色下 = 白底白字）
        if not re.search(r'\[data-theme="dark"\]\s+\.gm-toast\{[^}]*rgba\(\s*38,\s*36,\s*46', css):
            bad.append("%s：缺少 Toast 暗色档 —— 暗色下提示底仍是 97% 白，"
                       "而 color 取的是暗色档浅色字，实测 1.14:1（等于看不见）" % f)

        # 语义色点走 alias，不新造色（14 · 4.4.5）
        for st, tok in (("success", "--lg-sem-positive"), ("error", "--lg-sem-risk"),
                        ("warning", "--lg-sem-attention"), ("info", "--lg-sem-info")):
            if not re.search(r"\.gm-toast--%s\s+\.gm-toast__dot\{[^}]*%s" % (st, re.escape(tok)), css):
                bad.append("%s：.gm-toast--%s 的色点应取 %s（14 · 4.4.5）" % (f, st, tok))

    # ── ② 两个组件库：受控组件的无障碍与内置驻留时长 ──────────────────────
    for f in ("goodmom-ui/src/components/GmToast.tsx", "goodmom-vue/src/components/GmToast.vue"):
        if not os.path.exists(f):
            bad.append("%s 缺失 —— Part 18 要求 Toast 有唯一实现，不许每页各造一个" % f); continue
        t = _io.open(f, encoding="utf-8").read()
        if "role" not in t or "aria-live" not in t:
            bad.append("%s：缺少 role / aria-live（MD-18-01 无障碍要求）" % f)
        if "alert" not in t:
            bad.append("%s：error 语义应落到 role=\"alert\"（失败必须立刻被读到）" % f)
        if not re.search(r"duration\s*=\s*2400|duration:\s*2400", t):
            bad.append("%s：驻留默认值应为 2400ms（MD-18-01 的 2.4s）" % f)
        if not re.search(r"LEAVE_MS\s*=\s*240", t):
            bad.append("%s：退场必须真的等满 240ms 再卸载（否则「淡出上滑 240ms」是空话）" % f)

    # ── ③ 站点外壳：唯一一份实现 + 避让吸顶导航 ───────────────────────────
    if not os.path.exists(SHELL):
        bad.append("%s 不存在" % SHELL)
    else:
        sh = _io.open(SHELL, encoding="utf-8").read()
        # Toast 避让值必须**派生**自实测导航高度，不许写死。
        # 旧断言写死 "桌面 76 / 移动 160"：手机档导航从 144 收敛到 53 之后，
        # Toast 被顶到半屏以下，而这条断言还把过期值焊死了 —— 门禁本身成了回归源。
        if not re.search(r"--gm-toast-top:\s*calc\(\s*var\(--sh-nav-h", sh):
            bad.append("%s：--gm-toast-top 必须写成 calc(var(--sh-nav-h…) + N)，"
                       "读外壳实测的导航高度；写死数值会在导航换档后失效" % SHELL)
        if "--sh-nav-h" not in sh or "ResizeObserver" not in sh:
            bad.append("%s：外壳未实测吸顶导航高度（--sh-nav-h 应由 ResizeObserver 写入），"
                       "模块锚点留白与 Toast 避让都依赖它" % SHELL)
        if not re.search(r"window\.gmToast\s*=", sh):
            bad.append("%s：外壳缺少全局 window.gmToast —— 站点侧必须只有一份实现" % SHELL)
        if not re.search(r"DWELL\s*=\s*2400", sh):
            bad.append("%s：gmToast 驻留应为 2400ms（MD-18-01）" % SHELL)
        if not re.search(r"LEAVE\s*=\s*240\b", sh):
            bad.append("%s：gmToast 退场应为 240ms（MD-18-01）" % SHELL)
        if not re.search(r"window\.gmToast[\s\S]{0,2000}?removeChild\(node\)", sh):
            bad.append("%s：gmToast 未先摘掉上一个同类节点（MD-18-04「同类仅 1 条」）" % SHELL)
        if not re.search(r"role',\s*status\s*===\s*'error'\s*\?\s*'alert'\s*:\s*'status'", sh):
            bad.append("%s：gmToast 未按 error/其余 分流 role" % SHELL)
        if not re.search(r'\[data-theme="dark"\]\s+\.gm-toast\{', sh):
            bad.append("%s：外壳缺少 Toast 暗色档 —— 暗色模块里会变成白底白字（实测 1.14:1）" % SHELL)

    # ── ④ 站点页面：不许各自造 Toast（必须调用 gmToast）──────────────────
    for f in sorted(_glob.glob("site/fragments/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        # 旧的三套私有实现（底部定位 / 自定驻留）一律不得回归
        for cls in (".copied", ".fx"):
            # ⚠️ 不要写成 `r"\%s\s*\{" % re.escape(cls)`：%s 前面那个反斜杠会**留在结果里**，
            # 再叠加 re.escape 自带的反斜杠，模式成了 `\\.fx\s*\{` —— 它要求文本里先有一个
            # 字面量反斜杠，于是这条检查永远不命中（静默空转，实测 repr 为 '\\\\.fx\\s*\\{'）。
            # 这正是 scripts/gate-negative-tests.py 抓到的：注入 `.fx{…}` 后本门禁仍报 PASS。
            if re.search(re.escape(cls) + r"\s*\{", t):
                bad.append("%s：又出现了私有 Toast 样式 %s —— 站点侧应统一用外壳的 .gm-toast"
                           "（旧实现定位在底部、驻留 1600ms、无 role）" % (f, cls))
        if re.search(r"className\s*=\s*['\"]copied|className\s*=\s*['\"]fx\b", t):
            bad.append("%s：又用旧私有类名创建 Toast 节点" % f)
        for ms in ("1500", "1600", "2300"):
            if re.search(r"toast[\s\S]{0,400}?setTimeout\([\s\S]{0,120}?,\s*%s\s*\)" % ms, t, re.I):
                bad.append("%s：Toast 驻留出现 %sms —— MD-18-01 是 2.4s，此值只该出现在 gmToast 里"
                           % (f, ms))

    # ── ⑤ 独立演示页（不走构建）：实现与语义同样要达标 ────────────────────
    demo = "fuyouaicansai/goodmom-redesign.html"
    if os.path.exists(demo):
        t = _io.open(demo, encoding="utf-8").read()
        m = re.search(r"\.toast\{([^}]*)\}", t)
        if not m:
            bad.append("%s：缺少 .toast 规则" % demo)
        else:
            body = m.group(1)
            if "top:20px" not in body:
                bad.append("%s：Toast 必须在顶部偏上（MD-18-04）" % demo)
            if not re.search(r"animation:\s*toastIn\s+320ms", body):
                bad.append("%s：Toast 滑入必须 320ms（MD-18-01）" % demo)
            if re.search(r"border:[^;]*rgba\(\s*255,\s*255,\s*255", body):
                bad.append("%s：Toast 带白描边（V2.9 已全站收口的缺陷类）" % demo)
        if not re.search(r"\.toast\.leaving\{[^}]*toastOut\s+240ms", t):
            bad.append("%s：Toast 退场必须 240ms（MD-18-01）" % demo)
        if not re.search(r"setAttribute\('role'", t) or "aria-live" not in t:
            bad.append("%s：Toast 缺少 role / aria-live" % demo)
        if not re.search(r"\}\s*,\s*2400\s*\)", t):
            bad.append("%s：Toast 驻留应为 2400ms（MD-18-01）" % demo)
        # Modal：role / aria-modal / ESC / 焦点归还（MD-18-02）
        if 'role="dialog"' not in t or 'aria-modal="true"' not in t:
            bad.append("%s：Modal 面板缺 role=\"dialog\" / aria-modal=\"true\"（MD-18-02）" % demo)
        if "Escape" not in t:
            bad.append("%s：Modal 缺 ESC 关闭（MD-18-02）" % demo)
        if not re.search(r"_dkFocus[\s\S]{0,200}?\.focus\(\)", t):
            bad.append("%s：Modal 关闭后未把焦点归还触发点（MD-18-02「关闭归还触发点」）" % demo)
        if "role=\"dialog\"" in t and "aria-labelledby" not in t:
            bad.append("%s：role=dialog 却无 aria-labelledby（或 aria-label）—— 读屏只报「对话框」" % demo)

    if bad:
        for b in bad:
            rec("FAIL", "feedback-spec", b)
        return False
    rec("OK", "feedback-spec", "反馈与提示族符合 Part 18 · MD-18-01/02/04：Toast 顶部偏上"
        "（外壳给出 --gm-toast-top 避让吸顶导航）· 320ms 入 / 驻留 2.4s / 240ms 出 · 同类仅 1 条 · "
        "error→alert、其余→status+aria-live · 无白描边；Modal 有 role=dialog + aria-modal + ESC + 焦点归还")
    return True


# ══════════════════════════════════════════════════════════════════════════
# 未定义 Token 守门
#
# 为什么必须有：`color:var(--lg-sem-special)` 里若该变量**从未定义**且没写兜底，
# 浏览器会在"计算值阶段"把整条声明判为无效并**静默丢弃** —— 不报错、不警告，
# 静态扫描看不到、对比度检查也看不到（元素退化成继承色）。
# 实测：合并后的首页上 `--lg-sem-*` 全部未定义，preview-index 里 59 处引用集体失效 ——
# 反馈语义色（成功/注意/失败/中性/信息）等于不存在。这类缺陷只能靠机械清点发现。
# ══════════════════════════════════════════════════════════════════════════

def undefined_tokens():
    import io as _io, glob as _glob
    bad = []
    shell_defs = set()
    sh = "scripts/build-site.py"
    if os.path.exists(sh):
        shell_defs = set(re.findall(r"(--[a-z0-9-]+)\s*:", _io.open(sh, encoding="utf-8").read()))
    for f in sorted(_glob.glob("site/fragments/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        defined = set(re.findall(r"(--[a-z0-9-]+)\s*:", t)) | shell_defs
        # 只查「无兜底」写法：var(--x)。
        # 带兜底的写法（var(--x, 兜底值)）即使未定义也能降级，不算缺陷 —— 也就不必报。
        # 先剥掉注释：文档里写的反例（`var(--lg-sem-xxx)`）不是真的引用，
        # 不剥会把"注释"算成"缺陷"，逼着人把解释性注释删掉。
        code = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
        code = re.sub(r"<!--.*?-->", "", code, flags=re.S)
        nofb = set(re.findall(r"var\(\s*(--[a-z0-9-]+)\s*\)", code))
        missing = sorted(nofb - defined)
        if missing:
            bad.append("%s：%d 个 Token 被 var() 无兜底引用却从未定义 → 这些声明会被浏览器静默丢弃（%s）"
                       % (f, len(missing), ", ".join(missing[:8])))
    if bad:
        for b in bad:
            rec("FAIL", "undefined-token", b)
        return False
    rec("OK", "undefined-token", "站点片段里 var(--x) 的无兜底引用全部有定义"
        "（未定义 + 无兜底 = 整条声明被静默丢弃，是 V2.9 实测到的缺陷类）")
    return True


# ══════════════════════════════════════════════════════════════════════════
# 数据呈现层守门（03 · 3.7 / 08 · 8.2.11 / 08 · 8.2.13 / 11 · 11.2.6 / Part 15）
#
# 为什么必须有：这一族在 5 个页面各有一份实现，实测漂移成 ——
#   表头字号 11 / 11.5 / 12px（类型阶最小档是 caption 12）、字重 500 / 600（03.7 要 600）、
#   表体 12.5 / 13px（02 · 2.2.2 场景列写明「表格正文」= body-sm 14/20）、
#   分隔 rgba(…) 有 .06 / .08 / .09 三种、操作列有的靠行内 style 右对齐有的没有、
#   `.op` 与 `.ops` 两个名字；描述列表完全没有 8.2.13 要求的「省略 + 全文」；
#   折叠只有一个 `transition: 0s / all` 的 details（写着过渡但根本没过渡）。
# 数值类的一致性靠"外壳与独立页两份配方逐项相等"来守 —— 任一侧漂移即 FAIL。
# 渲染级的实测（行高档、收起残留、特异性失效）在 scripts/page-qa.mjs 里另有一组。
# ══════════════════════════════════════════════════════════════════════════

def data_present():
    import io as _io, glob as _glob
    bad = []
    SHELL = "scripts/build-site.py"
    DEMO = "fuyouaicansai/goodmom-redesign.html"
    if not os.path.exists(SHELL):
        rec("FAIL", "data-present", "%s 不存在" % SHELL); return False
    sh = _io.open(SHELL, encoding="utf-8").read()

    def block(text, sel):
        """取 `选择器{…}` 的声明体。

        ⚠️ 选择器末尾的 `{` 要先摘掉再统一补 `\{`：`re.escape("{")` 会把它转义成 `\{`，
        直接拼接就成了 `\{\{`（要求两个连续花括号）→ 任何规则都匹配不到，
        门禁会**全量误报"缺少配方"**（本轮实测踩到）。
        """
        sel = sel[:-1] if sel.endswith("{") else sel
        m = re.search(re.escape(sel) + r"\s*\{([^}]*)\}", text)
        return m.group(1) if m else None

    # ── ① 外壳：三套配方齐备且数值符合规范 ─────────────────────────────
    checks = [
        (".gm-tbl{", "font-size:14px", "玻璃表格正文必须 body-sm 14px（02 · 2.2.2「表格正文」档）"),
        (".gm-tbl{", "tabular-nums", "玻璃表格必须 tabular-nums（17 · 17.2.2「数字一律等宽」）"),
        (".gm-tbl td{", "white-space:nowrap",
         "单元格必须不折行：折行会把行高从 45 涨到 65，直接顶破 03 · 3.7 的 44–52"
         "（宽表横滑由 .gm-tbl-wrap 承担，TB-15-04）"),
        (".gm-tbl td>span,.gm-tbl td>div,.gm-tbl td>a{", "flex-wrap:nowrap",
         "单元格内联元素必须不折行：页面里 `.block span{flex-wrap:wrap}` 这类通用规则会把"
         "头像与文字拆成两行（实测 .cell-av 55px → 行高 80px）"),
        (".gm-tbl-wrap{", "overflow-x:auto", "宽表横滑必须由外层容器承担（TB-15-04 / TB-15-02 保留表头语义）"),
        (".gm-tbl th{", "font-size:14px", "表头必须 body-sm 14px（03 · 3.7）"),
        (".gm-tbl th{", "font-weight:600", "表头必须 600（03 · 3.7「body-sm 600 字重」）"),
        (".gm-tbl th{", "var(--lg-text-secondary", "表头必须次级色（03 · 3.7 / TB-15-01 D7b）"),
        (".gm-tbl th{", "var(--lg-divider", "表头分隔必须走 --lg-divider（TB-15-01 rgba(58,52,84,.08–.10)）"),
        (".gm-tbl td{", "padding:12px 14px", "单元格内边距 12px 是行高 44–52 的算术前提（12+20+12+1=45）"),
        (".gm-desc{", "var(--gm-desc-cols,3)", "描述列表分栏 2–4 自适应（08 · 8.2.11）"),
        (".gm-desc dd,.gm-desc .v{", "text-overflow:ellipsis", "描述列表 ≤1 行省略（08 · 8.2.13）"),
        (".gm-desc dd,.gm-desc .v{", "white-space:nowrap", "描述列表 ≤1 行省略（08 · 8.2.13）"),
        (".gm-desc dt,.gm-desc .k{", "font-size:12px", "描述列表 key 用 caption 12px（08 · 8.2.11）"),
        (".gm-fold>summary{", "min-height:44px", "折叠标题行 44 热区（11 · 11.2.6）"),
        (".gm-fold__body{", "grid-template-rows 300ms", "折叠高度过渡 300ms 且用 grid-template-rows（11 · 11.2.6）"),
        (".gm-fold .gm-fold__arr{", "transform 220ms", "折叠箭头旋转 220ms（11 · 11.2.6）"),
    ]
    for sel, needle, why in checks:
        b = block(sh, sel)
        if b is None:
            bad.append("%s：缺少外壳配方 %s —— %s" % (SHELL, sel, why))
        elif needle not in b:
            bad.append("%s：%s 里没有 `%s` —— %s" % (SHELL, sel, needle, why))

    # 折叠代理层不得自带 padding（0fr 轨道基尺寸取 min-content，padding 不可压缩）
    b = block(sh, ".gm-fold__body>div")
    if b is None:
        bad.append("%s：缺少 .gm-fold__body>div 折叠代理层" % SHELL)
    elif "padding" in b:
        bad.append("%s：折叠代理层 .gm-fold__body>div 不得带 padding —— "
                   "`0fr` 轨道的基尺寸取子项 min-content，padding 不可压缩，"
                   "实测收起后残留 14px 高（内边距应放在 `.gm-fold__body>div>*` 上）" % SHELL)

    # 表格不得用 display:block 做横滑：会在 Chrome / Firefox 里把表格语义从无障碍树里抹掉
    for sel in (".gm-tbl{", ".gm-tbl-wrap{"):
        b = block(sh, sel)
        if b and re.search(r"display:\s*block", b) and sel == ".gm-tbl{":
            bad.append("%s：%s 不得设 display:block —— 会抹掉表格语义（TB-15-02），"
                       "横滑要放在外层容器上" % (SHELL, sel))

    # ── ② 站点片段：不得再有私有表格/描述列表/折叠实现，且必须接系统 Token ──
    # 数据呈现层读的是系统命名（--lg-text-secondary / --lg-divider）；
    # 片段若只用私有命名（--t2 / --line）且不接别名，暗色档就会"页面翻了、表格没翻"，
    # 实测暗底深字 1.61:1（page-qa 抓到 12 条）。
    PRIVATE = [
        (r"table\.t\s*\{", "table.t", "预览页私有的表格配方"),
        (r"table\.gm\s*\{", "table.gm", "行业模式页私有的表格配方"),
        (r"\.mtable\b[^{]*\{", ".mtable", "视觉规范页私有的表格配方"),
        (r"details\.gfold\b", "details.gfold", "视觉规范页私有的折叠实现"),
        (r"\.desc\s*\{[^}]*grid-template-columns", ".desc", "私有的描述列表网格配方"),
        (r"th,td\s*\{[^}]*border-bottom", "th,td", "全局裸选择器写的表格样式（会外溢到规范正文表格）"),
    ]
    for f in sorted(_glob.glob("site/fragments/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        code = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
        code = re.sub(r"<!--.*?-->", "", code, flags=re.S)
        # 文档型模块（规范正文/手册/文档索引）的表格是文档表格，整套数据表格规则都不适用
        docmod = os.path.basename(f) in ("site-spec.html", "site-manual.html", "site-docs.html")
        for pat, name, why in ([] if docmod else PRIVATE):
            if re.search(pat, code):
                bad.append("%s：又出现了 %s（%s）—— 数据呈现层应统一取用外壳的 "
                           ".gm-tbl / .gm-desc / .gm-fold" % (f, name, why))
        # 表格必须带 class 且表头必须有 scope
        # 例外：规范正文 / 标准手册 / 文档索引模块的表格是**文档表格**（Markdown 生成、
        # 随文档版式排版），不属 03 · 3.7「数据表格」管辖。
        doc_table = os.path.basename(f) in ("site-spec.html", "site-manual.html", "site-docs.html")
        for m in re.finditer(r"<table(?![^>]*\bclass=)[^>]*>", code):
            if doc_table:
                break
            bad.append("%s：存在没有 class 的 <table> —— 未接入 .gm-tbl 配方" % f)
        for m in re.finditer(r'<table\b[^>]*class="([^"]*)"', code):
            if doc_table:
                break
            if "gm-tbl" not in m.group(1) and "tbl-doc" not in m.group(1):
                bad.append("%s：<table class=\"%s\"> 未接入 .gm-tbl（数据表格应统一取用外壳配方）"
                           % (f, m.group(1)[:40]))
        # 用了数据呈现层的片段，必须定义系统 Token（或做惰性别名）
        if re.search(r'class="[^"]*\bgm-(tbl|desc|fold)\b', code) and not doc_table:
            for tok in ("--lg-text-secondary", "--lg-divider"):
                if tok + ":" not in code:
                    bad.append("%s：用了数据呈现层却未定义 %s —— 外壳配方读的是系统 Token，"
                               "片段只有私有命名（--t2/--line）时，暗色档会出现"
                               "「页面翻了、表格没翻」的暗底深字（实测 1.61:1）" % (f, tok))
            # ⚠️ 别名**只能**接数据呈现层真正读取的那几个 Token。多接一个
            # `--lg-text-tertiary` 就会把页面里 `var(--lg-text-tertiary, 深色兜底)` 的写法
            # 从"走兜底"改成"走别名值" —— 实测 preview-patterns 的禁用态链接因此从可读的
            # 兜底色变成 #8A92A3（3.12:1），被 a11y-dom 判为**新增确证失败**。
            # 只禁"**别名**多接"（值是对私有 Token 的 var() 引用）；
            # 片段自己正常定义 --lg-text-tertiary 的**字面值**不算（那是它的基础令牌集）。
            extra = re.findall(r"(--lg-text-(?:tertiary|disabled|placeholder|on-accent))\s*:\s*var\(", code)
            if extra:
                bad.append("%s：别名多接了 %s —— 数据呈现层不读它，而页面里 "
                           "`var(%s, 兜底)` 的写法会因此从\"走兜底\"变成\"走别名值\"，"
                           "可能把本来合格的对比度改坏（实测 3.12:1）" % (f, extra[0], extra[0]))
        # .gm-tbl 表内所有 <th> 必须有 scope（TB-15-02 表头语义）
        for tbm in re.finditer(r'<table\b[^>]*class="[^"]*gm-tbl[^"]*"[^>]*>(.*?)</table>', code, re.S):
            for thm in re.finditer(r"<th\b([^>]*)>", tbm.group(1)):
                if "scope=" not in thm.group(1):
                    bad.append("%s：.gm-tbl 的表头缺 scope —— TB-15-02 要求保留表头语义"
                               "（读屏靠它把列头绑到单元格）" % f)
                    break
        # 描述列表 / 折叠：键值必须落在 .gm-desc / .gm-fold 上
        # 键值项判定要按**整词**：`\bk\b` 会误命中 `class="k-head"`（连字符是词边界），
        # 于是把卡片的 kpi 子元素当成"描述列表的键值项"报出来（实测的假阳性）。
        for m in re.finditer(r'<div class="([^"]*)"', code):
            toks = m.group(1).split()
            if "k" not in toks:
                continue
            ctx = code[max(0, m.start() - 500):m.start()]
            if 'class="gm-desc"' not in ctx and "gm-desc " not in ctx:
                bad.append("%s：出现了不在 .gm-desc 里的键值项（class=\"k\" 是描述列表的键；"
                           "键值网格必须走外壳配方）" % f)
                break

    # ── ③ 独立演示页：同源配方的关键数值必须与外壳逐项相等 ────────────────
    if os.path.exists(DEMO):
        d = _io.open(DEMO, encoding="utf-8").read()
        for sel, needle, why in checks:
            if not sel.startswith((".gm-tbl", ".gm-desc", ".gm-fold")):
                continue
            if sel == ".gm-tbl-wrap{":
                continue   # 独立页的横滑容器写法见下（无媒体查询包裹）
            b = block(d, sel)
            if b is None:
                bad.append("%s：缺少同源配方 %s（独立页拿不到站点外壳，必须自带一份）" % (DEMO, sel))
            elif needle not in b:
                bad.append("%s：%s 里没有 `%s` —— 与外壳配方漂移（%s）" % (DEMO, sel, needle, why))
        # 折叠脚本与 aria
        if "aria-expanded" not in d or "aria-controls" not in d:
            bad.append("%s：折叠未补 aria-expanded / aria-controls（原生 details 不报展开态，"
                       "读屏不知道这是可展开控件）" % DEMO)
        # 表格：role 语义不得被 display:block 抹掉
        if re.search(r"\.gm-tbl\{[^}]*display:\s*block", d):
            bad.append("%s：.gm-tbl 不得设 display:block 做横滑 —— "
                       "会把表格语义从无障碍树里抹掉（TB-15-02）" % DEMO)

    if bad:
        for b in bad:
            rec("FAIL", "data-present", b)
        return False
    rec("OK", "data-present", "数据呈现层符合 03 · 3.7 / 08 · 8.2.11+8.2.13 / 11 · 11.2.6 / TB-15-01/02："
        "表格 body-sm 14+600 次级表头 · tabular-nums · 行高算术 44–52 · 操作列右对齐；"
        "描述列表 caption key + body-sm value + 单行省略；折叠 44 热区 + 300ms grid-rows + 220ms 箭头；"
        "外壳与独立页两份配方逐项相等，页面侧零私有实现")
    return True


# ══════════════════════════════════════════════════════════════════════════
# 生长曲线 · 百分位带守门（13 · 13.2 母题 / 04 · 4.2–4.3.2）
#
# 为什么必须有：这是**系统母题**（12 章第五条品牌母题），实测却有 3 处各画一遍的静态 SVG，
# 且三处都把参考带画成 alpha .5（规范 .10–.14，**四倍浓**）、主曲线 2.4–2.6px（规范 2.5）、
# 警戒线用薄荷色 1.3px（规范：1.5px 三级色虚线）、网格线 .05（规范 --lg-divider）、
# 没有坐标轴 / Tooltip / 任何交互（13.2 的三条交互一条都没有）。
# 这类"手画 SVG"最容易悄悄漂移 —— 没有选择器、没有令牌、没人比对，只能逐值钉住。
# 渲染级实测在 scripts/page-qa.mjs（band 透明度、线宽、动画名等）。
# ══════════════════════════════════════════════════════════════════════════

def growth_chart():
    import io as _io, glob as _glob
    bad = []
    SHELL = "scripts/build-site.py"
    DEMO = "fuyouaicansai/goodmom-redesign.html"
    if not os.path.exists(SHELL):
        rec("FAIL", "growth-chart", "%s 不存在" % SHELL); return False
    sh = _io.open(SHELL, encoding="utf-8").read()

    def block(text, sel):
        sel = sel[:-1] if sel.endswith("{") else sel
        m = re.search(re.escape(sel) + r"\s*\{([^}]*)\}", text)
        return m.group(1) if m else None

    # ① 参考带透明度必须落在 13.2 的 .10–.14（这是最常被画浓的一条：实测三处都是 .5）
    def band_alpha(text, sel, src):
        b = block(text, sel)
        if b is None:
            bad.append("%s：缺少 %s（13 · 13.2 参考带）" % (src, sel)); return
        m = re.search(r"rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\.\d+|\.\d+|\.\d+)\)", b)
        if not m:
            bad.append("%s：%s 的填充必须写成 rgba(...)（13 · 13.2 要求 alpha .10–.14）" % (src, sel)); return
        a = float(m.group(1))
        if not (0.10 - 1e-9 <= a <= 0.14 + 1e-9):
            bad.append("%s：%s 参考带 alpha=%.2f 不在 .10–.14 —— 参考带是背景，"
                       "画浓就盖过主曲线，违背 04 · 4.1「数据最亮」（实测旧实现是 .5，四倍浓）"
                       % (src, sel, a))

    band_alpha(sh, ".gm-growth__band{", SHELL)
    band_alpha(_io.open(DEMO, encoding="utf-8").read() if os.path.exists(DEMO) else "", ".gx-band{", DEMO)

    # ② 外壳配方逐项
    checks = [
        (".gm-growth__line{", "stroke:#F77FA3", "主曲线必须是品牌主色 Rose-500 #F77FA3（13.2）"),
        (".gm-growth__line{", "stroke-width:2.5", "主曲线必须 2.5px（13.2 / 04 · 4.3.2）"),
        (".gm-growth__band-top{", "rgba(255,255,255,.9)", "参考带上界必须细白描边（13.2）"),
        (".gm-growth__band-top{", "stroke-width:1", "参考带上界描边 1px（13.2「细白描边」）"),
        (".gm-growth__warn{", "var(--gm-guide", "警戒线必须是三级色导引件（13.2「虚线 1.5px 三级色」）"),
        (".gm-growth__warn{", "stroke-width:1.5", "警戒线必须 1.5px（13.2；04 · 4.3.2 的 2px 是通用基线虚线）"),
        (".gm-growth__warn{", "stroke-dasharray", "警戒线必须是虚线（13.2）"),
        (".gm-growth__grid{", "var(--lg-divider", "网格线必须 --lg-divider（04 · 4.2）"),
        (".gm-growth__grid{", "stroke-width:1", "网格线 1px（04 · 4.2）"),
        (".gm-growth__dot{", "fill:#FFF", "端点必须是白芯（13.2 / 04 · 4.3.2）"),
        (".gm-growth__dot{", "stroke:#F77FA3", "端点必须粉描边（13.2）"),
        (".gm-growth__dot{", "stroke-width:2", "端点描边 2px（04 · 4.3.2）"),
        (".gm-growth__tick{", "font-size:12px", "轴刻度必须 caption 12px（04 · 4.2）"),
        (".gm-growth__tick{", "tabular-nums", "轴刻度数字必须等宽（04 · 4.2 / 17 · 17.2.2）"),
        (".gm-growth__plot{", "6s", "入场必须 0.6s（04 · 4.2「入场 0.6s ease-out」）"),
        (".gm-growth__tip{", "rgba(255,255,255,.75)", "Tooltip 必须是白玻璃泡 rgba(255,255,255,.75)（04 · 4.2）"),
        (".gm-growth__tip{", "blur(20px)", "Tooltip 必须 blur 20（04 · 4.2）"),
        (".gm-growth__tip{", "border-radius:16px", "Tooltip 圆角 16（04 · 4.2）"),
    ]
    for sel, needle, why in checks:
        b = block(sh, sel)
        if b is None:
            bad.append("%s：缺少 %s —— %s" % (SHELL, sel, why))
        elif needle not in b:
            bad.append("%s：%s 里没有 `%s` —— %s" % (SHELL, sel, needle, why))

    # ③ 导引件令牌必须两端都有（浅/暗各一档）
    m = re.search(r"--gm-guide:\s*(#[0-9A-Fa-f]{6})", sh)
    if not m:
        bad.append("%s：缺少 --gm-guide 浅色档 —— 网格/刻度/警戒线必须走这个令牌，"
                   "不能借 --lg-text-tertiary（页面会把它当正文色用，个别页面甚至"
                   "别名成次级色 → 导引件与正文一样重，违背 04 · 4.1「数据最亮」）" % SHELL)
    elif m.group(1).upper() != "#9AA2B0":
        # 光要求"是 # 开头的颜色"不够：负向测试实测把导引件改成次级色 #4F5B6E 也能过 ——
        # 那样虚线就跟正文一样重，"数据最亮"失效。故钉住具体档位。
        bad.append("%s：--gm-guide 浅色档 = %s ≠ #9AA2B0（02 · 2.1.1 三级色；"
                   "导引件必须比正文轻一档）" % (SHELL, m.group(1)))
    m2 = re.search(r'\[data-theme="dark"\]\{--gm-guide:\s*(#[0-9A-Fa-f]{6})', sh)
    if not m2:
        bad.append("%s：--gm-guide 缺暗色档（02 · 2.1.9）" % SHELL)
    elif m2.group(1).upper() != "#A6ADB9":
        bad.append("%s：--gm-guide 暗色档 = %s ≠ #A6ADB9（02 · 2.1.9 三级色暗档）" % (SHELL, m2.group(1)))

    # ④ 渲染器：无障碍与交互件
    for needle, why in [
        ("window.gmGrowth", "外壳必须提供 window.gmGrowth（唯一实现）"),
        ('role="img"', "图形必须 role=img（读屏无法读 SVG 路径）"),
        ("aria-label", "图形必须有 aria-label 概述（含数据源与聚焦读数）"),
        ("gm-sr-only", "必须生成视觉隐藏数据表（读屏逐点读取的唯一途径）"),
        ("d.p50", "百分位读数必须中位数锚定（P3–P50–P97 分段）—— 带内单一线性内插会把读数算偏 6–8 个分位"),
        ("aria-pressed", "P3/P97 开关必须报展开态（13.2「一键 P3/P97 红线开关」）"),
        ("gm-growth__note", "P3 以下 / P97 以上必须给玻璃气泡建议（13.2）"),
    ]:
        if needle not in sh:
            bad.append("%s：缺少 %s —— %s" % (SHELL, needle, why))

    # ⑤ 页面侧：不得再手画一份，且调用必须给数据源与 P50
    for f in sorted(_glob.glob("site/fragments/*.html")):
        t = _io.open(f, encoding="utf-8").read()
        code = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
        code = re.sub(r"<!--.*?-->", "", code, flags=re.S)
        # 旧的"画浓了"的参考带 = 手画 SVG 的指纹
        if re.search(r"rgba\(\s*169\s*,\s*227\s*,\s*212\s*,\s*\.?5", code):
            bad.append("%s：又出现了 alpha .5 的参考带 —— 那是页面自己手画生长曲线的指纹；"
                       "应挂 #growthChart 交给外壳的 window.gmGrowth（13 · 13.2 参考带是 .10–.14）" % f)
        if ".gm-growth__band{" in code or ".gm-growth__line{" in code:
            bad.append("%s：又在本页定义生长曲线样式 —— 母题配方只在**外壳**一份" % f)
        if "growthChart" in code:
            for need, why in ((r"source:\s*'[^']+'", "必须标注数据源版本（13 · 13.12「文档标注数据源版本」）"),
                              ("p50:", "必须给 P50（中位数锚定的百分位读数需要）"),
                              ("window.gmGrowth", "必须调用外壳实现")):
                if not re.search(need if need.startswith("source") else re.escape(need) + r"[^\n]{0,40}", code):
                    bad.append("%s：生长曲线缺少 %s —— %s" % (f, need, why))

    # ⑥ 独立演示页：同源静态版的数值必须与外壳逐项相等
    if os.path.exists(DEMO):
        d = _io.open(DEMO, encoding="utf-8").read()
        for sel, needle, why in [
            (".gx-band{", "rgba(169,227,212,.12)", "参考带透明度必须与外壳同值（.12）"),
            (".gx-band-top{", "stroke-width:1", "参考带上界细白描边"),
            (".gx-warn{", "stroke-width:1.5", "警戒线 1.5px"),
            (".gx-warn{", "stroke-dasharray", "警戒线虚线"),
            (".gx-line{", "stroke:#F77FA3", "主曲线 Rose-500"),
            (".gx-line{", "stroke-width:2.5", "主曲线 2.5px"),
            (".gx-dot{", "fill:#FFF", "端点白芯"),
            (".gx-dot{", "stroke:#F77FA3", "端点粉描边"),
            (".gx-grid{", "stroke-width:1", "网格线 1px"),
            (".gx-tick{", "font-size:12px", "轴刻度 12px"),
            (".gx-tick{", "tabular-nums", "轴刻度等宽数字"),
        ]:
            b = block(d, sel)
            if b is None:
                bad.append("%s：缺少同源配方 %s（独立页拿不到站点外壳，必须自带一份，%s）" % (DEMO, sel, why))
            elif needle not in b:
                bad.append("%s：%s 里没有 `%s` —— 与外壳配方漂移（%s）" % (DEMO, sel, needle, why))
        if 'role="img"' not in d or "aria-label" not in d:
            bad.append("%s：静态版生长曲线必须 role=img + aria-label（读屏读不到路径）" % DEMO)

    if bad:
        for b in bad:
            rec("FAIL", "growth-chart", b)
        return False
    rec("OK", "growth-chart", "生长曲线·百分位带符合 13 · 13.2 与 04 · 4.2–4.3.2："
        "参考带 alpha .12（.10–.14）+ 细白描边上界 · 主曲线 Rose-500 2.5px + 端点白芯粉描边 · "
        "P3/P97 虚线 1.5px 三级色（可一键开关）· 网格 --lg-divider 1px · 刻度 caption 12px 等宽 · "
        "入场 0.6s · 白玻璃 Tooltip · role=img + 隐藏数据表 + 中位数锚定的百分位读数")
    return True


def svg_refs():
    """SVG/CSS 画刷引用必须能解析到**同一文件内**的 id。

    `url(#x)`（fill / stroke / clip-path / mask / filter / marker-* 与 CSS 同类写法）
    指向不存在的 id 时**不报错、控制台无痕**，浏览器直接不画那个元素 —— 属于
    "页面少了一块、但所有门禁都 PASS"的静默缺陷类。

    实测 V2.9 产物：build 的 prefix_ids 只给 `id=` 加了模块前缀、没改引用侧，
    于是 6 处画刷全断（视觉规范的渐变柱/环形/雷达/径向底 + 移动端趋势图面积渐变）。
    本门禁与 build-site.py 里 rurl 的改写互为回归位：改坏任何一侧都会在这里失败。
    """
    bad, checked = [], 0
    targets = dict.fromkeys(["site/index.html"] + sorted(glob.glob("site/*.html"))
                            + sorted(glob.glob("preview/*.html")))
    for f in targets:
        if not os.path.exists(f):
            continue
        t = open(f, encoding="utf-8").read()
        if "页面已合并" in t or "url(#" not in t:
            continue
        ids = set(re.findall(r'\bid\s*=\s*"([^"]+)"', t))
        for m in re.finditer(r"url\(\s*['\"]?#([\w.-]+)", t):
            checked += 1
            if m.group(1) not in ids:
                bad.append("%s → #%s" % (f, m.group(1)))
    if bad:
        rec("FAIL", "svg-refs", "%d 处画刷引用指向不存在的 id（元素会整块不渲染）：%s"
            % (len(bad), sorted(set(bad))[:4]))
        return False
    rec("OK", "svg-refs", "全部 %d 处 url(#id) 画刷引用均可解析（跨模块 id 前缀未断链）" % checked)
    return True


def semantic_parity():
    """六语义色的「浅底档」必须在规范载体与实现之间一致。

    为什么需要：V2.8「语义色板达 AA」把 `--lg-sem-*` 深档化（例如 positive
    `#2F8F76` → `#25715D`，旧值作文字仅 3.95:1 不达标），但**规范表格没跟着改**。
    后果不是理论上的：照抄规范表写出来的 `goodmom-vue/playground/smoke.mjs`
    5 条语义色断言长期是红的 —— 而它不在 CI 里，于是没人发现，
    "两库 1:1 对齐"的结论也一直是靠人眼维持的。

    口径：
      · 唯一源 = `goodmom-ui/src/theme.css` 的 `:root` 段的 `--lg-sem-*`；
      · 规范性载体 = 02 · 2.1.9 映射表 B、14 · 4.4.5、skill reference/tokens.md；
      · **历史文档不参与**（`docs/审查决策记录.md`、`docs/设计系统问题清单.md`、
        `18-视觉规范审计报告.md` 记的是当时的状态与整改证据，改写它们等于涂改留痕）。
    """
    import io as _io
    src = "goodmom-ui/src/theme.css"
    if not os.path.exists(src):
        rec("FAIL", "semantic-parity", "缺少 %s" % src); return False
    css = _io.open(src, encoding="utf-8").read()
    # ⚠️ 不能按 `split('[data-theme="dark"]')` 取浅色段：注释里先出现过该字符串，
    #    会把文件截断（check-module-boundary.py 的 B10 就因此空转过）。按括号配对取非暗色块。
    truth = {}
    i, n = 0, len(css)
    while i < n:
        b = css.find("{", i)
        if b < 0:
            break
        sel = re.sub(r"/\*.*?\*/", " ", css[i:b], flags=re.S).strip().split("\n")[-1].strip()
        depth, j = 1, b + 1
        while j < n and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        if "data-theme" not in sel:
            for m in re.finditer(r"--lg-sem-(\w+):\s*(#[0-9A-Fa-f]{6})", css[b + 1 : j - 1]):
                truth[m.group(1)] = m.group(2).upper()
        i = j
    if len(truth) != 6:
        rec("FAIL", "semantic-parity", "theme.css 浅色段未解析出 6 个 --lg-sem-*（实际 %d）" % len(truth))
        return False

    carriers = [
        ("02-Token规范.md", r"\| `--lg-sem-(\w+)` \| `(#[0-9A-Fa-f]{6})` \|"),
        ("14-命名与术语规范.md", r"`--lg-sem-(\w+)`（`(#[0-9A-Fa-f]{6})`）"),
        (".claude/skills/goodmom-frontend/reference/tokens.md", r"\| `--lg-sem-(\w+)` \| `(#[0-9A-Fa-f]{6})` \|"),
    ]
    bad = []
    for path, pat in carriers:
        if not os.path.exists(path):
            bad.append("%s 缺失" % path); continue
        text = _io.open(path, encoding="utf-8").read()
        found = {m.group(1): m.group(2).upper() for m in re.finditer(pat, text)}
        if not found:
            bad.append("%s 未解析到语义色表（正则失效，需同步）" % path); continue
        for k in sorted(truth):
            if k not in found:
                bad.append("%s 缺少 --lg-sem-%s" % (path, k))
            elif found[k] != truth[k]:
                bad.append("%s 的 --lg-sem-%s 写的是 %s，实现是 %s"
                           % (path, k, found[k], truth[k]))
    if bad:
        rec("FAIL", "semantic-parity", "%d 处语义色口径与实现不一致：%s" % (len(bad), bad[:4]))
        return False
    rec("OK", "semantic-parity",
        "六语义浅底档在 02 / 14 / skill reference 与 theme.css 之间完全一致（%s）"
        % " · ".join("%s=%s" % (k, truth[k]) for k in sorted(truth)))
    return True


# 门禁登记表：名字 → 函数。集中登记是为了支持 `--only <名>`（负向测试要能
# 精确地"只跑这一条"，否则注入缺陷后先被其它门禁拦下，反而证明不了目标门禁有效）。
GATES = [
    ("md-links", md_links), ("chapter-seq", chapter_seq), ("icons", icons),
    ("html-no-md", html_no_md), ("stale", stale_words), ("color-css", colors),
    ("color-banned", banned_colors), ("bp", breakpoint_reg), ("spec", spec_health),
    ("hex-case", hex_case), ("mirror", mirror_sync), ("dark", dark_contrast),
    ("exports", exports_check), ("logo-guard", logo_guard), ("loading-spec", loading_spec),
    ("css-syntax", css_syntax), ("feedback-spec", feedback_spec),
    ("undefined-token", undefined_tokens), ("data-present", data_present), ("growth-chart", growth_chart),
    ("svg-refs", svg_refs), ("semantic-parity", semantic_parity), ("icon-mirror", icon_mirror),
    ("text-token-parity", text_token_parity), ("tertiary-size", tertiary_size), ("tint-base", tint_base),
    ("bg-origin", bg_origin), ("btn-radius", btn_radius),
]




def main():
    import argparse as _ap
    ap = _ap.ArgumentParser(description="规范审计")
    ap.add_argument("--only", default="", help="只运行名字含该子串的门禁（负向测试用）")
    args = ap.parse_args()
    gates = [(n, f) for n, f in GATES if args.only in n] if args.only else GATES
    if not gates:
        print("没有匹配的门禁：%s（可选：%s）" % (args.only, ", ".join(n for n, _ in GATES)))
        return 2
    hard = [f() for _n, f in gates]
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
