#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""`prd/zong.md`（GM-PRD-000 总体 PRD）的解析层 —— 供两个生成器共用。

为什么独立成文件：**同一份 PRD 被两个产物解析** ——
  · `scripts/gen-products.py`     → 唯一首页的「产品矩阵」模块（site/fragments/products.html）
  · `scripts/gen-product-apps.py` → fuyouaicansai/ 下 6 个独立产品页（侧栏应用外壳）
解析逻辑抄两遍，第二遍抄下去的那天就是两份开始漂移的那天（本仓已有先例：
生长曲线在三处各画一遍、表格配方在五处漂移）。故这里只留一份。

口径：产品名 / 英文标识 / PRD 编号**断言而不解析**（解析乱格式的表更脆；断言能在
PRD 改名时当场报错）；功能架构树、核心业务功能、独立销售价值、数据主责、销售组合**解析**。
⚠️ 该文档的表格是"每个单元格占一行"的形态（`|` 单独成行），不是标准管道表，
   故表格按 `|` 切分后逐段取值，而不是按行取值。
"""
from __future__ import annotations

import io
import os
import re

from products_data import PRODUCTS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRD = os.path.join(ROOT, "prd", "zong.md")


def read_prd() -> str:
    return io.open(PRD, encoding="utf-8").read()


# ══════════════════════════════════════════════════════════════════════════
# 二、PRD 解析（prd/zong.md → 结构数据）
#     ⚠️ 该文档的表格是"每个单元格占一行"的形态（`|\n表头\n|\n值\n|`），不是标准管道表，
#        故表格按 `|` 切分后逐段取值，而不是按行取值。
# ══════════════════════════════════════════════════════════════════════════


def read_prd() -> str:
    return io.open(PRD, encoding="utf-8").read()


def need(text: str, needle: str, where: str) -> None:
    """缺少预期内容就报错中止。生成器宁可响亮失败，也不产出空白的页面。"""
    if needle not in text:
        raise SystemExit("ERROR prd/zong.md 中未找到 %s：%r（PRD 结构变了，请同步解析逻辑）"
                         % (where, needle))


def section(text: str, start: str, *ends: str) -> str:
    """取 start 标题之后、ends 中任一标题之前的正文"""
    i = text.find(start)
    if i < 0:
        raise SystemExit("ERROR prd/zong.md 中未找到小节：%r" % start)
    i += len(start)
    j = len(text)
    for e in ends:
        k = text.find(e, i)
        if 0 <= k < j:
            j = k
    return text[i:j]


def para(block: str) -> str:
    """取小节首段（到空行或第一个列表项为止）—— 定位句是散文，能力清单是列表，
    两者同处一个小节时必须切开，否则"产品定位"会把能力清单也吞进去。"""
    out = []
    for line in block.splitlines():
        s = line.strip()
        if not s or re.match(r"^[*-]\s", s):
            if out:                      # 段落结束（开头空行不算结束）
                break
            continue
        out.append(s)
    return " ".join(out)


def bullets(block: str) -> list[str]:
    """取 `* xxx` 列表项（PRD 的价值/功能清单都用星号列表）"""
    out = []
    for line in block.splitlines():
        m = re.match(r"^\s*[*-]\s+(.+?)\s*$", line)
        if m and m.group(1) != "---":
            out.append(m.group(1))
    return out


def table_pairs(block: str) -> list[tuple[str, str]]:
    """取"每格一行"形态的表格 → [(左列, 右列), …]（跳过表头与分隔行）"""
    toks = [t.strip() for t in block.split("|")]
    toks = [t for t in toks if t and not re.fullmatch(r"-{2,}", t)]
    if toks and toks[0] == "数据":
        toks = toks[2:]           # 表头：数据 / 主责产品
    pairs, i = [], 0
    while i + 1 < len(toks):
        pairs.append((toks[i], toks[i + 1]))
        i += 2
    return pairs


def tree_from_code(code: str) -> list[tuple[str, list[str]]]:
    """解析功能架构的 ASCII 树 → [(一级模块, [二级功能, …]), …]

    行形如 `├── 妇女健康工作台`（一级）与 `│   ├── 妇女建档`（二级）：
    靠行首是否含 `│` 判层级，不数空格（PRD 里两种缩进宽度都存在过）。
    """
    nodes: list[tuple[str, list[str]]] = []
    for line in code.splitlines():
        m = re.match(r"^([\s│]*)([├└])──\s*(.+?)\s*$", line)
        if not m:
            continue
        indent, name = m.group(1), m.group(3)
        if "│" in indent:
            if nodes:
                nodes[-1][1].append(name)
        else:
            nodes.append((name, []))
    return nodes


def fenced(block: str) -> list[str]:
    """取全部 ``` 代码块内容"""
    return re.findall(r"```[a-z]*\n(.*?)```", block, re.S)


def parse_prd(text: str) -> dict:
    need(text, "妈咪好 Goodmom 妇幼全生命周期产品矩阵", "文档标题")
    for p in PRODUCTS:
        need(text, p["cn"], p["cn"] + " 正式名称")
        need(text, p["en"], p["en"] + " 英文标识")
        need(text, p["prd_no"], p["prd_no"] + " PRD 编号")

    data: dict = {"products": {}}

    # ── 五大业务产品：§四 的 4.1–4.20 ──────────────────────────────────
    sec_map = {
        "p01": ("## 产品01：", "4.1", "4.2", "4.3", "4.4"),
        "p02": ("## 产品02：", "4.5", "4.6", "4.7", "4.8"),
        "p03": ("## 产品03：", "4.9", "4.10", "4.11", "4.12"),
        "p04": ("## 产品04：", "4.13", "4.14", "4.15", "4.16"),
        "p05": ("## 产品05：", "4.17", "4.18", "4.19", "4.20"),
    }
    for pid, (head, s_pos, s_tree, s_caps, s_val) in sec_map.items():
        block = section(text, head, "## 产品0" if pid != "p05" else "# 五、")
        pos = para(section(block, "### %s 产品定位" % s_pos, "### %s" % s_tree))
        tree = fenced(section(block, "### %s 产品功能架构" % s_tree, "### %s" % s_caps))
        if not tree:
            raise SystemExit("ERROR %s 功能架构代码块为空" % pid)
        caps_block = section(block, "### %s 核心业务功能" % s_caps, "### %s" % s_val)
        vals = bullets(section(block, "### %s 产品独立销售价值" % s_val,
                               "## 产品0", "# 五、"))
        caps = bullets(caps_block) or [a for a, _b in table_pairs(caps_block)]
        data["products"][pid] = {
            "position": pos,
            "tree": tree_from_code(tree[0]),
            "caps": caps,
            "values": vals,
        }

    # ── 第六产品：§八（无功能架构树，用能力清单 + 负责/不负责边界）──────────
    ai = section(text, "# 八、第六产品AI系统重新定位", "# 九、")
    ai_pos = para(section(ai, "### 产品定位", "### AI不负责"))
    caps = bullets(section(ai, "### 产品定位", "### AI不负责"))
    data["products"]["p06"] = {
        "position": ai_pos,
        # AI 产品没有"功能架构树"，八项能力即其"模块"；模板按 capabilities 形态渲染
        "tree": [], "caps": caps,
        # 价值主张同样是这八项能力（PRD §八 未另列 独立销售价值）
        "values": caps,
        "no_do": bullets(section(ai, "### AI不负责", "### AI负责")),
        "pipeline": [l.strip(" ↓") for l in
                     fenced(section(ai, "### AI负责", "# 九、"))[0].splitlines() if l.strip(" ↓").strip()],
    }

    # ── §5.2 数据主责（谁主责哪类数据）────────────────────────────────
    dm = table_pairs(section(text, "## 5.2 数据主责原则", "# 六、"))
    owner = {"妇女健康": "p01", "婚前孕前": "p02", "孕产妇": "p03",
             "新生儿": "p04", "儿童": "p05", "AI产品": "p06"}
    for p in PRODUCTS:
        data["products"][p["pid"]]["owns"] = []
    for name, who in dm:
        pid = owner.get(who)
        if pid:
            data["products"][pid]["owns"].append(name)
    for pid in data["products"]:
        if not data["products"][pid]["owns"]:
            raise SystemExit("ERROR %s 未匹配到任何主责数据（§5.2 主责产品名变了？）" % pid)

    # ── §7.1 单品组成 / §7.2 组合销售 ────────────────────────────────
    data["single"] = bullets(section(text, "单品可包含：", "## 7.2 组合销售"))
    bundles = []
    for m in re.finditer(r"### (组合[一二三四五]：.+?)\n(.*?)(?=### 组合|# 八、)", text, re.S):
        bundles.append({"name": m.group(1).strip(), "items": bullets(m.group(2))})
    if len(bundles) != 5:
        raise SystemExit("ERROR §7.2 组合销售应为 5 个，实得 %d 个" % len(bundles))
    data["bundles"] = bundles

    # ── §三 顶层架构（产品互联的关系图，落地页"数据互联"一节引用）────────
    data["arch"] = fenced(section(text, "# 三、品牌产品顶层架构", "## 核心原则"))[0]
    data["datamap"] = dm
    data["owner_of"] = owner          # 主责产品名 → 产品 id（反查用）
    return data



def flow_steps(p: dict, pd: dict) -> tuple[str, list[str]]:
    """工作台的「核心业务闭环」= PRD 功能架构树里该产品旗舰一级模块的二级功能。

    p06 没有功能架构树，闭环取其 AI 链路（PRD §八「AI 负责」）。
    找不到配置的旗舰模块就报错中止 —— 页面上的步骤必须是 PRD 原文，不能编。
    """
    if p["flow_module"] is None:
        return ("AI 定位链路（PRD §八）", pd["pipeline"])
    for name, subs in pd["tree"]:
        if name == p["flow_module"]:
            if not subs:
                raise SystemExit("ERROR %s 的旗舰模块 %r 在 PRD 里没有二级功能"
                                 % (p["pid"], p["flow_module"]))
            return (name, subs)
    raise SystemExit("ERROR %s 配置的旗舰模块 %r 不在 PRD 功能架构树里（PRD 改了？）"
                     % (p["pid"], p["flow_module"]))
