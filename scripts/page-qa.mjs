#!/usr/bin/env node
/**
 * 逐页规范质检（Page-level Spec QA）
 *
 * 与既有工具的分工：
 *   - `scripts/audit.py`     静态扫描（色值白名单、命名、链接、计数）——不看渲染结果
 *   - `scripts/a11y.py`      静态断言（outline:none 兜底、span+onClick）
 *   - `scripts/a11y-dom.py`  渲染级**只有**对比度一项
 *   - 本工具                 渲染级逐页质检：结构语义 / 对比度 / 焦点可见 / 触控热区 /
 *                            横向溢出 / Token 档位（圆角·边框·阴影·模糊·字号·字重·4px 网格）/
 *                            图标与 emoji / 术语 / 版本计数 / 控制台错误
 *
 * 深度优先于广度：只报**可机械判定**的项，每条都带规范锚点、选择器、实测值，
 * 便于逐条修复后用同一工具回归（同一输入两次运行必须得到同一结果）。
 *
 * 用法：
 *   node scripts/page-qa.mjs                 # 全量质检，写 docs/page-qa-report.md
 *   node scripts/page-qa.mjs --page site/index.html#gm-mod-site-docs
 *   node scripts/page-qa.mjs --json          # 只输出机器可读结果
 *   node scripts/page-qa.mjs --shots         # 额外落盘截图（.qa-shots/）
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'docs', 'page-qa-report.md');
const SHOT_DIR = path.join(ROOT, '.qa-shots');

// ══════════════════════════════════════════════════════════════════════════
// 规范档位（全部取自编号规范正文，改这里等于改口径，必须同步改锚点）
// ══════════════════════════════════════════════════════════════════════════

const SPEC = {
  radius: [0, 18, 20, 22, 26, 28, 40],          // 02 · 2.4 圆角档（999/50% 单独按胶囊/圆形处理）
  radiusInteractiveMin: 16,                      // 02 · 2.4「永不出现 <16px 的交互组件圆角」
  radiusScopeMin: 32,                            // 02 · 2.4 只管「组件与容器」；任一边 <32px 的微元素不在档位管辖内
  borderMax: 2,                                  // 02 · 2.7.1「禁 3px 以上常规描边」，2px 为最高档
  blur: [16, 20, 32, 40, 48, 60],                // 02 · 2.7.2 档位 + 02 · 2.5 的 L4 popover 40px
  type: [12, 14, 15, 16, 18, 24, 32, 40, 56],    // 02 · 2.2.2 / 2.2.3 字号层级
  weightMax: 700,                                // 02 · 2.2.4「字重上限 700」
  grid: 4,                                       // 02 · 2.3.1 4px 基准网格
  shadowNeutral: [58, 52, 84],                   // 02 · 2.6 阴影色相 rgba(58,52,84,α)，无纯黑
  touchMobile: 44,                               // 10 · 10.4 / 02 · 2.3.2 触屏热区
  touchDesktop: 40,                              // 02 · 2.3.2 桌面允许 ≥40
  ringColor: 'rgba(232, 93, 143, 0.6)',          // 02 · 2.7.1 焦点环
  breakpoints: [767, 1024, 1366],                // 17 / 审计 bp 收敛
};
// D9 二分口径：品牌亮粉底必须配深字；白字只允许出现在深实底上。
const GRAD_ACTION_SOLID = ['#FFC4D6', '#F77FA3'];

// 页面集合：与 a11y-dom.py 同口径（唯一首页逐模块 + 独立页 + 演示页）
function siteModules() {
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'build-site.py'), 'utf8');
  const m = src.match(/^MODULES\s*=\s*\[([\s\S]*?)^\]/m);
  if (m) {
    const found = [...m[1].matchAll(/\(\s*"([a-z-]+)"/g)].map((x) => x[1]);
    if (found.length) return found;
  }
  return ['site-index', 'preview-index', 'preview-examples', 'preview-mobile',
    'preview-patterns', 'site-spec', 'site-manual', 'site-docs'];
}

function collectPages() {
  const out = [];
  const list = [...fs.readdirSync(path.join(ROOT, 'site')), ...fs.readdirSync(path.join(ROOT, 'preview'))];
  for (const dir of ['site', 'preview']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir)).sort()) {
      if (!f.endsWith('.html') || f.startsWith('_')) continue;
      const rel = `${dir}/${f}`;
      const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      if (src.includes('页面已合并')) { out.push({ rel, hash: '', kind: 'redirect' }); continue; }
      if (rel === 'site/index.html') {
        for (const mod of siteModules()) out.push({ rel, hash: `gm-mod-${mod}`, kind: 'module' });
      } else out.push({ rel, hash: '', kind: 'page' });
    }
  }
  void list;
  const extra = 'fuyouaicansai/goodmom-redesign.html';
  if (fs.existsSync(path.join(ROOT, extra))) out.push({ rel: extra, hash: '', kind: 'page' });
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// 静态服务
// ══════════════════════════════════════════════════════════════════════════

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.json': 'application/json', '.ts': 'text/javascript', '.tsx': 'text/javascript' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const [rawPath, rawQuery] = req.url.split('?');
      const url = decodeURIComponent(rawPath);
      let file = path.join(ROOT, url);
      try {
        if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        let body = fs.readFileSync(file);
        // 重定向桩专用：把"跳走"的内联脚本摘掉后再喂给浏览器。
        // 这样桩自己的卡片能被真实渲染与测量，又不会跳成目标模块。
        // （比 page.route 拦跳转可靠：拦跳转会连文档一起拆掉，测出来是空白页。）
        if (rawQuery === 'stub=1') {
          body = Buffer.from(String(body).replace(/<script\b[^>]*>[\s\S]*?location\.replace[\s\S]*?<\/script>/g, ''), 'utf8');
        }
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404); res.end('404');
      }
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 探针：在页面里跑的检查（返回结构化 findings）
// ══════════════════════════════════════════════════════════════════════════

const PROBE = (spec) => {
  const out = { findings: [], meta: {} };
  const push = (rule, severity, anchor, sel, detail) => {
    out.findings.push({ rule, severity, anchor, sel: sel.slice(0, 200), detail: String(detail).slice(0, 300) });
  };

  // ── 颜色工具（保留 alpha，按 source-over 合成；渐变取色标上界）──────────
  const parseColor = (t) => {
    const m = String(t).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter((x) => x !== '').map(Number);
    if (p.length < 3 || p.some((x) => Number.isNaN(x))) return null;
    return [p[0], p[1], p[2], p.length >= 4 ? p[3] : 1];
  };
  const over = (fg, bg) => {
    const a = fg[3] + bg[3] * (1 - fg[3]);
    if (a <= 0) return [0, 0, 0, 0];
    return [(fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
      (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
      (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a, a];
  };
  const lum = (c) => {
    const f = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const parseHex = (h) => {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6 && h.length !== 8) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  };
  const anyColor = (t) => {
    const m = String(t).match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/);
    if (!m) return null;
    return m[0][0] === '#' ? parseHex(m[0]) : parseColor(m[0]);
  };
  const gradStops = (img) => {
    const o = []; const re = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g; let m;
    while ((m = re.exec(img))) { const c = anyColor(m[0]); if (c) o.push(c); }
    return o;
  };
  const composite = (layers, pick) => {
    let acc = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i]; let c;
      if (L.solid) c = L.solid;
      else {
        let best = L.stops[0];
        for (const cand of L.stops) {
          if (pick === 'light' ? lum(cand) > lum(best) : lum(cand) < lum(best)) best = cand;
        }
        c = best;
      }
      acc = acc ? over(c, acc) : [c[0], c[1], c[2], c[3]];
    }
    if (!acc) acc = [255, 255, 255, 1];
    if (acc[3] < 1) acc = over(acc, [255, 255, 255, 1]);
    return acc;
  };
  const bgOf = (el) => {
    const layers = []; let node = el; let broke = false;
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      const img = cs.backgroundImage;
      if (img && img !== 'none') {
        const st = gradStops(img);
        if (!st.length) return { opaque: true };
        layers.push({ stops: st });
      }
      const c = parseColor(cs.backgroundColor);
      if (c && c[3] > 0) { layers.push({ solid: c }); if (c[3] >= 1) { broke = true; break; } }
      node = node.parentElement;
    }
    if (!broke) layers.push({ solid: [255, 255, 255, 1] });
    const hasGrad = layers.some((L) => !!L.stops);
    if (!hasGrad) {
      const only = layers.filter((L) => L.solid).map((L) => L.solid);
      let acc = only.length ? only[only.length - 1] : [255, 255, 255, 1];
      if (acc[3] < 1) acc = over(acc, [255, 255, 255, 1]);
      for (let i = only.length - 2; i >= 0; i--) acc = over(only[i], acc);
      return { color: acc };
    }
    return { color: composite(layers, 'light'), dark: composite(layers, 'dark'), gradient: true };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const pathOf = (el) => {
    const p = []; let n = el;
    while (n && n.nodeType === 1 && p.length < 4) {
      const cls = (n.className && typeof n.className === 'string')
        ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      p.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : cls));
      n = n.parentElement;
    }
    return p.join('>');
  };
  const txtOf = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();

  // 测量根：合并页只测当前激活模块
  const root = document.querySelector('.gm-mod.is-on') || document.body || document.documentElement;
  const all = [...root.querySelectorAll('*')];
  const onScreen = (el) => {
    let n = el;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; if (n === root) break; n = n.parentElement; }
    return true;
  };
  out.meta.root = root.id || root.tagName.toLowerCase();
  out.meta.rootClass = root.className && typeof root.className === 'string' ? root.className : '';

  // ── 1. 对比度（WCAG 2.2 AA，02 · 2.1.1 / 标准手册 Part 23）────────────
  {
    let fail = 0, grad = 0, info = 0, exempt = 0;
    for (const el of all) {
      if (el.closest('script,style,noscript')) continue;
      const texts = [...el.childNodes].filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
      if (!texts.length) continue;
      const cs = getComputedStyle(el);
      const fg = parseColor(cs.color);
      if (!fg || fg[3] === 0) continue;
      // WCAG 1.4.3 明文豁免「失效/禁用的界面控件」；禁用态用低对比表达"不可用"是正确做法，
      // 不该被算成违规（否则会诱导把禁用态也刷成高对比，反而看不出禁用）。
      if (el.matches('[disabled],[aria-disabled="true"],.dis,.disabled') ||
          cs.cursor === 'not-allowed' || cs.pointerEvents === 'none') { exempt++; continue; }
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight || '400', 10) >= 700;
      const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
      const bg = bgOf(el);
      if (bg.opaque) { info++; continue; }
      if (bg.gradient) {
        const fgL = over(fg, bg.color), fgD = over(fg, bg.dark);
        const best = Math.max(ratio(fgL, bg.color), ratio(fgD, bg.dark));
        if (best < need) {
          fail++; grad++;
          push('contrast', 'P1', '02 · 2.1.1 / Part 23', pathOf(el),
            `「${texts[0].slice(0, 24)}」 ${best.toFixed(2)}:1 < ${need}（渐变上界 ${bg.color.slice(0, 3).map(Math.round)} / ${bg.dark.slice(0, 3).map(Math.round)}，前景 ${cs.color}）`);
        } else info++;
        continue;
      }
      const eff = fg[3] >= 1 ? fg : over(fg, bg.color);
      const r = ratio(eff, bg.color);
      if (r < need) {
        fail++;
        push('contrast', 'P1', '02 · 2.1.1 / Part 23', pathOf(el),
          `「${texts[0].slice(0, 24)}」 ${r.toFixed(2)}:1 < ${need}（前景 ${cs.color} on rgb(${bg.color.slice(0, 3).map(Math.round)})）`);
      }
    }
    out.meta.contrast = { fail, grad, info, exempt };
  }

  // ── 2. 结构语义（Part 12/18/23）────────────────────────────────────────
  {
    const ids = new Map();
    for (const el of all) {
      if (el.id) ids.set(el.id, (ids.get(el.id) || 0) + 1);
    }
    for (const [id, n] of ids) if (n > 1) push('duplicate-id', 'P1', 'Part 23', '#' + id, `页面内 id 重复 ${n} 次`);
    let last = 0;
    for (const h of root.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
      if (!onScreen(h)) continue;
      const lv = +h.tagName[1];
      if (last && lv > last + 1) push('heading-order', 'P2', 'Part 23', pathOf(h), `标题层级 ${last} → ${lv} 跳级（「${txtOf(h).slice(0, 20)}」）`);
      last = lv;
    }
    for (const img of root.querySelectorAll('img')) {
      if (!onScreen(img)) continue;
      if (!img.hasAttribute('alt')) push('img-alt', 'P1', 'Part 23', pathOf(img), `img 缺 alt（src=${(img.getAttribute('src') || '').slice(0, 40)}）`);
    }
    // 无可见文字且无 aria-label 的按钮/链接 = 无可访问名
    for (const el of root.querySelectorAll('button,a[href],[role="button"]')) {
      if (!onScreen(el) || !visible(el)) continue;
      const name = (el.getAttribute('aria-label') || el.getAttribute('title') || txtOf(el) ||
        (el.querySelector('img[alt]') ? el.querySelector('img[alt]').alt : '')).trim();
      if (!name) push('accessible-name', 'P1', 'Part 23', pathOf(el), '可交互元素无可访问名（无文字/aria-label/title）');
    }
    for (const el of root.querySelectorAll('input,select,textarea')) {
      if (!onScreen(el)) continue;
      if (['hidden', 'submit', 'button', 'image', 'reset'].includes(el.type)) continue;
      const id = el.id;
      const hasLabel = (id && root.querySelector(`label[for="${CSS.escape(id)}"]`)) || el.closest('label') ||
        el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
      if (!hasLabel) push('form-label', 'P1', 'Part 14', pathOf(el), '表单控件无标签（label/aria-label）');
    }
    out.meta.headings = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(onScreen).length;
  }

  // ── 3. 焦点可见（02 · 2.7.1 焦点环 / Part 23）──────────────────────────
  // 用 focus({focusVisible:true}) 拿到真实的 :focus-visible 计算样式
  {
    const sample = [...root.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter((el) => onScreen(el) && visible(el)).slice(0, 60);
    let noRing = 0;
    for (const el of sample) {
      const before = getComputedStyle(el);
      const snap = (cs) => [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow,
        cs.borderColor, cs.backgroundColor, cs.color].join('|');
      const b = snap(before);
      try { el.focus({ focusVisible: true }); } catch { el.focus(); }
      const after = snap(getComputedStyle(el));
      el.blur();
      if (b === after) {
        noRing++;
        if (noRing <= 8) push('focus-visible', 'P1', '02 · 2.7.1 / Part 23', pathOf(el), '获得焦点后 outline/box-shadow/border/background 全无变化 → 焦点不可见');
      }
    }
    out.meta.focusSample = sample.length;
    out.meta.focusNoRing = noRing;
  }

  // ── 4. Token 档位（圆角 / 边框 / 阴影 / 模糊 / 字号 / 字重 / 4px 网格）──
  {
    const seen = new Map();
    const note = (rule, severity, anchor, el, detail) => {
      const k = rule + '|' + detail;
      if (seen.has(k)) return;
      seen.set(k, 1);
      push(rule, severity, anchor, pathOf(el), detail);
    };
    // 聚合档：同一"偏离值"只记一条（带命中元素数），避免逐元素刷屏
    const hist = new Map();
    const gridHist = (rule, value, el) => {
      const key = rule + '|' + value;
      const e = hist.get(key) || { rule, value, n: 0, sample: pathOf(el) };
      e.n++;
      hist.set(key, e);
    };
    const radOk = (v) => spec.radius.includes(Math.round(v * 100) / 100) || v >= 999;
    for (const el of all) {
      if (!onScreen(el) || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const interactive = ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tag) ||
        el.getAttribute('role') === 'button' || el.hasAttribute('onclick');

      // 圆角
      const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius]
        .map((x) => parseFloat(x) || 0);
      const maxR = Math.max(...radii);
      // 装饰形状（光斑/辉光/进度条/色点）不属 2.4「组件与容器圆角」管辖范围，
      // 拿 token 档位去量它们只会产生噪声 —— 显式排除，避免把规则刷成不可用。
      const rect = el.getBoundingClientRect();
      // ⚠️ logo 一律排除，且**永不**纳入圆角整改范围。
      // 品牌 logo 的圆角是品牌资产的一部分（用户明确要求"强制沿用当前 logo"），
      // 不属于 02 · 2.4「组件与容器圆角档」的管辖对象；对 logo 做圆角回档 = 改用户品牌视觉。
      const isBrand = /logo|brand/i.test(typeof el.className === 'string' ? el.className : '') ||
        /logo|brand/i.test(el.getAttribute('class') || '') ||
        /logo|brand/i.test(el.getAttribute('src') || '');
      const decorative = isBrand ||
        /(amb|glow|blob|orb|spot)/i.test(typeof el.className === 'string' ? el.className : '') ||
        rect.height <= 12 || rect.width <= 12 || cs.borderRadius.includes('%') ||
        cs.display.startsWith('inline');   // 行内盒子（code/kbd 芯片）是文字级装饰，非 2.4 管辖的组件与容器
      if (interactive && maxR > 0 && maxR < spec.radiusInteractiveMin) {
        note('radius', 'P2', '02 · 2.4', el, `交互组件圆角 ${maxR}px < 下限 ${spec.radiusInteractiveMin}px`);
      } else if (!decorative && maxR > 0 && !radOk(maxR) &&
                 Math.min(rect.width, rect.height) >= spec.radiusScopeMin &&
                 (radii.some((r) => r !== radii[0]) === false)) {
        note('radius', 'P2', '02 · 2.4', el, `圆角 ${maxR}px 不在档位 ${spec.radius.join('/')}px`);
      }

      // 边框宽度
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const w = parseFloat(cs['border' + side + 'Width']) || 0;
        const st = cs['border' + side + 'Style'];
        if (w > spec.borderMax && st !== 'none') {
          note('border-width', 'P2', '02 · 2.7.1', el, `边框宽度 ${w}px > 上限 ${spec.borderMax}px（${side}）`);
        }
      }

      // 阴影：无纯黑
      if (cs.boxShadow && cs.boxShadow !== 'none' && /rgba?\(0,\s*0,\s*0/.test(cs.boxShadow)) {
        note('shadow-black', 'P2', '02 · 2.6', el, `阴影使用纯黑：${cs.boxShadow.slice(0, 60)}`);
      }

      // 玻璃模糊档
      const bf = cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter : cs.webkitBackdropFilter;
      if (bf && bf !== 'none') {
        const m = bf.match(/blur\(([\d.]+)px\)/);
        if (m) {
          const b = parseFloat(m[1]);
          if (!spec.blur.includes(Math.round(b))) note('blur', 'P2', '02 · 2.7.2', el, `backdrop blur ${b}px 不在档位 ${spec.blur.join('/')}px`);
        }
      }

      // 字号 / 字重（只查有直接文字的元素）
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText) {
        const fs2 = Math.round(parseFloat(cs.fontSize) * 100) / 100;
        // P3 档：不在层级里的字号量大且多为"半档微调"，只做**聚合计数**，
        // 逐条罗列会把真正的 P1 淹没（口径见 --agg 说明）。
        if (!spec.type.includes(fs2)) gridHist('type-scale', fs2, el);
        const fw = parseInt(cs.fontWeight, 10);
        if (fw > spec.weightMax) note('font-weight', 'P2', '02 · 2.2.4', el, `字重 ${fw} > 上限 ${spec.weightMax}`);
      }

      // 4px 网格（只查盒模型外距/内距/间隙）—— 同样走聚合档
      const vals = [
        ['paddingTop', cs.paddingTop], ['paddingRight', cs.paddingRight],
        ['paddingBottom', cs.paddingBottom], ['paddingLeft', cs.paddingLeft],
        ['marginTop', cs.marginTop], ['marginBottom', cs.marginBottom],
        ['rowGap', cs.rowGap], ['columnGap', cs.columnGap],
      ];
      for (const [k, v] of vals) {
        const n = parseFloat(v);
        if (!n || Number.isNaN(n)) continue;
        if (Math.abs(n % spec.grid) > 0.01 && Math.abs(n % spec.grid - spec.grid) > 0.01) {
          gridHist('spacing-grid', n, el);
        }
      }
    }
    out.hist = [...hist.values()].sort((a, b) => b.n - a.n).slice(0, 60);
  }

  // ── 5. 图标与 emoji（09 / Part 08 / 12.5）───────────────────────────────
  {
    // 只查**图标**：图表/迷你走势/环形图是 04 章数据可视化，各有自己的坐标系，
    // 拿 24×24 网格去量它们属于误报。图标判定 = 引用了 lg-icon sprite、带 icon/ico 类名、
    // 或 role="img" 且尺寸 ≤32px（按钮内图标）。
    for (const svg of root.querySelectorAll('svg')) {
      if (!onScreen(svg)) continue;
      const cls = typeof svg.className === 'string' ? svg.className : (svg.getAttribute('class') || '');
      const isIcon = !!svg.querySelector('use[href*="lg-icon"], use[*|href*="lg-icon"]') ||
        /(^|[\s-])(ico|icon|ic-)/i.test(cls) ||
        (svg.getAttribute('role') === 'img' && svg.getBoundingClientRect().width <= 32);
      if (!isIcon) continue;
      const vb = svg.getAttribute('viewBox') || '';
      if (vb && vb !== '0 0 24 24') {
        push('icon-grid', 'P2', '09 · 9.2', pathOf(svg), `图标 viewBox="${vb}" ≠ "0 0 24 24"`);
      }
    }
    // 真 emoji（象形）才算违规；`→ ✘ ✓ ≥ ±` 这类排版符号是中文界面的正常标点，
    // 09/Part 08 禁的是"用 emoji 冒充系统图标"，不是禁箭头。
    const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}]/gu;
    const TYPO = new Set(['\u2192', '\u2190', '\u2191', '\u2193', '\u2713', '\u2714', '\u2717', '\u2718',
      '\u2265', '\u2264', '\u00b1', '\u00d7', '\u25cf', '\u25cb', '\u25b6', '\u25c0', '\u2022', '\u00b7']);
    let emojiN = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      const p = t.parentElement;
      if (!p || p.closest('script,style,noscript,pre,code')) continue;
      if (p.closest('.md,.chap,.doc,pre,code,blockquote')) continue;   // 规范正文＝文档内容，非界面
      const hits = (t.textContent.match(EMOJI) || []).filter((c) => !TYPO.has(c));
      if (hits.length) {
        emojiN += hits.length;
        if (emojiN <= 8) push('emoji', 'P2', '09 / Part 08 IC-08-05', pathOf(p), `界面出现 emoji「${hits.join('')}」（第 ${emojiN} 处）`);
      }
    }
    out.meta.emoji = emojiN;
  }

  // ── 6. 横向溢出 / 布局（17 · 页面壳）────────────────────────────────────
  {
    const de = document.documentElement;
    const ov = de.scrollWidth - window.innerWidth;
    out.meta.overflow = ov;
    if (ov > 1) {
      let culprit = '';
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1 && visible(el) && onScreen(el)) { culprit = pathOf(el) + ` right=${Math.round(r.right)}`; break; }
      }
      push('overflow-x', 'P1', '17 · 页面壳', culprit || 'documentElement', `横向溢出 ${ov}px（视口 ${window.innerWidth}px）`);
    }
  }


  // ── 6b. 数据呈现层：玻璃表格 / 描述列表 / 折叠（03 · 3.7 / 08 · 8.2.11 / 11 · 11.2.6）──
  // 为什么必须放在**渲染级**：这一族的缺陷全是"算出来才知道"的 ——
  //   · 行高：由内联元素（头像 / 徽章 / 按钮）撑出来的，静态看 CSS 算不出 55 还是 51；
  //   · 特异性：模块内规则经构建会加 `.gm-mod--x ` 前缀（0,2,0），与外壳的
  //     `.gm-tbl .badge`（0,2,0）**同权**而模块更靠后 → 外壳那条静默失效；
  //   · 折叠收起：`0fr` 轨道的基尺寸取子项 min-content，padding 不可压缩 →
  //     代理层若自带内边距，收起后残留十几像素（实测 14px）。
  // 这三类都不可能靠读 CSS 发现，只能量。
  {
    const px = (v) => parseFloat(v) || 0;
    // 玻璃表格
    for (const tb of root.querySelectorAll('table.gm-tbl')) {
      if (!visible(tb)) continue;
      const th = tb.querySelector('th');
      const cs0 = th ? getComputedStyle(th) : null;
      if (cs0) {
        if (px(cs0.fontSize) !== 14) push('tbl-head-type', 'P2', '03 · 3.7 / 02 · 2.2.2', pathOf(th), `表头字号 ${cs0.fontSize} ≠ body-sm 14px`);
        if (parseInt(cs0.fontWeight, 10) < 600) push('tbl-head-type', 'P2', '03 · 3.7', pathOf(th), `表头字重 ${cs0.fontWeight} < 600`);
        const noScope = [...tb.querySelectorAll('th')].filter((x) => !x.getAttribute('scope'));
        if (noScope.length) push('tbl-th-scope', 'P2', 'Part 15 · TB-15-02', pathOf(noScope[0]), `${noScope.length} 个表头缺 scope（表头语义靠它绑定列）`);
      }
      const td = tb.querySelector('tbody td');
      if (td && px(getComputedStyle(td).fontSize) !== 14) {
        push('tbl-body-type', 'P2', '02 · 2.2.2', pathOf(td), `表格正文 ${getComputedStyle(td).fontSize} ≠ body-sm 14px（「表格正文」在类型阶上就是这一档）`);
      }
      // 行高 44–52（03 · 3.7）；由内联元素撑破是最常见的超档原因，故把元凶一并报出来
      for (const tr of tb.querySelectorAll('tbody tr')) {
        const h = Math.round(tr.getBoundingClientRect().height);
        if (!h) continue;
        if (h < 44 || h > 52) {
          let tall = '', max = 0;
          for (const c of tr.querySelectorAll('td *')) {
            const ch = c.getBoundingClientRect().height;
            if (ch > max) { max = ch; tall = pathOf(c) + ` ${Math.round(ch)}px`; }
          }
          push('tbl-row-height', 'P2', '03 · 3.7', pathOf(tr),
            `行高 ${h}px 不在 44–52；最高内联元素 ${tall}（单元格折行与内联元素超高都会顶破这一档）`);
        }
      }
      // 操作列右对齐（TB-15-01）
      const opsTh = tb.querySelector('th.col-ops');
      if (opsTh) {
        for (const td2 of tb.querySelectorAll('tbody td.col-ops')) {
          if (getComputedStyle(td2).textAlign !== 'right') {
            push('tbl-ops-align', 'P2', 'Part 15 · TB-15-01', pathOf(td2), `操作列 text-align=${getComputedStyle(td2).textAlign} ≠ right`);
            break;
          }
        }
      }
      // 数字对齐（17 · 17.2.2）
      if (getComputedStyle(tb).fontVariantNumeric.indexOf('tabular-nums') < 0) {
        push('tbl-tabular', 'P2', '17 · 17.2.2 / 03 · 3.7', pathOf(tb), '表格未启用 tabular-nums（数字列无法对齐）');
      }
      // 禁止给 table 自己设 display:block 做横滑：会把表格语义从无障碍树里抹掉
      if (getComputedStyle(tb).display !== 'table') {
        push('tbl-display', 'P1', 'Part 15 · TB-15-02', pathOf(tb), `table 的 display=${getComputedStyle(tb).display} ≠ table（会丢失表格语义，横滑应用外层容器）`);
      }
    }
    // 描述列表
    for (const d of root.querySelectorAll('.gm-desc')) {
      if (!visible(d)) continue;
      const dd = d.querySelector('dd,.v');
      if (!dd) continue;
      const cs1 = getComputedStyle(dd);
      if (px(cs1.fontSize) !== 14 || px(cs1.lineHeight) !== 20) {
        push('desc-value-type', 'P2', '08 · 8.2.11 / 02 · 2.2.2', pathOf(dd), `value ${cs1.fontSize}/${cs1.lineHeight} ≠ body-sm 14/20`);
      }
      // 8.2.13：描述列表 ≤1 行 → 单行省略；长文本详情必须给全文（title）
      if (cs1.whiteSpace !== 'nowrap' || cs1.textOverflow !== 'ellipsis') {
        push('desc-ellipsis', 'P2', '08 · 8.2.13', pathOf(dd), `value 未做单行省略（white-space=${cs1.whiteSpace} / text-overflow=${cs1.textOverflow}）`);
      }
      const k = d.querySelector('dt,.k');
      if (k && px(getComputedStyle(k).fontSize) !== 12) {
        push('desc-key-type', 'P3', '08 · 8.2.11 / 02 · 2.2.2', pathOf(k), `key ${getComputedStyle(k).fontSize} ≠ caption 12px`);
      }
    }
    // 折叠面板
    for (const f of root.querySelectorAll('details.gm-fold')) {
      if (!visible(f)) continue;
      const sum = f.querySelector('summary');
      const body = f.querySelector('.gm-fold__body');
      if (!sum || !body) { push('fold-structure', 'P2', '11 · 11.2.6', pathOf(f), '缺 summary 或 .gm-fold__body（高度过渡无处施加）'); continue; }
      const sb = sum.getBoundingClientRect();
      if (sb.height < 44) push('fold-hit', 'P2', '11 · 11.2.6', pathOf(sum), `标题行 ${Math.round(sb.height)}px < 44 触控热区`);
      const bcs = getComputedStyle(body);
      // ⚠️ 看 `transition-property` 而不是 `transition-duration`：本工具为了测量稳定，
      // 加载后会注入 `*{transition-duration:0s!important}`（见 STABILIZE），
      // 于是任何元素的 duration 都读成 0s —— 拿它判定"有没有写过渡"必然误报（实测踩过）。
      // property 不受影响，仍能证明"过渡确实声明在 grid-template-rows 上"。
      const noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!noMotion && (bcs.gridTemplateRows === 'none' || !/grid-template-rows/.test(bcs.transitionProperty))) {
        push('fold-transition', 'P2', '11 · 11.2.6', pathOf(body), `高度过渡缺失（grid-template-rows=${bcs.gridTemplateRows} / transition=${bcs.transitionDuration}）`);
      }
      if (!f.open) {
        const h = Math.round(body.getBoundingClientRect().height);
        if (h > 0) push('fold-collapse', 'P2', '11 · 11.2.6', pathOf(body), `收起后仍占位 ${h}px（代理层自带 padding 会让 0fr 轨道撑住）`);
        if (sum.getAttribute('aria-expanded') !== 'false') {
          push('fold-aria', 'P2', 'Part 23 / 11 · 11.2.6', pathOf(sum), `收起态 aria-expanded=${sum.getAttribute('aria-expanded')} ≠ false`);
        }
      } else if (sum.getAttribute('aria-expanded') !== 'true') {
        push('fold-aria', 'P2', 'Part 23 / 11 · 11.2.6', pathOf(sum), `展开态 aria-expanded=${sum.getAttribute('aria-expanded')} ≠ true`);
      }
    }
  }


  // ── 6c. 生长曲线 · 百分位带（13 · 13.2 母题 / 04 · 4.2–4.3.2）──────────────
  // 这一族是**手画 SVG**：没有选择器、没有令牌，任何一处数值都只能量。实测三处旧实现
  // 把参考带画成 alpha .5（规范 .10–.14，四倍浓）、主曲线 2.4–2.6px、警戒线用薄荷色 1.3px。
  // 注意：本工具为测量稳定会注入 `*{animation-duration:0s!important}`，
  // 所以"入场 0.6s"只能看 animation-name，不能看 duration（同一坑在折叠检查里也踩过）。
  {
    const alphaOf = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x)); return p.length >= 4 ? p[3] : 1; };
    for (const g of root.querySelectorAll('.gm-growth')) {
      const svg = g.querySelector('.gm-growth__svg');
      if (!svg || !visible(svg)) continue;
      const label = pathOf(g);
      const band = g.querySelector('.gm-growth__band');
      if (!band) push('growth-band', 'P2', '13 · 13.2', label, '缺少 P3–P97 参考带');
      else {
        const a = alphaOf(getComputedStyle(band).fill);
        if (a === null || a < 0.10 - 1e-6 || a > 0.14 + 1e-6) {
          push('growth-band', 'P2', '13 · 13.2', label,
            `参考带 alpha=${a} 不在 .10–.14（参考带是背景，画浓就盖过主曲线，违背 04 · 4.1「数据最亮」）`);
        }
      }
      if (!g.querySelector('.gm-growth__band-top')) {
        push('growth-band', 'P2', '13 · 13.2', label, '参考带缺「细白描边上界」');
      }
      const line = g.querySelector('.gm-growth__line');
      if (!line) push('growth-line', 'P2', '13 · 13.2', label, '缺少实测主曲线');
      else {
        const cs2 = getComputedStyle(line);
        if (cs2.stroke !== 'rgb(247, 127, 163)') {
          push('growth-line', 'P2', '13 · 13.2', label, `主曲线 ${cs2.stroke} ≠ Rose-500 #F77FA3`);
        }
        if (parseFloat(cs2.strokeWidth) !== 2.5) {
          push('growth-line', 'P2', '13 · 13.2', label, `主曲线 ${cs2.strokeWidth} ≠ 2.5px`);
        }
      }
      const warn = g.querySelector('.gm-growth__warn');
      if (!warn) push('growth-warn', 'P3', '13 · 13.2', label, '缺少 P3/P97 警戒线');
      else {
        const w = getComputedStyle(warn);
        if (parseFloat(w.strokeWidth) !== 1.5) push('growth-warn', 'P2', '13 · 13.2', label, `警戒线 ${w.strokeWidth} ≠ 1.5px`);
        if (!w.strokeDasharray || w.strokeDasharray === 'none') push('growth-warn', 'P2', '13 · 13.2', label, '警戒线不是虚线');
      }
      const dot = g.querySelector('.gm-growth__dot');
      if (!dot) push('growth-dot', 'P2', '13 · 13.2', label, '缺少端点白芯圆点');
      else {
        const dcs = getComputedStyle(dot);
        if (dcs.fill !== 'rgb(255, 255, 255)') push('growth-dot', 'P2', '13 · 13.2', label, `端点不是白芯（fill=${dcs.fill}）`);
        if (dcs.stroke !== 'rgb(247, 127, 163)') push('growth-dot', 'P2', '13 · 13.2', label, `端点不是粉描边（stroke=${dcs.stroke}）`);
      }
      const tick = g.querySelector('.gm-growth__tick');
      if (tick) {
        const tcs = getComputedStyle(tick);
        if (parseFloat(tcs.fontSize) !== 12) push('growth-tick', 'P3', '04 · 4.2', label, `轴刻度 ${tcs.fontSize} ≠ 12px`);
        if (tcs.fontVariantNumeric.indexOf('tabular-nums') < 0) push('growth-tick', 'P3', '04 · 4.2', label, '轴刻度未启用 tabular-nums');
      }
      const plot = g.querySelector('.gm-growth__plot');
      if (plot && getComputedStyle(plot).animationName === 'none') {
        push('growth-enter', 'P3', '04 · 4.2', label, '缺入场动效（04 · 4.2「入场 0.6s ease-out」）');
      }
      // 无障碍：图形对 AT 不可见 → 必须有 role + 可访问名 + 隐藏数据表（整幅图只有 mini 变体可省数据表）
      if (svg.getAttribute('role') !== 'img') push('growth-aria', 'P2', 'Part 23', label, 'SVG 缺 role="img"');
      const al = svg.getAttribute('aria-label') || '';
      if (al.length < 8) push('growth-aria', 'P2', 'Part 23', label, 'SVG 缺 aria-label（读屏读不到路径，必须给概述）');
      if (!g.classList.contains('gm-growth--mini') && !g.querySelector('table.gm-sr-only')) {
        push('growth-aria', 'P2', 'Part 23', label, '缺视觉隐藏数据表（读屏逐点读取的唯一途径）');
      }
      if (g.querySelector('.gm-growth__toggle') && g.querySelector('.gm-growth__toggle').getAttribute('aria-pressed') === null) {
        push('growth-aria', 'P2', '13 · 13.2', label, 'P3/P97 开关未报 aria-pressed');
      }
    }
  }

  // ── 7. 版本与计数（16 · 16.2 / 14.1.1）──────────────────────────────────
  {
    // 版本号只查**界面载体**（顶栏/页脚/徽章）。规范正文里的版本沿革（V1.0→V2.8）
    // 与「如 V2.4→V2.5 缺口补齐轮」这类举例，都是内容而非载体。
    const chrome = [...root.querySelectorAll('header,footer,nav,.top,.topm,.hero,.badge,.tag,.banner,.foot,.sec-head')]
      .map((el) => el.innerText || '').join(' ');
    const body = chrome || (root.innerText || '');
    const vers = [...body.matchAll(/(?:^|[^\d.])V(\d+)\.(\d+)(?:\.(\d+))?(?![\d.→-])/g)].map((m) => 'V' + m[1] + '.' + m[2]);
    const uniq = [...new Set(vers)];
    out.meta.versions = uniq;
    if (uniq.length > 1) push('version-consistency', 'P2', '16 · 16.2', root.id || 'body', `同页出现多个版本号：${uniq.join(' / ')}`);
  }

  return out;
};

// 触控热区（移动视口单独跑，桌面鼠标场景不适用）
const TOUCH_PROBE = (spec) => {
  const out = { findings: [], meta: {} };
  const root = document.querySelector('.gm-mod.is-on') || document.body;
  const onScreen = (el) => {
    let n = el;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; if (n === root) break; n = n.parentElement; }
    return true;
  };
  const pathOf = (el) => {
    const p = []; let n = el;
    while (n && n.nodeType === 1 && p.length < 4) {
      const cls = (n.className && typeof n.className === 'string') ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      p.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : cls)); n = n.parentElement;
    }
    return p.join('>');
  };
  const inline = [], block = [];
  // 10 · 10.4 明确允许「用 `::after` 扩展热区，不改视觉行高」。伪元素没有
  // getBoundingClientRect，只量元素盒会把这种**合规实现**误判成违规，故单独识别：
  // 伪元素若自身高度已达 44 且覆盖左右，或上下各外扩 ≥8px，即视为热区已补足。
  const pseudoHot = (el) => {
    for (const pe of ['::after', '::before']) {
      const cs = getComputedStyle(el, pe);
      if (!cs || cs.content === 'none' || cs.display === 'none') continue;
      const h = parseFloat(cs.height);
      const t = parseFloat(cs.top), b = parseFloat(cs.bottom);
      const vertExpand = !Number.isNaN(t) && !Number.isNaN(b) && t <= -8 && b <= -8;
      if (h >= spec.touchMobile || vertExpand) return true;
    }
    return false;
  };
  for (const el of root.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[onclick],summary')) {
    if (!onScreen(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const isInlineLink = el.tagName === 'A' && cs.display.startsWith('inline') && el.closest('p,li,td,dd') && (el.closest('p,li,td,dd').innerText || '').length > 40;
    const rec = { sel: pathOf(el), w: Math.round(r.width), h: Math.round(r.height),
      txt: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 20) };
    if (isInlineLink) {
      // 11 · 11.2.18 明确允许 ::after 扩展热区；不识别它会把自己刚修好的实现又报成违规
      if (rec.h < 24 && !pseudoHot(el)) inline.push(rec);
      continue;
    }
    if (rec.w < spec.touchMobile || rec.h < spec.touchMobile) {
      if (pseudoHot(el)) continue;
      block.push(rec);
    }
  }
  out.meta.touchChecked = block.length;
  for (const r of block.slice(0, 30)) {
    out.findings.push({ rule: 'touch-target', severity: 'P1', anchor: '10 · 10.4 / 02 · 2.3.2', sel: r.sel,
      detail: `热区 ${r.w}×${r.h} < ${spec.touchMobile}×${spec.touchMobile}（「${r.txt}」）` });
  }
  out.meta.touchInlineViolations = inline.length;
  if (inline.length) {
    out.findings.push({ rule: 'touch-target-inline', severity: 'P2', anchor: '11 · 11.2.18', sel: inline[0].sel,
      detail: `行内链接热区高 ${inline[0].h}px < 24px（共 ${inline.length} 处行内链接，需 ::after 扩展热区）` });
  }
  return out;
};

// ══════════════════════════════════════════════════════════════════════════
// 驱动
// ══════════════════════════════════════════════════════════════════════════

const STABILIZE = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;
  animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important;
  scroll-behavior:auto!important}`;

async function auditPage(browser, base, page, opts) {
  // 重定向桩：它一加载就 `location.replace("index.html#…")`，开着 JS 测出来的是**目标模块**
  // （与模块本身重复计数），桩自身的样式永远测不到。故用 `?stub=1` 让服务端摘掉跳转脚本
  // 后再测 —— 桩留在原地，自己的卡片被真实渲染。
  const isRedirect = page.kind === 'redirect';
  const url = `${base}/${page.rel}${isRedirect ? '?stub=1' : ''}${page.hash ? '#' + page.hash : ''}`;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  p.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e.message).slice(0, 200)));
  const res = { page: page.rel + (page.hash ? ' · ' + page.hash.replace('gm-mod-', '') : ''), kind: page.kind, findings: [], meta: {}, console: consoleErrors };
  try {
    await p.goto(url, { waitUntil: 'load', timeout: 30000 });
    await p.addStyleTag({ content: STABILIZE });
    await p.waitForTimeout(700);
    const r1 = await p.evaluate(PROBE, SPEC);
    res.findings.push(...r1.findings);
    res.meta = { ...res.meta, ...r1.meta };
    res.hist = r1.hist || [];

    // 暗色档（02 · 2.1.9）：**按页面自己的开关语义**加载，别自造一套。
    // 站点把 data-theme 挂在模块根（见 build-site.py rewrite_page_dark_css），
    // 所以这里也挂模块根；只挂 <html> 会测出一个"永远不会发生"的状态。
    const hasDark = await p.evaluate(() => {
      for (const ss of document.styleSheets) {
        try { for (const r of ss.cssRules) if (r.cssText && r.cssText.includes('data-theme="dark"')) return true; } catch { /* cross-origin */ }
      }
      return false;
    });
    if (hasDark) {
      // 先取风格指纹，用来判断"这个模块到底实现了暗色没有"。
      // 合并页里只要有**任一**模块写了 data-theme 规则，全局 stylesheet 里就搜得到，
      // 于是没有暗色的模块也会被判为"支持暗色"，然后原样重复一遍浅色失败 —— 数字会骗人。
      const sig = () => p.evaluate(() => {
        const root = document.querySelector('.gm-mod.is-on') || document.body;
        const els = [root, ...root.querySelectorAll('*')].slice(0, 400);
        return els.map((el) => {
          const cs = getComputedStyle(el);
          return cs.color + '|' + cs.backgroundColor + '|' + cs.backgroundImage.slice(0, 40);
        }).join(';');
      });
      const before = await sig();
      await p.evaluate(() => {
        const root = document.querySelector('.gm-mod.is-on') || document.body;
        root.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await p.waitForTimeout(400);
      const after = await sig();
      res.meta.darkSupported = before !== after;
      if (res.meta.darkSupported) {
        const rd = await p.evaluate(PROBE, SPEC);
        const darkContrast = rd.findings.filter((f) => f.rule === 'contrast');
        res.meta.darkContrastFail = darkContrast.length;
        for (const f of darkContrast.slice(0, 12)) res.findings.push({ ...f, rule: 'contrast-dark', detail: '[暗色] ' + f.detail });
      } else {
        res.findings.push({ rule: 'dark-missing', severity: 'P3', anchor: '02 · 2.1.9', sel: '.gm-mod.is-on',
          detail: '该模块未实现暗色档：挂上 data-theme="dark" 后 400 个采样元素的颜色/底纹全无变化' });
      }
      await p.evaluate(() => {
        document.documentElement.removeAttribute('data-theme');
        document.querySelectorAll('[data-theme="dark"]').forEach((el) => el.removeAttribute('data-theme'));
      });
      await p.waitForTimeout(300);
    }

    // 移动视口：触控热区 + 横向溢出
    await p.setViewportSize({ width: 375, height: 812 });
    await p.waitForTimeout(500);
    const rt = await p.evaluate(TOUCH_PROBE, SPEC);
    res.findings.push(...rt.findings);
    res.meta.touch = rt.meta;
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    res.meta.overflowMobile = ov;
    if (ov > 1) {
      const culprit = await p.evaluate(() => {
        const root = document.querySelector('.gm-mod.is-on') || document.body;
        for (const el of root.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.right > window.innerWidth + 1 && r.width > 0 && cs.display !== 'none') {
            return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.')) + ' right=' + Math.round(r.right);
          }
        }
        return '';
      });
      res.findings.push({ rule: 'overflow-x-mobile', severity: 'P1', anchor: '10 · 10.1 / 17', sel: culprit || 'documentElement',
        detail: `375px 视口横向溢出 ${ov}px` });
    }
    await p.setViewportSize({ width: 1440, height: 1000 });

    if (opts.shots) {
      await fsp.mkdir(SHOT_DIR, { recursive: true });
      const name = (page.rel + (page.hash ? '_' + page.hash : '')).replace(/[\/#]/g, '_') + '.png';
      await p.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
    }
  } catch (e) {
    res.error = String(e.message || e).slice(0, 300);
  }
  await ctx.close();
  return res;
}

// ══════════════════════════════════════════════════════════════════════════
// 报告
// ══════════════════════════════════════════════════════════════════════════

const sevRank = { P0: 0, P1: 1, P2: 2 };
const RULE_NAME = {
  contrast: '对比度不足（浅色档）', 'contrast-dark': '对比度不足（暗色档）',
  'duplicate-id': '重复 id', 'heading-order': '标题跳级', 'img-alt': '图片缺 alt',
  'accessible-name': '可交互元素无可访问名', 'form-label': '表单控件缺标签',
  'focus-visible': '焦点不可见', radius: '圆角不在档位', 'border-width': '边框超档',
  'shadow-black': '阴影用纯黑', blur: '玻璃模糊不在档位', 'type-scale': '字号不在层级',
  'font-weight': '字重超上限', 'spacing-grid': '偏离 4px 网格', 'icon-grid': '图标网格不符',
  emoji: '界面出现 emoji', 'overflow-x': '桌面横向溢出', 'overflow-x-mobile': '移动横向溢出',
  'touch-target': '移动端热区不足', 'touch-target-inline': '行内链接热区不足',
  'version-consistency': '同页版本号不一致', 'dark-missing': '模块未实现暗色档',
};

function summarize(results) {
  const byRule = new Map();
  for (const r of results) {
    for (const f of r.findings) {
      const e = byRule.get(f.rule) || { rule: f.rule, name: RULE_NAME[f.rule] || f.rule, severity: f.severity, anchor: f.anchor, n: 0, pages: new Set(), samples: [] };
      e.n++;
      e.pages.add(r.page);
      if (e.samples.length < 4) e.samples.push(`\`${r.page}\` ${f.sel} — ${f.detail}`);
      byRule.set(f.rule, e);
    }
  }
  return [...byRule.values()].sort((a, b) => (sevRank[a.severity] - sevRank[b.severity]) || b.n - a.n);
}

/** 重定向桩与真实页面分开统计（桩只有一张跳转卡，混在一起会把分布读歪）。 */
function split(results) {
  const real = results.filter((r) => r.kind !== 'redirect');
  const stubs = results.filter((r) => r.kind === 'redirect');
  return { real, stubs };
}

function render(results, generatedAt) {
  const { real, stubs } = split(results);
  const agg = summarize(real);
  const total = real.reduce((s, r) => s + r.findings.length, 0);
  const L = [];
  L.push('# 逐页规范质检报告（Page-level Spec QA）', '');
  L.push('- 生成时间：`' + generatedAt + '`');
  L.push('- 工具：`node scripts/page-qa.mjs`（Playwright 真实渲染；桌面 1440 / 移动 375 / 暗色档各测一遍）');
  L.push('- 口径：每条 finding 都带**规范锚点 + 选择器 + 实测值**，可逐条复现与回归');
  L.push('- 范围：真实页面 ' + real.length + ' 个（唯一首页 8 模块逐模块 · 打印手册 · 演示页）；'
    + '重定向桩 ' + stubs.length + ' 个**单独统计**（服务端摘掉跳转脚本后测桩自身，避免测成目标模块而重复计数）', '');
  L.push('## 0. 结论摘要（不含重定向桩）', '');
  L.push('| 规则 | 严重度 | 规范锚点 | 命中数 | 涉及页面 |');
  L.push('| --- | --- | --- | --- | --- |');
  for (const a of agg) L.push(`| ${a.name} \`${a.rule}\` | ${a.severity} | ${a.anchor} | ${a.n} | ${a.pages.size} |`);
  L.push('', `**合计 ${total} 条**`, '');
  // P3 聚合档（字号不在层级 / 偏离 4px 网格）：量大且多为半档微调，只看分布
  const hist = new Map();
  for (const r of real) {
    for (const h of r.hist || []) {
      const k = h.rule + '|' + h.value;
      const e = hist.get(k) || { rule: h.rule, value: h.value, n: 0, pages: new Set(), sample: h.sample, page: r.page };
      e.n += h.n; e.pages.add(r.page);
      hist.set(k, e);
    }
  }
  const histArr = [...hist.values()].sort((a, b) => b.n - a.n);
  if (histArr.length) {
    L.push('## 0b. 档位偏离分布（P3 · 聚合，非逐条）', '');
    for (const rule of ['spacing-grid', 'type-scale']) {
      const rows = histArr.filter((h) => h.rule === rule);
      if (!rows.length) continue;
      L.push(`**${RULE_NAME[rule]}**（${rule}，锚点 ${rule === 'spacing-grid' ? '02 · 2.3.1' : '02 · 2.2.2'}，共 ${rows.reduce((s, r) => s + r.n, 0)} 处）`, '');
      L.push('| 实测值 | 命中元素数 | 样例 |');
      L.push('| --- | --- | --- |');
      for (const h of rows.slice(0, 18)) L.push(`| ${h.value} | ${h.n} | \`${h.page}\` \`${h.sample}\` |`);
      L.push('');
    }
  }
  L.push('## 1. 逐页明细', '');
  for (const r of [...real, ...stubs]) {
    const n = r.findings.length;
    L.push(`### ${r.page}`, '');
    if (r.error) { L.push('> ❌ 质检失败：' + r.error, ''); continue; }
    const m = r.meta;
    L.push(`- 结构：标题 ${m.headings ?? '-'} 个 · 焦点样本 ${m.focusSample ?? '-'} 个（其中不可见 ${m.focusNoRing ?? 0}）· emoji ${m.emoji ?? 0} 处`);
    if (m.contrast) L.push(`- 对比度（浅色档）：确证失败 ${m.contrast.fail}（渐变上界 ${m.contrast.grad}）· 无法判定 ${m.contrast.info}`);
    if (m.darkContrastFail !== undefined) L.push(`- 对比度（暗色档）：确证失败 ${m.darkContrastFail}`);
    L.push(`- 横向溢出：桌面 ${m.overflow ?? 0}px / 移动 ${m.overflowMobile ?? 0}px`);
    if (m.touch) L.push(`- 移动端非行内热区受检 ${m.touch.touchChecked} 个`);
    if (r.console.length) L.push(`- 控制台错误：${r.console.length} 条`);
    L.push('');
    if (!n) { L.push('✅ 未发现可机械判定的规范问题', ''); continue; }
    L.push('| 严重度 | 规则 | 锚点 | 位置 | 实测 |');
    L.push('| --- | --- | --- | --- | --- |');
    for (const f of r.findings.slice(0, 60)) {
      L.push(`| ${f.severity} | ${f.rule} | ${f.anchor} | \`${f.sel}\` | ${f.detail.replace(/\|/g, '\\|')} |`);
    }
    if (n > 60) L.push(`| … | | | | 另有 ${n - 60} 条 |`);
    L.push('');
  }
  return L.join('\n');
}

// ══════════════════════════════════════════════════════════════════════════

async function main() {
  const argv = process.argv.slice(2);
  const opts = { json: argv.includes('--json'), shots: argv.includes('--shots'), ci: argv.includes('--ci'),
    filter: (argv.find((a) => a.startsWith('--page=')) || '').replace('--page=', '') };
  let pages = collectPages();
  if (opts.filter) pages = pages.filter((p) => (p.rel + (p.hash ? '#' + p.hash : '')).includes(opts.filter));
  if (!pages.length) { console.error('没有匹配的页面：' + opts.filter); return 1; }

  const { srv, port } = await serve();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const results = [];
  for (const page of pages) {
    process.stderr.write('· ' + page.rel + (page.hash ? '#' + page.hash : '') + '\n');
    results.push(await auditPage(browser, base, page, opts));
  }
  await browser.close();
  srv.close();

  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + '+0800';
  const { real, stubs } = split(results);
  const total = real.reduce((s, r) => s + r.findings.length, 0);
  const stubTotal = stubs.reduce((s, r) => s + r.findings.length, 0);
  if (opts.json) {
    console.log(JSON.stringify({ generatedAt, total, stubTotal, results }, null, 2));
  } else {
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, render(results, generatedAt), 'utf8');
    const agg = summarize(real);
    console.log(`逐页质检：真实页 ${real.length} + 重定向桩 ${stubs.length} · ${total} 条问题（桩另有 ${stubTotal} 条）→ ${path.relative(ROOT, REPORT)}`);
    for (const a of agg) console.log(`  ${a.severity} ${a.rule.padEnd(20)} ${String(a.n).padStart(4)}  ${a.name}`);
    if (opts.ci) {
      // 门禁口径：P0/P1/P2 一律必须为 0。P3 是**能力缺口**（各展示模块自带皮肤，
      // 未实现暗色的模块不计成违规 —— token 层是否支持暗色由 audit.py 的 dark 检查守）。
      const blocking = agg.filter((a) => a.severity !== 'P3');
      const blockingStubs = summarize(stubs).filter((a) => a.severity !== 'P3');
      const n = blocking.reduce((x, a) => x + a.n, 0) + blockingStubs.reduce((x, a) => x + a.n, 0);
      const p3 = agg.filter((a) => a.severity === 'P3').reduce((x, a) => x + a.n, 0);
      console.log(`\n[门禁] P0–P2 问题 ${n} 条；P3 登记项 ${p3} 条（不阻塞）`);
      if (n > 0) {
        console.error('::error::逐页质检未通过（P0–P2 必须为 0），详见 ' + path.relative(ROOT, REPORT));
        for (const a of [...blocking, ...blockingStubs]) console.error(`  ${a.severity} ${a.rule} × ${a.n} — ${a.name}（${a.anchor}）`);
        return 1;
      }
      console.log('OK 逐页质检通过（P0–P2 = 0）');
    }
  }
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(2); });
