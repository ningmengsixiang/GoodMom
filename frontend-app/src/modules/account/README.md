# 账号与权限（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。角色与权限点属 account；机构/科室称谓见 15.3.2。

| 项 | 内容 |
| --- | --- |
| 归属 | 机构侧 |
| 拥有 | 机构信息（名称/等级/科室）、登录会话与令牌、角色与权限点（nurse/doctor/admin）、**权限矩阵（角色 × 模块）** |
| 依赖 | shared（session/domain/api/components/constants）；接口数据由 shared/api/mock.ts 供数 |
| 对外契约 | AccountSession 会话与科室、PermissionRow 权限矩阵行、Role 角色（与 `shared/session` 同源）、`PERMISSION_TABLE` / `permissionRows()` |
| 状态词（15 章已登记） | 正常 / 待审核 / 已审核 / 已注销（15.2.1 + 15.2.8；账号列表页排期时使用，当前页面只显示角色，不挂状态标签） |

## 硬规则

- 不得直接读写 localStorage 存令牌（统一走 account）
- 权限矩阵是**唯一**的一张表：`model.PERMISSION_TABLE`（`Record<NavModule, Record<Role, boolean>>`）。
  其它模块要判可见性请调 `shared/session` 的 `can()`，不得各自复制矩阵；新增导航项漏配权限行会被 `tsc` 拦下
- 矩阵口径 = 19.5.1 各模块「归属」列 + 19.5.3 第 2 条（机构侧只看聚合 → 管理员不进个体档案/随访队列），
  与 `app/routes.tsx` 的 `role` 声明保持一致
- 角色切换只经 `shared/session` 的 `login()`，页面不得自己改会话对象

- 只允许被 `app/` 与其它模块通过 `@/modules/account`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`；四态走 `@/shared/components/PageState`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
account/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 权限矩阵 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用；ModulePlaceholderPage 为后续模块的脚手架，不对外导出）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
