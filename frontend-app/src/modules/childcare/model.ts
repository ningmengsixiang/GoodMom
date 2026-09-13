/**
 * 儿童保健 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 *
 * 字段出处（严格照抄，不增不减）：
 *  · 月龄节点轴 1/3/6/8/12/18/24/36、已完成节点 = 结果摘要（身高/体重/头围 + 百分位 chip）、
 *    异常节点 = 「本次随访建议复查」气泡 → 13.3.4 儿保体检卡（月龄节点）。
 *  · 六项保健清单 = 生长发育 / 营养喂养 / 心理行为发育 / 视力保健 / 听力保健 / 口腔保健，
 *    行 = 图标 + 项目名 + 口径说明 + 状态标签，异常项进高危儿队列 → 13.3.8。
 *  · 口径说明与图标名取自 09 章 H 类图标表（13.3.8 原文：“图标用 H 类（lg-icon-wj-*，09）”）。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "childcare",
  title: "儿童保健",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "月龄与体检计划（1/3/6/8/12/18/24/36 月龄节点轴）",
  "六项保健清单（生长发育/营养喂养/心理行为发育/视力保健/听力保健/口腔保健）",
  "儿保结论与建议（含高危儿 / 重点随访队列入口标记）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  正常: "positive",
  未见异常: "positive",
  可疑: "attention",
  异常: "risk",
  待补检: "attention",
  待复查: "attention",
  待转诊: "attention",
  未出结果: "neutral",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串）—— 必须与路由表 `/childcare` 一致 */
export const ROUTES = {
  root: "/childcare",
} as const;

/* ── 数据契约（13.3.4 / 13.3.8）────────────────────────────────────────── */

/** 月龄节点轴上的月龄点（13.3.4：1/3/6/8/12/18/24/36 月） */
export const NODE_MONTHS = [1, 3, 6, 8, 12, 18, 24, 36] as const;

/** 六项保健清单的键（13.3.8，顺序即展示顺序） */
export const CHECK_KEYS = ["growth", "nutrition", "develop", "vision", "hearing", "oral"] as const;
export type CheckKey = (typeof CHECK_KEYS)[number];

/** 已完成节点的结果摘要：身高 / 体重 / 头围 + 百分位（13.3.4） */
export interface GrowthResult {
  /** 身高 cm（13.5.1：医学数值字号 ≥13 且 tabular-nums） */
  heightCm: number;
  /** 体重 kg */
  weightKg: number;
  /** 头围 cm */
  headCm: number;
  /** 百分位 chip 文案，如 `P50` / `低于 P3`（13.3.4；标准来源见 13.5.2） */
  percentile: string;
}

/** 月龄节点（13.3.4） */
export interface GrowthNode {
  /** 月龄，取值见 NODE_MONTHS */
  month: number;
  /** 是否已完成（已到月龄未完成 → 15.2.3「待补检」；未到月龄 → 不挂状态标签） */
  done: boolean;
  /** 已完成节点的结果摘要 */
  result?: GrowthResult;
  /** 是否异常（异常节点圆点转 amber/danger，并在气泡里给建议） */
  abnormal?: boolean;
  /** 异常节点气泡文案（13.3.4：「本次随访建议复查」） */
  advice?: string;
}

/** 单项保健记录（13.3.8 行结构：图标 44 底 + 项目名 + 口径说明 + 状态标签） */
export interface FiveHealth {
  key: CheckKey;
  /** 项目名，取 13.3.8 六项原文 */
  name: string;
  /** 09 章 H 类图标名（lg-icon-wj-*） */
  icon: string;
  /** 口径说明（09 章 H 类图标表「对应业务项」列，不另造口径） */
  scope: string;
  /** 业务状态文案，必须是 15.2.3 已登记词 */
  status: string;
  /**
   * 是否已进入高危儿 / 重点随访队列（13.3.8：「异常项自动进入高危儿 / 重点随访队列」）。
   * 由数据源判定并给出，**页面不得按状态自行推断临床含义**。
   */
  highRisk: boolean;
}

/** 儿童档案（儿童以月龄计；不得复用孕期的孕周模型 —— 与 19.5 硬规则一致） */
export interface ChildProfile {
  childId: string;
  childName: string;
  /** 档案编号（15.3.2 档案词） */
  archiveNo: string;
  /** 当前月龄 */
  month: number;
}

/** 儿保体检页数据（13.3.4 节点轴 + 13.3.8 清单） */
export interface ChildcareVisit extends ChildProfile {
  nodes: GrowthNode[];
  checklist: FiveHealth[];
}

/** 对外契约：跨模块引用时只认这些类型（19.6 公共出口） */
export interface Contract {
  ChildProfile: ChildProfile;
  GrowthNode: GrowthNode;
  FiveHealth: FiveHealth;
  ChildcareVisit: ChildcareVisit;
}
