/**
 * 医护工作台 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "workbench",
  title: "医护工作台",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "今日待办视图（跨模块任务的只读聚合）",
  "接诊/随访执行入口",
  "个人工作统计",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  待处理: "attention",
  进行中: "info",
  即将到期: "attention",
  已逾期: "attention",
  已接诊: "info",
  待反馈: "attention",
  已反馈: "positive",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/workbench/today",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** TodayBrief 今日概览 */
  TodayBrief?: unknown;
  /** WorkloadItem 待办项 */
  WorkloadItem?: unknown;
}
