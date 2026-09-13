/**
 * 健康档案 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "archive",
  title: "健康档案",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "服务对象主档（孕妇/儿童统一抽象）",
  "建档与档案状态流转",
  "档案检索与筛选",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  已建档: "info",
  待完善: "attention",
  管理中: "info",
  已归档: "neutral",
  已迁出: "neutral",
  暂停管理: "special",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/archive/clients",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** Client 服务对象 */
  Client?: unknown;
  /** ArchiveQuery 检索条件 */
  ArchiveQuery?: unknown;
  /** ArchiveDetail 档案详情 */
  ArchiveDetail?: unknown;
}
