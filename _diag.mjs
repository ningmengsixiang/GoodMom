import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = process.cwd();
const srv = http.createServer((req,res)=>{const f=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();}else{res.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':'text/plain'});res.end(d);}});}).listen(5299);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:5299/fuyouaicansai/p01-women-health.html');
await p.waitForTimeout(600);
const out = await p.evaluate(() => {
  document.documentElement.setAttribute('data-theme','dark');
  const q = (s) => { const e = document.querySelector(s); if(!e) return null; const cs = getComputedStyle(e);
    return { color: cs.color, v: cs.getPropertyValue('--lg-text-primary'), bg: cs.backgroundColor, bgimg: cs.backgroundImage.slice(0,50) }; };
  return {
    html: q('html'), app: q('.gm-app'), side: q('.gm-side'), who: q('.gm-side__foot .who b'),
    av: q('.gm-pm-av'), navm: q('.gm-navm__n'),
    darkRuleExists: [...document.styleSheets].some(ss=>{try{return [...ss.cssRules].some(r=>r.cssText.includes('data-theme="dark"'))}catch{return false}}),
  };
});
console.log(JSON.stringify(out, null, 2));
await b.close(); srv.close();
