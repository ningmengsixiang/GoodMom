/**
 * 跨模块共享的领域类型（19.5）
 *
 * 规则：**只有两个以上模块真正用到的类型才放这里**；单模块独占的类型写在
 * `modules/<name>/model.ts` 里，避免 shared 变成杂物间。
 */
import type { GmFive, GmSemantic } from "./status";

/** 服务对象（孕妇 / 儿童统一抽象，13 章 ClientCard 的数据形态） */
export interface Client {
  id: string;
  name: string;
  /** 档案号，如 MMH-2025-0102 */
  archiveNo: string;
  kind: "pregnant" | "child";
  /** 孕期：孕周；儿童：月龄 */
  stage: { week?: number; day?: number; month?: number };
  risk?: GmFive;
  status: string;
  manager?: string;
  avatarText?: string;
}

/** 随访任务（followup 模块拥有，workbench 只读引用） */
export interface FollowupTask {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  /** 业务状态文案，必须是 15 章登记过的词 */
  status: string;
  semantic: GmSemantic;
  dueAt: string;
  channel?: "电话" | "上门" | "线上";
}

/** 统一的"按状态取值"结果：状态词 → 语义/文案，避免各页各判一次 */
export interface StatusView {
  label: string;
  semantic: GmSemantic;
}
