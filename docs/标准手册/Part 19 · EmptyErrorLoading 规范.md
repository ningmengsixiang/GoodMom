# Part 19 · Empty/Error/Loading 规范（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：空态、错误与加载三态（08.2.12/13/15）。
> 用词：应/宜/可；编号 `19-xx`。

## 1 目的与适用范围
## 2 条款
- EL-19-01 应：Empty——图标 48–52（移动加大）+ 一句话说明 + 可选行动；可操作空态给主行动（如“去建档”）。
- EL-19-02 应：Loading 三态——① 按钮忙碌＝图标位细环 **0.9s/圈**（不换内容、保留原宽度、`aria-busy`）；② 区块＝骨架 **1.6s 上下微透明呼吸（α .5↔.85，ease-in-out）**，`rowHeight` 应**贴近终态高度**；③ Spin `role="status"`+文案（无文案时补 `aria-label`），尺寸 18–40px，`delay` 默认 300ms 防闪切。
  > **口径裁决（V2.9）**：本条的「1.15s shimmer」与 08 · 8.2.15 的「1.6s 呼吸 + **禁止左右扫光马赛克**」直接冲突。以 **08 · 8.2.15 为准**（章节级细则、有明文禁令、且站点演示一直按此实现）；本条已随之修正。
- EL-19-03 应：Error 三通道（色+文案+动作）——医疗场景给“稍后重试/联系/保持现场数据”类引导，不暴露内部堆栈。
  落地：**`GmResult`**（`status` 四值 → `--lg-sem-*` 色通道 / `title`+`desc` 文案通道 / `actionText`+`onAction` 动作通道）；`error` 用 `role="alert"`，其余 `role="status"`。组件**有意不提供 `code`/`stack` 类 prop** —— 那正是「暴露内部结构」的入口。
- EL-19-04 应：实时断连=状态点呼吸警示+重连；行级错误行内重试。
- EL-19-05 应：组件实现 GmEmpty/GmSpin/GmSkeleton（含 aria/role）+ **GmResult**（结果页）。
  落地：`GmEmpty` `role="status"`、`GmSpin` `role="status" aria-live="polite"`、`GmSkeleton` `role="status" aria-busy="true"`、`GmProgress` `role="progressbar"`＋取值三元组。
- EL-19-06 不应：空态无文案只有占位；loading 与内容闪切无过渡；错误信息暴露内部结构。
