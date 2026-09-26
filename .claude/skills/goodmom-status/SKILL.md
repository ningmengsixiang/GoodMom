---
name: goodmom-status
description: Use when 需要展示或新增任何业务状态 —— 状态标签、状态色点、状态文案、语义色、风险分级。触发词：状态、状态标签、状态色、StatusTag、Tag 颜色、语义色、semantic、高危、待随访、已逾期、已结案、阳性、阴性、筛查、转诊、随访、预约、审核、任务状态、妊娠风险、五色、红橙黄绿紫、分级、状态表、词库、statusMap、为什么状态是灰色的、颜色不对、状态不显示颜色。
---

# 业务状态与语义色

## 唯一正确用法（三条）

```tsx
// ✅ React —— 必须显式传 semantic，React 的 GmStatusTag 不会自动推导
import { semanticOf } from "@/shared/domain/status";
<GmStatusTag semantic={semanticOf(record.status)}>{record.status}</GmStatusTag>
```

```vue
<!-- ✅ Vue —— 会从插槽文案自动推导（但显式传也一样正确、更安全） -->
<GmStatusTag>待随访</GmStatusTag>
<GmStatusTag :semantic="semanticOf(record.status)">{{ record.status }}</GmStatusTag>
```

```tsx
// ✅ 妊娠风险五色：只读用 GmTag five，可编辑用 GmRiskPicker
<GmTag five="m4">红 · 高风险</GmTag>
<GmRiskPicker v-model="risk" />
```

**⛔ 页面禁止**：手写 `statusMap` / 自选 `semantic` / 自写色值 / 裸 hex / 只靠颜色区分状态。

## 静默回落：这个系统最危险的失败

```ts
export const semanticOf = (label: string): GmSemantic => MAP[label.trim()] ?? "neutral";
```

- **精确查表 + 只 `trim`**：没有大小写归一、没有包含匹配、没有分词。
- **未登记文案静默回落 `neutral` 灰**：不报错、不打日志、组件不抛错。
- 线上表现就是**「高危显示成灰」**，而且要等到有人肉眼发现。

**所以：写任何业务状态文案之前，先查 `reference/lexicon.md` 确认它已登记。** 查不到 → 走下面的登记流程，不要绕过。

## 六语义

| 语义 | 浅色 | 暗色 | 含义 | 典型文案 |
| --- | --- | --- | --- | --- |
| `positive` | `#25715D` | `#6FC9B4` | 正常 / 正向 | 正常、已完成、阴性、未见异常 |
| `info` | `#3261C1` | `#9CAEFF` | 信息 / 进行 | 进行中、已预约、筛查中、审核中 |
| `attention` | `#8D5A15` | `#F2C14E` | 注意 / 待办 | 待随访、待处理、待审核、已逾期(任务类) |
| `risk` | `#B72F42` | `#F79AA8` | 风险 / 异常 | 高危、阳性、异常、已驳回 |
| `neutral` | `#5E6673` | `#A6ADB9` | 中性 / 未动 | 未开始、草稿、已归档 |
| `special` | `#6A48DC` | `#B9A0FF` | 特殊 / 协作 | 转诊、重点关注、暂停管理 |

**三条边界**

1. `--lg-sem-*` 是**前景色**（文字/色点/描边），**不可当填充底**。要实底 + 白字 → `SEMANTIC_SOLID` / `--mmh-solid-*`。
2. 淡底必须混实底：`color-mix(in srgb, var(--lg-sem-x) 13%, var(--lg-tint-base))`。⛔ 禁 `transparent`（12px 字只剩 4.06:1）。
3. **状态必须双通道**：色 + 文字（WCAG 1.4.1）。仅靠色点区分即不合规。

## 妊娠风险五色（`GmFive`）

