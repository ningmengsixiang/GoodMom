#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""组件/资产覆盖率度量（G-P2-2 落地）：统计代码已封装 vs 规范定义，输出 docs/coverage-report.md。
用法：python3 scripts/coverage.py [--ci]（--ci 只打印摘要，供 CI 展示）"""
import glob, io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CI = "--ci" in sys.argv

comps = sorted(glob.glob("goodmom-ui/src/components/*.tsx")) + sorted(glob.glob("goodmom-ui/src/adapters/*.tsx"))
names = [os.path.basename(x).replace(".tsx", "") for x in comps]
icons_svg = open("icons/lg-icons.svg", encoding="utf-8").read()
icons_n = len(re.findall(r'<symbol id="lg-icon-[^"]+"', icons_svg))
registry = open("goodmom-icons/src/registry.ts", encoding="utf-8").read()
reg_n = len(set(re.findall(r'"lg-icon-[^"]+"', registry)))
md = sorted(glob.glob("[0-9][0-9]-*.md"))
cat = open("00-组件总目录.md", encoding="utf-8").read() if os.path.exists("00-组件总目录.md") else ""
rows = re.findall(r"^\|\s*\d+\s*\|", cat, re.M)
data = {
  "date": __import__("datetime").datetime.now().strftime("%Y-%m-%d"),
  "docs": len(md),
  "components_spec_defined": len(rows),
  "components_code_implemented": len(names),
  "component_names": names,
  "icons_sprite": icons_n, "icons_registry": reg_n,
}
json.dump(data, open("docs/coverage.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
lines = [
 "# 覆盖度量（自动）", "",
 "- 生成：`python3 scripts/coverage.py` · %s" % data["date"], "",
 "| 指标 | 数值 |", "| --- | --- |",
 "| 编号规范文档 | %d 份" % data["docs"],
 "| 组件（00 目录登记，规范全量） | %d 项" % data["components_spec_defined"],
 "| 组件（代码已封装，含适配器） | %d 个" % data["components_code_implemented"],
 "| 图标（sprite / registry） | %d / %d" % (data["icons_sprite"], data["icons_registry"]), "",
 "> 口径：00 目录为规范全量；代码层为已封装子集。新增封装后请重跑本脚本。",
]
io.open("docs/coverage-report.md", "w", encoding="utf-8").write("\n".join(lines) + "\n")
if CI:
    print("coverage: docs=%d spec_comp=%d code_comp=%d icons=%d/%d" % (
        data["docs"], data["components_spec_defined"], data["components_code_implemented"], data["icons_sprite"], data["icons_registry"]))
else:
    print("\n".join(lines))
