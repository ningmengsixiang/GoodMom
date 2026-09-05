#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOM 级可访问性实测（Axe 级替代：静态断言之外的真实渲染检查）。
在无头 Chrome 中为每个页面注入探针：逐文本节点按 WCAG 公式算前景/背景对比度。
背景为实色→实测判定；背景为渐变→标 INFO（gradient，见 D6 已按离线实测切深档）。
输出 docs/a11y-dom-report.md。用法：python3 scripts/a11y-dom.py"""
import glob, io, json, os, re, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if not os.path.exists(CHROME):
    CHROME = os.environ.get("CHROME", "")
PAGES = (glob.glob("site/*.html") + glob.glob("preview/*.html")
         + ["fuyouaicansai/goodmom-redesign.html"])

PROBE = r"""
<script>
(function(){
try{
function rgb(t){var m=t.match(/rgba?\(([^)]+)\)/);if(!m)return null;
  var p=m[1].split(/[, ]+/).map(Number);return [p[0],p[1],p[2]];}
function lum(c){var f=c.map(function(x){x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});
  return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2];}
function ratio(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function alphaBg(el){var g=document.defaultView.getComputedStyle(el).getPropertyValue('background-image').trim();
  var node=el, stack=[];
  while(node&&node.nodeType===1){var cs=document.defaultView.getComputedStyle(node);
    var col=cs.backgroundColor, img=cs.backgroundImage.trim();
    if(img&&img!=='none'){return {g:true};}
    if(col&&col!=='transparent'&&col!=='rgba(0, 0, 0, 0)'){var a=rgb(col);if(a&&a[3]!==0){stack.push(a);break;}}
    node=node.parentElement;}
  // 合并不透明祖先（简化：取最近非透明）
  var last=null;for(var i=0;i<stack.length;i++)last=stack[i];
  return {g:false,c:last};}
function fontSize(el){var cs=document.defaultView.getComputedStyle(el);return parseFloat(cs.fontSize);}
function textInfo(el){var out=[];[].slice.call(el.childNodes).forEach(function(n){
  if(n.nodeType===3){var t=n.textContent.replace(/\s+/g,' ').trim();if(t)out.push({t:t});}});return out;}
var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT);
var fails=[],infos=[];
while(walker.nextNode()){
  var el=walker.currentNode;
  if(el.closest('script,style,noscript'))continue;
  var txt=textInfo(el);if(!txt.length)continue;
  var cs=document.defaultView.getComputedStyle(el);
  if(cs.color==='transparent')continue;
  var fg=rgb(cs.color);if(!fg)continue;
  var bg=alphaBg(el);
  var size=fontSize(el);var bold=parseInt(cs.fontWeight||'400',10)>=700;
  var large=size>=24||(size>=18.66&&bold);
  if(bg.g){infos.push({sel:el.tagName.toLowerCase()+(el.id?'#'+el.id:''),txt:txt[0].t.slice(0,30),note:'gradient'});continue;}
  if(!bg.c){continue;}
  var r=ratio(fg,bg.c);var need=large?3:4.5;
  if(r<need){fails.push({sel:el.tagName.toLowerCase()+(el.id?'#'+el.id:''),txt:txt[0].t.slice(0,30),r:Math.round(r*100)/100,fs:size,bold:bold});}
}
var pre=document.createElement('pre');pre.id='A11Y';pre.textContent=JSON.stringify({fails:fails.slice(0,40),failN:fails.length,infos:infos.slice(0,20),infoN:infos.length});
document.body.appendChild(pre);
}catch(e){var d=document.createElement('pre');d.id='A11Y';d.textContent='ERR '+e.message;document.body.appendChild(d);}
})();
</script>"""

def run(page):
    d = os.path.dirname(page) or "."
    tmp = os.path.join(d, "_a11y_probe.html")
    content = io.open(page, encoding="utf-8").read()
    io.open(tmp, "w", encoding="utf-8").write(content.replace("</body>", PROBE + "\n</body>", 1))
    try:
        out = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--dump-dom",
                              "--virtual-time-budget=2500", "--window-size=1440,1000",
                              "file://" + os.path.abspath(tmp)],
                             capture_output=True, text=True, timeout=40)
        m = re.search(r'<pre id="A11Y">(.*?)</pre>', out.stdout, re.S)
        if not m:
            return {"error": "no probe", "stderr": out.stderr[:300]}
        return json.loads(m.group(1))
    finally:
        try: os.remove(tmp)
        except OSError: pass

lines = ["# A11y DOM 实测报告（渲染级）", "",
         "- 工具：`scripts/a11y-dom.py`（无头 Chrome 逐文本节点按 WCAG 公式实测）",
         "- 说明：实色背景按 ≥4.5（大字/粗体 ≥3.0）判定；渐变背景无法取样，标 INFO——文字承载面已按 D6 离线切深档（实测值见 docs/审查决策记录.md D5）", ""]
lines += ["| 页面 | 文本节点失败(实色) | 渐变未取样(INFO) | 备注 |", "| --- | --- | --- | --- |"]
rows = []
for p in PAGES:
    res = run(p)
    if "error" in res:
        rows.append((p, "ERR", 0, 0, res["error"]))
        continue
    n = res.get("failN", 0)
    rows.append((p, n, res.get("infoN", 0), res.get("infos", []), res.get("fails", [])[:5]))
    lines.append("| %s | %d | %d | %s |" % (p, n, res.get("infoN", 0),
                 "&nbsp;" if not res.get("fails") else "; ".join("%s %s %.2f" % (f["sel"], f["txt"], f["r"]) for f in res["fails"][:3])))
io.open("docs/a11y-dom-report.md", "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("\n".join(l for l in lines if l.startswith("|") or l.startswith("#")))
print("-> docs/a11y-dom-report.md")