| 级 | 标签文案 | Token | 色值 | 管理要求 |
| --- | --- | --- | --- | --- |
| 1 | 绿 · 低风险 | `--mmh-m5-m1` | `#4CB98A` | 常规产检与随访 |
| 2 | 黄 · 一般风险 | `--mmh-m5-m2` | `#F2C14E` | 增加频次，保健机构管理 |
| 3 | 橙 · 较高风险 | `--mmh-m5-m3` | `#F0954A` | 县级及以上專案管理 |
| 4 | 红 · 高风险 | `--mmh-m5-m4` | `#EE5C70` | 市级及以上救治中心，绿色通道 |
| 5 | 紫 · 合并传染病 | `--mmh-m5-m5` | `#8F6AE0` | 传染病规范管理 + 母婴阻断 |

- 五色**只用于妊娠风险分级**，不用于其他任何状态。
- **五色不进六语义映射表**（不走 `semanticOf`，走 `five` prop）。
- chip 配方：底 = 对应色 **12–18%** 洗色 + 深色文字；红/紫可用白字实色 chip。**仅作管理标签，不做大面积填充。**
- 组件里五色分支的**文字不用五色亮值**（走 `--lg-text-primary`），颜色由色点承载。
- 风险级 → 处置时限（应用层 `RISK_SLA`）：`m5` 立即上报 / `m4` 当日处置 / `m3` 24h 复核 / `m2` 周内随访 / `m1` 常规。
- **红/橙对象列表置顶**；风险只升不降需复评。

## 已裁决例外

**「已逾期」→ `attention`（琥珀）**：15.2.7 行内标 🔴，但 15.5 例外条明确「任务类已逾期用琥珀」。
**医疗结果类**逾期 / 未到诊请在页面**显式**传 `semantic="risk"`（`未到诊` 本身已是 `risk`）。

## 新增状态文案：四处一次改齐

漏登记**不会报错**，只会静默变灰。这是流程题。

```bash
# ① 15-妇幼业务词库与状态大典.md §15.2.x   → 写成「新词(🟠)」形式（色点决定语义）
# ② goodmom-ui/src/tokens/business.ts       → MAP 内加：新词:"attention",
# ③ 同步应用镜像（必须逐字节同内容）
cp goodmom-ui/src/tokens/business.ts frontend-app/packages/gm-arco-ui/src/tokens/business.ts
# ④ goodmom-vue/src/tokens/business.ts      → MAP 内加同一条
# ⑤ 页面要用的话，登记模块契约面：frontend-app/src/modules/<模块>/model.ts 的 STATUS

# ── 校验（在仓库根执行）──
python3 scripts/check-status-map.py --ci              # 15 章 ⇄ 两库映射表 + 六语义色四来源同号
python3 scripts/check-module-boundary.py --only B6    # model.ts 状态词必须在 15 章登记
python3 scripts/check-module-boundary.py --only B7    # 业务代码禁裸 hex
python3 scripts/coverage.py --ci                      # 状态文案计数不得回退（当前 60 条）
```

**色点 → 语义对照**（15 章用色点标语义）：🟢 `positive` · 🔵 `info` · 🟠 `attention` · 🔴 `risk` · ⚪ `neutral` · 🟣 `special`

## 禁用词（15 章明确）

| ⛔ 禁用 | ✅ 替代 |
| --- | --- |
| 已随访 | 已完成 |
| 随访失败 | 未完成 / 暂未联系 / 无法联系 / 待再次随访 |
| 联系不上 | 无法联系 |
| 需再次随访 | 待再次随访 |
| 「发现异常」当状态用 | 它是转诊**链路描述词**，未登记，不要当状态标签 |

## 守门缺口（已知，别依赖）

- `check-status-map.py` **只扫两个库，不含 `frontend-app` 镜像** → 镜像漂移漏守，必须手工 `cp`。
- 该脚本的色值检查用**相对 CWD 的路径** → **必须在仓库根运行**，否则静默放过。
- `goodmom-vue/**` **没有**镜像或样式字节门禁（`audit.py mirror_sync` 明确排除它）。
