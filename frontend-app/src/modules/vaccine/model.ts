/**
 * 疫苗接种 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "vaccine",
  title: "疫苗接种",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "免疫规划计划（按月龄）",
  "接种记录与凭证",
  "逾期召回名单",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  已预约: "info",
  已完成: "positive",
  待预约: "neutral",
  已过期: "attention",
  未到诊: "risk",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/vaccine/plan",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** VaccinePlan 计划 */
  VaccinePlan?: unknown;
  /** Vaccination 接种记录 */
  Vaccination?: unknown;
}
