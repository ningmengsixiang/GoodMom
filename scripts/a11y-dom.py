#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOM 级可访问性实测（渲染级对比度）。

## 这个工具修了什么（P1-20 / P2-2 / P2-4）

旧版有四个确定性缺陷，导致它虽是"唯一的渲染级证据"却完全不可用：

1. **丢弃 alpha**：`rgb()` 用同一个正则匹配 `rgb()`/`rgba()` 却只返回前 3 个分量，
   于是 `a[3] !== 0` 恒为真，半透明背景被当作不透明实色参与对比度计算，
   读数**夸大 2–3 倍**。本版按 `source-over` 沿祖先链逐层合成，
   前景色自身的 alpha 也同样合成。
2. **跑不完**：无头 Chrome 打完 DOM 后**不会自动退出**（实测 `--dump-dom` 挂住），
   旧版靠 `subprocess.run(timeout=)` 等它，必然超时 → 报告永远写不出来。
   本版边读边匹配结束标记，拿到完整文档即主动收工，并对整个进程组收尸。
3. **孤儿进程**：无信号处理，父进程被杀后子进程继续跑并重建探针文件
   （表现为"删掉又出现"）。本版 `start_new_session=True` + SIGTERM/SIGINT 处理。
4. **探针落在自己的输入目录**：旧版把 `_a11y_probe.html` 写进 `site/` 与 `preview/`，
   下次运行会把它当成待测页面；残留还会让 `audit.py` 的 hex-case 门禁变红。
   本版写到系统临时目录，并注入 `<base>` 使相对资源仍能解析。

另补上"反向盲区"：合并后的 `site/index.html` 里各模块靠 `display` 切换，
**只测默认模块等于漏掉另外 7 个**（旧报告把首页失败数报成 4，而迁入该文件的
两个页面原本各有 71 / 147 项）。本版对 `site/index.html` 逐模块各测一遍。

## 用法

    python3 scripts/a11y-dom.py                   # 实测并写报告；超过基线则退出 1
    python3 scripts/a11y-dom.py --update-baseline # 用本次结果重建基线
    python3 scripts/a11y-dom.py --json            # 只输出机器可读结果

