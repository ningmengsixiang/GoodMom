/**
 * 疫苗接种 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 *
 * ⚠️ 13.3.3 的原始状态词是「未到 / 可接种 / 已预约 / 已完成 / 延后」——
 * 其中 **未到 / 可接种 / 延后 在 15.2 里没有登记**，按 skill R4「新词先登记再使用」
 * 不许直接落到界面，故按下列映射改用已登记词（15.2.6 预约状态）：
 *
 *   13.3.3 原词      本模块状态词（15.2 已登记）   依据
 *   ────────────    ─────────────────────────    ──────────────────────────────
 *   可接种          待预约                        15.2.6（待预约 ⚪）
 *   已预约          已预约                        15.2.6（已预约 🔵）
 *   已完成          已完成                        15.2.6（已完成 🟢）
 *   逾期未种        已过期                        15.2.6（已过期 🟠 → 任务级）
 *   未到（月龄）    **不给状态**                   15.2 无对应登记词 → 页面用灰字说明，
 *                                                 不挂状态标签（更不许自造「未到月龄」标签）
 *
 * 字段出处：按月龄时间线（疫苗徽章 + 疫苗名 + 应种月龄 + 状态）、机构端覆盖率统计条
 * + 到期未种名单（红字行 + 一键随访）、到期前 3 天提醒 → 13.3.3。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "vaccine",
  title: "疫苗接种",
  owner: "医护侧",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "免疫规划计划（按月龄时间线）",
  "接种记录与凭证",
  "逾期召回名单（到期未种）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源；映射依据见文件头） */
export const STATUS: Record<string, GmSemantic> = {
  待预约: "neutral",
  已预约: "info",
  已完成: "positive",
  已过期: "attention",
};

/** 时间线节点/名单行可用的状态词（缺省 = 未到月龄，不挂标签） */
export type VaccineStatus = "待预约" | "已预约" | "已完成" | "已过期";

/** 路由（app/routes.tsx 引用；页面禁写路径字符串）—— 必须与路由表 `/vaccine` 一致 */
export const ROUTES = {
  root: "/vaccine",
} as const;

/* ── 数据契约（13.3.3）──────────────────────────────────────────────────── */

/** 疫苗计划节点：疫苗徽章 + 疫苗名 + 应种月龄 + 状态（13.3.3） */
export interface VaccineItem {
  id: string;
  /** 疫苗名（13.3.3 只给"疫苗徽章"形态；疫苗名与 13.3.2 同口径，沿用仓内「乙肝疫苗第 2 剂」命名） */
  vaccine: string;
  /** 剂次，如「第 1 剂」 */
  dose: string;
  /** 应种月龄 */
  month: number;
  /** 缺省表示未到月龄（15.2 无登记词，页面用灰字说明而不是标签） */
  status?: VaccineStatus;
  /** 已完成：接种日期 */
  doneAt?: string;
  /** 已预约 / 待预约 / 已过期：应种（到期）日期 */
  dueAt?: string;
}

/** 到期前 3 天提醒（13.3.3） */
export interface VaccineReminder {
  vaccine: string;
  dose: string;
  month: number;
  /** 到期日（页面用 `dueText` 换算成"剩余 N 天"） */
  dueAt: string;
}

/** 机构端覆盖率统计条（13.3.3：覆盖率统计条 + 到期未种名单） */
export interface VaccineCoverage {
  /** 应种率/覆盖率百分比（0–100） */
  rate: number;
  /** 已接种剂次 */
  done: number;
  /** 应种剂次 */
  should: number;
}

/** 到期未种名单行（13.3.3：红字行，一键随访） */
export interface OverdueCase {
  id: string;
  childId: string;
  childName: string;
  vaccine: string;
  dose: string;
  /** 应种月龄 */
  month: number;
  /** 应种（到期）日期，逾期天数由 `dueText` 换算 */
  dueAt: string;
  status: VaccineStatus;
}

/** 疫苗计划页数据（13.3.3 双端视图） */
export interface VaccinePlan {
  childId: string;
  childName: string;
  /** 档案编号（15.3.2 档案词） */
  archiveNo: string;
  /** 当前月龄 */
  month: number;
  reminder?: VaccineReminder | null;
  items: VaccineItem[];
  coverage: VaccineCoverage;
  overdue: OverdueCase[];
}

/** 对外契约：跨模块引用时只认这些类型（19.6 公共出口） */
export interface Contract {
  VaccinePlan: VaccinePlan;
  VaccineItem: VaccineItem;
  VaccineCoverage: VaccineCoverage;
  OverdueCase: OverdueCase;
}
