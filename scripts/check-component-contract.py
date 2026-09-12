#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""双库组件契约一致性（`@goodmom/ui` ↔ `@goodmom/vue`）。

## 为什么需要它

`docs/设计系统问题清单.md` P1-12 实测：同名组件在两个库里 API 与默认行为大面积分歧 ——
`GmButton` 在 Vue 有 `type/status/size/shape/long/ariaLabel/nativeType/icon` 八个 prop，
React 一个都没有（它只是 Arco `<Button>` 的薄包装）；`GmStatusTag` 的默认尺寸一个
small 一个 default；`GmTag` 的 `five` 只有 Vue 有。两个包对外都叫 `@goodmom/*`，
调用方换一个包就会静默换一套行为。

`scripts/check-style-parity.py` 只比 **CSS**；`audit.py mirror_sync` 只比
React ↔ 应用镜像。**没有任何一处比对两个库的 props 面**，所以这类分歧可以无限积累。

## 检查项（作用域写清楚，避免"作用域比结论窄"）

1. **props 名集合**：同名组件在两侧的 prop 名必须一致。
2. **默认值**：两侧都声明默认值的 prop，值必须一致。
3. **契约类名**：两侧组件源码里出现的 `gm-*` **类名字面量**集合必须一致
   （`GmButton` 分歧的根因正是"一边输出 `.arco-btn-*`、一边输出 `.gm-btn--*`"）。
4. **目录约定**：React 侧不得再出现 `src/adapters/`（Vue 把所有组件都放在
   `src/components/`，同组件跨包不同目录属 P1-12 第 8 条）。

用法：
    python3 scripts/check-component-contract.py          # 报告
    python3 scripts/check-component-contract.py --ci     # 有差异则退出 1
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CI = "--ci" in sys.argv

REACT_DIR = "goodmom-ui/src/components"
VUE_DIR = "goodmom-vue/src/components"

# 已登记的两库差异：组件名 → (原因, 涉及方面)。加白名单必须写明理由与后续计划。
KNOWN_DIVERGENCE = {
    # ── A 类：宿主渲染模型不同（React render-prop ↔ Vue 具名插槽） ──
    #    这不是"两套设计"，而是两个框架表达同一件事的惯用写法；
    #    两边都提供相同的能力，只是传参方式不同。**不要求对齐 props 名。**
    "GmCard": (
        "React 用 ReactNode（title/extra/children/style），Vue 用插槽（title/extra/footer 槽）"
        "并多出 hoverable/bodyless —— React render-prop ↔ Vue 具名插槽，同一能力的两种惯用写法。"
        "**待办**：至少统一 radius 默认值与 hover/bodyless 的等价能力。",
        {"props", "classes"},
    ),
    "GmClientCard": (
        "React 用 actions/extra/tags（ReactNode 数组），Vue 用同名具名插槽 —— 同上。",
        {"props"},
    ),
    "GmResponsiveView": (
        "React 用 table/condensed/empty（render prop），Vue 用同名插槽 —— 同上；"
        "`modeChange` / `onModeChange` 已归一为同一事件名。",
        {"props"},
    ),
    "GmProgress": (
        "React 基于 Arco Progress 渲染，Vue 为自包含实现（.gm-progress__*）—— "
        "两个库的进度条视觉契约尚未统一。**已登记为待办**（与 check-style-parity.py 的白名单同源）。",
        {"props", "classes"},
    ),
    "GmStatusTag": (
        "Vue 另有 closeLabel（关闭按钮可访问名）—— React 侧已补 closable/onClose，"
        "**待办**：把 closeLabel 也补上，然后从本白名单移除。",
        {"props"},
    ),

    # ── B 类：受控值的写法不同（React `value` ↔ Vue `v-model`） ──
    #    Vue 的 v-model 会展开成 modelValue + update:modelValue 两个成员，
    #    因此 props 名集合天然无法与 React 的 value/onChange 相等。
    #    行为契约一致（单一受控值 + 变更回调），故不强制改名。
    "GmCascader": (
        "React `value` + onChange ↔ Vue `v-model`（展开为 modelValue/update:modelValue）——"
        "受控值的框架惯用写法不同，行为契约一致。",
        {"props"},
    ),
    "GmRiskPicker": (
        "React `value` + onChange ↔ Vue `v-model` —— 同上。",
        {"props"},
    ),

    # ── C 类：确实是能力缺口，已登记为待办（保留在名单里以免误判为"已对齐"） ──
    "GmVirtualList": (
        "React 用 renderItem / stickyTop（render prop），Vue 用默认插槽 / sticky 插槽 —— A 类；"
        "`itemKey` 已补入 Vue。**待办**：确认 Vue 侧 sticky 插槽与 React stickyTop 行为等价后收窄本条目。",
        {"props"},
    ),
}