阈值口径：**实色背景**（可机械判定）的失败数不得超过 `docs/a11y-dom-baseline.json`。
渐变/图片背景无法取样，只计 INFO，不参与阈值。
"""
from __future__ import annotations

import argparse
import glob
import io
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

TOOL_VERSION = "2.0.0"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

BASELINE = os.path.join(ROOT, "docs", "a11y-dom-baseline.json")
REPORT = os.path.join(ROOT, "docs", "a11y-dom-report.md")
PAGE_TIMEOUT = int(os.environ.get("A11Y_PAGE_TIMEOUT", "90"))


# ══════════════════════════════════════════════════════════════════════════
# 浏览器定位
# ══════════════════════════════════════════════════════════════════════════

def find_chrome() -> str:
    cands = [os.environ.get("CHROME", ""),
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             shutil.which("google-chrome") or "",
             shutil.which("chromium") or "",
             shutil.which("chromium-browser") or ""]
    # Playwright 下载的 chromium（CI 里常常是唯一可用的浏览器）
    for d in ("/root/.cache/ms-playwright", os.path.expanduser("~/Library/Caches/ms-playwright")):
        if os.path.isdir(d):
            for name in sorted(os.listdir(d), reverse=True):
                for sub in ("chrome-mac/Chromium.app/Contents/MacOS/Chromium",
                            "chrome-linux/chrome"):
                    p = os.path.join(d, name, sub)
                    if os.path.exists(p):
                        cands.append(p)
    for c in cands:
        if c and os.path.exists(c):
            return c
    return ""


CHROME = find_chrome()


# ══════════════════════════════════════════════════════════════════════════
# 页面集合
# ══════════════════════════════════════════════════════════════════════════

def site_modules() -> list:
    """从站点构建脚本读取模块列表，避免两处维护（读不到则退回内置顺序）。"""
    try:
        src = io.open(os.path.join(ROOT, "scripts", "build-site.py"), encoding="utf-8").read()
        m = re.search(r"^MODULES\s*=\s*\[(.*?)^\]", src, re.S | re.M)
        if m:
            found = re.findall(r'\(\s*"([a-z-]+)"', m.group(1))
            if found:
                return found
    except Exception:                                   # noqa: BLE001
        pass
    return ["site-index", "preview-index", "preview-examples", "preview-mobile",
            "preview-patterns", "site-spec", "site-manual", "site-docs"]


def collect_pages() -> list:
    """返回 [(页面路径, hash)]；hash 为空表示整页测一次。

    排除：`_*` 临时探针、已被合并的重定向桩（内容只有跳转，没有可测文本）。
    """
    out = []
    for p in sorted(glob.glob("site/*.html") + glob.glob("preview/*.html")):
        if os.path.basename(p).startswith("_"):
            continue
        try:
            if "页面已合并" in io.open(p, encoding="utf-8").read():
                continue
        except OSError:
            continue
        if p == "site/index.html":
            for mod in site_modules():
                out.append((p, "gm-mod-" + mod))
        else:
            out.append((p, ""))
    # fuyouaicansai/：参照项目重画版 + **6 个独立产品页 + 索引页**（由 gen-product-apps.py 生成）。
    # 这些页不在 site//preview/ 下，故单独列；与 site/index.html 的模块一起构成"全站逐页"口径。
    extras = ["fuyouaicansai/goodmom-redesign.html", "fuyouaicansai/index.html"] + [
        "fuyouaicansai/p0%d-%s.html" % (i, slug) for i, slug in enumerate(
            ["women-health", "preconception", "maternity", "newborn", "child-health", "ai-care"], 1)]
    for extra in extras:
        if os.path.exists(extra):
            out.append((extra, ""))
    return out


# ══════════════════════════════════════════════════════════════════════════
# 探针
# ══════════════════════════════════════════════════════════════════════════

# 稳定性样式：测对比度时把动效钉死在**终态**。
# 不加这一段，同一份产物两次运行会得到不同的失败数（入场动画的中间帧透明度不同），
# 阈值门禁就会变成随机红绿 —— 实测两次运行相差 25 项。
# 只影响时序、不影响配色，因此测量结论仍然有效。
STABILIZE = ("<style id=\"gm-a11y-stabilize\">"
             "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;"
             "animation-iteration-count:1!important;transition-duration:0s!important;"
             "transition-delay:0s!important;scroll-behavior:auto!important}"
             "</style>")

PROBE = r"""
<script>
(function(){
try{
/* —— 颜色：保留 alpha（旧版正好在这里丢掉第 4 个分量，读数因此夸大 2–3 倍）—— */
function parseColor(t){
  var m=String(t).match(/rgba?\(([^)]+)\)/);
  if(!m)return null;
  var p=m[1].split(/[,\s\/]+/).filter(function(x){return x!=='';}).map(Number);
  if(p.length<3||p.some(function(x){return isNaN(x);}))return null;
  var a=(p.length>=4)?p[3]:1;
  return [p[0],p[1],p[2],a];
}
/* source-over：fg 叠在 bg 之上 */
function over(fg,bg){
  var a=fg[3]+bg[3]*(1-fg[3]);
  if(a<=0)return [0,0,0,0];
  return [(fg[0]*fg[3]+bg[0]*bg[3]*(1-fg[3]))/a,
          (fg[1]*fg[3]+bg[1]*bg[3]*(1-fg[3]))/a,
          (fg[2]*fg[3]+bg[2]*bg[3]*(1-fg[3]))/a, a];
}
function lum(c){var f=c.slice(0,3).map(function(x){x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});
  return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2];}
function ratio(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}

/* 背景：沿祖先链收集所有半透明层，自底向上做 source-over 合成。
 *
 * 渐变不再是"无法判定就放弃"：渐变的取值只能落在它的色标之间，因此承载面
 * 的明度也被夹在**最亮组合**与**最暗组合**之间；对比度对明度单调，于是
 *   maxRatio = max(ratio(fg, 全取最亮色标), ratio(fg, 全取最暗色标))
 * 是"任意渐变下可达对比度的上界"。上界仍不达标 ⇒ 该文本在任何渐变上都必然
 * 失败，可以判 FAIL（确证失败）。这正是审计里"以最乐观承载面重算"的严格化。
 */
function parseHex(h){
  h=h.replace('#','');
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6&&h.length!==8)return null;
  var a=(h.length===8)?parseInt(h.slice(6,8),16)/255:1;
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),a];
}
function anyColor(t){
  var m=String(t).match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/);
  if(!m)return null;
  return m[0].charAt(0)==='#'?parseHex(m[0]):parseColor(m[0]);
}
function gradientStops(img){
  var out=[],re=/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g,m;
  while((m=re.exec(img))){var c=anyColor(m[0]);if(c)out.push(c);}
  return out;
}
/* 把层序列按"每层取最亮/最暗色标"合成出两个极端承载面。
   layers[0] 是元素自身的背景（最上层），layers[last] 是最底层的实色，
   因此必须**从最后一层往前**叠：acc = over(上层, acc)。 */
