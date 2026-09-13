# 儿童保健（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 月龄与体检计划、五健检查（视力/口腔/听力/心理/体格）、儿保结论与建议 |
| 依赖 | archive、shared/domain |
| 对外契约 | ChildProfile 儿童档案、FiveHealth 五健结论 |
| 状态词（15 章已登记） | 未见异常 / 可疑 / 异常 / 待补检 / 未出结果 |

## 硬规则

- 不得复用孕期的孕周模型（儿童以月龄计，两套口径不可混用）

- 只允许被 `app/` 与其它模块通过 `@/modules/childcare`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`。
- 页面不得写裸色值、裸断点数字（用 Token 与 `@/shared/constants/breakpoints`）。

## 目录约定

```
childcare/
├── index.ts     # 公共出口（唯一允许被外部引用的入口）
├── model.ts     # 数据契约 + 状态词 + 路由（模块边界的登记处）
├── api.ts       # 接口契约（走 shared/api）
├── pages/       # 页面（由路由表引用）
├── components/  # 模块私有组件（外部禁止引用）
└── hooks/       # 模块私有 hooks
```
