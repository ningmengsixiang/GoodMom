/**
 * 孕期管理 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "pregnancy",
  title: "孕期管理",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "孕周与预产期换算",
  "产检计划（13.3.2）",
  "妊娠风险五色分级（02.10）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  待筛查: "neutral",
  筛查中: "info",
  待复查: "attention",
  高风险: "risk",
  待转诊: "attention",
  已转诊: "special",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/pregnancy/home",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** PregnancyProfile 孕期档案 */
  PregnancyProfile?: unknown;
  /** AntenatalPlan 产检计划 */
  AntenatalPlan?: unknown;
}
