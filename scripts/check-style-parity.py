#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""双库样式一致性（React/应用侧 ↔ Vue）—— 解析后的**值**比对。

## 为什么需要它

`goodmom-ui/src/theme.css` 与 `goodmom-vue/src/styles/components.css` 描述**同一套**
`.gm-*` 组件。审计实测：12 处选择器的**解析值真的不同**，例如

    .gm-client background     React rgba(255,255,255,.5)   Vue var(--lg-glass-card) → .22
    .gm-step .gs-dot          React rgba(255,255,255,.8)   Vue var(--lg-glass-control) → .35

这些差异**没有登记在案**（决策记录 D10 只声明了"镜像范围"，未提组件级值差异），
属静默漂移。旧的 `audit.py mirror_sync()` 明确排除 goodmom-vue/**，
`check-status-map.py` 只比"文案 → 语义"映射，**没有一处守门会看这些值**。

## 口径（两层，缺一不可）

**A 层 · 解析后的值**（原有）：
1. 解析两侧 `var(--x)`（用各自的 token 层），把颜色统一成 `r,g,b,a`；
2. 对**同名选择器**的**同名属性**逐一比对；
3. 只报告双方都声明了该属性的差异（一方缺声明由选择器集合检查负责）。

**B 层 · 严格不变量**（V2.9 新增，`strict_checks()`）：
4. **共享选择器的声明写法必须逐字节一致**。A 层比的是解析值，于是
   `var(--lg-border-1)` 与 `1px`、`var(--lg-divider-hairline)` 与 `var(--lg-divider)`
   在浅色档解析值相同 —— A 层绿灯，但 Token 换档后**暗色档就分叉了**。
   实证：`.gm-step.finish .gs-dot` 两侧一写 `var(--lg-text-on-inverse)`、一写死 `#FFF`，
   浅色档都是白、暗色档一个白一个深墨，而旧门禁全程绿灯。
5. **暗色覆盖集合必须一致**：`[data-theme="dark"] .gm-*` 两侧同名同值。
   防「一边有暗色档、另一边漏了 → 暗色下退回浅色值」——这正是 `.gm-cascader__btn`
   与 `.gm-vlist__sticky` 曾经的形态（Vue 漏、React 有）。
6. **Token 层必须一致**：React `theme.css` 的 `:root`/暗色段 与 Vue `base.css` 的
   `:root`/暗色段同名同值（Vue 的 Token 层在 base.css、React 的在 theme.css，
   这是**文件归属差异**而不是值差异）。实证：Vue 曾把暗色 `--lg-tint-base` 写成 `#000000`
   （既撞「禁纯黑」，又让同一 13% 淡底在两库算出不同底色）；Vue 还漏了
   `--lg-tint-pct` 与 `--lg-text-on-inverse`，而 React 漏了 `--lg-font`
   （**7 处 `font-family:var(--lg-font)` 引用一个从未定义的变量 → 整条声明被丢弃，
   React 组件全部回落到浏览器默认字体**）。这三类都跑不出 A 层，只能靠 B 层。

用法：
    python3 scripts/check-style-parity.py          # 报告
    python3 scripts/check-style-parity.py --ci     # 有差异则退出 1
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PAIRS = [
    ("React/应用侧 theme.css", "goodmom-ui/src/theme.css",
     "Vue components.css", "goodmom-vue/src/styles/components.css"),
]
TOKEN_FILES = {
    "goodmom-ui/src/theme.css": ["goodmom-ui/src/theme.css"],
    "goodmom-vue/src/styles/components.css": ["goodmom-vue/src/styles/base.css"],
}
CI = "--ci" in sys.argv

NAMED = {"white": "255,255,255,1", "black": "0,0,0,1", "transparent": "0,0,0,0"}


def strip_comments(s: str) -> str:
    return re.sub(r"/\*.*?\*/", "", s, flags=re.S)