function composite(layers,pick){
  var acc=null;
  for(var i=layers.length-1;i>=0;i--){
    var L=layers[i],c;
    if(L.solid){c=L.solid;}
    else{
      var best=L.stops[0];
      for(var j=1;j<L.stops.length;j++){
        var cand=L.stops[j];
        if(pick==='light'?lum(cand)>lum(best):lum(cand)<lum(best))best=cand;
      }
      c=best;
    }
    if(!acc){acc=[c[0],c[1],c[2],c[3]];}
    else{acc=over(c,acc);}
  }
  if(!acc)acc=[255,255,255,1];                              /* 页面基色 */
  if(acc[3]<1)acc=over(acc,[255,255,255,1]);                 /* 底层仍半透明 → 叠白底 */
  return acc;
}
function bgOf(el){
  var layers=[],node=el,broke=false;
  while(node&&node.nodeType===1){
    var cs=getComputedStyle(node);
    var img=cs.backgroundImage;
    if(img&&img!=='none'){
      var st=gradientStops(img);
      if(!st.length)return {opaque:true};                    /* url(...) 图片：确实取不到 */
      layers.push({stops:st});
    }
    var c=parseColor(cs.backgroundColor);
    if(c&&c[3]>0){layers.push({solid:c});if(c[3]>=1){broke=true;break;}}
    node=node.parentElement;
  }
  if(!broke)layers.push({solid:[255,255,255,1]});
  var hasGrad=layers.some(function(L){return !!L.stops;});
  if(!hasGrad){
    var only=layers.filter(function(L){return L.solid;}).map(function(L){return L.solid;});
    var acc=only.length?only[only.length-1]:[255,255,255,1];
    if(acc[3]<1)acc=over(acc,[255,255,255,1]);
    for(var i=only.length-2;i>=0;i--)acc=over(only[i],acc);
    return {color:acc};
  }
  return {color:composite(layers,'light'),dark:composite(layers,'dark'),gradient:true};
}
function visible(el){
  var cs=getComputedStyle(el);
  if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)===0)return false;
  var r=el.getBoundingClientRect();
  return r.width>0&&r.height>0;
}
function isHiddenByAncestor(el,root){
  var n=el;
  while(n&&n.nodeType===1){
    var cs=getComputedStyle(n);
    if(cs.display==='none')return true;
    if(n===root)break;
    n=n.parentElement;
  }
  return false;
}
function pathOf(el){
  var p=[],n=el;
  while(n&&n.nodeType===1&&p.length<4){
    var cls=(n.className&&typeof n.className==='string')?'.'+n.className.trim().split(/\s+/).slice(0,2).join('.'):'';
    p.unshift(n.tagName.toLowerCase()+(n.id?'#'+n.id:cls));
    n=n.parentElement;
  }
  return p.join('>');
}
/* 测量范围 = 当前激活的模块（合并页）或整个 body（独立页）。
   只测"当前可见"会漏掉模块内靠 display 切换的隐藏内容（示例页 6 个 view 只测到 1 个）；
   测整个 body 又会把各模块重复计一次。取模块根即两者兼顾。 */
