# 孕期管理（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 孕周与预产期换算、产检计划（13.3.2）、妊娠风险五色分级（02.10） |
| 依赖 | archive（取档案）、shared/domain |
| 对外契约 | PregnancyProfile 孕期档案、AntenatalPlan 产检计划 |
| 状态词（15 章已登记） | 待筛查 / 筛查中 / 待复查 / 高风险 / 待转诊 / 已转诊 |

## 硬规则

- 不得自己算风险等级（分级规则属 15.2.10，由 GmRiskPicker 承载）

- 只允许被 `app/` 与其它模块通过 `@/modules/pregnancy`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
pregnancy/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
