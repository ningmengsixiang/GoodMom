# 儿童保健（模块）

> 边界定义见 19 · 19.5（`19-工程架构与组件复用规范.md`）。字段来源见 13.3.4 / 13.3.8，状态词来源见 15.2.3。

| 项 | 内容 |
| --- | --- |
| 归属 | 医护侧 |
| 拥有 | 月龄节点轴（1/3/6/8/12/18/24/36 月龄）、六项保健清单（生长发育/营养喂养/心理行为发育/视力保健/听力保健/口腔保健）、儿保结论与高危儿队列标记 |
| 依赖 | shared（domain/api/components/utils/feedback）；接口数据由 shared/api/mock.ts 供数。README 的 19.5.1 依赖列还含 `archive`（读儿童档案），当前页面只读本模块接口，尚未真实 import |
| 对外契约 | ChildProfile 儿童档案、GrowthNode 月龄节点、FiveHealth 单项保健记录、ChildcareVisit 儿保体检页 |
| 状态词（15 章已登记） | 正常 / 未见异常 / 可疑 / 异常 / 待补检 / 待复查 / 待转诊 / 未出结果（15.2.3 检查结果标签） |

## 硬规则

- 不得复用孕期的孕周模型（儿童以月龄计，两套口径不可混用 —— 月龄一律走 `shared/utils/format.monthAge`）
- 未到月龄的节点**不挂状态标签**，只用灰字说明（不新造状态词）
- 异常项是否进高危儿 / 重点随访队列由数据源给（`FiveHealth.highRisk`），页面不得按状态自行推断临床含义
- 医学数值字号 ≥13 且 `tabular-nums`，单位与标准来源（WHO 0–5 岁标准）以小字标注（13.5.1 / 13.5.2）

- 只允许被 `app/` 与其它模块通过 `@/modules/childcare`（公共出口）引用，禁止深链内部文件。
- 不得直接 `fetch`，一律经 `shared/api/client`；四态走 `@/shared/components/PageState`。
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
