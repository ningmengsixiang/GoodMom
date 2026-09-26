# -*- coding: utf-8 -*-
import re,html,glob,os

FILES=['README.md']+sorted(glob.glob('[0-9][0-9]-*.md'))
def anchor(fn):
    b=os.path.basename(fn)
    if b=='README.md': return 'ch-readme'
    m=re.match(r'(\d\d)-',b)
    return 'ch-'+m.group(1) if m else 'ch-'+b.split('.')[0]
TARGET={anchor(f):'#'+anchor(f) for f in FILES}

def mdlink(m):
    txt=m.group(1); url=m.group(2)
    if url.startswith(('http','#','mailto')) or url.endswith(('.html','.svg','.png','.pdf')):
        return '['+txt+']('+url+')'
    # 相对 md 文档 → 锚点
    for a in TARGET:
        pass
    base=os.path.basename(url.split('#')[0])
    key='ch-readme' if base=='README.md' else (re.match(r'(\d\d)-',base).group(1) if re.match(r'(\d\d)-',base) else None)
    if key:
        return '['+txt+']('+('#ch-'+ (key if key!='ch-readme' else 'readme'))+')'
    # 其他相对路径（html 等）在站点目录需加 ../（相对根）
    if url.startswith(('../','./','/')) or url.startswith('icons') or url.startswith('preview') or url.startswith('site'):
        return '['+txt+']('+('../' if not url.startswith(('../','./','/')) else '')+url+')'
    return '['+txt+']('+url+')'

def inline(t):
    t=t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',t)
    t=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',mdlink,t)
    return t

def brk(html: str) -> str:
    """在标题 HTML 的**文本节点**里插入 `<wbr>` 断行点（中日韩 ↔ 拉丁/数字边界、全角括号内侧）。

    ⚠️ 为什么必须在生成期插标签，而不是靠 CSS 或零宽空格：
      · 「总表（Flat Component Registry）」这类粗体混排标题在 250px 内容宽下实测 254px；
      · `overflow-wrap:anywhere` / `word-break:break-all` / `line-break:anywhere` 全部无效；
      · 插 U+200B **更糟**（CJK 禁则：「（」不得落在行末、其后本就不许断行，ZWSP 被抑制，仍不换行）；
      · 实测唯独 `<wbr>` 在每个边界都能断开（高 27px→54px，溢出 4px→0）。
    只在文本节点插入（按标签切分后跳过标签段），不会破坏 `<code>`/`<a>` 等内联结构。
    """
    cjk = "[\u3000-\u9fff\uff00-\uffef]"
    out = []
    for part in re.split(r"(<[^>]+>)", html):
        if part.startswith("<"):
            out.append(part); continue
        part = re.sub("(" + cjk + ")(?=[A-Za-z0-9])", r"\1<wbr>", part)
        part = re.sub("(?<=[A-Za-z0-9])(" + cjk + ")", r"<wbr>\1", part)
        part = re.sub("([\uff08\u3010\u300a])", r"\1<wbr>", part)
        part = re.sub("([\uff09\u3011\u300b])", r"<wbr>\1", part)
        out.append(part)
    return "".join(out)


