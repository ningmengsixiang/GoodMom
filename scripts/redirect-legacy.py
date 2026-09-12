#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把已合并进唯一首页的旧页面改写为**重定向页**。

背景：V2.7 把 8 个入口页合并为 site/index.html 单文件 + 单一主导航。
旧文件不直接删除的原因：
  1. 站内/站外（README、CHANGELOG、GitHub Pages 收藏、已发出的链接）仍可能指向旧地址；
  2. CI 的 markdown 内链检查要求标称存在的文件可解析；
  3. 直接 404 对用户不友好。
因此保留文件、清空内容、只留一条带锚点透传的重定向。

用法：
    python3 scripts/redirect-legacy.py            # 改写旧页面为重定向
    python3 scripts/redirect-legacy.py --check    # 只校验（CI 用）
"""
from __future__ import annotations

import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 旧页面 → 目标模块（与 scripts/build-site.py 的 LEGACY_PAGE 保持一致）
# 值为 None 表示保留为独立页（打印版手册），不改写
REDIRECTS = {
    "site/docs.html": "site-docs",
    "site/manual.html": "site-manual",
    "site/spec.html": "site-spec",
    "preview/index.html": "preview-index",
    "preview/examples.html": "preview-examples",
    "preview/mobile.html": "preview-mobile",
    "preview/patterns.html": "preview-patterns",
    # preview/manual.html 是打印版（38 部分总纲的打印布局），保留为独立页
}

# 规范章节锚点：spec.html#ch-02 → index.html#site-spec--ch-02
SPEC_ANCHOR_MOD = "site-spec"

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>已合并至唯一首页 · 妈咪好 GoodMom</title>
<link rel="icon" type="image/svg+xml" href="{icon}">
<meta name="robots" content="noindex">
<!-- 合并说明：本页原为独立入口页，V2.7 起全部内容并入 site/index.html 的「{title}」模块。
     保留本文件仅为兼容旧链接（Gitea/GitHub Pages 收藏、README/CHANGELOG 引用、已发出的地址）。
     锚点会透传：例如 spec.html#ch-02 → index.html#site-spec--ch-02 -->
<script>
(function () {{
  var mod = "{mod}";
  var hash = (location.hash || "").replace(/^#/, "");
  var target = "{targetIndex}" + "#" + mod;
  if (hash) {{
    // 规范各章锚点在模块内带前缀；其余锚点也统一加模块前缀
    if (mod === "{specMod}" && hash.indexOf("ch-") === 0) target += "--" + hash;
    else if (hash.indexOf(mod + "--") === 0) target = "{targetIndex}" + "#" + hash;
    else target += "--" + hash;
  }}
  location.replace(target);
}})();
</script>
<style>
  :root {{ --rose:#B23A63; --t:#343A46; --t2:#4F5B6E; }}
  body {{ margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    font-family:"Inter","PingFang SC","MiSans","Noto Sans SC",sans-serif; color:var(--t);
    background:linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#EAD3CA); text-align:center; padding:24px; }}
  .card {{ max-width:520px; padding:28px 30px; border-radius:22px;
    background:linear-gradient(160deg,rgba(255,255,255,.72),rgba(255,255,255,.38));
    border:1px solid rgba(255,255,255,.8); box-shadow:0 12px 30px rgba(90,70,70,.12); }}
  b {{ display:block; font-size:17px; color:var(--rose); margin-bottom:8px; }}
  p {{ margin:0 0 16px; font-size:13.5px; color:var(--t2); line-height:1.8; }}
  a {{ display:inline-flex; align-items:center; justify-content:center; min-height:44px;
    text-decoration:none; font-weight:600; font-size:14px; padding:0 22px;
    border-radius:999px; color:#343A46; background:linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%);
    border:1px solid transparent; box-shadow:0 1px 2px rgba(178,58,99,.22),0 8px 20px rgba(240,127,163,.30); }}   /* 03 · 3.2.4 主按钮配方 */
  a:focus-visible {{ outline:2px solid rgba(232,93,143,.6); outline-offset:2px; }}
</style>
</head>
<body>
  <div class="card">
    <b>页面已合并</b>
    <p>「{title}」已并入唯一首页的单一入口，正在为你跳转…<br>若未自动跳转，请点击下方按钮。</p>
    <a href="{targetIndex}#{mod}" data-mod="{mod}">前往首页 · {title}</a>
  </div>
</body>
</html>
"""


def build_page(rel: str, mod: str, title: str, icon: str, target_index: str) -> str:
    return TEMPLATE.format(mod=mod, title=title, icon=icon, targetIndex=target_index, specMod=SPEC_ANCHOR_MOD)


MODULE_TITLES = {
    "site-docs": "文档索引",
    "site-manual": "标准手册",
    "site-spec": "规范全文",
    "preview-index": "视觉规范",
    "preview-examples": "组件与状态",
    "preview-mobile": "移动端",
    "preview-patterns": "交互范式",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只校验旧页面已是重定向")
    args = ap.parse_args()

    missing, wrong = [], []
    for rel, mod in REDIRECTS.items():
        path = os.path.join(ROOT, rel)
        # 相对路径按实际所在目录计算（都在仓库根的一级子目录里）
        if rel.startswith("site/"):
            target_index, icon = "index.html", "../brand/logo-192.png"
        else:                      # preview/*
            target_index, icon = "../site/index.html", "../brand/logo-192.png"
        want = build_page(rel, mod, MODULE_TITLES[mod], icon, target_index)

        if args.check:
            # ⚠️「文件不存在」与「文件存在但内容不是重定向」是两种完全不同的状态，
            # 必须分开报告：合并成一句"还不是重定向"会在干净检出里把维护者
            # 引向错误的修复方向（真实原因是文件根本未入库）。
            if not os.path.exists(path):
                missing.append(rel)
                continue
            if "页面已合并" not in io.open(path, encoding="utf-8").read():
                wrong.append(rel)
            continue
        io.open(path, "w", encoding="utf-8").write(want)
        print(f"  {rel:24} → site/index.html#{mod}  ({len(want)}B)")

    if args.check:
        if missing:
            print("FAIL 以下旧页面不存在（未入库？应先提交或重新生成）：", missing)
        if wrong:
            print("FAIL 以下旧页面存在但内容不是重定向（应执行 python3 scripts/redirect-legacy.py 重新生成）：", wrong)
        if missing or wrong:
            return 1
        print("OK 旧页面均为重定向（%d 个）" % len(REDIRECTS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
