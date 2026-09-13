# 疫苗接种（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 免疫规划计划（按月龄）、接种记录与凭证、逾期召回名单 |
| 依赖 | archive、shared/domain |
| 对外契约 | VaccinePlan 计划、Vaccination 接种记录 |
| 状态词（15 章已登记） | 已预约 / 已完成 / 待预约 / 已过期 / 未到诊 |

## 硬规则

- 不得直接改档案状态（接种结果通过 archive 的公共出口回写）

- 只允许被 `app/` 与其它模块通过 `@/modules/vaccine`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
vaccine/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