var root=document.querySelector('.gm-mod.is-on')||document.body||document.documentElement;
var walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT);
var fails=[],infos=[];
while(walker.nextNode()){
  var el=walker.currentNode;
  if(el.closest('script,style,noscript,#A11Y'))continue;
  var txt=[];[].slice.call(el.childNodes).forEach(function(n){
    if(n.nodeType===3){var t=n.textContent.replace(/\s+/g,' ').trim();if(t)txt.push(t);}});
  if(!txt.length)continue;
  var cs=getComputedStyle(el);
  var fg=parseColor(cs.color);
  if(!fg||fg[3]===0)continue;
  var bg=bgOf(el);
  var size=parseFloat(cs.fontSize);
  var bold=parseInt(cs.fontWeight||'400',10)>=700;
  var large=size>=24||(size>=18.66&&bold);
  var need=large?3:4.5;
  var hidden=isHiddenByAncestor(el,root);
  if(bg.opaque){
    /* url(...) 图片背景：既取不到色标也取不到像素，如实标为无法判定 */
    infos.push({sel:pathOf(el),txt:txt[0].slice(0,30),note:'image'});
    continue;
  }
  if(bg.gradient){
    /* 渐变承载面：用"最亮/最暗色标组合"夹出上界（见 bgOf 注释）。
       上界仍不达标 ⇒ 任意渐变下都必然失败 → 确证失败；否则无法判定 → INFO。 */
    var effG=fg[3]>=1?fg:[fg[0],fg[1],fg[2],1];
    var fgLight=over(fg,bg.color),fgDark=over(fg,bg.dark);
    var best=Math.max(ratio(fgLight,bg.color),ratio(fgDark,bg.dark));
    if(best<need){
      fails.push({sel:pathOf(el),txt:txt[0].slice(0,40),r:Math.round(best*100)/100,fs:size,
                  bold:bold,hidden:hidden,gradient:true,
                  fg:cs.color,bg:'渐变上界（亮 '+bg.color.slice(0,3).map(Math.round).join(',')+
                                ' / 暗 '+bg.dark.slice(0,3).map(Math.round).join(',')+'）'});
    }else{
      infos.push({sel:pathOf(el),txt:txt[0].slice(0,30),note:'gradient'});
    }
    continue;
  }
  /* 前景自身的 alpha 也要合成到背景上，否则半透明文字被当成实色 */
  var eff=fg[3]>=1?fg:over(fg,bg.color);
  var r=ratio(eff,bg.color);
  if(r<need){
    fails.push({sel:pathOf(el),txt:txt[0].slice(0,40),r:Math.round(r*100)/100,fs:size,
                bold:bold,hidden:hidden,
                fg:cs.color,bg:'rgb('+bg.color.slice(0,3).map(Math.round).join(',')+')'});
  }
}
var pre=document.createElement('pre');pre.id='A11Y';
pre.textContent=JSON.stringify({fails:fails.slice(0,200),failN:fails.length,
                                infos:infos.slice(0,50),infoN:infos.length});
