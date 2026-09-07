#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 docs/妈咪好UIUX设计系统标准手册.md（38 部分总纲）生成为 site/manual.html。
用法：python3 scripts/gen-manual.py"""
import io, os, re, html as H
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,"docs","妈咪好UIUX设计系统标准手册.md")
OUT=os.path.join(ROOT,"site","manual.html")

def inline(t):
    t=H.escape(t, quote=False)
    t=re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t=re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
    return t

def read_table(rows):
    def cells(r): return [inline(c.strip()) for c in r.strip().strip('|').split('|')]
    head=cells(rows[0]); body=[cells(r) for r in rows[2:]]
    h='<table><thead><tr>'+''.join('<th>%s</th>'%c for c in head)+'</tr></thead><tbody>'
    for r in body:
        h+='<tr>'+''.join('<td>%s</td>'%c for c in r)+'</tr>'
    return h+'</tbody></table>'

def block_to_html(lines):
    out=[]; i=0
    def flush_table(buf):
        if buf: out.append(read_table(buf))
    tbl=[]
    while i<len(lines):
        ln=lines[i].rstrip()
        if not ln.strip():
            flush_table(tbl); tbl=[]
            out.append('')
        elif ln.lstrip().startswith('|'):
            tbl.append(ln)
        else:
            flush_table(tbl); tbl=[]
            if ln.startswith('>'):
                q=[]
                while i<len(lines) and lines[i].rstrip().startswith('>'):
                    q.append(inline(lines[i].strip()[1:].strip())); i+=1
                out.append('<blockquote>'+('<br>'.join(q))+'</blockquote>'); i-=1
            elif re.match(r'\s*[-*] ', ln):
                items=[]; ind=[]
                while i<len(lines) and re.match(r'\s*[-*] ', lines[i].rstrip()):
                    items.append(inline(re.sub(r'^\s*[-*] ','',lines[i].rstrip()))); i+=1
                out.append('<ul>'+''.join('<li>%s</li>'%x for x in items)+'</ul>'); i-=1
            elif re.match(r'\s*\d+\. ', ln):
                items=[]
                while i<len(lines) and re.match(r'\s*\d+\. ', lines[i].rstrip()):
                    items.append(inline(re.sub(r'^\s*\d+\. ','',lines[i].rstrip()))); i+=1
                out.append('<ol>'+''.join('<li>%s</li>'%x for x in items)+'</ol>'); i-=1
            elif ln.strip()=='---':
                out.append('<hr>')
            elif ln.startswith('#'):
                lvl=len(ln)-len(ln.lstrip('#')); txt=inline(ln.lstrip('#').strip())
                tag='h%d'%min(3+lvl,5)
                out.append('<%s>%s</%s>'%(tag,txt,tag))
            else:
                out.append('<p>'+inline(ln)+'</p>')
        i+=1
    flush_table(tbl)
    return '\n'.join(x for x in out if x!='' or x is None)

lines=io.open(SRC,encoding='utf-8').read().split('\n')
# 拆章
sections=[]; cur=None; meta=[]
for ln in lines:
    m=re.match(r'^## Part (\d+) · (.+)$', ln.rstrip())
    if m:
        if cur: sections.append(cur)
        cur={'id':'part-%s'%m.group(1).zfill(2),'t':'Part %s · %s'%(m.group(1),m.group(2)),'lines':[]}
        continue
    if cur is None:
        if ln.strip(): meta.append(ln.rstrip())
    else:
        cur['lines'].append(ln)
if cur: sections.append(cur)

CSS='''
*{box-sizing:border-box}body{margin:0;font-family:"PingFang SC","Inter","MiSans","Noto Sans SC",sans-serif;color:#343A46;line-height:1.8;background:#E9D2C9;
 background:radial-gradient(1000px 600px at 90% -8%,rgba(247,127,163,.18),transparent 65%),radial-gradient(900px 560px at -6% 24%,rgba(182,154,255,.14),transparent 65%),linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#E6CFC6)}
.wrap{max-width:1240px;margin:0 auto;padding:16px 16px 90px;display:grid;grid-template-columns:250px 1fr;gap:20px;align-items:start}
.top{grid-column:1/-1;position:sticky;top:8px;z-index:50;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.top img{width:26px;height:26px;border-radius:50%;object-fit:cover}
.top b{color:#B23A63;font-size:14px}
.top .navr{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.top a{font-size:12.5px;font-weight:600;text-decoration:none;padding:7px 13px;border-radius:999px;background:linear-gradient(135deg,#B23A63,#9E3054);color:#fff}
aside{position:sticky;top:80px;max-height:calc(100vh - 100px);overflow:auto;padding:14px;border-radius:20px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.85)}
aside b{display:block;font-size:12px;color:#586273;margin-bottom:8px}
aside a{display:block;font-size:12px;color:#343A46;text-decoration:none;padding:4px 8px;border-radius:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
aside a:hover{background:rgba(232,93,143,.1);color:#B23A63}
main{min-width:0}
.chap{scroll-margin-top:76px;margin-bottom:18px;padding:18px 22px;border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.66),rgba(255,255,255,.3));border:1px solid rgba(255,255,255,.85);box-shadow:0 8px 20px rgba(90,70,70,.07)}
.chap>h2{margin:0 0 10px;font-size:19px;color:#B23A63}
.chap h3{font-size:15px;color:#343A46;margin:14px 0 6px}
.chap p,.chap li{font-size:13.5px;color:#343A46}
.chap blockquote{border-left:4px solid #E85D8F;margin:10px 0;padding:6px 12px;color:#586273;background:rgba(247,127,163,.06);border-radius:0 10px 10px 0;font-size:12.5px}
.chap table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px}
.chap th,.chap td{text-align:left;padding:7px 9px;border-bottom:1px solid rgba(58,52,84,.08);vertical-align:top}
.chap th{color:#4F5B6E;font-weight:600;background:rgba(255,255,255,.5)}
.chap code{background:rgba(232,93,143,.08);color:#B23A63;padding:1px 6px;border-radius:6px;font-size:12px}
.chap hr{border:none;border-top:1px dashed #e6c6bd;margin:14px 0}
@media(max-width:900px){.wrap{grid-template-columns:1fr}aside{position:static;max-height:none}}
'''
nav=''
for s in sections:
    nav+='<a href="#%s">%s</a>'%(s['id'],s['t'].replace('·','·'))
chaps=''
for s in sections:
    chaps+='<section class="chap" id="%s">%s</section>'%(s['id'],block_to_html(s['lines']))
head='''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>妈咪好 GoodMom · 设计系统标准手册（38 部分）</title>
<link rel="icon" type="image/png" href="../logo.png"><style>%s</style></head><body>'''%CSS
body='''<div class="wrap"><div class="top"><img src="../logo.png" alt="妈咪好"><b>设计系统标准手册 · 38 部分</b>
<div class="navr"><a href="index.html">返回官网首页</a><a href="docs.html">文档中心</a><a href="spec.html#ch-readme">全量规范</a></div></div>
<aside><b>标准目录（%d 章）</b>%s</aside><main>%s</main></div>'''%(len(sections),nav,chaps)
io.open(OUT,'w',encoding='utf-8').write(head+body+'</body></html>')
print('manual.html written', len(sections), 'chapters, size', os.path.getsize(OUT))
