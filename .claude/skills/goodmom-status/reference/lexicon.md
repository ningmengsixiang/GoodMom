# 状态词库全表（60 条 · 唯一登记处 `business.ts` 的 `MAP`）

> 真值来源：`goodmom-ui/src/tokens/business.ts`（React）· `frontend-app/packages/gm-arco-ui/src/tokens/business.ts`（镜像，逐字节同内容）· `goodmom-vue/src/tokens/business.ts`（Vue）· 文档侧 `15-妇幼业务词库与状态大典.md` §15.2.x。
> **三份 `MAP` 必须逐条一致**（`scripts/check-status-map.py --ci` 守门，当前 60 条全一致）。
> 匹配规则：**精确查表 + `trim()`**，未命中回落 `neutral`。**下表之外的一律未登记。**

## 档案 / 人员（10 条）

| 文案 | 语义 | 用于哪些模块 |
| --- | --- | --- |
| 正常 | `positive` | account · childcare · dashboard（档案/检查结果/人员三处共用） |
| 已建档 | `info` | archive |
| 管理中 | `info` | archive · dashboard |
| 待完善 | `attention` | archive |
| 待审核 | `attention` | account |
| 已审核 | `positive` | account |
| 已归档 | `neutral` | archive |
| 已注销 | `neutral` | account |
| 已迁出 | `neutral` | archive |
| 暂停管理 | `special` | archive |

## 人员组合标签（4 条 · 15.2.9）

| 文案 | 语义 |
| --- | --- |
| 高危 | `risk` |
| 重点关注 | `special` |
| 失访 | `risk` |
| 已转出 | `neutral` |

> 组合标签示例：张女士 `已建档` `管理中` `高危`；李女士 `已建档` `待复查` `重点关注`。
> 「高危」历史上曾漏登记 → **线上显示成灰色**，是 R4 存在的直接原因。

## 筛查（两癌流程 · 4 条）

| 文案 | 语义 |
| --- | --- |
| 待筛查 | `neutral` |
| 筛查中 | `info` |
| 待复查 | `attention` |
| 检查异常 | `risk` |

## 检查结果标签（7 条）

| 文案 | 语义 |
| --- | --- |
| 未见异常 | `positive` |
| 阴性 | `positive` |
| 可疑 | `attention` |
| 阳性 | `risk` |
| 异常 | `risk` |
| 待复核 | `attention` |
| 待补检 | `attention` |
| 未出结果 | `neutral` |

> 「高风险」在筛查与检查结果两处共用，语义恒为 `risk`。

## 随访（7 条）

| 文案 | 语义 |
| --- | --- |
| 待随访 | `attention` |
| 随访中 | `info` |
| 未随访 | `neutral` |
| 拒绝随访 | `attention` |
| 无法联系 | `attention` |
| 待再次随访 | `attention` |
| 已结案 | `neutral` |

## 转诊（6 条 · 完整链路）

| 文案 | 语义 |
| --- | --- |
| 待转诊 | `attention` |
| 转诊中 | `info` |
| 已接诊 | `info` |
| 待反馈 | `attention` |
| 已反馈 | `positive` |
| 已转诊 | `special` |

> 链路原文：`发现异常 → 待转诊(🟠) → 转诊中(🔵) → 已接诊(🔵) → 待反馈(🟠) → 已反馈(🟢) → 已完成(🟢)`，另有 `已取消(⚪)`。**同链路禁用自造词。**

## 预约（7 条）

| 文案 | 语义 |
| --- | --- |
| 待预约 | `neutral` |
| 已预约 | `info` |
| 待确认 | `attention` |
| 已确认 | `positive` |
| 已签到 | `info` |
| 服务中 | `info` |
| 已过期 | `attention` |
| 未到诊 | `risk` |

> **「未到诊」= `risk`**（🔴 → 影响随访排程时）。

## 任务（工作台 · 5 条）

| 文案 | 语义 |
| --- | --- |
| 待处理 | `attention` |
| 进行中 | `info` |
| 即将到期 | `attention` |
| **已逾期** | **`attention`**（已裁决例外：任务类用琥珀；医疗结果类请在页面显式 `semantic="risk"`） |
| 已关闭 | `neutral` |

> 优先级展示顺序：**危险 > 逾期 > 待处理 > 进行中 > 已完成**。

## 审核（5 条）

| 文案 | 语义 |
| --- | --- |
| 草稿 | `neutral` |
| 审核中 | `info` |
| 审核通过 | `positive` |
| 已驳回 | `risk` |
| 已撤回 | `neutral` |

## 跨域共用（5 条）

| 文案 | 语义 | 出现域 |
| --- | --- | --- |
| 已完成 | `positive` | 筛查 · 随访 · 转诊 · 预约 · 任务（**文案统一用「已完成」，不用「已随访」**） |
| 已取消 | `neutral` | 转诊 · 预约 |
| 高风险 | `risk` | 筛查 · 检查结果 |
| 已预约 | `info` | 随访 · 预约 |
| 待审核 | `attention` | 档案 · 审核 |

---

## 不算登记词（别当状态用）

| 词 | 状态 |
| --- | --- |
| `已随访` | **明确 IGNORE** —— 只在示例/反例里出现，正解是「已完成」 |
| `发现异常` | 转诊**链路描述词**，未按 `文案(色点)` 登记，无映射 |
| `随访失败` / `联系不上` / `需再次随访` | 禁用词，见下表替代 |
| `疫苗应种率` / `疫苗全程率` | 大屏**指标词**（15.3.4），不是状态词 |

## 孕产妇五色分级（15.2.10 · **不进** `MAP`）

五色文案以「色点 + 分级名」呈现，**没有** `文案(色点)` 形式，因此不参与 `check-status-map.py` 解析，也不在 `business.ts` 里。

| 级 | 文案 | 语义通道 |
| --- | --- | --- |
| 1 | 绿 · 低风险 | `GmTag five="m1"` / `GmRiskPicker` |
| 2 | 黄 · 一般风险 | `five="m2"` |
| 3 | 橙 · 较高风险 | `five="m3"` |
| 4 | 红 · 高风险 | `five="m4"` |
| 5 | 紫 · 合并传染病 | `five="m5"` |

文案真值：`GmRiskPicker` 的 `LABEL`（两包同名，`m1: "绿 · 低风险"` … `m5: "紫 · 合并传染病"`）。

---

## 统计与计数

当前口径：**60 条**（`docs/coverage-report.md`，由 `scripts/coverage.py` 统计）。
`coverage.py --ci` 会与基线比对，**计数回退即失败**。

## 守门脚本速查

```bash
python3 scripts/check-status-map.py --ci            # ① 15章有映射表无→ERROR ② 映射表有15章无→WARN ③ 两侧语义不一致→ERROR
python3 scripts/check-module-boundary.py --only B6  # model.ts 的状态词必须在 15 章登记
python3 scripts/coverage.py --ci                    # 状态文案计数不得回退
python3 scripts/audit.py --only semantic-parity     # 六语义色值四来源同号
```

`IGNORE = {"已随访"}` 与「已裁决例外白名单（已逾期）」都写在 `check-status-map.py` 里；改动前先看该文件。
