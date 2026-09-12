#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Markdown 内链检查（递归全仓）。

旧版有两处作用域缺口，导致"链接全绿"是假通过：
  1. `glob.glob("*.md")` **非递归** → `docs/**`（45 个文件）与 `docs/标准手册/**` 从不扫描；
  2. `os.path.exists(p)` 相对**仓库根**判断，而非链接所在文件的目录 →
     子目录里的相对链接一律误判。

用法：
    python3 scripts/check-md-links.py          # 检查并打印
    python3 scripts/check-md-links.py --ci     # 同上（失败即退出 1，两种模式行为一致）
"""
from __future__ import annotations

import io
import os
import re
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
SKIP_PREFIX = ("http://", "https://", "mailto:", "#", "tel:", "data:")


def md_files() -> list:
    out = []
    for dirpath, dirnames, filenames in os.walk("."):
        dirnames[:] = [d for d in dirnames
                       if d not in {".git", "node_modules", "dist", "storybook-static",
                                    ".npm-cache", ".baseline"}]
        for fn in filenames:
            if fn.endswith(".md"):
                out.append(os.path.normpath(os.path.join(dirpath, fn)))
    return sorted(out)


def main() -> int:
    bad = []
    checked = 0
    files = md_files()
    for f in files:
        try:
            text = io.open(f, encoding="utf-8").read()
        except OSError:
            continue
        base = os.path.dirname(f)
        for m in LINK_RE.finditer(text):
            raw = m.group(1).strip()
            if not raw or raw.startswith(SKIP_PREFIX):
                continue
            target = raw.split("#", 1)[0]
            if not target:
                continue
            target = urllib.parse.unquote(target)
            if target.startswith("/"):
                continue                       # 站点绝对路径，不适用文件系统校验
            checked += 1
            resolved = os.path.normpath(os.path.join(base, target))
            if not os.path.exists(resolved):
                line = text[:m.start()].count("\n") + 1
                bad.append((f, line, raw, resolved))

    print("Markdown 内链检查：扫描 %d 个 .md 文件，校验 %d 条相对链接" % (len(files), checked))
    if bad:
        print("\n失效链接：")
        for f, line, raw, resolved in bad:
            print("  %s:%d  %s  →  %s" % (f, line, raw, resolved))
        print("\nFAIL 共 %d 条失效内链" % len(bad))
        return 1
    print("OK 全部相对内链目标存在")
    return 0


if __name__ == "__main__":
    sys.exit(main())
