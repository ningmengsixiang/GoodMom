# 机构运营（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 机构管理员 |
| 拥有 | 机构与科室管理、医生排班与工位、服务量统计（机构维度） |
| 依赖 | account（读机构）、shared/domain |
| 对外契约 | OrgUnit 科室、Shift 排班 |
| 状态词（15 章已登记） | 服务中 / 已签到 / 已取消 / 已关闭 |

## 硬规则

- 不得读取个体健康数据（机构侧只看聚合，个体数据属医护侧）

- 只允许被 `app/` 与其它模块通过 `@/modules/institution`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
institution/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
