# Part 08 · Iconography（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：系统图标集的使用、命名、同步与可访问性。
> 规范性用词：应/宜/可；条目标号 `08-xx`。

## 1 目的与适用范围
## 1 条款
- IC-08-01 应：图标使用自绘线性体系——24×24 viewBox、1.7px 圆头、命名 `lg-icon-{语义kebab}`；现有 77 枚（icons/lg-icons.svg）。
- IC-08-02 应：三方同步：sprite（icons/lg-icons.svg）= registry（goodmom-icons/src/registry.ts）= 09 文档；变更必须执行 `scripts/build-icons.py` 再生成。
- IC-08-03 应：尺寸档 16/18/20/24（移动 22–24）；颜色继承 `currentColor`；与文字并排时底部视觉对齐（inline-flex）。
- IC-08-04 应：可访问性——装饰位 `aria-hidden="true"`；独立传义图标 `role="img"`＋`aria-label`（`gmIcon(name,size,title?)` / React `GmIcon`）。
- IC-08-05 不应：混入 emoji/第三方图标；直接改 sprite 不跑 build-icons；新增语义重复图标（先查 09 语义表）。
- IC-08-06 应：新增流程 09.6：登记 → 24 网格绘制 → build-icons → registry 同步 → 页面引用。

## 2 验收
- [ ] audit icons OK（77 唯一/命名/三方一致）；[ ] 页面图标可 grep 到 registry；[ ] 传义图标带 label。