# 框架级 props：两个宿主的写法天然不同（React 显式声明 children/className/style，
# Vue 走默认插槽 / class / style 透传），不属设计契约，不参与比对。
# 回调（on*）**属于契约**，但改用 Vue 的 defineEmits 与之比对（见下）。
FRAMEWORK_PROPS = {"children", "className", "style", "id", "role", "tabIndex", "key", "ref"}


def camel_to_emit(name: str) -> str:
    """React `onClose` → Vue emit `close`；`onValueChange` → `valueChange`"""
    return name[2].lower() + name[3:] if len(name) > 2 else ""


# ══════════════════════════════════════════════════════════════════════════
# 解析
# ══════════════════════════════════════════════════════════════════════════

def strip_comments(s: str) -> str:
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    s = re.sub(r"^\s*//.*$", "", s, flags=re.M)
    return s


def extract_classes(s: str) -> set:
    """提取源码里出现的 `gm-*` 类名字面量。

    用"引号/反引号后紧跟 gm-"的前缀匹配，而不是要求引号内整体就是类名 ——
    否则 `"gm-step " + st`（拼接）与 `` `gm-status-tag--${size}` ``（模板）都会漏掉，
    造成"类名不一致"的假报。末尾多余的 `-` 归一掉（模板前缀）。
    传入的必须是**已剥离注释**的源码，否则注释里的规范引用会被当成实现。
    """
    out = set()
    for m in re.finditer(r"""["'`](gm-[a-z0-9-]+)""", s):
        out.add(m.group(1).rstrip("-"))
    return out


def brace_block(s: str, start: int) -> str:
    """从 start 处的 '{' 开始取配对内容"""
    depth, i = 0, start
    while i < len(s):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return s[start + 1:i]
        i += 1
    return ""


def react_contract(path: str) -> dict:
    raw = io.open(path, encoding="utf-8").read()
    s = strip_comments(raw)
    props: dict = {}
    m = re.search(r"export interface \w+Props\s*", s)
    if m:
        brace = s.find("{", m.end())
        body = brace_block(s, brace)
        # 逐条取 `name?: Type;`（类型里的 {} 不参与 prop 名）
        for pm in re.finditer(r"(?:^|;|\n)\s*([A-Za-z_]\w*)\s*\??\s*:", body):
            props[pm.group(1)] = None
    defaults: dict = {}
    dm = re.search(r"\)\s*=>\s*\{|\)\s*=>\s*\(", s)
    head = s[: dm.start()] if dm else s
    for am in re.finditer(r"(\w+)\s*=\s*([^,)\n}]+)", head):
        name, val = am.group(1), am.group(2).strip()
        if name in ("React", "forwardRef", "require"):
            continue
        defaults[name] = re.sub(r"\s+", " ", val)
    classes = extract_classes(s)
    callbacks = {camel_to_emit(k) for k in props if re.match(r"^on[A-Z]", k)}
    plain = {k for k in props if not re.match(r"^on[A-Z]", k)} - FRAMEWORK_PROPS
    return {"props": plain, "defaults": defaults, "classes": classes, "emits": callbacks}


def vue_contract(path: str) -> dict:
    raw = io.open(path, encoding="utf-8").read()
    s = strip_comments(raw)
    props: dict = {}
    defaults: dict = {}
    m = re.search(r"defineProps\s*<", s)
    if m:
        inner = s[m.end():]
        # 形态一：defineProps<{ ... }>()
        if inner.lstrip().startswith("{"):
            brace = s.find("{", m.end())
            body = brace_block(s, brace)
        else:
            # 形态二：defineProps<GmXxxProps<T>>() —— props 类型是**具名接口**，
            # 必须回到文件里把那个 interface 找出来，否则整组 props 会被漏读
            # （GmVirtualList / GmProgress 就是这种写法，漏读会把它们误报成"props 不一致"）。
            name = re.match(r"\s*([A-Za-z_]\w*)", inner)
            m2 = re.search(r"interface\s+%s\b[^{]*" % re.escape(name.group(1)), s) if name else None
            body = brace_block(s, s.find("{", m2.end())) if m2 else ""
        for pm in re.finditer(r"(?:^|;|\n)\s*([A-Za-z_]\w*)\s*\??\s*:", body):
            props[pm.group(1)] = None
    dm = re.search(r"withDefaults\s*\([^,]*,\s*\{", s)
    if dm:
        body = brace_block(s, dm.end() - 1)
        for am in re.finditer(r"(\w+)\s*:\s*([^,\n}]+)", body):
            defaults[am.group(1)] = re.sub(r"\s+", " ", am.group(2).strip())
    classes = extract_classes(s)
    emits = set(re.findall(r'\(\s*e\s*:\s*"([^"]+)"', s))
    emits |= set(re.findall(r"defineEmits\s*\(\s*\[([^\]]*)\]", s) and
                 re.findall(r'"([^"]+)"', re.search(r"defineEmits\s*\(\s*\[([^\]]*)\]", s).group(1)))
    # Vue 里回调既可以写成 emit（@click / v-model），也可以写成 `onXxx` prop
    # （GmVirtualList 的 onEndReached）。两者都归一成"事件名"，才能与 React 的 on* 对齐。
    for k in list(props):
        if re.match(r"^on[A-Z]", k):
            emits.add(camel_to_emit(k))
            props.pop(k)
    emits = {e for e in emits if not e.startswith("update:")}
    return {"props": props, "defaults": defaults, "classes": classes, "emits": emits}