def token_map(paths) -> dict:
    """收集 `:root` / `[data-theme="dark"]` 中的自定义属性（取浅色档为准）"""
    out = {}
    for p in paths:
        if not os.path.exists(p):
            continue
        s = strip_comments(io.open(p, encoding="utf-8").read())
        for m in re.finditer(r":root\s*\{([^}]*)\}", s):
            for d in m.group(1).split(";"):
                if ":" in d:
                    k, v = d.split(":", 1)
                    out.setdefault(k.strip(), v.strip())
    return out


def resolve(value: str, tokens: dict, depth: int = 0) -> str:
    if depth > 10:
        return value
    def sub(m):
        name, fallback = m.group(1), m.group(2)
        if name in tokens:
            return resolve(tokens[name], tokens, depth + 1)
        return resolve(fallback, tokens, depth + 1) if fallback else "/*unresolved*/"
    out = re.sub(r"var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)", sub, value)
    return re.sub(r"\s+", " ", out).strip()


def norm_color(v: str) -> str:
    """把颜色规范化成 r,g,b,a（便于跨 hex / rgb() / rgba() 比对）"""
    v = v.strip().lower()
    if v in NAMED:
        return NAMED[v]
    m = re.fullmatch(r"#([0-9a-f]{3,8})", v)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        if len(h) == 6:
            h += "ff"
        if len(h) == 8:
            return "%d,%d,%d,%s" % (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16),
                                    round(int(h[6:8], 16) / 255, 3))
    m = re.fullmatch(r"rgba?\(([^)]*)\)", v)
    if m:
        p = [x.strip() for x in re.split(r"[,\s/]+", m.group(1)) if x.strip()]
        if len(p) >= 3:
            a = p[3] if len(p) >= 4 else "1"
            return "%s,%s,%s,%s" % (p[0], p[1], p[2], round(float(a), 3))
    return v


def norm_value(prop: str, v: str) -> str:
    v = re.sub(r"\s+", " ", v).strip().rstrip(";")
    # 颜色类属性：把每个颜色 token 规范化
    if prop in ("background", "background-color", "color", "border-color",
                "border", "border-bottom", "border-right", "box-shadow",
                "border-top-color", "border-bottom-color", "outline", "stroke", "fill"):
        def rep(m):
            return norm_color(m.group(0))
        v = re.sub(r"rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b", rep, v)
        v = re.sub(r"\b(white|black|transparent)\b", lambda m: norm_color(m.group(1)), v)
    # 时长统一成 ms
    v = re.sub(r"(\d*\.?\d+)s\b", lambda m: "%gms" % (float(m.group(1)) * 1000), v)
    return v


def decls(path: str, tokens: dict) -> dict:
    """{选择器: {属性: 解析后的值}}；只取顶层规则（忽略 @media 内部，见文件头说明）"""
    s = strip_comments(io.open(path, encoding="utf-8").read())
    s = re.sub(r"@(media|keyframes|supports)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", s)
    out: dict = {}
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", s):
        sels = [re.sub(r"\s+", " ", x.strip()) for x in m.group(1).split(",")]
        for sel in sels:
            if not sel or sel.startswith("@"):
                continue
            slot = out.setdefault(sel, {})
            for d in m.group(2).split(";"):
                if ":" not in d:
                    continue
                k, v = d.split(":", 1)
                k = k.strip().lower()
                rv = resolve(v.strip(), tokens)
                if "unresolved" in rv:
                    continue
                slot[k] = norm_value(k, rv)
    return out


