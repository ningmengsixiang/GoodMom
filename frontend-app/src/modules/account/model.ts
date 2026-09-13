/**
 * 账号与权限 —— 模块模型与边界声明（19.5）
 *
 * 本文件是模块的**契约面**：拥有什么数据、用哪些状态词、对外暴露什么。
 * 状态词一律取自 15 章已登记词（skill R4：新词先登记 business.ts 与 15 章再回来用），
 * 页面不得自造词、不得自判语义色。
 *
 * 本模块拥有的三件东西（19.5.1「account 拥有：机构信息、登录会话、角色与权限点」）：
 *  1. 机构信息（名称 / 等级 / 科室）—— 会话里的机构来自 `shared/session`（平台能力），
 *     科室列表由本模块的 `/account/session` 提供（`Institution` 契约里没有科室字段，
 *     不为了展示而给它加字段）；
 *  2. 登录会话与令牌（页面只读，不落 localStorage）；
 *  3. **权限矩阵**（角色 × 模块）—— 见下方 `PERMISSION_TABLE`，它是本模块拥有的契约表，
 *     不入接口（接口只回会话与科室），其它模块要判可见性请调 `shared/session` 的 `can()`，
 *     不要各自复制一张权限表。
 */
import type { GmSemantic } from "@/shared/domain/status";
import type { Role } from "@/shared/session";
import { NAV, type NavModule } from "@/shared/constants/nav";

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
  "权限矩阵（角色 × 模块，见 PERMISSION_TABLE）",
] as const;

/**
 * 账号 / 机构的审核状态词（15.2.1 档案状态 + 15.2.8 审核状态，均已登记）。
 * 当前页面未渲染它们 —— 账号列表页排期时直接用本表，避免届时又造一套词。
 * （保留非空是硬要求：边界门禁 B6 要求每个模块的 model.ts 声明 STATUS。）
 */
export const STATUS: Record<string, GmSemantic> = {
  正常: "positive",
  待审核: "attention",
  已审核: "positive",
  已注销: "neutral",
};

/** 路由（app/routes.tsx 引用；页面禁写路径字符串）—— 必须与路由表 `/account` 一致 */
export const ROUTES = {
  root: "/account",
} as const;

/* ── 角色与权限点（19.5）────────────────────────────────────────────────── */

/** 三档角色（与 shared/session 的 Role 同源，不另立枚举） */
export const ROLES: readonly Role[] = ["nurse", "doctor", "admin"] as const;

/** 角色显示名（界面文案；角色标识一律用 `Role` 的英文值） */
export const ROLE_LABEL: Record<Role, string> = {
  nurse: "护士",
  doctor: "医生",
  admin: "管理员",
};

/**
 * 权限矩阵：行 = 模块（NAV 登记项），列 = 护士 / 医生 / 管理员，值 = 是否可访问。
 *
 * 口径来源：19.5.1 各模块「归属」列 —— 医护侧模块只有护士/医生可进，
 * 机构管理员只进 `dashboard` 与 `institution`（19.5.3 第 2 条：机构侧只看聚合，
 * 因此管理员**不能**看到个体档案 / 随访队列）；`account` 是每个角色都要用的自身设置。
 * 与 `app/routes.tsx` 的 `role` 声明保持一致（本表是"可见性收敛"，服务端鉴权才是门）。
 *
 * 类型是 `Record<NavModule, …>`：新增导航项却忘了给权限行 → `tsc` 直接报错，
 * 而不是界面上静默少一行（这正是把矩阵放在契约面的意义）。
 */
export const PERMISSION_TABLE: Record<NavModule, Record<Role, boolean>> = {
  workbench: { nurse: true, doctor: true, admin: false },
  archive: { nurse: true, doctor: true, admin: false },
  followup: { nurse: true, doctor: true, admin: false },
  pregnancy: { nurse: true, doctor: true, admin: false },
  childcare: { nurse: true, doctor: true, admin: false },
  vaccine: { nurse: true, doctor: true, admin: false },
  dashboard: { nurse: false, doctor: true, admin: true },
  institution: { nurse: false, doctor: false, admin: true },
  account: { nurse: true, doctor: true, admin: true },
};

/** 权限矩阵的一行（页面渲染用；从 NAV 派生，导航改了行也跟着改） */
export interface PermissionRow {
  module: NavModule;
  /** 模块显示名，取 NAV 的 label（导航与矩阵不会各说各话） */
  label: string;
  can: Record<Role, boolean>;
}

/** 按导航登记顺序产出矩阵行 —— 页面不得自己拼行名 */
export function permissionRows(): PermissionRow[] {
  return NAV.map((n) => ({ module: n.module, label: n.label, can: PERMISSION_TABLE[n.module] }));
}

/* ── 数据契约 ───────────────────────────────────────────────────────────── */

/** 会话接口返回的机构与科室（机构名/等级与会话同源，演示期一致） */
export interface AccountSession {
  role: Role;
  institution: { id: string; name: string; level: string };
  /** 机构下属科室（15.3.2「建档机构」口径下的科室名） */
  depts: string[];
}

/** 对外契约：跨模块引用时只认这些类型（19.6 公共出口） */
export interface Contract {
  AccountSession: AccountSession;
  PermissionRow: PermissionRow;
  Role: Role;
}
