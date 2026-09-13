# 账号与权限（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 机构侧 |
| 拥有 | 机构信息（名称/等级/科室）、登录会话与令牌、角色与权限点（nurse/doctor/admin） |
| 依赖 | shared/domain、shared/api |
| 对外契约 | Institution 机构、Session 会话、Role 角色、Permission 权限点 |
| 状态词（15 章已登记） | 正常 / 待审核 / 已审核 / 已注销 |

## 硬规则

- 不得直接读写 localStorage 存令牌（统一走 account）
- 不得被其它模块 import（只被 app/providers 使用）

- 只允许被 `app/` 与其它模块通过 `@/modules/account`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
account/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
