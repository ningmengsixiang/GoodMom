#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""工程架构门禁（19 · 19.4–19.7）

把"架构规范"变成可机械判定的检查 —— 否则它只是文档里的一段话，
第一次赶工就会被绕过，而且绕过之后没有任何人会发现（本仓最贵的一课）。

规则（每条都对应一次真实会发生的漂移）：

  B1 跨模块引用必须走公共出口        禁止 `@/modules/x/pages/...` 这类深链
  B2 跨模块依赖必须在 README 里声明  依赖是模块边界的一部分，不是"顺手 import"
  B3 分层方向单向                    shared 不得依赖 modules/app；modules 不得依赖 app
  B4 dev/ 不进业务链路              modules/shared 不得引用 dev/
  B5 模块边界声明完整                每个模块必须有 index.ts / model.ts / README.md
                                    且 README 含「拥有 / 依赖 / 对外契约 / 状态词 / 硬规则」
  B6 状态词必须在 15 章登记           model.ts 的 STATUS 键 ⊆ business.ts 的字典键
                                    （未登记词会**静默**回落灰色，线上表现为「高危显示成灰」）
  B7 业务代码禁裸色值                 modules/ shared/ app/ dev/ 的 .ts/.tsx 不得出现 #hex
  B8 业务代码禁内联玻璃配方          不得内联 linear-gradient( / box-shadow: / rgba( 做底色
                                    （配方只允许在组件库或 styles/*.css 里定义一次）
  B9 CSS 变量必须可解析              业务代码引用的 var(--x) 要么在 theme.css/gm.css 里定义，
                                    要么带兜底值（无兜底 + 未定义 = 整条声明被静默丢弃）

用法：
    python3 scripts/check-module-boundary.py            # 在仓库根执行
    python3 scripts/check-module-boundary.py --only B6   # 只跑某条（负向测试用）
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, "frontend-app")
SRC = os.path.join(APP, "src")
MODULES = os.path.join(SRC, "modules")
BUSINESS = os.path.join(ROOT, "goodmom-ui", "src", "tokens", "business.ts")
THEME_CSS = [os.path.join(ROOT, "goodmom-ui", "src", "theme.css"),
             os.path.join(APP, "packages", "gm-arco-ui", "src", "gm.css"),
             os.path.join(SRC, "styles", "base.css"),
             os.path.join(SRC, "styles", "layout.css")]

problems: list[tuple[str, str]] = []


def bad(rule: str, msg: str) -> None:
    problems.append((rule, msg))


def walk(exts: tuple[str, ...]) -> list[str]:
    out = []
    for root, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "dist")]
        for f in sorted(files):
            if f.endswith(exts):
                out.append(os.path.join(root, f))
    return sorted(out)


def rel(p: str) -> str:
    return os.path.relpath(p, APP).replace(os.sep, "/")


def module_names() -> list[str]:
    if not os.path.isdir(MODULES):
        return []
    return sorted(d for d in os.listdir(MODULES) if os.path.isdir(os.path.join(MODULES, d)))


IMPORT_RE = re.compile(r"""(?:import|export)[^;]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)""", re.S)


def imports_of(path: str) -> list[tuple[int, str]]:
    """返回 [(行号, 模块说明符)]，覆盖静态 import/export 与动态 import()"""
    src = io.open(path, encoding="utf-8").read()
    out = []
    for m in IMPORT_RE.finditer(src):
        spec = m.group(1) or m.group(2)
        if spec:
            out.append((src[: m.start()].count("\n") + 1, spec))
    return out


def layer_of(path: str) -> str:
    r = rel(path)
    for name in ("modules", "shared", "app", "dev"):
        if r.startswith(f"src/{name}/") or r == f"src/{name}":
            return name
    return "entry"


def module_of(path: str) -> str | None:
    r = rel(path)
    m = re.match(r"src/modules/([^/]+)/", r)
    return m.group(1) if m else None


def declared_deps(mod: str) -> set[str]:
    """从模块 README 的「依赖」行里抽出被依赖的模块名（其余如 shared/* 忽略）"""
    p = os.path.join(MODULES, mod, "README.md")
    if not os.path.exists(p):
        return set()
    text = io.open(p, encoding="utf-8").read()
    m = re.search(r"\|\s*依赖\s*\|([^|]*)\|", text)
    if not m:
        return set()
    cell = m.group(1)
    return {n for n in module_names() if n != mod and re.search(r"(?<![\w-])%s(?![\w-])" % re.escape(n), cell)}


# ── B1 / B2 / B3 / B4：引用方向与出口 ────────────────────────────────────
def check_imports() -> None:
    mods = module_names()
    for f in walk((".ts", ".tsx")):
        src_layer = layer_of(f)
        src_mod = module_of(f)
        if src_layer not in ("modules", "shared", "app", "dev"):
            continue
        for line, spec in imports_of(f):
            if spec.startswith("@/modules/"):
                rest = spec[len("@/modules/"):]
                target, _, sub = rest.partition("/")
                if target not in mods:
                    bad("B1", f"{rel(f)}:{line} 引用了不存在的模块 `{target}`")
                    continue
                # B1：只能走公共出口；自己模块内部用相对路径，不该出现 @/modules/<self>/...
                if sub:
                    bad("B1", f"{rel(f)}:{line} 跨模块深链 `{spec}` —— 只能 import `@/modules/{target}`（公共出口）")
                elif src_mod == target:
                    bad("B1", f"{rel(f)}:{line} 用 `@/modules/{target}` 引用了**自己**模块 —— 模块内请用相对路径")
                # B2：依赖必须声明
                elif src_mod and target not in declared_deps(src_mod):
                    bad("B2", f"{rel(f)}:{line} 模块 `{src_mod}` 依赖 `{target}`，但 README 的「依赖」行未声明")
            # B3：分层方向
            if spec.startswith("@/modules/") and src_layer in ("shared", "dev"):
                bad("B3", f"{rel(f)}:{line} `{src_layer}/` 不得依赖 modules/（分层方向单向：app → modules → shared）")
            if spec.startswith(("@/app/", "@/app")):
                if src_layer in ("shared", "modules"):
                    bad("B3", f"{rel(f)}:{line} `{src_layer}/` 不得依赖 app/（分层方向单向：app → modules → shared）")
            # B4：dev 不进业务链路（只有 app/ 装配层可以把 dev 页面挂成一条路由）
            if spec.startswith("@/dev/") and src_layer != "app":
                bad("B4", f"{rel(f)}:{line} `{src_layer}/` 不得引用 dev/ —— "
                          f"开发期页面只允许由 app/ 装配（生产开关也在 app/）")


# ── B5：模块边界声明完整 ────────────────────────────────────────────────
def check_module_shape() -> None:
    for m in module_names():
        base = os.path.join(MODULES, m)
        for need in ("index.ts", "model.ts", "README.md"):
            if not os.path.exists(os.path.join(base, need)):
                bad("B5", f"模块 `{m}` 缺少 {need}")
        rp = os.path.join(base, "README.md")
        if os.path.exists(rp):
            t = io.open(rp, encoding="utf-8").read()
            for key in ("拥有", "依赖", "对外契约", "状态词", "硬规则"):
                if not re.search(r"(\|\s*%s|^#+\s*.*%s|-\s*\*\*%s)" % (key, key, key), t, re.M):
                    bad("B5", f"模块 `{m}` 的 README 未声明「{key}」（边界声明不完整）")
        idx = os.path.join(base, "index.ts")
        if os.path.exists(idx):
            t = io.open(idx, encoding="utf-8").read()
            if "export * from \"./model\"" not in t and "./model" not in t:
                bad("B5", f"模块 `{m}` 的 index.ts 未导出 model（契约面缺失）")


# ── B6：状态词必须已在 15 章登记 ────────────────────────────────────────
def check_status_words() -> None:
    if not os.path.exists(BUSINESS):
        bad("B6", "找不到 goodmom-ui/src/tokens/business.ts（状态词唯一字典）")
        return
    t = io.open(BUSINESS, encoding="utf-8").read()
    m = re.search(r"const MAP[^{]*\{(.*?)\n\};", t, re.S)
    registered = set(re.findall(r"([^\s,{}:]+)\s*:\s*\"", m.group(1))) if m else set()
    if not registered:
        bad("B6", "未能从 business.ts 解析出字典键（正则失效，需同步）")
        return
    for mod in module_names():
        p = os.path.join(MODULES, mod, "model.ts")
        if not os.path.exists(p):
            continue
        s = io.open(p, encoding="utf-8").read()
        blk = re.search(r"STATUS[^{]*\{(.*?)\n\};", s, re.S)
        if not blk:
            bad("B6", f"模块 `{mod}` 的 model.ts 缺少 STATUS 映射")
            continue
        words = re.findall(r"^\s*([^\s,{}:]+)\s*:\s*\"", blk.group(1), re.M)
        unknown = [w for w in words if w not in registered]
        if unknown:
            bad("B6", f"模块 `{mod}` 用了未登记的状态词 {unknown} —— "
                      f"先登记 goodmom-ui/src/tokens/business.ts（+镜像）与 15 章，否则界面会**静默**回落灰色")


# ── B7 / B8：业务代码不写色值与玻璃配方 ─────────────────────────────────
HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
GLASS_RE = re.compile(r"linear-gradient\(|radial-gradient\(|box-shadow\s*:|rgba\(")


def strip_var_spans(code: str) -> str:
    """剥掉 `var(--x, ...)` 整段（含嵌套括号）。

    为什么必须剥：`var(--lg-text-secondary,#4F5B6E)` 里的 #4F5B6E 是**兜底值**，
    不是"页面自己发明颜色" —— 而且 B9 明确要求"未定义且无兜底"才算缺陷。
    若不剥，正确的写法反而会被判违规（工具口径必须与规范口径一致）。"""
    out, i, n = [], 0, len(code)
    while i < n:
        j = code.find("var(", i)
        if j < 0:
            out.append(code[i:])
            break
        out.append(code[i:j])
        depth, k = 0, j + 3
        while k < n:
            if code[k] == "(":
                depth += 1
            elif code[k] == ")":
                depth -= 1
                if depth == 0:
                    k += 1
                    break
            k += 1
        i = k
    return "".join(out)


def check_no_raw_style() -> None:
    for f in walk((".ts", ".tsx")):
        r = rel(f)
        if r.startswith("src/styles/"):
            continue
        lines = io.open(f, encoding="utf-8").read().splitlines()
        for i, line in enumerate(lines, 1):
            code = line.split("//")[0]
            # 允许注释里出现（注释说明色值口径是必要的）
            code = re.sub(r"/\*.*?\*/", "", code)
            if i > 1 and lines[i - 2].strip().startswith(("*", "/*")):
                continue
            code = strip_var_spans(code)      # var() 兜底值不算裸色值
            m = HEX_RE.search(code)
            if m:
                bad("B7", f"{r}:{i} 业务代码出现裸色值 `{m.group(0)}` —— 改用 Token（--lg-* / --mmh-* / 语义色）")
            if GLASS_RE.search(code):
                bad("B8", f"{r}:{i} 内联玻璃配方（gradient/阴影/rgba 底）—— 配方只允许在组件库或 styles/*.css 定义一次")


# ── B9：CSS 变量可解析 ──────────────────────────────────────────────────
VAR_RE = re.compile(r"var\(\s*(--[\w-]+)\s*([^)]*)\)")


def check_css_vars() -> None:
    defined: set[str] = set()
    for f in THEME_CSS:
        if os.path.exists(f):
            defined |= set(re.findall(r"(--[\w-]+)\s*:", io.open(f, encoding="utf-8").read()))
    for f in walk((".ts", ".tsx", ".css")):
        text = io.open(f, encoding="utf-8").read()
        for i, line in enumerate(text.splitlines(), 1):
            for m in VAR_RE.finditer(line):
                name, rest = m.group(1), m.group(2)
                if rest.strip().startswith(","):
                    continue      # 有兜底值 → 即使未定义也不会静默丢声明
                if name not in defined:
                    bad("B9", f"{rel(f)}:{i} `var({name})` 既未定义又无兜底 —— 整条声明会被静默丢弃")


CHECKS = {
    "B1": check_imports, "B2": check_imports, "B3": check_imports, "B4": check_imports,
    "B5": check_module_shape, "B6": check_status_words,
    "B7": check_no_raw_style, "B8": check_no_raw_style, "B9": check_css_vars,
}


def main() -> int:
    only = ""
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    if not os.path.isdir(SRC):
        print("找不到 frontend-app/src —— 请在仓库根执行")
        return 2
    seen: set = set()
    for key, fn in CHECKS.items():
        if only and key != only:
            continue
        if fn in seen:      # B1–B4 共用一个扫描函数：只跑一次，避免重复报同一处
            continue
        seen.add(fn)
        fn()

    hits = [p for p in problems if not only or p[0] == only]
    if hits:
        print("工程架构门禁：FAIL %d 项" % len(hits))
        for rule, msg in hits[:40]:
            print(f"  [{rule}] {msg}")
        if len(hits) > 40:
            print(f"  …… 其余 {len(hits) - 40} 项省略")
        return 1
    print("工程架构门禁：OK（模块边界 / 分层方向 / 状态词登记 / 色值与配方 / CSS 变量）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