# 允许"只在单侧存在"的 `.gm-*` 选择器（白名单必须写明理由，否则又会变成静默漂移的藏身处）。
# 键是选择器前缀。
#
# V2.9 收紧：此前这里躺着 5 条「已登记为待办」的差异（进度条整体 + 4 条暗色覆盖），
# 白名单成了漂移的藏身处。本轮已把它们**全部补齐**，白名单只剩两类**结构上无法相同**的项：
#   ① Arco 互操作层 —— 只在 React/应用侧有意义（Vue 零基座，没有 Arco 可覆盖）；
#   ② 文件归属差异 —— 同一条规则被放在另一个文件（Vue 的 Token 与工具类在 base.css）。
ONE_SIDED_ALLOW = {
    # ① Arco 互操作层
    ".gm-btn.arco-btn": "Arco 互操作层：仅服务于历史代码里直接用 Arco Button 的写法",
    ".arco-btn-primary.gm-btn-hc": "同上（D9 高对比主行动档的历史选择器）",
    ".gm-btn-hc.arco-btn-primary": "同上（同一历史选择器的另一种书写顺序）",
    ".gm-progress .arco-progress": "Arco 进度条兼容层：应用若仍直用 Arco 进度条，其默认文字色仅 2.90:1",
    # ② 文件归属差异（同一条规则，另一个文件）
    ".gm-sr-only": "屏幕阅读器工具类：React 在 theme.css，Vue 在 base.css（文本逐字节相同）",
}


def raw_decls(path: str) -> dict:
    """{选择器: {属性: 原样文本}} —— **不解析 var()**，用于「写法必须逐字节一致」的严格比对。

    为什么需要它：`decls()` 比的是**解析后的值**，于是
    `var(--lg-border-1)` 与 `1px`、`var(--lg-divider-hairline)` 与 `var(--lg-divider)`
    在浅色档解析值相同 —— 门禁绿，但**暗色档会分叉**（Token 换档后值不再相同）。
    实证：`.gm-step.finish .gs-dot` 的 Vue 侧写死 `#FFF`，React 侧写 `var(--lg-text-on-inverse)`，
    浅色档都是白、暗色档一个白一个深墨 —— `check-style-parity` 全程绿灯。
    """
    s = strip_comments(io.open(path, encoding="utf-8").read())
    s = re.sub(r"@(media|keyframes|supports)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", s)
    out: dict = {}
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", s):
        for sel in [re.sub(r"\s+", " ", x.strip()) for x in m.group(1).split(",")]:
            if not sel or sel.startswith("@"):
                continue
            d = out.setdefault(sel, {})
            for item in m.group(2).split(";"):
                if ":" in item:
                    k, v = item.split(":", 1)
                    d[k.strip().lower()] = re.sub(r"\s+", " ", v.strip())
    return out


def token_layer(path: str, sel: str) -> dict:
    """取某个块里的自定义属性原值（合并同名块，避免重复 `:root` 互相覆盖）"""
    s = strip_comments(io.open(path, encoding="utf-8").read())
    out: dict = {}
    for m in re.finditer(re.escape(sel) + r"\s*\{([^}]*)\}", s):
        for d in m.group(1).split(";"):
            if ":" in d:
                k, v = d.split(":", 1)
                out[k.strip()] = re.sub(r"\s+", " ", v.strip())
    return out


ARCO_ONLY = lambda k: k.startswith(("--primary", "--success", "--warning", "--danger"))


def strict_checks() -> list:
    """三条「零差异」不变量（V2.9 新增，锁住本轮统一化的成果）。

    1. **共享选择器的声明写法逐字节一致**（不只是解析值）—— 防暗色档分叉；
    2. **暗色覆盖集合一致** —— `[data-theme="dark"] .gm-*` 在两侧必须同名同值，
       防「一边有暗色档、另一边漏了」；
    3. **Token 层一致** —— React `theme.css` 的 `:root` / 暗色段 与
       Vue `base.css` 的 `:root` / 暗色段 必须同名同值（Vue 的 Token 层在 base.css，
       React 的在 theme.css，这是**文件归属差异**，不是值差异）。
    """
    problems = []
    ra = raw_decls("goodmom-ui/src/theme.css")
    rb = raw_decls("goodmom-vue/src/styles/components.css")

    # ① 共享选择器写法
    for sel in sorted(set(ra) & set(rb)):
        for prop in sorted(set(ra[sel]) & set(rb[sel])):
            if ra[sel][prop] != rb[sel][prop]:
                problems.append("写法不一致 %s | %s：React=%s  Vue=%s"
                                % (sel, prop, ra[sel][prop], rb[sel][prop]))

    # ② 暗色覆盖集合
    da = {s for s in ra if s.startswith('[data-theme="dark"] .gm')}
    db = {s for s in rb if s.startswith('[data-theme="dark"] .gm')}
    for sel in sorted(da - db):
        problems.append("暗色覆盖仅 React 有：%s（Vue 暗色档会退回浅色值）" % sel)
    for sel in sorted(db - da):
        problems.append("暗色覆盖仅 Vue 有：%s" % sel)

    # ③ Token 层
    for block in (":root", '[data-theme="dark"]'):
        ta = {k: v for k, v in token_layer("goodmom-ui/src/theme.css", block).items()
              if not ARCO_ONLY(k)}
        tb = {k: v for k, v in token_layer("goodmom-vue/src/styles/base.css", block).items()
              if not ARCO_ONLY(k)}
        for k in sorted(set(ta) - set(tb)):
            problems.append("Token 仅 React 有（%s）：%s = %s" % (block, k, ta[k]))
        for k in sorted(set(tb) - set(ta)):
            problems.append("Token 仅 Vue 有（%s）：%s = %s" % (block, k, tb[k]))
        for k in sorted(set(ta) & set(tb)):
            if ta[k] != tb[k]:
                problems.append("Token 值不一致（%s）：%s → React=%s  Vue=%s"
                                % (block, k, ta[k], tb[k]))
    return problems


