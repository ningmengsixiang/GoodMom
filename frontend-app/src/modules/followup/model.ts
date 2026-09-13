/**
 * 随访队列 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "followup",
  title: "随访队列",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "随访任务状态机",
  "队列排序（风险优先 + 逾期置顶）",
  "随访闭环（含失访处置）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  待随访: "attention",
  随访中: "info",
  已结案: "neutral",
  未随访: "neutral",
  拒绝随访: "attention",
  无法联系: "attention",
  待再次随访: "attention",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/followup/tasks",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** FollowupTask 随访任务 */
  FollowupTask?: unknown;
  /** QueueQuery 队列查询 */
  QueueQuery?: unknown;
}
