# @goodmom/gm-arco-ui — 妈咪好 GoodMom × Arco Design 封装层

> 依据 Arco Design（[arco-design](https://github.com/arco-design/arco-design)，本库为基底/API 参考）与
> 「妈咪好 GoodMom」设计系统（本仓 00–15 章规范）封装业务组件。
> 目标：工程上直接使用 Arco 的高质量基础件，视觉与语义完全服从设计系统。

## 设计系统口径
- Token：02（lg-* / mmh-*），主色=蜜桃粉 `--mmh-rose-*`，六语义状态色见 14 · 4.4.5 / 15.5
- 组件命名：14 · 2（官方名 ↔ Arco 代码名一一对应）
- 状态标签：15.2 九套业务状态 + 15.2.10 孕产妇五色；颜色双通道（文字+色）
- 三端：PC（03/08）· iPad（10.1.1/15.4）· Mobile（10/11）

## 已封装
| 文件 | 说明 | 对应规范 |
| --- | --- | --- |
| `src/components/GmButton.tsx` | 按钮（封装 Arco `Button`，透传 type/status/size/shape/long/loading） | 03 · 3.2.4 按钮全谱 |
| `src/components/GmStatusTag.tsx` | 状态标签（六语义 + 五色） | 14 · 4.4.5 / 02.10 |
| `src/tokens/business.ts` | 业务状态文案 → 六语义字典（15.2 汇总，供 `semanticOf`） | 15.2 |
| `src/tokens/design.ts` | 品牌 Token 汇总导出（数值与 02/12 一致） | 02 / 12 |
| `src/components/GmCard.tsx` | 玻璃卡片 | 03 · 3.3 |
| `src/components/GmAvatar.tsx` | 服务对象首字头像（rose/mint/purple 渐变） | 03 · 3.4.2 |
| `src/components/GmProgress.tsx` | 线性/环形进度（品牌渐变或薄荷正向） | 08 · 8.2.5 |
| `src/components/GmRiskPicker.tsx` | 妊娠风险五色单选（受控） | 02.10 / 15.2.10 |
| `src/components/GmClientCard.tsx` | 服务对象卡（头像 + 组合标签 + 摘要 + 操作） | 15.6.1 / 13 |
| `src/gm.css` | 主题覆盖（Arco 主色变量 → GoodMom 蜜桃粉） | 02.9 / 12.3 |

## 使用（示例）
```tsx
import { GmButton } from '@goodmom/gm-arco-ui';
import { GmStatusTag } from '@goodmom/gm-arco-ui';

<GmButton type="primary" size="large" long onClick={save}>保存并提交</GmButton>
<GmStatusTag semantic="attention">待随访</GmStatusTag>
<GmStatusTag five="m3">橙 · 较高风险</GmStatusTag>
```

## 路线图（按 00 总目录推进）
1. ✅ Button / StatusTag / 业务字典 / Card / Avatar / Progress
2. ✅ 领域组件：服务对象卡（GmClientCard）、五色单选（GmRiskPicker）
3. ⏳ Tag 字典表格、随访队列表格（07/13）、Form 包装
4. ⏳ 筛查 Steps、转诊状态链、生命周期轴、生长曲线卡（13）
5. ⏳ Arco 依赖安装后 typecheck/build 验证（npm install && npm run gm:typecheck）

> 说明：本封装层不内置 Arco 源码；以 npm 依赖方式使用。

## 拉取 Arco（需可访问 GitHub / npm 的网络环境）
```bash
# 方式 A：源码参考（本封装层只需 API 参考，不内置源码）
git clone --depth 1 https://github.com/arco-design/arco-design.git
# 方式 B：仅安装依赖（推荐用于构建本库）
cd gm-arco-ui && npm i @arco-design/web-react react react-dom
npm i -D typescript @types/react @types/react-dom
npm run typecheck && npm run build
```

## Arco ↔ GoodMom API 基线（已按官方文档校准，封装以此为准）
| GoodMom 层 | Arco 透传 | 说明 |
| --- | --- | --- |
| GmButton.type | `Button.type` primary/secondary/outline/dashed/text/default | 03 · 3.2.4 |
| GmButton.status | `Button.status` default/success/warning/danger | 语义色由 gm.css 主题覆盖 |
| GmButton.size | mini/small/default/large | 28/32/40/48 |
| GmButton.shape | round/circle/square | — |
| GmButton.long | 全宽 | 底部主行动 |
| GmStatusTag | `Tag color`（支持自定义 hex）+ `size` | 六语义/五色字典见 tokens/status.ts |
| 主题 | Arco css 变量 `--primary-6` 等 + gm.css 渐变类 | 02.9/12.3 |

> 当前沙箱网络受限（GitHub/npm 均不可达），请在可联网环境按上述命令安装依赖后 `npm run build` 继续封装。
