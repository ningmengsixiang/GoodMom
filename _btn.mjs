import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=process.cwd();
const MIME={'.html':'text/html; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,s)=>{try{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
  s.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f));}catch{s.writeHead(404);s.end('404');}});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const port=srv.address().port;
const b=await chromium.launch();
const mods=['site-index','preview-index','preview-examples','preview-mobile','preview-patterns'];
const seen=new Map();
for(const mod of mods){
  const ctx=await b.newContext({viewport:{width:1440,height:1000}});
  const p=await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/site/index.html#gm-mod-${mod}`,{waitUntil:'load'});
  await p.waitForTimeout(800);
  const rows=await p.evaluate(()=>{
    const root=document.querySelector('.gm-mod.is-on');
    const out=[];
    for(const el of root.querySelectorAll('button,a.btn,a.b1,.mbb,.bx,.cta,.gbtn')){
      const rc=el.getBoundingClientRect(); if(rc.width===0||rc.height===0) continue;
      const cs=getComputedStyle(el);
      const txt=(el.innerText||'').replace(/\s+/g,' ').trim().slice(0,14);
      out.push({key:el.tagName.toLowerCase()+'.'+String(el.className).trim().replace(/\s+/g,'.'),
        h:Math.round(rc.height), txt,
        bg:cs.backgroundColor, bgi:cs.backgroundImage.slice(0,120),
        bw:cs.borderTopWidth+' '+cs.borderTopStyle+' '+cs.borderTopColor,
        sh:cs.boxShadow.slice(0,150), r:cs.borderTopLeftRadius, color:cs.color});
    }
    return out;
  });
  for(const r of rows){ const k=r.key; if(!seen.has(k)) seen.set(k,{...r,mods:new Set()}); seen.get(k).mods.add(mod); }
  await ctx.close();
}
await b.close(); srv.close();
console.log('════ 所有按钮变体的计算样式（去重）════\n');
for(const [k,v] of seen){
  const primary=/pri|primary|cta/i.test(k);
  const whiteish=/line|default|sec|outline|gho|ghost/i.test(k);
  const tag = primary?'【主/品牌色】':(whiteish?'【白/浅底】':'');
  console.log(`${tag} ${k}   h=${v.h}  ${[...v.mods].join(',')}`);
  console.log(`   文字 ${v.color}   圆角 ${v.r}`);
  console.log(`   底  bg=${v.bg}`);
  if(v.bgi!=='none') console.log(`       bgi=${v.bgi}`);
  console.log(`   描边 ${v.bw}`);
  console.log(`   阴影 ${v.sh}`);
  console.log();
}
