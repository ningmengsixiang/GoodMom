#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静态可访问性走查（A3 落地 · 07.9）。用法：python3 scripts/a11y.py [--ci]

FAIL 项（退出码 1）：
  1. CSS 出现 `outline:none` / `outline:0` 压制焦点，但**没有覆盖同一选择器**的
     `:focus-visible` 兜底。判据是**选择器级**（P2-3）。
  2. 非交互元素上挂点击交互（TSX `<span onClick>` / Vue 非交互标签 `@click`）。
INFO：HTML 无 alt 图片计数（引导后续完善，不阻断）。

## 为什么 outline 检查必须提到选择器级

旧实现是**文件级**判断：

    if "outline:none" in s and ":focus-visible" not in s

于是只要同一文件里出现**任意一处** `:focus-visible` 就整体通过。实测后果：
`theme.css` 有 7 条 `:focus-visible`，而 `.gm-btn` 与 `.gm-status-tag__close`
既被 `[class*="gm-"]:focus{outline:none}` 压制、又没有任何 `:focus-visible` 恢复，
键盘用户完全看不到焦点 —— 门禁却报 OK「outline:none 均伴 :focus-visible 兜底」。
"""
from __future__ import annotations

import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CI = "--ci" in sys.argv
fails: list = []


def rec(level, msg):
    print("[%s] a11y %s" % (level, msg))


# ══════════════════════════════════════════════════════════════════════════
# 1) outline 压制必须有**同选择器**的 :focus-visible 兜底（选择器级）
# ══════════════════════════════════════════════════════════════════════════

# 有意的例外：(选择器子串, 理由)。加例外必须写清键盘等价路径。
OUTLINE_EXEMPT = [
    (".gm-vlist__viewport", "键盘焦点环由 .gm-vlist__viewport:focus-visible 提供"),
]


def css_rules(text: str):
    """逐条产出 (选择器, 声明体)；展开 @media/@supports 外层包裹"""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"@(media|supports)[^{]*\{", "", text)
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", text):
        for s in [re.sub(r"\s+", " ", x.strip()) for x in m.group(1).split(",")]:
            if s and not s.startswith("@"):
                yield s, m.group(2)


def key(sel: str) -> str:
    """选择器归一化：去掉伪类/伪元素，便于配对"""
    return re.sub(r"::?[a-z-]+(\([^)]*\))?", "", sel).strip()


def check_outline() -> list:
    css_globs = ["goodmom-ui/**/*.css", "frontend-app/**/*.css", "goodmom-vue/src/**/*.css"]
    problems = []
    # 必须排除 node_modules：那是第三方源码（Arco 自带 `*{outline:none}`），
    # 不该由本仓库的静态规则来判定，否则门禁永远红、最终被关掉。
    #
    # ⚠️ 同样必须排除**构建产物**：`npm run build` 会把 Arco 的整份 CSS 打成
    # `frontend-app/dist/assets/index-*.css`，里面同样有 `*{outline:none}` ——
    # 实测只要跑过一次构建，本门禁立刻报 16 处"焦点环缺口"（全是第三方样式），
    # 而它跟源码质量毫无关系（dist 已在 .gitignore 里，不属于交付物）。
    # 与 audit.py 的跳过清单（dist / storybook-static / .vite / .npm-cache）保持同一口径。
    SKIP_DIRS = ("node_modules/", "/dist/", "storybook-static/", "/.vite/", ".npm-cache/")
    files = {p for g in css_globs for p in glob.glob(g, recursive=True)
             if not any(d in ("/" + p.replace(os.sep, "/")) for d in SKIP_DIRS)}
    for f in sorted(files):
        text = io.open(f, encoding="utf-8").read()
        suppressed, recovery = set(), set()
        for sel, body in css_rules(text):
            if re.search(r"outline\s*:\s*(none|0)\b", body):
                suppressed.add(sel)
            if ":focus-visible" in sel:
                recovery.add(sel)
        for sel in sorted(suppressed):
            if any(sub in sel for sub, _ in OUTLINE_EXEMPT):
                continue
            base = key(sel)
            # 必须是**同一选择器**（去掉伪类后完全相等）的 :focus-visible 才算兜底。
            # ⚠️ 不能用子串匹配：`.gm-btn` 是 `.gm-btn2` 的子串，会把未覆盖的
            # `.gm-btn2:focus{outline:none}` 误判为"已被 .gm-btn:focus-visible 兜底"
            # （负向测试实测的假阴性）。
            ok = any(key(r) == base for r in recovery)
            if not ok:
                problems.append("%s: `%s{outline:none}` 没有覆盖同一选择器的 :focus-visible 兜底"
                                % (f, sel))
    return problems


# ══════════════════════════════════════════════════════════════════════════
# 2) 非交互元素上的点击交互
# ══════════════════════════════════════════════════════════════════════════

pat_tsx = re.compile(r"<(span|div|li|td|tr|section|article)\b[^>]*\bonClick\b")
NON_INTERACTIVE = ("span", "div", "li", "td", "tr", "section", "article")
pat_vue = re.compile(r"<(%s)\b[^>]*?@click" % "|".join(NON_INTERACTIVE))


def _exempt(line: str, prev: str) -> bool:
    """允许的例外（键盘等价路径必须存在）：
      · 遮罩层点击关闭 —— 同时提供 Esc 关闭与「取消/确定」按钮；
      · 仅 stopPropagation 的处理器 —— 它不产生交互，只是阻止冒泡。"""
    if "mask" in line or "mask" in prev:
        return True
    if "stopPropagation" in line:
        return True
    return False


def check_click() -> list:
    """TSX 与 Vue 走**同一套例外**（旧实现只在 Vue 路径写了 mask 豁免，
    于是 TSX 侧的遮罩/止冒泡被误判为违规，两边的口径不一致）。"""
    hits = []
    tsx_files = {f for f in glob.glob("goodmom-ui/src/**/*.tsx", recursive=True)
                 + glob.glob("frontend-app/**/*.tsx", recursive=True)
                 if "node_modules" not in f.replace(os.sep, "/")}
    for f in sorted(tsx_files):
        lines = io.open(f, encoding="utf-8").read().splitlines()
        for i, line in enumerate(lines, 1):
            m = pat_tsx.search(line)
            if not m:
                continue
            if _exempt(line, lines[i - 2] if i > 1 else ""):
                continue
            hits.append("%s:%d 非交互 <%s> 上挂 onClick" % (f, i, m.group(1)))
    for f in sorted(set(glob.glob("goodmom-vue/src/**/*.vue", recursive=True))):
        lines = io.open(f, encoding="utf-8").read().splitlines()
        for i, line in enumerate(lines, 1):
            m = pat_vue.search(line)
            if not m:
                continue
            if _exempt(line, lines[i - 2] if i > 1 else ""):
                continue
            hits.append("%s:%d 非交互 <%s> 上挂 @click" % (f, i, m.group(1)))
    return hits


def main() -> int:
    outline = check_outline()
    rec("OK" if not outline else "FAIL",
        "每条 outline 压制都有同选择器的 :focus-visible 兜底（选择器级）"
        if not outline else "发现 %d 处焦点环缺口" % len(outline))
    for x in outline:
        print("   -", x)
    fails.extend(outline)

    hits = check_click()
    rec("OK" if not hits else "FAIL", "无非交互元素点击交互" if not hits else "发现 %d 处" % len(hits))
    for h in hits:
        print("   -", h)
    fails.extend(hits)

    imgs = 0
    for f in glob.glob("site/*.html") + glob.glob("preview/*.html"):
        s = io.open(f, encoding="utf-8").read()
        imgs += len(re.findall(r"<img(?![^>]*alt=)[^>]*>", s))
    rec("INFO", "HTML <img> 缺 alt: %d（装饰图请用 alt=\"\" 或 aria-hidden）" % imgs)

    print("a11y:", "FAIL" if fails else "PASS")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
