#!/usr/bin/env python3
"""业务状态字典一致性校验（15 章 ⇄ 组件库映射表）

背景：`GmStatusTag` 靠 `tokens/business.ts` 的文案→语义映射自动取色；
漏登记的文案会**静默**回落 neutral 灰、不报错。历史缺陷：`高危`（15.2.9 明确标 🔴）曾漏登记，
线上表现为「高危显示成灰色」，人眼很难第一时间发现。本脚本把这类缺陷变成 CI 失败。

用法：
    python3 scripts/check-status-map.py           # 报告
    python3 scripts/check-status-map.py --ci      # 有差异则退出码 1

校验两面：
  1) 15 章列出但映射表缺失 → 线上会显示错误的灰色（ERROR）
  2) 映射表有但 15 章没有 → 可能是自造词/文档漏记（WARN）
  3) 两侧都有但语义不一致 → 配色错（ERROR）
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "15-妇幼业务词库与状态大典.md"
MAPS = [
    ROOT / "goodmom-vue" / "src" / "tokens" / "business.ts",
    ROOT / "goodmom-ui" / "src" / "tokens" / "business.ts",
]
CI = "--ci" in sys.argv

# 色点 → 六语义（14.4.5）
MARKER = {
    "🟢": "positive",
    "🔵": "info",
    "🟠": "attention",
    "🟡": "attention",
    "🔴": "risk",
    "⚪": "neutral",
    "🟣": "special",
}

# `文案(🟢…)` 形式；文案为中文/字母数字
ENTRY = re.compile(r"([\u4e00-\u9fa5A-Za-z0-9·]+)\s*\(\s*([🟢🔵🟠🟡🔴⚪🟣])")
# 映射表条目： 文案: "semantic"
MAP_ENTRY = re.compile(r"([\u4e00-\u9fa5A-Za-z0-9·]+)\s*:\s*[\"'](positive|info|attention|risk|neutral|special)[\"']")

# 忽略：这些是示例/反例说明里提到的文案，不属于状态清单
IGNORE = {"已随访"}

# 15 章行内色点与 15.5 汇总表口径不一致时的**已裁决例外**（不是 bug，白名单需写明依据）。
# 已逾期：15.2.7 行内标 🔴（风险级），但 15.5 例外条明确规定
#         「任务类『即将到期/已逾期』用琥珀；医疗结果类逾期/未到诊升级为红」。
#         映射表按任务类取 attention（列表页绝大多数逾期是任务类），故为正确口径。
#         医疗结果类逾期请在页面显式传 semantic="risk"。
ACCEPTED_DEVIATION = {
    "已逾期": ("attention", "15.5 例外条：任务类已逾期用琥珀；医疗结果类请在页面显式 semantic=\"risk\""),
}


def parse_spec() -> dict[str, set[str]]:
    """15 章 → {文案: {语义…}}（跨节合并，同一文案允许出现在多节）"""
    text = SPEC.read_text(encoding="utf-8")
    out: dict[str, set[str]] = {}
    for m in ENTRY.finditer(text):
        label, marker = m.group(1), m.group(2)
        if label in IGNORE:
            continue
        out.setdefault(label, set()).add(MARKER[marker])
    return out


def parse_map(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    return {m.group(1): m.group(2) for m in MAP_ENTRY.finditer(path.read_text(encoding="utf-8"))}


# ══════════════════════════════════════════════════════════════════════════
# 六语义色值一致性（P1-1 / P2-12）
# 四个来源必须同号：React tokens/status.ts、Vue tokens/status.ts、
# theme.css(=gm.css) 的浅色 :root、base.css 的浅色 :root。
# ══════════════════════════════════════════════════════════════════════════

SEM_KEYS = ("positive", "info", "attention", "risk", "neutral", "special")


def _ts_colors(path: Path) -> dict:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    m = re.search(r"SEMANTIC_COLOR[^{]*\{(.*?)\}", text, re.S)
    if not m:
        return {}
    return {k: v.upper() for k, v in
            re.findall(r"(positive|info|attention|risk|neutral|special)\s*:\s*\"(#[0-9A-Fa-f]{6})\"",
                       m.group(1))}


def _css_colors(path: Path) -> dict:
    """取浅色 `:root` 块里的 --lg-sem-* （不取 [data-theme="dark"]）"""
    if not path.exists():
        return {}
    text = re.sub(r"/\*.*?\*/", "", path.read_text(encoding="utf-8"), flags=re.S)
    m = re.search(r"(?<!\])\:root\s*\{([^}]*)\}", text)
    if not m:
        return {}
    return {k: v.upper() for k, v in
            re.findall(r"--lg-sem-(positive|info|attention|risk|neutral|special)\s*:\s*(#[0-9A-Fa-f]{6})",
                       m.group(1))}


def check_semantic_colors() -> list:
    sources = {
        "goodmom-ui/src/tokens/status.ts": _ts_colors(Path("goodmom-ui/src/tokens/status.ts")),
        "goodmom-vue/src/tokens/status.ts": _ts_colors(Path("goodmom-vue/src/tokens/status.ts")),
        "goodmom-ui/src/theme.css": _css_colors(Path("goodmom-ui/src/theme.css")),
        "goodmom-vue/src/styles/base.css": _css_colors(Path("goodmom-vue/src/styles/base.css")),
    }
    errs = []
    for name, colors in sources.items():
        if not colors:
            errs.append(f"语义色：{name} 未解析到任何 --lg-sem-* / SEMANTIC_COLOR 条目")
            continue
        ref = sources["goodmom-ui/src/tokens/status.ts"]
        for k in SEM_KEYS:
            if k in ref and colors.get(k) and colors[k] != ref[k]:
                errs.append(f"语义色漂移：{name} 的 {k}={colors[k]}，React tokens 为 {ref[k]}")
    return errs


def main() -> int:
    if not SPEC.exists():
        print(f"ERROR: 找不到规范文件 {SPEC}")
        return 1

    spec = parse_spec()
    errors: list[str] = []
    warns: list[str] = []

    print(f"15 章状态文案：{len(spec)} 条\n")

    for map_path in MAPS:
        rel = map_path.relative_to(ROOT)
        mapping = parse_map(map_path)
        if not mapping:
            print(f"WARN: 未解析到映射条目（{rel}）\n")
            continue

        missing = sorted(set(spec) - set(mapping))
        extra = sorted(set(mapping) - set(spec))
        conflict = sorted(
            lbl for lbl in set(spec) & set(mapping)
            if mapping[lbl] not in spec[lbl]
            and ACCEPTED_DEVIATION.get(lbl, (None,))[0] != mapping[lbl]
        )
        accepted = sorted(
            lbl for lbl in set(spec) & set(mapping)
            if mapping[lbl] not in spec[lbl]
            and ACCEPTED_DEVIATION.get(lbl, (None,))[0] == mapping[lbl]
        )

        print(f"── {rel}（{len(mapping)} 条）")
        if missing:
            errors.append(f"[{rel}] 15 章有、映射表缺（会静默显示灰色）：{'、'.join(missing)}")
        if conflict:
            detail = "、".join(
                f"{lbl}(15章={'/'.join(sorted(spec[lbl]))} vs 表={mapping[lbl]})" for lbl in conflict
            )
            errors.append(f"[{rel}] 语义不一致：{detail}")
        if extra:
            warns.append(f"[{rel}] 映射表有、15 章未见（可能是自造词或文档漏记）：{'、'.join(extra)}")
        for lbl in accepted:
            print(f"   ℹ️  已裁决例外 {lbl} → {mapping[lbl]}（{ACCEPTED_DEVIATION[lbl][1]}）")
        if not (missing or conflict or extra):
            print("   ✅ 与 15 章一致")
        print()

    for w in warns:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")

    # ── 附带校验：六语义**色值**必须四处同号 ──────────────────────────────
    # 背景：`goodmom-vue/src/tokens/business.ts` 曾声称"由 audit.py mirror_sync 守门，
    # 否则 CI FAIL"，但该机制**并不存在**（mirror_sync 明确排除 goodmom-vue/**），
    # 实际只比"文案→语义"映射、从不比色值。于是 P1-1 的色板偏浅长期无人守。
    color_errors = check_semantic_colors()
    if color_errors:
        errors.extend(color_errors)
        for e in color_errors:
            print(f"ERROR {e}")

    if errors:
        print(f"\n❌ 状态字典校验失败：{len(errors)} 项错误")
        return 1 if CI else 0
    print("✅ 状态字典与 15 章一致" + (f"（{len(warns)} 项告警）" if warns else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