document.body.appendChild(pre);
}catch(e){var d=document.createElement('pre');d.id='A11Y';
  d.textContent=JSON.stringify({error:String((e&&e.message)||e)});document.body.appendChild(d);}
})();
</script>"""


def dump_dom(url: str):
    """打开 URL 取回 DOM 文本。

    无头 Chrome 打完 DOM 后**不会自动退出**（会一直挂着直到被外部杀掉），
    所以这里边读边找 `</html>`，拿到即主动收工，最后清理整个进程组。
    """
    profile = tempfile.mkdtemp(prefix="gm-a11y-")
    proc = None
    try:
        proc = subprocess.Popen(
            [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
             "--no-first-run", "--no-default-browser-check", "--disable-extensions",
             "--disable-background-networking", "--disable-sync",
             "--user-data-dir=" + profile, "--dump-dom",
             # ⚠️ 预算必须给足：3s 时同一份产物三次运行得到 240/215/240 项，
             # 因为模块脚本里的定时器还没跑完、部分内容尚未渲染完就被 dump。
             # 8s 后三次运行稳定同值 —— 阈值门禁不能建在会抖的量上。
             "--virtual-time-budget=8000", "--window-size=1440,1000", url],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            errors="replace", start_new_session=True)
        buf = []
        done = threading.Event()

        def reader():
            try:
                for line in proc.stdout:
                    buf.append(line)
                    if "</html>" in line:
                        break
            except Exception:                                 # noqa: BLE001
                pass
            finally:
                done.set()

        threading.Thread(target=reader, daemon=True).start()
        done.wait(PAGE_TIMEOUT)
        return ("</html>" in "".join(buf)), "".join(buf), ""
    except Exception as e:                                    # noqa: BLE001
        return False, "", str(e)
    finally:
        if proc:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            except Exception:                                 # noqa: BLE001
                try:
                    proc.kill()
                except Exception:                             # noqa: BLE001
                    pass
        shutil.rmtree(profile, ignore_errors=True)


def probe(page: str, mod_hash: str) -> dict:
    """把探针注入临时副本后测量一页（或合并页的一个模块）。"""
    src = io.open(page, encoding="utf-8").read()
    base_href = "file://" + os.path.dirname(os.path.abspath(page)) + "/"
    html = src.replace("</body>", STABILIZE + PROBE + "\n</body>", 1)
    # <base> 必须在任何相对 URL 之前生效，故紧跟 <head> 之后插入
    if re.search(r"<head[^>]*>", html, re.I):
        html = re.sub(r"(<head[^>]*>)", '\\1\n<base href="%s">' % base_href,
                      html, count=1, flags=re.I)
    else:
        html = '<base href="%s">' % base_href + html

    tmpdir = tempfile.mkdtemp(prefix="gm-a11y-page-")
    try:
        tmp = os.path.join(tmpdir, "probe.html")
        io.open(tmp, "w", encoding="utf-8").write(html)
        url = "file://" + tmp + (("#" + mod_hash) if mod_hash else "")
        ok, out, err = dump_dom(url)
        if not ok:
            return {"error": "no dom", "stderr": (err or "")[:200]}
        m = re.search(r'<pre id="A11Y">(.*?)</pre>', out, re.S)
        if not m:
            return {"error": "no probe"}
        return json.loads(m.group(1))
    except Exception as e:                                    # noqa: BLE001
        return {"error": "probe error: %s" % e}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ══════════════════════════════════════════════════════════════════════════
# 主流程
# ══════════════════════════════════════════════════════════════════════════

def on_signal(*_a):
    """SIGTERM/SIGINT 时不留下孤儿进程与临时目录（旧版正是在这里漏的）。"""
    print("\n[中断] 正在清理…", file=sys.stderr)
    sys.exit(130)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--update-baseline", action="store_true", help="用本次结果重建基线")
    ap.add_argument("--json", action="store_true", help="只输出机器可读结果")
    args = ap.parse_args()

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)

    if not CHROME:
        print("[FAIL] 未找到可用的 Chrome/Chromium。请设置 CHROME 环境变量，"
              "或执行 npx playwright install chromium。")
        return 1

    pages = collect_pages()
    rows, errs, total_fail, total_info, total_grad_fail = [], [], 0, 0, 0
    for page, mod_hash in pages:
        label = page + ((" · " + mod_hash.replace("gm-mod-", "")) if mod_hash else "")
        res = probe(page, mod_hash)
        if "error" in res:
            errs.append((label, res["error"]))
            rows.append({"page": label, "fail": None, "info": None, "error": res["error"]})
            continue
        fails = res.get("fails", [])
        n, i = res.get("failN", 0), res.get("infoN", 0)
        n_grad = len([f for f in fails if f.get("gradient")])
        total_fail += n
        total_info += i
        total_grad_fail += n_grad
        rows.append({"page": label, "fail": n, "gradFail": n_grad, "info": i,
                     "samples": fails[:3], "all": fails})

    result = {
        "tool": "scripts/a11y-dom.py",
        "version": TOOL_VERSION,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S%z"),
        "chrome": CHROME,
        "pages": rows,
        "failN": total_fail,
        "gradientFailN": total_grad_fail,
        "solidFailN": total_fail - total_grad_fail,
        "gradientInfoN": total_info,
        "probeErrors": len(errs),
    }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        lines = ["# A11y DOM 实测报告（渲染级对比度）", "",
                 "- 生成时间：`%s`" % result["generatedAt"],
                 "- 工具：`scripts/a11y-dom.py` v%s（无头 Chrome 逐文本节点按 WCAG 公式实测）" % TOOL_VERSION,
                 "- 算法：前景/背景均**保留 alpha 并做 source-over 合成**（沿祖先链逐层叠加）；",
                 "  渐变与图片背景无法取样，标 INFO，不参与阈值。",
                 "- 覆盖：`site/index.html` 逐模块各测一遍（模块数从 build-site.py 的 MODULES 读取；"
                 "模块靠 display 切换，只测默认模块会漏掉其余全部）；",
                 "  重定向桩与 `_*` 临时文件已排除。",
                 ""]
        if errs:
            lines += ["> ⚠️ 有 %d 项未能实测，**本次结果不构成通过结论**。" % len(errs), ""]
        lines += ["| 页面 | 确证失败 | 其中渐变上界 | 无法判定 INFO | 失败样例（选择器 「文本」 对比度 前景 on 背景） |",
                  "| --- | --- | --- | --- | --- |"]
        for r in rows:
            if r["fail"] is None:
                lines.append("| %s | ERR | — | — | 未实测（%s） |" % (r["page"], r["error"]))
                continue
            samples = "; ".join("%s 「%s」 %.2f (%s on %s)" %
                                (s["sel"], s["txt"], s["r"], s["fg"], s["bg"])
                                for s in r.get("samples", []))
            lines.append("| %s | %d | %d | %d | %s |" % (r["page"], r["fail"], r.get("gradFail", 0),
                                                        r["info"], samples or "&nbsp;"))
        lines += ["", "**确证失败合计 %d**（其中 %d 项为渐变承载面的上界确证，%d 项为实色承载面直接确证）；"
                  "无法判定（渐变但上界达标）%d。"
                  % (total_fail, total_grad_fail, total_fail - total_grad_fail, total_info), ""]

        # 按成因归类：一眼看出"要修的是哪几个色 / 哪类承载面"，而不是 497 条逐条看
        by_fg: dict = {}
        for r in rows:
            for f in r.get("all", []):
                k = f.get("fg", "?")
                e = by_fg.setdefault(k, {"n": 0, "pages": set(), "sample": f})
                e["n"] += 1
                e["pages"].add(r["page"])
        if by_fg:
            lines += ["## 按前景色归类的成因分布", "",
                      "> 修色板时按本表从上往下改，一次一行即可消掉一批失败。",
                      "",
                      "| 前景色 | 失败数 | 涉及页面 | 样例（对比度 / 承载面） |",
                      "| --- | --- | --- | --- |"]
            for fg, e in sorted(by_fg.items(), key=lambda kv: -kv[1]["n"]):
                sm = e["sample"]
                lines.append("| `%s` | %d | %s | %.2f · %s |"
                             % (fg, e["n"], "、".join(sorted(e["pages"])[:3]), sm.get("r", 0), sm.get("bg", "")))
            lines.append("")

        if not args.update_baseline and os.path.exists(BASELINE):
            base = json.load(io.open(BASELINE, encoding="utf-8"))
            lines.append("阈值基线（`docs/a11y-dom-baseline.json`）：实色失败 ≤ %d（基线生成于 %s）。"
                         % (base.get("solidFailN", 0), base.get("generatedAt", "?")))
        io.open(REPORT, "w", encoding="utf-8").write("\n".join(lines) + "\n")
        print("\n".join(l for l in lines if l.startswith(("|", "#", "**"))))
        print("-> " + os.path.relpath(REPORT, ROOT))

    if args.update_baseline:
        io.open(BASELINE, "w", encoding="utf-8").write(
            json.dumps({"generatedAt": result["generatedAt"], "tool": TOOL_VERSION,
                        "failN": total_fail,
        "gradientFailN": total_grad_fail,
        "solidFailN": total_fail - total_grad_fail, "gradientInfoN": total_info},
                       ensure_ascii=False, indent=2) + "\n")
        print("基线已写入 docs/a11y-dom-baseline.json（实色失败 %d）" % total_fail)

    # ── 门禁语义：探针没跑完 → 失败；超过基线 → 失败（旧版两者都不失败）──
    if errs:
        print("\n[FAIL] %d/%d 个页面未能实测（报告不构成通过结论）：" % (len(errs), len(pages)))
        for label, e in errs:
            print("  - %s: %s" % (label, e))
        return 1

    if not args.update_baseline and os.path.exists(BASELINE):
        base = json.load(io.open(BASELINE, encoding="utf-8"))
        # ⚠️ 必须与**同一个量**比较：基线里既存了 failN（合计）也存了 solidFailN（仅实色承载面）。
        #    早先误用 solidFailN 当阈值，导致"合计"永远大于"仅实色"，门禁恒红。
        allowed = int(base.get("failN", base.get("solidFailN", 0)))
        if total_fail > allowed:
            print("\n[FAIL] 确证对比度失败 %d 项，超过基线 %d 项（新增 %d）。"
                  % (total_fail, allowed, total_fail - allowed))
            print("       修复后如属预期收紧，请执行：python3 scripts/a11y-dom.py --update-baseline")
            return 1
        print("\nOK 确证对比度失败 %d 项 ≤ 基线 %d 项" % (total_fail, allowed))
    return 0


if __name__ == "__main__":
    sys.exit(main())
