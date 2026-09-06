# Part 31 · 版本管理（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：版本载体、分级与发布。
> 用词：应/宜/可；编号 `31-xx`。

## 1 目的与适用范围
## 2 条款
- VR-31-01 应：版本载体 root package.json(V2.x)+workspaces 包版本+CHANGELOG+README 版本表。
- VR-31-02 应：破坏性/系统性变更升中版本；局部补丁文档同步并记录。
- VR-31-03 应：同步矩阵——改版本同步 README/CHANGELOG/spec(refresh)/docs 报告；不一致为缺陷。
- VR-31-04 应：发布=全量回归→更新文档→推送→CI 三 job 绿→决策记录标注版本轮次。
- 历史口径：README/pkg/spec 曾不同号，已修正（V2.4 同号）。
