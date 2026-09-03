# @goodmom/icons

妈咪好 GoodMom 自绘线性图标库（24×24 · 1.7px 圆头）。源资产：`../icons/lg-icons.svg`（77 symbols）。

## 使用
```tsx
import { GmIcon } from "@goodmom/icons";
<GmIcon name="lg-icon-vaccine" size={22} />
```
无需 SVG 文件：图标已编译进 `registry.ts`（`GM_ICON_GLYPH` / `GM_ICON_IDS` / `gmIcon(name)` 字符串版）。
重建注册表：`python3 scripts/build-icons.py`（读取 icons/lg-icons.svg 重新生成 src/registry.ts）。
