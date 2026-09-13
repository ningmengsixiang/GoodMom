/**
 * 账号与权限 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "account",
  title: "账号与权限",
  owner: "机构侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "机构信息（名称/等级/科室）",
  "登录会话与令牌",
  "角色与权限点（nurse/doctor/admin）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  正常: "positive",
  待审核: "attention",
  已审核: "positive",
  已注销: "neutral",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串） */
export const ROUTES = {
  root: "/account/session",
} as const;

/** 对外契约：跨模块引用时只认这些类型 */
export interface Contract {
  /** Institution 机构 */
  Institution?: unknown;
  /** Session 会话 */
  Session?: unknown;
  /** Role 角色 */
  Role?: unknown;
  /** Permission 权限点 */
  Permission?: unknown;
}
