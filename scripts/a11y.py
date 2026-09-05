#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静态可访问性走查（A3 落地 · 07.9）。用法：python3 scripts/a11y.py [--ci]
FAIL 项（退出码 1）：CSS 出现 outline:none 但缺 :focus-visible 兜底；TSX 里 <span onClick> 交互；
INFO：HTML 无 alt 图片 / 无标识输入控件计数（引导后续完善，不阻断）。"""
import glob, io, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CI = "--ci" in sys.argv
fails = []

def rec(level, msg):
    print("[%s] a11y %s" % (level, msg))

# 1) outline:none 必须有 focus-visible 兜底
for f in glob.glob("goodmom-ui/**/*.css", recursive=True):
    s = io.open(f, encoding="utf-8").read()
    if "outline:none" in s and ":focus-visible" not in s:
        fails.append("%s 有 outline:none 且缺 :focus-visible" % f)
if not fails:
    rec("OK", "outline:none 均伴 :focus-visible 兜底")

# 2) 禁 <span onClick> 键盘不可达交互
pat = re.compile(r'<span[^>]*\bonClick\b')
for f in glob.glob("goodmom-ui/src/**/*.tsx", recursive=True):
    s = io.open(f, encoding="utf-8").read()
    if pat.search(s):
        fails.append("%s 存在 span+onClick 交互" % f)
if not fails or not any("span+onClick" in x for x in fails):
    rec("OK", "无 <span onClick> 键盘不可达交互")

# 3) 信息项（不阻断）
imgs = 0
for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
    s = io.open(f, encoding="utf-8").read()
    imgs += len(re.findall(r"<img(?![^>]*alt=)[^>]*>", s))
rec("INFO", "HTML <img> 缺 alt: %d（装饰图请用 alt=\"\" 或 aria-hidden）" % imgs)

print("a11y:", "FAIL" if fails else "PASS")
for x in fails: print(" -", x)
sys.exit(1 if fails else 0)