def one_sided(da: dict, db: dict, label_a: str, label_b: str) -> list:
    """返回只在单侧出现的 `.gm-*` 选择器（未在白名单内）"""
    ok = lambda sel: any(sel.startswith(p) for p in ONE_SIDED_ALLOW)
    out = []
    for sel in sorted(set(da) - set(db)):
        if "gm-" in sel and not ok(sel):
            out.append((sel, label_a))
    for sel in sorted(set(db) - set(da)):
        if "gm-" in sel and not ok(sel):
            out.append((sel, label_b))
    return out


def main() -> int:
    problems = []
    for la, pa, lb, pb in PAIRS:
        if not os.path.exists(pa) or not os.path.exists(pb):
            print("SKIP 缺少文件：%s / %s" % (pa, pb))
            continue
        ta, tb = token_map(TOKEN_FILES.get(pa, [pa])), token_map(TOKEN_FILES.get(pb, [pb]))
        da, db = decls(pa, ta), decls(pb, tb)
        shared = sorted(set(da) & set(db))
        diffs = []
        for sel in shared:
            for prop in sorted(set(da[sel]) & set(db[sel])):
                if da[sel][prop] != db[sel][prop]:
                    diffs.append((sel, prop, da[sel][prop], db[sel][prop]))
        solo = one_sided(da, db, la, lb)
        strict = strict_checks()
        print("── %s  ↔  %s" % (la, lb))
        print("   共同选择器 %d 个；解析值差异 %d 处；单侧独有 .gm-* 选择器 %d 个；严格不变量问题 %d 处"
              % (len(shared), len(diffs), len(solo), len(strict)))
        for sel, prop, va, vb in diffs:
            print("     DIFF %-34s %-16s %s   |   %s" % (sel, prop, va, vb))
            problems.append((la, lb, sel, prop, va, vb))
        for sel, side in solo:
            print("     ONLY %-48s 仅存在于 %s" % (sel, side))
            problems.append((la, lb, sel, "(单侧独有)", side, ""))
        for item in strict:
            print("     STRICT %s" % item)
            problems.append((la, lb, item, "(严格不变量)", "", ""))

    print()
    if problems:
        print("FAIL 双库样式不一致 %d 处 —— 二者必须对齐，或把『有意不同』登记到"
              " docs/审查决策记录.md 并加入本脚本的 ONE_SIDED_ALLOW（白名单必须写明理由）。"
              % len(problems))
        print("     注：只比『共同选择器』会漏掉整类漂移 —— 按钮曾长期分居两套类名"
              "（React .arco-btn-* / Vue .gm-btn--*），交集为空所以永远比不到。")
        return 1
    print("OK 双库同名选择器的解析值完全一致")
    return 0


if __name__ == "__main__":
    sys.exit(main())
