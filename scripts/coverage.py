#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""组件/资产覆盖度量 —— 全仓**唯一**的自动计数来源。

用法：
    python3 scripts/coverage.py          # 打印完整报表
    python3 scripts/coverage.py --ci     # 打印摘要；计数相对基线回退则退出 1

## 这个脚本修了什么（P1-10 / P2-1）

1. **`--ci` 根本不是门禁**：旧实现是 `if CI: print(摘要) else: print(报表)` ——
   全文没有一处 `sys.exit`，所以组件数从 16 掉到 0 也不会失败。
   现改为与 `docs/coverage.json` 基线比对，**回退即退出 1**。
2. **完全不计 `@goodmom/vue`**：旧实现只 `glob("goodmom-ui/src/...")`，
   于是"组件（代码已封装）16 个"在已有**两个**库（各 16、共 32）之后失真；
   `@goodmom/vue` 整个被删掉，这个数字仍会显示 16 并 PASS。
3. **口径不全**：状态文案数、示例页数、站点模块数都没有自动来源，
   只能手抄进 README / 16 / 18 / 站点，必然漂移。现一并在本报表输出。

## 口径（写清楚，避免"作用域比结论窄"）

- 组件（规范全量）：`00-组件总目录.md` 的编号行数。
- 组件（代码已封装）：`@goodmom/ui` 的 `components/*.tsx` + `adapters/*.tsx`，
  加上 `@goodmom/vue` 的 `components/*.vue`。**两库分别列出，另给合计**。
