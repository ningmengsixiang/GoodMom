#!/usr/bin/env python3
"""从 icons/lg-icons.svg 重新生成 goodmom-icons/src/registry.ts"""
import re, os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sp = open(os.path.join(base, "icons/lg-icons.svg"), encoding="utf-8").read()
entries = [(m.group(1), m.group(2)) for m in re.finditer(r'<symbol id="([^"]+)" viewBox="0 0 24 24"><g[^>]*>([\s\S]*?)</g></symbol>', sp)]
reg = 'export type GmIconName =\n  | "' + '\n  | "'.join(n for n, _ in entries) + '"\n'
reg += '\n\nexport const GM_ICON_IDS: GmIconName[] = [' + ', '.join('"%s"' % n for n, _ in entries) + '];'
reg += '\n\nexport const GM_ICON_GLYPH: Record<GmIconName, string> = {\n'
reg += '\n'.join('  "%s": %r,' % (n, g) for n, g in entries) + '\n};'
out = os.path.join(base, "goodmom-icons/src/registry.ts")
open(out, "w", encoding="utf-8").write(reg)
print("regenerated %d icons -> %s" % (len(entries), os.path.relpath(out, base)))
