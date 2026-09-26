# fuyouaicansai → GoodMom 重画版说明

原 `_1~_4/code.html`：Tailwind + CDN 原型页（依赖网络，非本设计语言）。
重画产物：**goodmom-redesign.html**（单文件 4 视图 · 统一菜单切换）：

| 视图 | 对应原页 | GoodMom 设计要点 |
| --- | --- | --- |
| 专家工作台 | _4 | KPI · 待复核 AI 建议(置信度标签) · AI 助手对话 |
| 全生命周期档案 | _1 | 档案头卡 · 生长百分位 · 健康事件时间线 |
| 多智能体会诊 | _2 | 会诊对象(五色红) · 智能体对话 · 结论建议待签发 |
| 诊疗详情 | _3 | 诊疗头卡 · 证据链 · 智能建议与历史对比 |

统一采用：玻璃卡/暖底、蜜桃粉主色、六语义标签、五色分级、tabular 数字、无外部 CDN 依赖；
Logo 引用仓库根 `logo.png`。打开方式：浏览器直接打开 goodmom-redesign.html。
如需逐页独立 HTML（每页一个文件），可基于本文件拆分。

---

## 6 个独立产品页（V2.9 新增）

按 `prd/zong.md`（GM-PRD-000 六大产品总体 PRD）把 6 大产品各做成一页，
**参照本目录 `goodmom-redesign.html` 的应用外壳形态**：可收起侧栏（分组菜单 + 徽标 + 用户区）
+ 顶栏（品牌 + 页签 + 侧栏/顶栏切换），≤1280px 自动切顶栏模式；单文件、无 CDN 依赖，双击即可打开。

| 页面 | 产品 | 四个视图 |
| --- | --- | --- |
| [`index.html`](index.html) | — | 6 个产品页索引（入口） |
| [`p01-women-health.html`](p01-women-health.html) | 01 妇女健康管理系统 | 工作台 / 档案 / AI 协同 / 详情 |
| [`p02-preconception.html`](p02-preconception.html) | 02 婚前孕前保健系统 | 同上 |
| [`p03-maternity.html`](p03-maternity.html) | 03 孕产妇全程管理系统 | 同上（含孕期体重曲线） |
| [`p04-newborn.html`](p04-newborn.html) | 04 新生儿健康管理系统 | 同上（含新生儿体重曲线） |
| [`p05-child-health.html`](p05-child-health.html) | 05 儿童健康管理系统 | 同上（含 WHO 生长曲线） |
| [`p06-ai-care.html`](p06-ai-care.html) | 06 妇幼AI智能体平台 | 同上（AI 建议审核链路） |

**每页四个视图做什么**

| 视图 | 内容 |
| --- | --- |
| 工作台 | 4 KPI（可点 → 按语义筛选待处理清单）· 核心业务闭环步骤轴（步骤取 PRD 二级功能）· 今日待处理（状态筛选 + 行内动作推进状态 + Toast/动态）· 风险/筛查队列（点行即筛选）· 快捷工具 · 质量概览 · 最新动态 |
| 档案 | 档案头卡（六语义 / 五色标签）· 关键指标 · 体重/生长曲线（p03/p04/p05，可悬停读点）· 健康事件时间线（由 PRD 旗舰流程派生）· 关联档案与主责数据 |
| AI 协同 | AI 建议待复核（置信度 + 依据 + 采纳 / 驳回 / 转人工复核 → 复核弹层）· AI 助手对话（打字反馈 + 预设问答）· 协同方 · AI 边界（PRD §八 四类"不负责"） |
| 详情 | 对象头卡 · 检查检验表 · 结论与建议（草稿 → 待审核 → 审核通过 / 已驳回）· 证据链 · 随访计划 |

**生成与守门**（改 PRD 或改数据后重跑即可，不要手改页面）

```bash
python3 scripts/gen-product-apps.py          # 生成 6 页 + index.html
python3 scripts/gen-product-apps.py --check  # CI：产物是否与生成器一致
node scripts/product-apps-smoke.mjs          # 130 条断言（需先起静态服务）
```

· 内容来自 `prd/zong.md`（产品身份 / 功能架构树 / 旗舰流程 / 主责数据 / 角色，由 `products_prd.py` 解析）
+ `scripts/products_data.py` 的 `APP`（档案 / AI / 详情文案）。
· **样式单一出处**：页面样式 = 唯一首页「产品矩阵」模块的样式表（运行时从 `scripts/gen-products.py`
抽出）＋ 外壳的数据呈现层配方（从 `build-site.py` 的 `SHELL` 抽出 `.gm-tbl`）＋ 本页外壳增量；
后者集中放在 `scripts/product_app_assets.py`。抄第二份样式，就是两份开始漂移的那天。
· 已纳入 CI 门禁：`page-qa.mjs`（逐页质检，P0–P2 必须为 0）· `a11y-dom.py`（渲染级对比度，
确证失败 0）· `product-apps-smoke.mjs`（导航 / 四视图 / 交互 / 表格配方 / 移动端热区）。
· 全部数值为**示意数据**，不作为医疗依据（13 · 13.5）。
