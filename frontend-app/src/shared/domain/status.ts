/**
 * 状态词与语义色的**唯一入口**（19.6 复用规则 / 14 · 4.4.5 / 15 章）
 *
 * 红线（skill R2/R3/R4）：
 *  · 页面禁止写裸 hex、禁止自己判断"什么状态是什么颜色"；
 *  · 业务状态一律 `<GmStatusTag>文案</GmStatusTag>`，颜色由 15 章词库查表得出；
 *  · 新状态词先登记 `goodmom-ui/src/tokens/business.ts`（+ 镜像）与 15 章，再来这里用。
 *
 * 本文件只做**转发与收窄**：不新增字典、不改色值。这样"词库改了但页面没跟上"这类
 * 静默漂移不可能发生 —— 全应用的语义色来源只有 `@goodmom/ui` 一处。
 */
export {
  SEMANTIC_COLOR,
  SEMANTIC_VAR,
  SEMANTIC_SOLID,
  SEMANTIC_LABEL,
  FIVE_COLOR,
  FIVE_VAR,
  varOf,
  semTint,
  semanticOf,
  isRiskLike,
  BUSINESS_LABELS,
} from "@goodmom/gm-arco-ui";
export type { GmSemantic, GmFive } from "@goodmom/gm-arco-ui";

import { SEMANTIC_VAR, type GmSemantic } from "@goodmom/gm-arco-ui";

/** 语义背景/描边的安全写法：只允许走 alias，暗色档自动换档（02 · 2.1.5） */
export const semanticCssVar = (sem: GmSemantic): string => SEMANTIC_VAR[sem];

/** 风险级 → 处置时限（15.2.10：红=当日 / 橙=24h / 黄=周内 / 绿=常规） */
export const RISK_SLA: Record<string, string> = {
  m5: "立即上报",
  m4: "当日处置",
  m3: "24 小时内复核",
  m2: "周内随访",
  m1: "常规随访",
};
