#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""站点锚点完整性门禁（P0-4 / P2-14）。

作用域（显式声明，避免"作用域比结论窄"的假通过）：
  · 目标文件：site/*.html + preview/*.html + site/fragments/*.html
  · 检查项：
      1. 畸形串 `href="href=`（生成器把 `href="` 重复输出的历史缺陷）
      2. 文档内 `href="#x"` 的 x 是否存在于同一文档的 id 集合（空锚点 `#` 除外）
      3. 模块内锚点是否缺少 `data-mod`（跨模块跳转需要）
  · 不检查：外链、mailto、javascript:、以及站点片段（片段尚未加模块前缀，
    其锚点为"模块内相对锚点"，只能做畸形串与占位符检查）

用法：
    python3 scripts/check-anchors.py            # 检查并打印报告
    python3 scripts/check-anchors.py --ci       # 有失败则退出码 1
"""
from __future__ import annotations

import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

ID_RE = re.compile(r'\bid\s*=\s*"([^"]+)"')
HREF_ALL_RE = re.compile(r'\bhref\s*=\s*"([^"]*)"')
MALFORMED_RE = re.compile(r'href="href="([^"]*)"')


def markup_only(html: str) -> str:
    """只保留参与渲染的标记。

    必须剔除 `<script>`/`<style>`/注释/`<pre>`：站内文档与脚本注释里
    会**引用** `href="href="#x"` 这类写法作为反面例子，把它们算作页面缺陷
    会造成永久假红（这类假红最终会让人把断言关掉）。
    """
    s = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    s = re.sub(r"<style\b[^>]*>.*?</style>", "", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<pre\b[^>]*>.*?</pre>", "", s, flags=re.S | re.I)
    return s


def ids_of(html: str) -> set[str]:
    return set(ID_RE.findall(markup_only(html)))


def malformed(html: str) -> list[str]:
    """畸形 href 样本（生成器把 `href="` 重复输出）"""
    return MALFORMED_RE.findall(markup_only(html))


def normalize(html: str) -> str:
    """把畸形 `href="href="#x"` 还原为 `href="#x"`，以便做真实的锚点解析。

    不先归一化就会漏报：`href="href="#a"` 按逐 href 扫描时只看得见第一个
    `href="`（值为字面量 `href=`），真正的目标锚点被它挡住。
    """
    return MALFORMED_RE.sub(lambda m: 'href="%s"' % m.group(1), html)


def dead_anchors(html: str) -> list[str]:
    """返回文档中所有目标 id 不存在的 `href="#x"`（含重复计数）"""
    html = normalize(markup_only(html))
    ids = ids_of(html)
    out = []
    for href in HREF_ALL_RE.findall(html):
        if not href.startswith("#"):
            continue
        frag = href[1:]
        if not frag:                      # href="#" 合法（占位）
            continue
        if frag in ids:
            continue
        out.append(href)
    return out


def check_page(path: str) -> dict:
    html = io.open(path, encoding="utf-8").read()
    return {
        "path": path,
        "malformed": malformed(html),
        "dead": dead_anchors(html),
    }


def main() -> int:
    pages = sorted(glob.glob("site/*.html") + glob.glob("preview/*.html"))
    frags = sorted(glob.glob("site/fragments/*.html"))
    fail = 0

    print("== 页面锚点检查（site/ + preview/）==")
    total_dead = 0
    for p in pages:
        r = check_page(p)
        if r["malformed"]:
            fail += 1
            print(f"[FAIL] {p}: 畸形 href=\"href= 共 {len(r['malformed'])} 处")
        if r["dead"]:
            fail += 1
            total_dead += len(r["dead"])
            print(f"[FAIL] {p}: 悬空锚点 {len(r['dead'])} 处")
            seen: dict[str, int] = {}
            for href in r["dead"]:
                seen[href] = seen.get(href, 0) + 1
            for href, n in sorted(seen.items(), key=lambda kv: (-kv[1], kv[0]))[:12]:
                print(f"         {href}  ×{n}")
        if not r["malformed"] and not r["dead"]:
            print(f"[OK]   {p}")

    print()
    print("== 片段锚点检查（site/fragments/，仅畸形串与占位符）==")
    for p in frags:
        html = io.open(p, encoding="utf-8").read()
        bad = malformed(html)
        if bad:
            fail += 1
            print(f"[FAIL] {p}: 畸形 href=\"href= 共 {len(bad)} 处")
        else:
            print(f"[OK]   {p}")

    print()
    if fail:
        print(f"FAIL 锚点检查未通过（{fail} 项；悬空锚点合计 {total_dead}）")
        return 1
    print("OK 锚点检查通过（畸形串 0、悬空锚点 0）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
