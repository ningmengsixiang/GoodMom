# 医护工作台（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 今日待办视图（跨模块任务的只读聚合）、接诊/随访执行入口、个人工作统计 |
| 依赖 | followup（读任务）、archive（读对象）、account（读会话） |
| 对外契约 | TodayBrief 今日概览、WorkloadItem 待办项 |
| 状态词（15 章已登记） | 待处理 / 进行中 / 即将到期 / 已逾期 / 已接诊 / 待反馈 / 已反馈 |

## 硬规则

- 不得拥有自己的任务状态机（只做只读聚合与跳转）

- 只允许被 `app/` 与其它模块通过 `@/modules/workbench`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
workbench/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
