# 机构运营（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。称谓词见 15.3.1 / 15.3.2，指标词见 15.3.4。

| 项 | 内容 |
| --- | --- |
| 归属 | 机构管理员（路由 `role: "admin"`） |
| 拥有 | 机构与科室管理（科室 / 管理医生 / 建档机构）、医生排班与工位、服务量统计（机构维度聚合） |
| 依赖 | shared（session/domain/api/components/utils）；接口数据由 shared/api/mock.ts 供数。README 的 19.5.1 依赖列还含 `account`（读机构信息），当前页面读 `shared/session` 的机构，“依赖”行保持声明 |
| 对外契约 | OrgUnit 科室、Shift 排班、ServiceMetric 服务量指标、InstitutionOverview 机构运营页 |
| 状态词（15 章已登记） | 已签到 / 服务中 / 已取消 / 已关闭（15.2.6 预约状态 + 15.2.7 任务状态） |

## 硬规则

- 不得读取个体健康数据（机构侧只看聚合，个体数据属医护侧 —— 19.5.3 第 2 条）
- 服务量指标名**逐字**取自 15.3.4 表，不得自造指标（`疫苗应种率` 的疑义见 `model.ts` 注释）
- 科室与人员只用 15.3.2 档案词（管理医生 / 建档机构）与 15.3.1 称谓（管理对象），不用“负责医生 / 主治”这类自造词

- 只允许被 `app/` 与其它模块通过 `@/modules/institution`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`；四态走 `@/shared/components/PageState`。
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
