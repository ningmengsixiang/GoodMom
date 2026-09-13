# 健康档案（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 服务对象主档（孕妇/儿童统一抽象）、建档与档案状态流转、档案检索与筛选 |
| 依赖 | shared/domain、shared/api |
| 对外契约 | Client 服务对象、ArchiveQuery 检索条件、ArchiveDetail 档案详情 |
| 状态词（15 章已登记） | 已建档 / 待完善 / 管理中 / 已归档 / 已迁出 / 暂停管理 |

## 硬规则

- 不得持有随访任务的状态机（那是 followup 的边界）
- 不得直接查疫苗/儿保明细（经各自模块出口）

- 只允许被 `app/` 与其它模块通过 `@/modules/archive`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
archive/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
