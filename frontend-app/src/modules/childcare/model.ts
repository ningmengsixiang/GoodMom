/**
 * 儿童保健 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "childcare",
  title: "儿童保健",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "月龄与体检计划",
  "五健检查（视力/口腔/听力/心理/体格）",
  "儿保结论与建议",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  未见异常: "positive",
  可疑: "attention",
  异常: "risk",
  待补检: "attention",
  未出结果: "neutral",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/childcare/visits",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** ChildProfile 儿童档案 */
  ChildProfile?: unknown;
  /** FiveHealth 五健结论 */
  FiveHealth?: unknown;
}
