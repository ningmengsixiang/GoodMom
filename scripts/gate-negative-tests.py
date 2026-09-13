#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""门禁负向测试（Gate negative tests）

为什么必须有：门禁最危险的失效方式不是"漏报"，而是**永远返回 PASS** ——
正则写错、锚点写错、目标文件改名，都会让检查静默变成空转，
而这种失效在正常仓库状态下**完全不可见**（因为正常状态下本来就该 PASS）。

本脚本对每条门禁注入一个真实缺陷，断言它必须 FAIL 且报出预期关键词，
随后在 finally 里**按字节**还原文件。任何一条注入后仍然 PASS，说明该门禁已经空转。

用法：
    python3 scripts/gate-negative-tests.py          # 全部用例
    python3 scripts/gate-negative-tests.py feedback # 只跑名字含该词的用例

注意：脚本会临时改写仓库文件（随后还原）。运行前请确保工作区干净，
以便用 `git status` 复核还原结果。
"""
import io
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def run_audit(only: str) -> tuple[int, str]:
    """只跑目标门禁：否则注入缺陷后可能被**其它**门禁先拦下，
    那样证明不了目标门禁本身有效（它可能早已空转）。"""
    p = subprocess.run([sys.executable, "scripts/audit.py", "--only", only],
                       capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


# (用例名, 目标门禁(--only 用), 目标文件, 查找串, 替换串, FAIL 里必须出现的关键词)
CASES = [
    # ── feedback-spec ────────────────────────────────────────────────────
    # ── text-token-parity / tertiary-size / tint-base（V2.9 新增）──────────
    # 这三条守的是"用改名或调透明度把无障碍违规盖住"这一类：站点曾把 tertiary
    # 本地改写成 secondary 的值，组件库曾把语义淡底混进 transparent（实测 4.06:1）。
    ("token/preview-index 本地改写 tertiary", "text-token-parity", "site/fragments/preview-index.html",
     "  --lg-text-primary:#343A46; --lg-text-secondary:#4F5B6E;",
     "  --lg-text-primary:#343A46; --lg-text-secondary:#4F5B6E; --lg-text-tertiary:#4F5B6E;",
     "被本地改写"),
    ("token/站点把 on-accent 写成白字", "text-token-parity", "site/fragments/site-spec.html",
     "  --lg-text-on-accent: #343A46;", "  --lg-text-on-accent: #FFFFFF;", "被本地改写"),
    ("a11y/12px 小字回退到 tertiary", "tertiary-size", "goodmom-ui/src/theme.css",
     ".gm-client-sub{font-size:12px;color:var(--lg-text-secondary);margin-top:3px}",
     ".gm-client-sub{font-size:12px;color:var(--lg-text-tertiary);margin-top:3px}", "tertiary 被用于 <24px"),
    ("a11y/淡底又混回 transparent", "tint-base", "goodmom-ui/src/tokens/status.ts",
     "`color-mix(in srgb, ${base} var(--lg-tint-pct,13%), var(--lg-tint-base,#FFFFFF))`",
     "`color-mix(in srgb, ${base} var(--lg-tint-pct,13%), transparent)`", "transparent 混色"),
    ("token/暗色档漏声明淡底透明度", "tint-base", "goodmom-ui/src/theme.css",
     "  --lg-tint-base:#23222A; --lg-tint-pct:8%;", "  --lg-tint-base:#23222A;", "应为 8%"),
    # ── bg-origin / btn-radius（V2.9：用户报"主按钮头上缺一块、露出别的底色"）──
    ("a11y/渐变规则漏写背景原点", "bg-origin", "goodmom-ui/src/theme.css",
     "box-shadow:0 1px 2px rgba(178,58,99,.22),0 8px 20px rgba(240,127,163,.30);background-origin:border-box}",
     "box-shadow:0 1px 2px rgba(178,58,99,.22),0 8px 20px rgba(240,127,163,.30)}", "缺 background-origin"),
    ("a11y/又加回全局假防线", "bg-origin", "goodmom-ui/src/theme.css",
     "/* ⚠️ 不要试图用全局",
     "*,*::before,*::after{background-origin:border-box}\n/* ⚠️ 不要试图用全局", "全局"),
    ("a11y/渐变叠 background-clip:padding-box", "bg-origin", "goodmom-ui/src/theme.css",
     ".gm-btn--primary{background:var(--mmh-grad-action-hc);color:#343A46;border:var(--lg-border-1) solid transparent;",
     ".gm-btn--primary{background:var(--mmh-grad-action-hc);color:#343A46;border:var(--lg-border-1) solid transparent;background-clip:padding-box;",
     "padding-box"),
    ("token/按钮圆角写回大于半高", "btn-radius", "goodmom-ui/src/theme.css",
     ".gm-btn--sz-large{height:48px;padding:0 26px;border-radius:var(--lg-radius-pill);font-size:16px}",
     ".gm-btn--sz-large{height:48px;padding:0 26px;border-radius:26px;font-size:16px}", "大于半高"),
    ("token/胶囊档 token 被删", "btn-radius", "goodmom-ui/src/theme.css",
     "  --lg-radius-pill:999px;", "  --lg-radius-pill:0;", "胶囊档"),
    # ── icon-mirror ──────────────────────────────────────────────────────
    ("icons/应用侧雪碧图与真源漂移", "icon-mirror", "frontend-app/public/icons/lg-icons.svg",
     "</svg>", "</svg>\n", "与真源"),
    # ── semantic-parity ──────────────────────────────────────────────────
    ("token/02 章语义色回退到 AA 之前的旧值", "semantic-parity", "02-Token规范.md",
     "| `--lg-sem-positive` | `#25715D` |", "| `--lg-sem-positive` | `#2F8F76` |",
     "语义色口径与实现不一致"),
    ("token/14 章语义色回退", "semantic-parity", "14-命名与术语规范.md",
     "`--lg-sem-risk`（`#B72F42`）", "`--lg-sem-risk`（`#D35466`）", "语义色口径与实现不一致"),
    ("token/skill reference 语义色回退", "semantic-parity",
     ".claude/skills/goodmom-frontend/reference/tokens.md",
     "| `--lg-sem-info` | `#3261C1` |", "| `--lg-sem-info` | `#4A76D0` |", "语义色口径与实现不一致"),
    ("feedback/外壳 Toast 避让值写死", "feedback-spec", "scripts/build-site.py",
     "  --gm-toast-top:calc(var(--sh-nav-h,60px) + 16px);",
     "  --gm-toast-top:76px;", "必须写成 calc(var(--sh-nav-h"),
    ("feedback/外壳不再实测导航高度", "feedback-spec", "scripts/build-site.py",
     "  if(window.ResizeObserver){ try{ new ResizeObserver(sync).observe(top); }catch(e){} }\n",
     "", "未实测吸顶导航高度"),
    ("feedback/驻留时长被改", "feedback-spec", "scripts/build-site.py",
     "var DWELL = 2400, LEAVE = 240;", "var DWELL = 1600, LEAVE = 240;", "驻留应为 2400ms"),
    ("feedback/退场时长被改", "feedback-spec", "scripts/build-site.py",
     "var DWELL = 2400, LEAVE = 240;", "var DWELL = 2400, LEAVE = 280;", "退场应为 240ms"),
    ("feedback/去掉同类仅 1 条", "feedback-spec", "scripts/build-site.py",
     "    if(node && node.parentNode) node.parentNode.removeChild(node);\n", "", "同类仅 1 条"),
    ("feedback/role 不再分流", "feedback-spec", "scripts/build-site.py",
     "n.setAttribute('role', status === 'error' ? 'alert' : 'status');",
     "n.setAttribute('role', 'status');", "未按 error/其余 分流 role"),
    ("feedback/站点又造私有 Toast", "feedback-spec", "site/fragments/preview-examples.html",
     "/* Part 18 · MD-18-01/04", ".fx{position:fixed;bottom:26px}\n/* Part 18 · MD-18-01/04",
     "又出现了私有 Toast 样式"),
    ("feedback/演示页 Toast 回到底部", "feedback-spec", "fuyouaicansai/goodmom-redesign.html",
     ".toast{position:fixed;left:50%;top:20px;", ".toast{position:fixed;left:50%;bottom:20px;",
     "Toast 必须在顶部偏上"),
    ("feedback/演示页白描边回归", "feedback-spec", "fuyouaicansai/goodmom-redesign.html",
     " border:1px solid rgba(58,52,84,.10);box-shadow:0 1px 2px rgba(58,52,84,.06),0 12px 30px rgba(90,60,60,.18)",
     " border:1px solid rgba(255,255,255,1);box-shadow:0 12px 30px rgba(90,60,60,.18)",
     "Toast 带白描边"),
    ("feedback/Modal 丢 role", "feedback-spec", "fuyouaicansai/goodmom-redesign.html",
     '<div class="dlg" role="dialog" aria-modal="true" tabindex="-1">',
     '<div class="dlg" tabindex="-1">', 'Modal 面板缺 role="dialog"'),
    ("feedback/Modal 丢 ESC", "feedback-spec", "fuyouaicansai/goodmom-redesign.html",
     "document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMask()});",
     "/* removed */", "Modal 缺 ESC 关闭"),
    ("feedback/库侧 Toast 回到底部", "feedback-spec", "goodmom-ui/src/theme.css",
     "  top:var(--gm-toast-top,20px);\n", "  bottom:20px;\n", "必须定位在**顶部偏上**"),
    ("feedback/库侧滑入时长被改", "feedback-spec", "goodmom-ui/src/theme.css",
     "animation:gmToastIn 320ms", "animation:gmToastIn 260ms", "滑入必须 320ms"),
    ("feedback/库侧退场不再用动画", "feedback-spec", "goodmom-ui/src/theme.css",
     ".gm-toast.is-leaving{animation:gmToastOut 240ms ease-in forwards}",
     ".gm-toast.is-leaving{opacity:0}", "退场必须 240ms"),
    ("feedback/组件不再等满 240ms", "feedback-spec", "goodmom-ui/src/components/GmToast.tsx",
     "const LEAVE_MS = 240;", "const LEAVE_MS = 0;", "退场必须真的等满 240ms"),
    ("feedback/组件驻留默认值被改", "feedback-spec", "goodmom-vue/src/components/GmToast.vue",
     "duration: 2400", "duration: 1600", "驻留默认值应为 2400ms"),

    ("feedback/去掉库侧暗色档", "feedback-spec", "goodmom-ui/src/theme.css",
     '[data-theme="dark"] .gm-toast{\n  background:linear-gradient(160deg,rgba(38,36,46,.97),rgba(38,36,46,.9));',
     '/* 已删 */', "缺少 Toast 暗色档"),
    ("feedback/去掉外壳暗色档", "feedback-spec", "scripts/build-site.py",
     '[data-theme="dark"] .gm-toast{\n  background:linear-gradient(160deg,rgba(38,36,46,.97),rgba(38,36,46,.9));',
     '/* 已删 */', "外壳缺少 Toast 暗色档"),

    # ── data-present ────────────────────────────────────────────────────
    ("dp/表头字重被改回 500", "data-present", "scripts/build-site.py",
     ".gm-tbl th{text-align:left;font-size:14px;line-height:20px;font-weight:600;",
     ".gm-tbl th{text-align:left;font-size:14px;line-height:20px;font-weight:500;",
     "表头必须 600"),
    ("dp/表头改回三级色", "data-present", "scripts/build-site.py",
     "color:var(--lg-text-secondary,#4F5B6E);padding:12px 14px;white-space:nowrap;",
     "color:var(--lg-text-tertiary,#9AA2B0);padding:12px 14px;white-space:nowrap;",
     "表头必须次级色"),
    # ⚠️ 注入点要带上选择器：`color:var(--lg-text-primary,…);font-variant-numeric:tabular-nums}`
    # 这串在文件里出现了两次（`.gm-growth__val` 同款），只按值注入会改错地方，用例会假通过。
    ("dp/去掉 tabular-nums", "data-present", "scripts/build-site.py",
     ".gm-tbl{width:100%;border-collapse:collapse;font-size:14px;line-height:20px;\n  color:var(--lg-text-primary,#343A46);font-variant-numeric:tabular-nums}",
     ".gm-tbl{width:100%;border-collapse:collapse;font-size:14px;line-height:20px;\n  color:var(--lg-text-primary,#343A46)}",
     "tabular-nums"),
    ("dp/单元格允许折行（顶破行高 44–52）", "data-present", "scripts/build-site.py",
     "vertical-align:middle;white-space:nowrap;", "vertical-align:middle;",
     "单元格必须不折行"),
    ("dp/单元格内联元素允许折行", "data-present", "scripts/build-site.py",
     ".gm-tbl td>span,.gm-tbl td>div,.gm-tbl td>a{flex-wrap:nowrap}",
     ".gm-tbl td>span,.gm-tbl td>div,.gm-tbl td>a{flex-wrap:wrap}", "内联元素必须不折行"),
    ("dp/折叠代理层加回 padding（收起残留）", "data-present", "scripts/build-site.py",
     ".gm-fold__body>div{overflow:hidden;min-height:0}",
     ".gm-fold__body>div{overflow:hidden;min-height:0;padding:0 16px 14px}",
     "不得带 padding"),
    ("dp/折叠过渡时长被改", "data-present", "scripts/build-site.py",
     "transition:grid-template-rows 300ms", "transition:grid-template-rows 260ms",
     "折叠高度过渡 300ms"),
    ("dp/描述列表去掉省略", "data-present", "scripts/build-site.py",
     "  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
     "  overflow:hidden}",
     "描述列表 ≤1 行省略"),
    ("dp/页面又造私有表格配方", "data-present", "site/fragments/preview-patterns.html",
     "/* 玻璃表格：配方在**外壳**", "table.gm{font-size:13px}\n/* 玻璃表格：配方在**外壳**",
     "又出现了 table.gm"),
    ("dp/片段不接系统 Token 别名", "data-present", "site/fragments/preview-examples.html",
     "--lg-text-secondary:var(--t2);", "", "未定义 --lg-text-secondary"),
    ("dp/别名多接未使用的 Token", "data-present", "site/fragments/preview-examples.html",
     "--lg-text-secondary:var(--t2);",
     "--lg-text-secondary:var(--t2);--lg-text-tertiary:var(--t3);",
     "别名多接了"),
    ("dp/表头丢 scope", "data-present", "site/fragments/preview-patterns.html",
     '<th scope="col">姓名</th>', '<th>姓名</th>', "表头缺 scope"),
    ("dp/独立页配方漂移", "data-present", "fuyouaicansai/goodmom-redesign.html",
     "  font-variant-numeric:tabular-nums}", "  font-variant-numeric:normal}",
     "与外壳配方漂移"),
    ("dp/独立页表头字重漂移", "data-present", "fuyouaicansai/goodmom-redesign.html",
     ".gm-tbl th{text-align:left;font-size:14px;line-height:20px;font-weight:600;",
     ".gm-tbl th{text-align:left;font-size:14px;line-height:20px;font-weight:500;",
     "与外壳配方漂移"),

    # ── growth-chart ────────────────────────────────────────────────────
    ("gc/参考带画浓（旧实现的 .5）", "growth-chart", "scripts/build-site.py",
     ".gm-growth__band{fill:rgba(169,227,212,.12)}", ".gm-growth__band{fill:rgba(169,227,212,.5)}",
     "参考带 alpha="),
    ("gc/主曲线线宽被改", "growth-chart", "scripts/build-site.py",
     ".gm-growth__line{fill:none;stroke:#F77FA3;stroke-width:2.5;",
     ".gm-growth__line{fill:none;stroke:#F77FA3;stroke-width:2.6;", "主曲线必须 2.5px"),
    ("gc/主曲线改回薄荷色", "growth-chart", "scripts/build-site.py",
     ".gm-growth__line{fill:none;stroke:#F77FA3;", ".gm-growth__line{fill:none;stroke:#6FC9B4;",
     "主曲线必须是品牌主色"),
    ("gc/警戒线借正文色", "growth-chart", "scripts/build-site.py",
     ".gm-growth__warn{fill:none;stroke:var(--gm-guide,#9AA2B0);",
     ".gm-growth__warn{fill:none;stroke:var(--lg-text-tertiary,#9AA2B0);", "警戒线必须是三级色导引件"),
    ("gc/警戒线改实线", "growth-chart", "scripts/build-site.py",
     "stroke-width:1.5;stroke-dasharray:4 4}", "stroke-width:1.5}", "警戒线必须是虚线"),
    ("gc/去掉参考带上界白描边", "growth-chart", "scripts/build-site.py",
     ".gm-growth__band-top{fill:none;stroke:rgba(255,255,255,.9);stroke-width:1}",
     ".gm-growth__band-top{fill:none;stroke-width:1}", "参考带上界必须细白描边"),
    ("gc/网格线借正文色", "growth-chart", "scripts/build-site.py",
     ".gm-growth__grid{stroke:var(--lg-divider,rgba(58,52,84,.08));",
     ".gm-growth__grid{stroke:var(--lg-text-secondary,#4F5B6E);", "网格线必须 --lg-divider"),
    ("gc/端点丢白芯", "growth-chart", "scripts/build-site.py",
     ".gm-growth__dot{fill:#FFF;stroke:#F77FA3;stroke-width:2}",
     ".gm-growth__dot{fill:#F77FA3;stroke:#F77FA3;stroke-width:2}", "端点必须是白芯"),
    ("gc/Tooltip 丢玻璃规格", "growth-chart", "scripts/build-site.py",
     "background:rgba(255,255,255,.75);-webkit-backdrop-filter:blur(20px);",
     "background:rgba(255,255,255,.97);-webkit-backdrop-filter:blur(20px);",
     "Tooltip 必须是白玻璃泡"),
    ("gc/导引件令牌改成正文色档", "growth-chart", "scripts/build-site.py",
     "  --gm-guide:#9AA2B0;\n}", "  --gm-guide:#4F5B6E;\n}", "导引件必须比正文轻一档"),
    ("gc/导引件令牌暗档被改", "growth-chart", "scripts/build-site.py",
     '[data-theme="dark"]{--gm-guide:#A6ADB9}', '[data-theme="dark"]{--gm-guide:#F3EFEC}',
     "三级色暗档"),
    ("gc/页面又手画一份", "growth-chart", "site/fragments/preview-examples.html",
     '<div id="growthChart"></div>',
     '<div id="growthChart"></div><svg><path fill="rgba(169,227,212,.5)" d="M0,0"/></svg>',
     "又出现了 alpha .5 的参考带"),
    ("gc/调用缺数据源版本", "growth-chart", "site/fragments/preview-examples.html",
     "source:'WHO 2006 · 0–24 月龄'", "source:''", "缺少 source:"),
    ("gc/调用缺 P50", "growth-chart", "site/fragments/preview-examples.html",
     "    p50:[3.3,6.4,7.9,8.9,9.6,10.3,10.9,11.5,12.2],\n", "", "缺少 p50:"),
    ("gc/独立页配方漂移", "growth-chart", "fuyouaicansai/goodmom-redesign.html",
     ".gx-line{fill:none;stroke:#F77FA3;stroke-width:2.5;",
     ".gx-line{fill:none;stroke:#F77FA3;stroke-width:2.4;", "与外壳配方漂移"),

    # ── undefined-token ─────────────────────────────────────────────────
    ("token/语义色定义被删（无兜底引用仍在）", "undefined-token", "site/fragments/preview-index.html",
     "  --lg-sem-positive:#25715D; --lg-sem-info:#3261C1; --lg-sem-attention:#8D5A15;\n", "",
     "无兜底引用却从未定义"),

    # ── css-syntax ──────────────────────────────────────────────────────
    ("css/注释不闭合", "css-syntax", "site/fragments/preview-patterns.html",
     "<!--@css-->\n", "<!--@css-->\n/* 未闭合的注释\n", "注释不闭合"),
]


def main() -> int:
    filt = sys.argv[1] if len(sys.argv) > 1 else ""
    cases = [c for c in CASES if filt in c[0]]
    if not cases:
        print("没有匹配的用例：%s" % filt)
        return 2

    failures = []
    for name, gate, path, old, new, expect in cases:
        if not os.path.exists(path):
            failures.append((name, "目标文件不存在：%s" % path))
            print("SKIP %-40s 目标文件不存在" % name)
            continue
        backup = io.open(path, encoding="utf-8").read()
        if backup.count(old) < 1:
            failures.append((name, "注入点没找到（门禁或源码已变，用例需同步）"))
            print("SKIP %-40s 注入点没找到：%r" % (name, old[:40]))
            continue
        try:
            io.open(path, "w", encoding="utf-8").write(backup.replace(old, new, 1))
            code, out = run_audit(gate)
            ok = code != 0 and expect in out
            if ok:
                print("PASS %-40s 注入后如预期 FAIL（%s）" % (name, expect))
            else:
                why = "注入后仍然 PASS —— 该门禁已空转" if code == 0 else \
                      "注入后 FAIL 了，但报的不是预期原因（预期含 %r）" % expect
                failures.append((name, why))
                print("FAIL %-40s %s" % (name, why))
                if code != 0:
                    for line in out.splitlines():
                        if line.startswith("[FAIL]"):
                            print("       " + line[:160])
        finally:
            # 按字节还原：绝不允许负向测试把仓库改坏
            cur = io.open(path, encoding="utf-8").read()
            if cur != backup:
                io.open(path, "w", encoding="utf-8").write(backup)
            assert io.open(path, encoding="utf-8").read() == backup, "还原失败：%s" % path

    print()
    if failures:
        print("负向测试未通过 %d / %d：" % (len(failures), len(cases)))
        for n, w in failures:
            print("  - %s：%s" % (n, w))
        return 1
    print("全部 %d 条负向测试通过：每条门禁在注入真实缺陷后都会 FAIL，且报出预期原因。" % len(cases))
    return 0


if __name__ == "__main__":
    sys.exit(main())
