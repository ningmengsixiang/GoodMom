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

def render_md(txt):
    out=[]; code=False; buf=[]; para=[]; inlist=None; table=[]
    lines=txt.split('\n')
    i=0
    def flush_p():
        if para:
            out.append('<p>'+' '.join(inline(x) for x in para)+'</p>'); para.clear()
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
            out.append('<h%d>%s</h%d>'%(h,inline(m.group(2)),h)); i+=1; continue
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
            out.append('<ul>'+''.join('<li>'+inline(x)+'</li>' for x in items)+'</ul>')
            continue
        mnum=re.match(r'^\s*\d+[.、]\s*(.*)$',s)
        if mnum:
            flush_p()
            items=[]
            while i<len(lines):
                mn=re.match(r'^\s*\d+[.、]\s*(.*)$',lines[i])
                if not mn: break
                items.append(mn.group(1)); i+=1
            out.append('<ol>'+''.join('<li>'+inline(x)+'</li>' for x in items)+'</ol>')
            continue
        # code block indented? none significant
        para.append(s); i+=1
    flush_p()
    return '\n'.join(out)

# build html body
groups=[('概览',['README.md']),
 ('组件索引',['00-组件总目录.md']),
 ('设计指南',['01-设计总览与设计DNA.md','12-妈咪好品牌与设计语言.md','14-命名与术语规范.md','16-优化与一致性审计.md','17-页面布局与组件组合规范.md']),
 ('开发指南',['02-Token规范.md','03-组件规范.md','04-数据可视化规范.md','05-AI生成Prompt库.md','06-制作流程与验收清单.md','07-交互动效与微交互规范.md','08-组件覆盖清单与Semi对齐.md','09-图标库规范.md']),
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

sections=[]
for fn in FILES:
    t=open(fn,encoding='utf-8').read()
    title=os.path.basename(fn).replace('.md','')
    if title=='README': title='总览 · README'
    sections.append('<section class="chap" id="%s"><div class="chap-hd"><b>%s</b></div><div class="md">%s</div></section>'%(anchor(fn),html.escape(title),render_md(t)))

css='''
:root{--t:#343A46;--t2:#586273;--t3:#9AA2B0;--rose:#E85D8F;--rose-deep:#C94A77;--bg:linear-gradient(165deg,#FDF2EE,#F6E2DB 55%,#E7D3CB)}
*{box-sizing:border-box}body{margin:0;font-family:"PingFang SC","Inter","MiSans","Noto Sans SC",sans-serif;color:var(--t);background:var(--bg)}
a{color:var(--rose-deep)}
.top{position:sticky;top:0;z-index:90;display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:10px 16px;background:rgba(255,255,255,.78);border-bottom:1px solid #f0d4cf;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.top img{width:26px;height:26px;border-radius:50%;object-fit:cover}
.top b{color:var(--rose-deep);font-size:14px;margin-right:10px}
.gp{position:relative;display:inline-flex}
.gp>button{font-family:inherit;border:1px solid transparent;background:none;border-radius:999px;padding:7px 12px;cursor:pointer;font-size:13px;font-weight:500;color:var(--t2)}
.gp>button::after{content:"▾";font-size:9px;margin-left:4px;opacity:.6}
.gp:hover>button{background:#fff;color:var(--rose-deep)}
.drop{position:absolute;top:calc(100% + 10px);left:0;min-width:210px;z-index:100;padding:6px;border-radius:16px;background:#fff;border:1px solid rgba(232,93,143,.2);box-shadow:0 16px 40px rgba(90,70,70,.15);opacity:0;pointer-events:none;transform:translateY(6px);transition:.2s}
.gp:hover .drop{opacity:1;pointer-events:auto;transform:none}
.gp::after{content:"";position:absolute;left:0;right:0;top:100%;height:12px}
.drop a{display:block;padding:8px 12px;border-radius:10px;font-size:13px;color:var(--t2);text-decoration:none;white-space:nowrap}
.drop a:hover{background:rgba(247,127,163,.1);color:#C94A77}
.top .ext{margin-left:auto;font-size:12.5px;font-weight:600;text-decoration:none;padding:7px 14px;border-radius:999px;background:#fff;border:1px solid rgba(232,93,143,.3);color:var(--rose-deep)}
.top .ext2{margin-left:8px;background:linear-gradient(135deg,#FFA9C2,#E85D8F);color:#fff;font-weight:600;text-decoration:none;font-size:12.5px;padding:7px 14px;border-radius:999px}
.wrap{max-width:1080px;margin:0 auto;padding:20px 18px 80px}
.chap{scroll-margin-top:70px;margin:0 0 34px;border-radius:22px;padding:22px 26px;background:linear-gradient(160deg,rgba(255,255,255,.72),rgba(255,255,255,.4));border:1px solid #f0d4cf;box-shadow:0 10px 26px rgba(90,70,70,.08)}
.chap-hd{font-size:20px;font-weight:700;color:var(--rose-deep);padding-bottom:10px;border-bottom:1px solid #f0d4cf;margin-bottom:12px}
.md h1{font-size:24px;margin:18px 0 8px;color:var(--rose-deep)}
.md h2{font-size:19px;margin:20px 0 6px}
.md h3{font-size:16px;margin:16px 0 6px}
.md p{line-height:1.85;font-size:14px}
.md ul,.md ol{padding-left:22px;line-height:1.9;font-size:14px}
.md table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px}
.md th,.md td{border:1px solid #eed5cd;padding:7px 9px;text-align:left}
.md th{background:rgba(247,127,163,.1);color:#a03f60}
.md pre{background:#fff7f4;border:1px solid #f0d4cf;border-radius:12px;padding:12px 14px;overflow:auto;font-size:12px;line-height:1.7}
.md code{font-family:ui-monospace,Menlo,monospace;background:rgba(247,127,163,.08);padding:1px 5px;border-radius:6px;font-size:12px}
.md pre code{background:none;padding:0}
.md blockquote{border-left:4px solid var(--rose);margin:12px 0;padding:4px 14px;color:var(--t2);background:rgba(247,127,163,.06);border-radius:0 10px 10px 0}
.md hr{border:none;border-top:1px dashed #e6c6bd;margin:16px 0}
@media(max-width:760px){.chap{padding:16px}}
'''
htmlout='''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>妈咪好 GoodMom · 设计规范大全（HTML 主页）</title>
<link rel="icon" type="image/png" href="../logo.png">
<style>%s</style>
</head>
<body>
<div class="top"><img src="../logo.png" alt="妈咪好"><b>妈咪好 GoodMom · 规范大全</b>%s</div>
<div class="wrap">%s</div>
</body>
</html>'''%(css,menu,'\n'.join(sections))
open('site/spec.html','w',encoding='utf-8').write(htmlout)
print('spec.html written',len(htmlout))
