# 疫苗接种（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。数据形态见 13.3.3，状态词来源见 15.2.6。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 免疫规划计划（按月龄时间线）、接种记录与凭证、逾期召回名单（到期未种） |
| 依赖 | shared（domain/api/components/utils/feedback）；接口数据由 shared/api/mock.ts 供数。README 的 19.5.1 依赖列还含 `archive`（回写接种结果时经其公共出口），当前页面只读本模块接口，尚未真实 import |
| 对外契约 | VaccinePlan 计划、VaccineItem 计划节点、VaccineCoverage 覆盖率、OverdueCase 到期未种行 |
| 状态词（15 章已登记） | 待预约 / 已预约 / 已完成 / 已过期（15.2.6 预约状态；`未到诊` 未使用） |

## 硬规则

- 13.3.3 原文的「未到 / 可接种 / 延后」**不在 15.2 词库**：可接种→`待预约`、逾期未种→`已过期`、
  未到月龄→**不挂状态标签**（只用灰字）。映射表与依据见 `model.ts` 文件头，禁止在页面里改口径
- 不得直接改档案状态（接种结果通过 archive 的公共出口回写）
- 覆盖率统计条必须是薄荷色（`GmProgress status="success"`），到期未种名单行必须同时有红字与状态标签（双通道）

- 只允许被 `app/` 与其它模块通过 `@/modules/vaccine`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`；四态走 `@/shared/components/PageState`。
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