def render_md(txt):
    out=[]; code=False; buf=[]; para=[]; inlist=None; table=[]
    lines=txt.split('\n')
    i=0
    def flush_p():
        if para:
            out.append('<p>'+brk(' '.join(inline(x) for x in para))+'</p>'); para.clear()
    while i<len(lines):
        ln=lines[i]
        if ln.strip().startswith('```'):
            flush_p()
            if code:
                out.append('<pre>'+html.escape('\n'.join(buf))+'</pre>'); buf=[]
            code=not code; i+=1; continue
        if code:
            buf.append(ln); i+=1; continue
        s=ln.strip()
        if not s:
            flush_p(); i+=1; continue
        # table
        if s.startswith('|') and i+1<len(lines) and re.match(r'^\s*\|?[\s:|-]+\|?\s*$',lines[i+1].strip()):
            flush_p()
            head=[c.strip() for c in s.strip('|').split('|')]
            rows=[]; i+=2
            while i<len(lines) and lines[i].strip().startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i+=1
            out.append('<table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in r)+'</tr>' for r in rows)+'</tbody></table>')
            continue
        # headings
        m=re.match(r'^(#{1,6})\s+(.*)$',s)
        if m:
            flush_p()
            h=min(len(m.group(1))+1,6)
            out.append('<h%d>%s</h%d>'%(h,brk(inline(m.group(2))),h)); i+=1; continue
        if s=='---':
            flush_p(); out.append('<hr>'); i+=1; continue
        if s.startswith('>'):
            flush_p(); buf2=[]
            while i<len(lines) and lines[i].strip().startswith('>'):
                buf2.append(lines[i].strip()[1:].strip()); i+=1
            out.append('<blockquote>'+'<br>'.join(inline(x) for x in buf2)+'</blockquote>')
            continue
        mlist=re.match(r'^(\s*)[-*]\s+(.*)$',s)
        if mlist:
            flush_p()
            items=[]
            while i<len(lines):
                mm=re.match(r'^(\s*)[-*]\s+(.*)$',lines[i])
                if not mm: break
                items.append(mm.group(2)); i+=1
            out.append('<ul>'+''.join('<li>'+brk(inline(x))+'</li>' for x in items)+'</ul>')
            continue
        mnum=re.match(r'^\s*\d+[.、]\s*(.*)$',s)
        if mnum:
            flush_p()
            items=[]
            while i<len(lines):
                mn=re.match(r'^\s*\d+[.、]\s*(.*)$',lines[i])
                if not mn: break
                items.append(mn.group(1)); i+=1
            out.append('<ol>'+''.join('<li>'+brk(inline(x))+'</li>' for x in items)+'</ol>')
            continue
        # code block indented? none significant
        para.append(s); i+=1
    flush_p()
    return '\n'.join(out)

# build html body
groups=[('概览',['README.md']),
 ('组件索引',['00-组件总目录.md']),
 ('设计指南',['01-设计总览与设计DNA.md','12-妈咪好品牌与设计语言.md','14-命名与术语规范.md','16-优化与一致性审计.md','17-页面布局与组件组合规范.md']),
 ('开发指南',['02-Token规范.md','03-组件规范.md','04-数据可视化规范.md','05-AI生成Prompt库.md','06-制作流程与验收清单.md','07-交互动效与微交互规范.md','08-组件覆盖清单与Semi对齐.md','09-图标库规范.md','19-工程架构与组件复用规范.md']),
 ('多端',['10-移动端组件规范.md','11-移动端组件全量库.md']),
 ('妇幼业务',['13-妇幼领域组件规范.md','15-妇幼业务词库与状态大典.md'])]

menu=''
for g,fl in groups:
    links=''
    for fn in fl:
        lbl=fn.replace('.md','').replace('README','总览与使用')
        links+='<a href="#%s">%s</a>'%(anchor(fn),lbl)
    menu+='<div class="gp"><button type="button">%s</button><div class="drop">%s</div></div>'%(g,links)
menu+='<a class="ext" href="index.html">主站</a><a class="ext2" href="../preview/examples.html">示例中心</a>'
# ⚠️ 阅读模式开关必须存在：阅读器脚本第一句就是
#    `document.getElementById('modeBtn')…addEventListener`，缺了它整段脚本抛 TypeError
#    （表现为"规范全文的阅读模式/上下章全部失灵"，而门禁只看到控制台有错）。
#    同时 .chapnav 的三个按钮（prevCh/allCh/nextCh）也必须齐备。此前这两处都丢了，
#    所以 `gen-spec.py` 一旦重跑就会把可用的片段覆盖成坏片段 —— 这正是它长期没人敢跑的原因。
menu+='<button class="readtoggle" id="modeBtn" type="button">阅读模式</button>'

sections=[]
for fn in FILES:
    t=open(fn,encoding='utf-8').read()
    title=os.path.basename(fn).replace('.md','')
    if title=='README': title='总览 · README'
    sections.append('<section class="chap" id="%s"><div class="chap-hd"><b>%s</b></div><div class="md">%s</div></section>'%(anchor(fn),html.escape(title),render_md(t)))

css='''
/* 02 · 2.5 背景原点（V2.9 实测修复）：渐变按 border-box 定尺。
   默认 padding-box 时，渐变图按 padding-box 定尺却要铺满 border-box，
   多出的 1px 边框环会平铺取到渐变**另一端** → 顶部一条暗缝、底部一条亮缝，
   看起来像"胶囊缺了一角 / 露出别的底色"。全局声明，特异性 0，可被组件规则覆盖。 */
:root{--t:#343A46;--t2:#4F5B6E;--t3:#4F5B6E;--rose:#E85D8F;--rose-deep:#B23A63;--bg:linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#E7D3CB)}
*{box-sizing:border-box}body{margin:0;font-family:"PingFang SC","Inter","MiSans","Noto Sans SC",sans-serif;color:var(--t);background:var(--bg)}
a{color:var(--rose-deep)}
.top{position:sticky;top:0;z-index:90;display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:10px 16px;background:rgba(255,255,255,.78);border-bottom:1px solid #F0D4CF;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.top img{width:26px;height:26px;border-radius:50%;object-fit:cover}
.top b{color:var(--rose-deep);font-size:14px;margin-right:10px}
.gp{position:relative;display:inline-flex}
.gp>button{font-family:inherit;border:1px solid transparent;background:none;border-radius:var(--lg-radius-pill,999px);min-height:26px;padding:7px 12px;cursor:pointer;font-size:13px;font-weight:500;color:var(--t2)}
.gp>button::after{content:"▾";font-size:9px;margin-left:4px;opacity:.6}
.gp:hover>button{background:#FFF;color:var(--rose-deep)}
/* V2.9：阅读器工具栏/章节导航按钮原为 25px 直角 —— 尺寸落 26 档、圆角走胶囊档 */
.top button,.chapnav button,.readtoggle{min-height:26px;border-radius:var(--lg-radius-pill,999px)}
.drop{position:absolute;top:calc(100% + 10px);left:0;min-width:210px;z-index:100;padding:6px;border-radius:22px;background:#FFF;border:1px solid rgba(232,93,143,.2);box-shadow:0 16px 40px rgba(90,70,70,.15);opacity:0;pointer-events:none;transform:translateY(6px);transition:.2s}
.gp:hover .drop{opacity:1;pointer-events:auto;transform:none}
.gp::after{content:"";position:absolute;left:0;right:0;top:100%;height:12px}
.drop a{display:block;padding:8px 12px;border-radius:18px;font-size:13px;color:var(--t2);text-decoration:none;white-space:nowrap}
.drop a:hover{background:rgba(247,127,163,.1);color:#B23A63}
.top .ext{margin-left:auto;font-size:12.5px;font-weight:600;text-decoration:none;padding:7px 14px;border-radius:999px;background:#FFF;border:1px solid rgba(232,93,143,.3);color:var(--rose-deep)}
.top .ext2{margin-left:8px;background:var(--mmh-grad-action-hc,linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%));color:#343A46;font-weight:600;text-decoration:none;font-size:12.5px;padding:7px 14px;border-radius:999px;border:var(--lg-border-1,1px) solid transparent;box-shadow:0 1px 2px rgba(178,58,99,.22),0 8px 20px rgba(240,127,163,.30);background-origin:border-box}   /* 03 · 3.2.4 主按钮配方 */
.wrap{max-width:1080px;margin:0 auto;padding:20px 18px 80px}
.chap{scroll-margin-top:70px;margin:0 0 34px;border-radius:22px;padding:22px 26px;background:linear-gradient(160deg,rgba(255,255,255,.72),rgba(255,255,255,.4));border:1px solid #F0D4CF;box-shadow:0 10px 26px rgba(90,70,70,.08);background-origin:border-box}
.chap-hd{font-size:20px;font-weight:700;color:var(--rose-deep);padding-bottom:10px;border-bottom:1px solid #F0D4CF;margin-bottom:12px}
/* 02 · 2.2.4 字重上限 700：<b> 在 700 的父级下按 bolder 计算为 900，故显式回落 */
.chap-hd b{font-weight:700}
.md h1{font-size:24px;margin:18px 0 8px;color:var(--rose-deep)}
.md h2{font-size:19px;margin:20px 0 6px}
.md h3{font-size:16px;margin:16px 0 6px;min-width:0;flex-wrap:wrap}
.md h4{min-width:0;flex-wrap:wrap}
.md p{line-height:1.85;font-size:14px}
.md ul,.md ol{padding-left:22px;line-height:1.9;font-size:14px}
.md table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px}
.md th,.md td{border:1px solid #EED5CD;padding:7px 9px;text-align:left}
.md th{background:rgba(247,127,163,.1);color:#A03F60}
.md pre{background:#FFF7F4;border:1px solid #F0D4CF;border-radius:18px;padding:12px 14px;overflow:auto;font-size:12px;line-height:1.7}
.md code{font-family:ui-monospace,Menlo,monospace;background:rgba(247,127,163,.08);padding:1px 5px;border-radius:6px;font-size:12px}
.md pre code{background:none;padding:0}
.md blockquote{border-left:2px solid var(--rose);margin:12px 0;padding:4px 14px;color:var(--t2);background:rgba(247,127,163,.06);border-radius:0 18px 18px 0}
.md hr{border:none;border-top:1px dashed #E6C6BD;margin:16px 0}
/* ── 17 · 页面壳 / 10 · 10.11.1：正文护栏 ──
   实测根因（逐页质检 scripts/page-qa.mjs）：引用块里的长 URL
   （如 https://semi.design/zh-CN/basic/icon）不可断行，把整页顶宽 116px；
   正文里的宽表同样越界。`overflow-wrap:anywhere` 允许在任意字符处断行。 */
.md,.chap,.doc,main{min-width:0;max-width:100%}
.md p,.md li,.md td,.md blockquote{overflow-wrap:anywhere;word-break:break-word}
.md h1,.md h2,.md h3,.md h4{overflow-wrap:anywhere}
@media(max-width:480px){
  /* 窄屏把正文两侧留白各收 6px（18→12）+ 章内边距收 4px：一起多出 20px 内容宽，
     把上面那类"混排标题差 4~5px 收不进"的情况一次性吸收掉（比逐条改文案稳）。 */
  .wrap{padding-left:12px;padding-right:12px}
  .chap{padding:12px}
}
.md blockquote a,.md a{overflow-wrap:anywhere;word-break:break-word}
.md table,.chap table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
@media(max-width:767px){
  .chap{padding:16px}
  /* 17 · 页面壳：顶栏下拉（绝对定位 min-width:210px）与正文宽表在 375px 越界。
     ⚠️ 只写 `right:0` 不够：菜单锚在药丸上，320~600 档实测左边缘跑到 -18 / -76 / -98px
     （菜单文字被左边缘切掉）。窄屏改成"挂在顶栏上的整宽面板"——任何视口宽度都不出屏。 */
  .top{position:relative}
  .gp{position:static}
  .drop{left:12px;right:12px;top:calc(100% + 6px);min-width:0;max-width:none;width:auto}
  .md pre{max-width:100%;overflow-x:auto}
  /* 10 · 10.4：可点热区 ≥44×44（原实测 34–38px） */
  .top button,.top a,.drop a,.chapnav button{min-height:44px;display:inline-flex;align-items:center}
}
'''
htmlout='''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>妈咪好 GoodMom · 设计规范大全（HTML 主页）</title>
<link rel="icon" type="image/png" href="../brand/logo-192.png">
<style>%s</style>
</head>
<body>
<div class="top"><img src="../brand/logo-512.png" alt="妈咪好"><b>妈咪好 GoodMom · 规范大全</b>%s</div>
<div class="wrap">%s</div>
</body>
</html>'''%(css,menu,'\n'.join(sections))
# 阅读模式脚本（build-site.py 会做作用域改写后重新包裹 <script>）
# ⚠️ 本段此前**从未在文件中定义**：`SCRIPT.strip()` 被引用，而 `SCRIPT = ...` 不存在，
#    于是 `python3 scripts/gen-spec.py` 直接 NameError 退出 —— 规范全文的站点片段
#    因此长期无法重新生成，内嵌正文悄悄停在 94 项/12 模块的旧快照上。
#    CI 的"片段新鲜度"步骤（P1-9）会把这类"生成器本身跑不起来"变成显式失败。
SCRIPT = r"""(function(){var chaps=[].slice.call(document.querySelectorAll('section.chap'));
var ids=chaps.map(function(c){return c.id;});var cur=0;
var btn=document.getElementById('modeBtn'),allBtn=document.getElementById('allCh'),prevBtn=document.getElementById('prevCh'),nextBtn=document.getElementById('nextCh');
function setActive(id,top){chaps.forEach(function(c){c.classList.remove('active');});var el=document.getElementById(id);if(el)el.classList.add('active');cur=ids.indexOf(id);if(top!==false)window.scrollTo(0,0);}
function reader(on){document.body.classList.toggle('reader',on);btn.textContent=on?'回到列表':'阅读模式';if(on){var h=(location.hash||'').slice(1);setActive(ids.indexOf(h)>=0?h:'ch-readme',true);}else chaps.forEach(function(c){c.classList.remove('active');});}
btn.addEventListener('click',function(){reader(!document.body.classList.contains('reader'));});
allBtn.addEventListener('click',function(){reader(false);location.hash='';});
prevBtn.addEventListener('click',function(){cur=Math.max(0,cur-1);setActive(ids[cur],true);});
nextBtn.addEventListener('click',function(){cur=Math.min(ids.length-1,cur+1);setActive(ids[cur],true);});
document.addEventListener('click',function(e){if(!document.body.classList.contains('reader'))return;var a=e.target.closest?e.target.closest('a[href^="#ch-"]'):null;if(!a)return;e.preventDefault();var h=a.getAttribute('href');setActive(h.slice(1),true);history.replaceState(null,'',h);});
if(location.hash&&location.hash.indexOf('ch-')===1)reader(true);})();"""

# ── V2.7 起：本站只有唯一首页 site/index.html ──────────────────────────────
# 本脚本不再产出独立入口页，改为产出 build-site.py 消费的片段；
# 旧的 site/spec.html 由 scripts/redirect-legacy.py 改写为重定向页。
import os
FRAG=os.path.join('site','fragments','site-spec.html')
os.makedirs(os.path.dirname(FRAG),exist_ok=True)
# 顶栏保留 .gp 分组菜单（它是模块内的章节导航，由 build-site 剔除品牌块）
CHAPNAV = ('<div class="chapnav">'
           '<button id="prevCh" type="button">‹ 上一章</button>'
           '<button id="allCh" type="button">回到全部（列表）</button>'
           '<button id="nextCh" type="button">下一章 ›</button></div>')
# ⚠️ 这里**不能用 `%` 格式化**：`css` 里有 5 个 `%`（`55%` / `50%` / `100%` …），
#    一旦把 css 拼进格式化模板，`%` 会被当成格式说明符 →
#    `TypeError: not all arguments converted during string formatting`，脚本直接崩。
#    这正是 `gen-spec.py` 长期跑不起来的原因之一。全部改为字符串拼接。
frag = ('<!--@css-->\n' + css.strip() + '\n\n<!--@body-->\n'
        + '<div class="top">' + menu + '</div>\n<div class="wrap">'
        + CHAPNAV + '\n'.join(sections) + '</div>\n')
# 阅读模式脚本：build-site.py 会做作用域改写后重新包裹 <script>
frag+='\n<!--@js-->\n'+SCRIPT.strip()+'\n'
open(FRAG,'w',encoding='utf-8').write(frag)
print('site/fragments/site-spec.html written',len(frag))