- 图标：`icons/lg-icons.svg` 的 `<symbol>` 数 vs `goodmom-icons` registry 唯一 ID 数。
- 状态文案：`15-妇幼业务词库与状态大典.md` §15.2 表格登记的条数。
- 示例页：站点 `preview-examples` 模块的 `.view` 数（真值取自站点产物/片段）。
- 站点模块：`scripts/build-site.py` 的 `MODULES` 长度。
"""
from __future__ import annotations

import datetime
import glob
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CI = "--ci" in sys.argv
BASELINE = "docs/coverage.json"


def count_react() -> list:
    return sorted(os.path.basename(x)[:-4]
                  for x in glob.glob("goodmom-ui/src/components/*.tsx")
                  + glob.glob("goodmom-ui/src/adapters/*.tsx"))


def count_vue() -> list:
    return sorted(os.path.basename(x)[:-4] for x in glob.glob("goodmom-vue/src/components/*.vue"))


def count_modules() -> int:
    try:
        src = io.open("scripts/build-site.py", encoding="utf-8").read()
        m = re.search(r"^MODULES\s*=\s*\[(.*?)^\]", src, re.S | re.M)
        if m:
            return len(re.findall(r'\(\s*"[a-z-]+"', m.group(1)))
    except OSError:
        pass
    return 0


def count_example_views() -> int:
    """示例页数量：以站点**产物**为准（片段与产物的一致性由 build-site --check 守门）"""
    for p in ("site/index.html", "site/fragments/preview-examples.html"):
        if os.path.exists(p):
            n = len(re.findall(r'class="view[^"]*"\s+id="[^"]*"\s+data-v=',
                               io.open(p, encoding="utf-8").read()))
            if n:
                return n
    return 0


def count_status_texts() -> int:
    """§15.2 登记的状态文案条数。

    **复用 check-status-map.py 的解析器**，不另写一套正则：
    两处口径一旦分叉，"计数"与"一致性校验"就会各说各话（这类漂移在本仓已发生过）。
    口径：`文案(🟢)` 形式，去重后计数，扣除显式 IGNORE 示例词。
    """
    import importlib.util
    spec = importlib.util.spec_from_file_location("csm", "scripts/check-status-map.py")
    if spec is None or spec.loader is None:
        return 0
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        parsed = mod.parse_spec()
    except Exception:                                     # noqa: BLE001
        return 0
    # parse_spec() → {文案: {语义…}}；文案条数即登记的状态数
    return len(parsed)
    return len(parsed)


def main() -> int:
    react, vue = count_react(), count_vue()
    icons_svg = io.open("icons/lg-icons.svg", encoding="utf-8").read()
    icons_n = len(re.findall(r'<symbol id="lg-icon-[^"]+"', icons_svg))
    registry = io.open("goodmom-icons/src/registry.ts", encoding="utf-8").read()
    reg_n = len(set(re.findall(r'"lg-icon-[^"]+"', registry)))
    cat = io.open("00-组件总目录.md", encoding="utf-8").read()
    spec_n = len(re.findall(r"^\|\s*\d+\s*\|", cat, re.M))

    data = {
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "docs": len(glob.glob("[0-9][0-9]-*.md")),
        "components_spec_defined": spec_n,
        "components_react": len(react),
        "components_vue": len(vue),
        "components_code_implemented": len(react) + len(vue),
        "component_names_react": react,
        "component_names_vue": vue,
        "icons_sprite": icons_n,
        "icons_registry": reg_n,
        "status_texts": count_status_texts(),
        "example_views": count_example_views(),
        "site_modules": count_modules(),
    }

    lines = [
        "# 覆盖度量（自动生成，请勿手改）", "",
        "- 生成：`python3 scripts/coverage.py` · %s" % data["date"],
        "- 口径：本表是全仓**唯一**的自动计数来源；README / 16 / 18 / 站点的数字都应引用本表，不要手抄。",
        "",
        "| 指标 | 数值 |", "| --- | --- |",
        "| 编号规范文档 | %d 份 |" % data["docs"],
        "| 组件（00 目录登记，规范全量） | %d 项 |" % data["components_spec_defined"],
        "| 组件（代码已封装 · `@goodmom/ui`） | %d 个 |" % data["components_react"],
        "| 组件（代码已封装 · `@goodmom/vue`） | %d 个 |" % data["components_vue"],
        "| 组件（代码已封装 · 合计） | **%d 个** |" % data["components_code_implemented"],
        "| 图标（sprite / registry） | %d / %d |" % (data["icons_sprite"], data["icons_registry"]),
        "| 状态文案（15.2 登记） | %d 条 |" % data["status_texts"],
        "| 示例页（示例中心 view） | %d 页 |" % data["example_views"],
        "| 站点模块 | %d 个 |" % data["site_modules"],
        "",
        "> 口径说明：00 目录为规范全量；代码层为已封装子集，**两个库分别统计后合计**。",
        "> 新增封装/登记后请重跑本脚本；`--ci` 会与上次基线比对，计数回退即失败。",
    ]
    io.open("docs/coverage-report.md", "w", encoding="utf-8").write("\n".join(lines) + "\n")

    # ── 门禁：与基线比对（旧实现只打印，永不失败）──
    prev = None
    if os.path.exists(BASELINE):
        try:
            prev = json.load(io.open(BASELINE, encoding="utf-8"))
        except (ValueError, OSError):
            prev = None
    json.dump(data, io.open(BASELINE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    print(("coverage: docs=%d spec_comp=%d react=%d vue=%d total=%d icons=%d/%d "
           "status=%d views=%d modules=%d") % (
              data["docs"], data["components_spec_defined"], data["components_react"],
              data["components_vue"], data["components_code_implemented"],
              data["icons_sprite"], data["icons_registry"], data["status_texts"],
              data["example_views"], data["site_modules"]) if CI else "\n".join(lines))

    if prev:
        regress = []
        for k in ("docs", "components_spec_defined", "components_react", "components_vue",
                  "icons_sprite", "icons_registry", "status_texts", "example_views", "site_modules"):
            old = prev.get(k)
            if isinstance(old, int) and data[k] < old:
                regress.append("%s: %d → %d" % (k, old, data[k]))
        # 两库组件名集合必须一致（CHANGELOG 声称 1:1 同名覆盖）
        if set(data["component_names_react"]) != set(data["component_names_vue"]):
            only_r = sorted(set(data["component_names_react"]) - set(data["component_names_vue"]))
            only_v = sorted(set(data["component_names_vue"]) - set(data["component_names_react"]))
            regress.append("两库组件名集合不一致：仅 React %s；仅 Vue %s" % (only_r, only_v))
        if regress:
            print("\n[FAIL] 覆盖度量相对基线回退：")
            for r in regress:
                print("  -", r)
            return 1
        print("OK 覆盖度量未回退（基线 %s）" % prev.get("date", "?"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
