# 数据中心（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 机构管理员 / 医护 |
| 拥有 | 机构 KPI 与趋势（04 章图表）、妇幼指标口径与色序（12.3.3）、大屏布局（17 / 04.5） |
| 依赖 | shared/domain、shared/api |
| 对外契约 | KpiCard KPI、TrendSeries 趋势 |
| 状态词（15 章已登记） | 正常 / 管理中 |

## 硬规则

- 不得自行定义指标口径（口径来自 15 章 / 04 章）
- 不得用语义色表示数据序列（数据色序是 12.3.3）

- 只允许被 `app/` 与其它模块通过 `@/modules/dashboard`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
dashboard/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
