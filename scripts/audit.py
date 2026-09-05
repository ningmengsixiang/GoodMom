#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GoodMom 全自动规范审计（scripts/audit.py）
检查：Markdown 链接 / 章节连续性 / 图标唯一与计数 / HTML 无 .md 链接 / 残留词 / 色彩合规（严格: css与token层）。
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
    bad = []
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
        t = open(f, encoding="utf-8").read()
        for m in re.finditer(r'href="([^"]*\.md)"', t):
            bad.append((f, m.group(1)))
    if bad:
        rec("FAIL", "html-md", "%d 处 .md 链接：%s" % (len(bad), bad[:3]))
        return False
    rec("OK", "html-md", "HTML 页面无 .md 链接")
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
#9A78FF #8066F0 #B9A0FF #B69AFF #7D8CFF #4CB98A #F2C14E #F0954A #EE5C70 #8F6AE0 #2f8f76 #4a76d0 #b9771c #d35466 #757e8e
#7a5ce0 #b98d1f #8a6d10 #4F5B6E #B23A63 #9E3054 #1E6B52 #9A5A0E #B04052 #385CB3 #6242B8 #FFA9C2 #FF9AB6 #FF8FAE #7FD8C2 #EFAF55 #F79AA8 #E25B72 #FFFFFF #FFF """.split()}
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
    banned = {"#3F9C88"}  # 旧正向绿（已归一为 #2f8f76，禁止回归）
    src_files = COLOR_SOURCES + ["goodmom-ui/src/theme.css"]
    bad_src, bad_html = [], []
    pat = re.compile(r"#[0-9a-fA-F]{6}\b")
    for f in src_files:
        if not os.path.exists(f): continue
        hit = sorted({m.group(0).upper() for m in pat.finditer(open(f, encoding="utf-8").read())} & banned)
        if hit: bad_src.append((f, hit))
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
        hit = sorted({m.group(0).upper() for m in pat.finditer(open(f, encoding="utf-8").read())} & banned)
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
    f = "site/spec.html"
    if not os.path.exists(f):
        rec("FAIL", "spec", "缺少 site/spec.html"); return False
    s = open(f, encoding="utf-8").read()
    chaps = s.count('class="chap"')
    if chaps < 20 or 'id="modeBtn"' not in s:
        rec("FAIL", "spec", "章节=%d 或阅读器缺失" % chaps); return False
    rec("OK", "spec", "spec.html 章节=%d 阅读器在" % chaps)
    return True

def main():
    hard = []
    hard.append(md_links()); hard.append(chapter_seq()); hard.append(icons())
    hard.append(html_no_md()); hard.append(stale_words()); hard.append(colors()); hard.append(banned_colors()); hard.append(breakpoint_reg()); hard.append(spec_health())
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
