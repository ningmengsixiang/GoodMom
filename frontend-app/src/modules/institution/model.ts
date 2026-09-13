/**
 * 机构运营 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 *
 * 字段出处：
 *  · 科室与人员的称谓词（管理医生 / 建档机构 / 管理对象）→ 15.3.2 档案词 + 15.3.1 人员称谓；
 *  · 医生排班状态词 → 15.2.6 / 15.2.7 已登记词：已签到 / 服务中 / 已取消 / 已关闭；
 *  · 服务量指标名 → 15.3.4 数据大屏核心指标词表（儿童建档数 / 儿童体检人数 /
 *    生长发育异常 / 高危儿 / 视力异常 / 听力异常 / 随访完成率）。
 *    ⚠️ 「疫苗应种率」在 15.3.4 里**没有逐字登记**（最接近的是两癌列的「筛查覆盖率」），
 *    本模块与 dashboard 既有文案保持一致，疑义已在交付说明中标注。
 *
 * 边界（19.5.3 第 2 条）：机构侧**只看聚合**，不得读取个体健康数据。
 */
import type { GmSemantic } from "@/shared/domain/status";

export const MODULE = {
  name: "institution",
  title: "机构运营",
  owner: "机构管理员",
} as const;

/** 本模块**拥有**的数据域：别的模块只能通过公共出口读，不能直接建表/改状态 */
export const OWNS = [
  "机构与科室管理（科室 / 管理医生 / 建档机构）",
  "医生排班与工位",
  "服务量统计（机构维度的聚合指标）",
] as const;

/** 本模块用到的业务状态词 → 语义（与 15 章、business.ts 同源） */
export const STATUS: Record<string, GmSemantic> = {
  已签到: "info",
  服务中: "info",
  已取消: "neutral",
  已关闭: "neutral",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串）—— 必须与路由表 `/institution` 一致 */
export const ROUTES = {
  root: "/institution",
} as const;

/* ── 数据契约（15.3.1 / 15.3.2 / 15.3.4）───────────────────────────────── */

/** 科室（15.3.2 档案词：管理机构 / 建档机构 / 管理医生；15.3.1：管理对象） */
export interface OrgUnit {
  id: string;
  /** 科室名 */
  name: string;
  /** 管理医生（15.3.2 档案词，不用"负责医生/主治"等自造词） */
  manager: string;
  /** 建档机构（15.3.2 档案词） */
  archiveOrg: string;
  /** 在管人数（口径：管理对象数，15.3.1） */
  managed: number;
}

/** 医生排班（15.2.6 / 15.2.7 已登记状态词） */
export interface Shift {
  id: string;
  doctor: string;
  dept: string;
  /** 班次，如「上午 08:00–12:00」 */
  shift: string;
  /** 业务状态文案，必须是已登记词：已签到 / 服务中 / 已取消 / 已关闭 */
  status: string;
}

/** 服务量指标（指标名取 15.3.4 表；`kind` 只决定展示形态，不改口径） */
export interface ServiceMetric {
  /** 指标名，必须逐字取自 15.3.4 */
  name: string;
  value: number;
  unit: string;
  /** count = 计数（人）· rate = 率（%），率走 GmProgress */
  kind: "count" | "rate";
}

/** 机构运营页数据（科室与人员 + 医生排班 + 服务量统计） */
export interface InstitutionOverview {
  org: { id: string; name: string; level: string };
  depts: OrgUnit[];
  shifts: Shift[];
  metrics: ServiceMetric[];
}

/** 对外契约：跨模块引用时只认这些类型（19.6 公共出口） */
export interface Contract {
  OrgUnit: OrgUnit;
  Shift: Shift;
  ServiceMetric: ServiceMetric;
  InstitutionOverview: InstitutionOverview;
}
