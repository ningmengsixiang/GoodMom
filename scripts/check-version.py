#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""版本一致性门禁（P1-8）。

## 为什么需要它

审计实测：同一个系统里同时存在 6 个不同的"当前版本"——
`package.json` 停在 2.5.0、README 徽章停在 2.3、`16` 写 V2.5、手册写"随系统 V2.5"、
`preview/manual.html` 头部 V2.3 页脚 V2.2、PDF 文件名 V2.2。
而**没有任何门禁比较过版本号**（CI 里唯一的 "version" 步骤只是 grep 三个旧产品定位词）。

## 唯一版本源

`VERSION` 文件（机器可读，格式 `X.Y.Z`）。优先级：`VERSION` > `CHANGELOG.md` 顶部 > 其它。
其余所有载体都必须与它一致；`CHANGELOG.md` 顶部标题是"版本史"，必须同号。

## 用法

    python3 scripts/check-version.py          # 检查并打印
    python3 scripts/check-version.py --ci     # 失败则退出 1
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# 载体清单：(文件, 正则, 取第几个捕获组作为"该处声明的版本", 说明)
# 版本一律归一化为 `X.Y`（展示口径）比较，避免 2.7 / 2.7.0 / V2.7 三种写法互相误报。
CARRIERS = [
    ("package.json", r'"version"\s*:\s*"(\d+\.\d+)(?:\.\d+)?"', 1, "根 package.json version"),
    ("CHANGELOG.md", r"^##\s*\[V(\d+\.\d+)\]", 1, "CHANGELOG 顶部版本"),
    ("README.md", r"badge/version-(\d+\.\d+)-", 1, "README shields 徽章"),
    ("README.md", r"交付统计（V(\d+\.\d+)）", 1, "README 交付统计标题"),
    ("16-优化与一致性审计.md", r"妈咪好 GoodMom（V(\d+\.\d+)）", 1, "16 章产品品牌行"),
    ("docs/标准手册/README.md", r"随系统 V(\d+\.\d+)", 1, "标准手册 README"),
    ("docs/妈咪好UIUX设计系统标准手册.md", r"随主系统 V(\d+\.\d+)", 1, "标准手册总纲"),
    ("docs/标准手册/Part 38 · 设计系统资产库.md", r"资产登记（V(\d+\.\d+)）", 1, "Part 38 资产登记"),
    ("preview/manual.html", r"Design System Overview · V(\d+\.\d+)", 1, "打印版手册页头"),
    ("preview/manual.html", r"设计系统 V(\d+\.\d+)<br>", 1, "打印版手册页脚"),
]

# 允许出现旧版本的"历史记录"文件（版本史/决策记录本身就是历史，不该被改写）
HISTORY_FILES = {"CHANGELOG.md", "docs/审查决策记录.md", "12-妈咪好品牌与设计语言.md"}


def version_source() -> str:
    if os.path.exists("VERSION"):
        v = io.open("VERSION", encoding="utf-8").read().strip()
        m = re.match(r"^(\d+\.\d+)(?:\.\d+)?$", v)
        if m:
            return m.group(1)
    print("FAIL 未找到 VERSION 文件（唯一版本源）或格式不是 X.Y.Z")
    return ""


def main() -> int:
    want = version_source()
    if not want:
        return 1

    print("唯一版本源：VERSION = %s" % want)
    fails = []
    for path, pattern, grp, label in CARRIERS:
        if not os.path.exists(path):
            fails.append((label, path, "文件不存在"))
            continue
        text = io.open(path, encoding="utf-8").read()
        m = re.search(pattern, text, re.M)
        if not m:
            fails.append((label, path, "未匹配到版本声明（载体被改写或删除？）"))
            continue
        got = m.group(grp)
        status = "OK " if got == want else "FAIL"
        print("  [%s] %-22s %s  →  V%s" % (status, label, path, got))
        if got != want:
            fails.append((label, path, "声明 V%s，应为 V%s" % (got, want)))

    if fails:
        print("\nFAIL 版本不一致（%d 处）—— 唯一版本源是 VERSION：" % len(fails))
        for label, path, why in fails:
            print("  - %s（%s）：%s" % (label, path, why))
        print("\n提示：改版本时请同步 VERSION / package.json / CHANGELOG / README 徽章与交付统计 /")
        print("      16 章 / 标准手册三处 / Part 38 / preview/manual.html / scripts/print-manual.sh")
        return 1
    print("\nOK 全部 %d 个版本载体与 VERSION 一致（V%s）" % (len(CARRIERS), want))
    return 0


if __name__ == "__main__":
    sys.exit(main())
