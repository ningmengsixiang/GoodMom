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
# ══════════════════════════════════════════════════════════════════════════
# 宿主惯用写法映射（IDIOM）—— **唯一**允许"叫法不同"的地方
#
# V2.9 之前这里是一张 KNOWN_DIVERGENCE 白名单，粒度是「允许这个组件的 props 不一致」——
# 于是整组 props 与默认值的比对被跳过，实测漏掉了这些真差异：
#   · `GmStatusTag` 的 `size` 默认值两侧不同（small / default）→ 同一行代码两个库渲染不同尺寸
#   · `GmStatusTag` 的 `set="large"` 在 React 输出一个 CSS 里不存在的类名（prop 完全无效）
#   · `GmCard` 的 `hoverable`/`bodyless` 只有 Vue 有（能力缺口）
#   · `GmEmpty` 的 `title` 默认值不同（Vue 渲染「暂无数据」、React 什么都不渲染）
#
# 现在改成**归一化后再严格比对**：把两侧的惯用写法映射到同一个规范名，
# 然后要求集合完全相等。于是「惯用写法差异」被显式承认，
# 而**任何新的漂移照旧 FAIL** —— 白名单不再能藏住真差异。
#
# 每条都必须是**宿主语言层面的惯用写法**，不是"懒得对齐"：
#   · 受控值：React 用 `value` + `onChange`；Vue 用 `v-model`（`modelValue` + `update:modelValue`）
#   · 具名区域：React 用 render prop / ReactNode prop；Vue 用具名插槽
# 归一化后的规范名：受控值 → `value` / 事件 `change`；具名区域 → `#<name>`。
IDIOM = {
    "GmCascader": {
        "value": "v-model   受控值：React value+onChange ↔ Vue v-model（modelValue+update:modelValue）",
        "onChange": "v-model   同上（事件侧）",
    },
    "GmRiskPicker": {
        "value": "v-model   受控值（同上）",
        "onChange": "v-model   同上（事件侧）",
    },
    "GmResponsiveView": {
        "table": "#table      具名区域：React render prop ↔ Vue 具名插槽",
        "condensed": "#condensed  同上",
        "empty": "#empty      同上",
        "card": "#card       同上",
    },
    "GmVirtualList": {
        "renderItem": "#default    具名区域：React renderItem ↔ Vue 默认插槽",
        "stickyTop": "#sticky     同上",
    },
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
    """提取源码里出现的**全部** `gm-*` 类名字面量。

    为什么不能用"引号配对"来取（V2.9 实测两次踩坑）：
      · 旧实现是「引号后紧跟 `gm-`」的前缀匹配 → 每个字符串里**只有第一个**类名被看到，
        一侧多输出一个类不会 FAIL（负向测试当场抓出）；
      · 改成"引号配对"后仍然漏：Vue 的 `:class="cx('gm-risk')"` 里**引号嵌套**，
        扫描在 `"cx(` 处就把 `'` 当成配对的收尾吃掉了，紧跟其后的 `gm-risk` 再也进不了视野。
    结论：不做引号配对，**全量扫描** `gm-*` 词元。

    两个降噪处理：
      1. 先剥掉 `.gm-xxx`（选择器写法）—— 它不是"输出的类名"；
      2. 末端的裸 `-` 归一掉（模板前缀，如 `` `gm-btn--${size}` `` → `gm-btn--` → `gm-btn`）。
    传入的必须是**已剥离注释**的源码，否则注释里的规范引用会被当成实现。
    """
    s = re.sub(r"\.gm-[a-z0-9-]+", "", s)
    out = set()
    for c in re.findall(r"gm-[a-z0-9-]+", s):
        c = c.rstrip("-")
        if c and c != "gm":
            out.add(c)
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
    has_children = "children" in props
    plain = {k for k in props if not re.match(r"^on[A-Z]", k)} - FRAMEWORK_PROPS
    return {"props": plain, "defaults": defaults, "classes": classes, "emits": callbacks,
            "children": has_children}


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


def react_render_slots(name: str) -> set:
    """React 侧的「具名区域」名字：即 IDIOM 里声明为 `#xxx` 的那些 prop。

    React 没有插槽，具名区域就是 prop（ReactNode 或 render function），
    因此这里只需要回读 IDIOM，不做猜测。
    """
    out = set()
    for key, why in IDIOM.get(name, {}).items():
        if why.startswith("#"):
            out.add(why.split()[0][1:])
    return out


def vue_slots(path: str) -> set:
    """Vue 具名插槽名：从 `defineSlots<{ ... }>()` 与模板 `<slot name="x">` 两处取。

    ⚠️ 只取**行首**的顶层键。插槽签名里带参数（`table?: (props: { rows: T[] }) => unknown`），
    按 `;` 切分会把参数对象里的 `rows`/`item`/`index` 也读成插槽名 —— 实测漏报过一次。
    """
    s = strip_comments(io.open(path, encoding="utf-8").read())
    out = set()
    m = re.search(r"defineSlots\s*<", s)
    if m:
        body = brace_block(s, s.find("{", m.end()))
        out |= set(re.findall(r"^[ \t]*([A-Za-z_]\w*)\s*\??\s*:", body, re.M))
    out |= set(re.findall(r'<slot[^>]*\bname="([^"]+)"', s))
    for tag in re.findall(r"<slot\b[^>]*>", s):   # 无名 `<slot ...>` = 默认插槽
        if 'name="' not in tag:
            out.add("default")
    return out


def vue_has_model(path: str) -> bool:
    """Vue 侧是否用 `defineModel` / `modelValue` 表达受控值"""
    s = strip_comments(io.open(path, encoding="utf-8").read())
    return bool(re.search(r"defineModel\s*[<(]", s)) or "modelValue" in s


def normalize(name: str, side: str, props: set, emits: set, slots: set, has_model: bool,
              has_children: bool = False, rslots_all: set = frozenset()):
    """把宿主惯用写法归一化到**同一个规范名**，然后由调用方做严格集合比对。

    规范名规则（V2.9 统一口径）：
    1. **默认内容区**：React `children` ↔ Vue 默认插槽 → 两侧都叫 `#default`。
    2. **具名区域**：Vue 有插槽 `S`，则 Vue 的 prop/插槽 `S` 与 React 的 prop `S`
       都规范成 `#S`。React 侧没有"插槽"概念，具名区域就是 prop（ReactNode 或 render 函数），
       因此这条规则让"React 传节点 / Vue 传插槽"这**同一种能力**归到同一个名字下。
    3. **受控值**：React `value` + `onChange` ↔ Vue `v-model`（`modelValue` + `update:modelValue`）
       → 两侧都规范成 prop `value` + 事件 `change`。
    4. **IDIOM 覆盖**：名字确实不同但能力相同（如 React `renderItem` ↔ Vue 默认插槽）
       由 IDIOM 显式声明，且必须通过 `capability_parity()` 的能力对等校验。

    归一化之后集合必须**完全相等** —— 所以任何新漂移照旧 FAIL，白名单藏不住真差异。
    """
    idiom = IDIOM.get(name, {})
    props, emits = set(props), set(emits)
    if side == "vue":
        if has_model:
            props.discard("modelValue")
            emits.discard("update:modelValue")
            props.add("value")
            emits.add("change")
        canon = set()
        for s in slots:
            canon.add("#" + s)
        for pr in props:
            canon.add(("#" + pr) if pr in slots else pr)
        props = canon
    else:
        canon = set()
        for pr in props:
            why = idiom.get(pr, "")
            if why.startswith("#"):                  # IDIOM 显式指定了目标插槽
                canon.add(why.split()[0])
            elif pr in rslots_all:                   # Vue 侧有同名插槽 → 具名区域
                canon.add("#" + pr)
            else:
                canon.add(pr)
        props = canon
        if has_children:
            props.discard("children")
            props.add("#default")
    return props, emits


def capability_parity(name: str, rc: dict, rslots: set, vslots: set, vhas_model: bool) -> list:
    """IDIOM 映射的**能力对等**校验：映射表里写了哪一侧，那一侧就必须真有那个成员。

    只归一化不校验，就会出现「React 声明了 value 而 Vue 根本没接 v-model」这种
    "看起来已对齐、实际少一半能力"的情况。
    """
    out = []
    for key, why in IDIOM.get(name, {}).items():
        if why.startswith("v-model"):
            # React 的「值」在 props、「回调」在 emits（react_contract 已把 on* 归到 emits），
            # 所以两侧要分开校验 —— 早先统一按 props 查，把 onChange 误报成「React 没有」。
            if re.match(r"^on[A-Z]", key):
                if "change" not in rc["emits"]:
                    out.append("%s：IDIOM 声明了受控值映射，但 React 侧没有 `onChange` 回调" % name)
            elif key not in rc["props"]:
                out.append("%s：IDIOM 声明了受控值映射，但 React 侧没有 prop `%s`" % (name, key))
            if not vhas_model:
                out.append("%s：IDIOM 声明了受控值映射，但 Vue 侧没有 defineModel / modelValue" % name)
        elif why.startswith("#"):
            slot = why.split()[0][1:]
            if slot not in vslots:
                out.append("%s：IDIOM 声明了 `#%s` 映射，但 Vue 侧没有该插槽" % (name, slot))
            if key not in rc["props"] and key not in rslots:
                out.append("%s：IDIOM 声明了 `%s` 映射，但 React 侧没有对应 prop" % (name, key))
    return out


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
        rslots, vslots = react_render_slots(name), vue_slots(vue_files[name])
        rhas_model = "value" in rc["props"]
        vhas_model = vue_has_model(vue_files[name])
        notes = []

        # ① 归一化宿主惯用写法后**严格**比对（归一只认 IDIOM 里登记过的映射）
        rp, re_em = normalize(name, "react", set(rc["props"]), rc["emits"], rslots,
                              rhas_model, rc.get("children", False), vslots)
        vp, ve_em = normalize(name, "vue", set(vc["props"]), vc["emits"], vslots, vhas_model)
        if rp != vp:
            notes.append("props 不一致（已归一化宿主惯用写法）：仅 React %s；仅 Vue %s"
                         % (sorted(rp - vp), sorted(vp - rp)))
        diffs = []
        for k in sorted(set(rc["props"]) & set(vc["props"])):
            if k in rc["defaults"] and k in vc["defaults"]:
                a, b = norm_default(rc["defaults"][k]), norm_default(vc["defaults"][k])
                if a != b:
                    diffs.append("%s: React=%s Vue=%s" % (k, a, b))
        if diffs:
            notes.append("默认值不一致：" + "；".join(diffs))

        # ② 惯用写法映射的**能力对等**
        notes.extend(capability_parity(name, rc, rslots, vslots, vhas_model))

        # ③ 契约类名
        rc_cls = {c for c in rc["classes"] if c.startswith("gm-")}
        vc_cls = {c for c in vc["classes"] if c.startswith("gm-")}
        if rc_cls != vc_cls:
            notes.append("契约类名不一致：仅 React %s；仅 Vue %s"
                         % (sorted(rc_cls - vc_cls), sorted(vc_cls - rc_cls)))

        # ④ 事件（归一化后）
        if re_em != ve_em:
            notes.append("事件不一致（已归一化）：仅 React %s；仅 Vue %s"
                         % (sorted(re_em - ve_em), sorted(ve_em - re_em)))

        if notes:
            print("  FAIL %-18s" % name)
            for n in notes:
                print("       " + n)
                problems.append((name, n))
        else:
            tag = "（含宿主惯用写法映射）" if name in IDIOM else ""
            print("  OK   %-18s props %d · 默认值 %d · 契约类名 %d %s"
                  % (name, len(rp), len(set(rc["defaults"]) & set(vc["defaults"])), len(rc_cls), tag))

    # 目录约定
    for d in ("goodmom-ui/src/adapters", "frontend-app/packages/gm-arco-ui/src/adapters"):
        if os.path.isdir(d):
            problems.append(("目录约定", "%s 仍存在 —— 组件必须统一放在 src/components/（P1-12 第 8 条）" % d))

    print()
    if problems:
        print("FAIL 双库契约不一致 %d 处：" % len(problems))
        for a, b in problems:
            print("  - %s：%s" % (a, b))
        print("\n对齐方式：改实现；只有**宿主语言层面的惯用写法**才允许登记进本脚本的 IDIOM，"
              "并且必须同时通过能力对等校验（映射表里写了哪一侧，那一侧就必须真有那个成员）。")
        return 1
    print("OK 双库同名组件的 props / 默认值 / 契约类名一致（%d 对）" % len(shared))
    return 0


if __name__ == "__main__":
    sys.exit(main())
