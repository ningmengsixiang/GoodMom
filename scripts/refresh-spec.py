#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重生成 site/spec.html（md -> HTML）并重注入「阅读模式」资产。
用法：在仓库根执行 `python3 scripts/refresh-spec.py`。
阅读器 CSS/按钮/JS 从旧 spec.html 中抽取，避免与生成器耦合。"""
import io, re, subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "site", "spec.html")

def read(p):
    return io.open(p, encoding="utf-8").read()

def write(p, s):
    io.open(p, "w", encoding="utf-8").write(s)

def extract_reader_assets(old):
    css_a = old.find("body.reader .wrap{max-width:100%")
    css_b = old.find(".chapnav button{border:none;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:999px;background:#fff;color:#B23A63;border:1px solid rgba(232,93,143,.3)}")
    assert css_a != -1 and css_b != -1, "旧 spec.html 中未找到阅读器 CSS"
    css = old[css_a:css_b + len(".chapnav button{border:none;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:999px;background:#fff;color:#B23A63;border:1px solid rgba(232,93,143,.3)}")]
    tb_a = old.find('<button class="readtoggle"')
    tb_b = old.find("</button>", tb_a)
    assert tb_a != -1 and tb_b != -1
    toggle = old[tb_a:tb_b + len("</button>")]
    m = re.search(r'<div class="chapnav">.*?</div>', old, re.S)
    assert m, "未找到 chapnav"
    chapnav = m.group(0)
    js_a = old.rfind("(function(){var chaps=[].slice.call(document.querySelectorAll('section.chap'));")
    js_b = old.find("</script>", js_a)
    assert js_a != -1 and js_b != -1
    js = old[js_a:js_b]
    return css, toggle, chapnav, js

def inject(new, css, toggle, chapnav, js):
    if "body.reader .wrap" not in new:
        new = new.replace("</style>", css + "\n</style>", 1)
    if 'id="modeBtn"' not in new:
        new = new.replace('</div>\n<div class="wrap">', toggle + '</div>\n<div class="wrap">', 1)
    if 'class="chapnav"' not in new:
        new = new.replace('<div class="wrap">', '<div class="wrap">\n' + chapnav, 1)
    if "var chaps=" not in new:
        new = new.replace("</body>", "<script>\n" + js + "</script>\n</body>", 1)
    return new

def main():
    old = read(SPEC)
    css, toggle, chapnav, js = extract_reader_assets(old)
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "gen-spec.py")], cwd=ROOT, check=True)
    new = inject(read(SPEC), css, toggle, chapnav, js)
    write(SPEC, new)
    print("spec.html refreshed + reader re-injected, size", len(new))

if __name__ == "__main__":
    main()