def norm_default(v: str):
    """把两侧的默认值写法归一到可比较形式。

    React 直接把数组写在参数默认值里（`widths = ["100%","80%"]`），
    Vue 用工厂函数（`widths: () => ["100%","80%"]`）—— 去掉箭头外壳与引号/空格
    后才能比较，否则会把"同一份数组"报成不一致。
    """
    v = (v or "").strip()
    v = re.sub(r"^\(?\s*\)?\s*=>\s*", "", v)
    v = v.replace('"', "").replace("'", "").replace(" ", "")
    v = v.strip('"').strip("'")
    if v in ("undefined", "null"):
        return None
    if v in ("true", "false"):
        return v
    try:
        return str(float(v))
    except ValueError:
        return v


def main() -> int:
    react_files = {os.path.basename(f)[:-4]: os.path.join(REACT_DIR, f)
                   for f in sorted(os.listdir(REACT_DIR)) if f.endswith(".tsx")}
    vue_files = {os.path.basename(f)[:-4]: os.path.join(VUE_DIR, f)
                 for f in sorted(os.listdir(VUE_DIR)) if f.endswith(".vue")}
    shared = sorted(set(react_files) & set(vue_files))

    problems = []
    print("双库组件契约比对：React %d 个 · Vue %d 个 · 同名配对 %d 个"
          % (len(react_files), len(vue_files), len(shared)))

    only_r = sorted(set(react_files) - set(vue_files))
    only_v = sorted(set(vue_files) - set(react_files))
    if only_r:
        problems.append(("组件缺失", "仅 React 有：%s" % only_r))
    if only_v:
        problems.append(("组件缺失", "仅 Vue 有：%s" % only_v))

    for name in shared:
        rc = react_contract(react_files[name])
        vc = vue_contract(vue_files[name])
        allow = KNOWN_DIVERGENCE.get(name)
        allowed = allow[1] if allow else set()
        notes = []

        rp, vp = set(rc["props"]), set(vc["props"])
        if rp != vp and "props" not in allowed:
            notes.append("props 不一致：仅 React %s；仅 Vue %s"
                         % (sorted(rp - vp), sorted(vp - rp)))
        diffs = []
        for k in sorted(rp & vp):
            if k in rc["defaults"] and k in vc["defaults"]:
                a, b = norm_default(rc["defaults"][k]), norm_default(vc["defaults"][k])
                if a != b:
                    diffs.append("%s: React=%s Vue=%s" % (k, a, b))
        if diffs and "props" not in allowed:
            notes.append("默认值不一致：" + "；".join(diffs))

        rc_cls = {c for c in rc["classes"] if c.startswith("gm-")}
        vc_cls = {c for c in vc["classes"] if c.startswith("gm-")}
        re_em, ve_em = rc["emits"], vc["emits"]
        if re_em != ve_em and "events" not in allowed:
            notes.append("事件不一致：仅 React %s；仅 Vue %s"
                         % (sorted(re_em - ve_em), sorted(ve_em - re_em)))

        if rc_cls != vc_cls and "classes" not in allowed:
            notes.append("契约类名不一致：仅 React %s；仅 Vue %s"
                         % (sorted(rc_cls - vc_cls), sorted(vc_cls - rc_cls)))

        if notes:
            print("  FAIL %-18s" % name)
            for n in notes:
                print("       " + n)
                problems.append((name, n))
        elif allow:
            print("  KNOWN %-17s（已登记差异：%s）" % (name, allow[0][:56] + "…"))
        else:
            print("  OK   %-18s props %d · 默认值 %d · 契约类名 %d"
                  % (name, len(rp), len(set(rc["defaults"]) & set(vc["defaults"])), len(rc_cls)))

    # 目录约定
    for d in ("goodmom-ui/src/adapters", "frontend-app/packages/gm-arco-ui/src/adapters"):
        if os.path.isdir(d):
            problems.append(("目录约定", "%s 仍存在 —— 组件必须统一放在 src/components/（P1-12 第 8 条）" % d))

    print()
    if problems:
        print("FAIL 双库契约不一致 %d 处：" % len(problems))
        for a, b in problems:
            print("  - %s：%s" % (a, b))
        print("\n对齐方式：改实现，或把『有意不同』登记进本脚本 KNOWN_DIVERGENCE 并写明理由与后续计划。")
        return 1
    print("OK 双库同名组件的 props / 默认值 / 契约类名一致（%d 对）" % len(shared))
    return 0


if __name__ == "__main__":
    sys.exit(main())
