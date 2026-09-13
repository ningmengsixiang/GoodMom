# 随访队列（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 随访任务状态机、队列排序（风险优先 + 逾期置顶）、随访闭环（含失访处置） |
| 依赖 | archive（读对象信息）、shared/domain、shared/api |
| 对外契约 | FollowupTask 随访任务、QueueQuery 队列查询 |
| 状态词（15 章已登记） | 待随访 / 随访中 / 已结案 / 未随访 / 拒绝随访 / 无法联系 / 待再次随访 |

## 硬规则

- 不得改档案状态（只写任务状态）
- 不得跨模块直接读 vaccine/childcare 的数据表

- 只允许被 `app/` 与其它模块通过 `@/modules/followup`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
followup/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
