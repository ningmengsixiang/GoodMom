/**
 * 路由表（19.5）
 *
 * 约定：
 *  · 每个路由必须显式声明它属于哪个 `module`，以及需要的 `role`；
 *  · 页面组件一律从**模块公共出口** `@/modules/<name>` 导入，
 *    禁止深链到模块内部文件（边界门禁会拦）；
 *  · 标题进入壳的顶栏，不在页面里再写一遍 h1。
 */
import React from "react";
import type { Role } from "@/shared/session";
import RequireRole from "@/app/guards/RequireRole";
import { useRouter } from "@/shared/router";

/* 模块公共出口（唯一允许的跨模块引用形态） */
import { WorkbenchTodayPage } from "@/modules/workbench";
import { ArchiveListPage, ArchiveDetailPage } from "@/modules/archive";
import { FollowupQueuePage } from "@/modules/followup";
import { PregnancyHomePage } from "@/modules/pregnancy";
import { DashboardPage } from "@/modules/dashboard";
import { ChildcareVisitPage } from "@/modules/childcare";
import { VaccinePlanPage } from "@/modules/vaccine";
import { InstitutionOverviewPage } from "@/modules/institution";
import { AccountSessionPage } from "@/modules/account";
import ComponentPreview from "@/dev/ComponentPreview";

export interface RouteDef {
  path: string;
  module: string;
  title: string;
  sub?: string;
  role?: Role | Role[];
  render: (params: Record<string, string>) => React.ReactElement;
}

export const ROUTES: RouteDef[] = [
  { path: "/workbench", module: "workbench", title: "今日待办", sub: "医护工作台 · 当日随访与接诊",
    render: () => <WorkbenchTodayPage /> },
  { path: "/archive", module: "archive", title: "健康档案", sub: "孕期 / 儿童统一档案",
    render: () => <ArchiveListPage /> },
  { path: "/archive/:id", module: "archive", title: "档案详情",
    render: (p) => <ArchiveDetailPage id={p.id} /> },
  { path: "/followup", module: "followup", title: "随访队列", sub: "按风险分级排序 · 逾期置顶",
    render: () => <FollowupQueuePage /> },
  { path: "/dashboard", module: "dashboard", title: "数据中心", sub: "机构运营与妇幼指标",
    role: ["admin", "doctor"], render: () => <DashboardPage /> },
  { path: "/pregnancy", module: "pregnancy", title: "孕期管理", sub: "孕周 · 产检计划 · 妊娠风险",
    render: () => <PregnancyHomePage /> },
  { path: "/dev/preview", module: "dev", title: "组件演示", sub: "开发期页面 · 不进入生产导航",
    render: () => <ComponentPreview /> },
  { path: "/account", module: "account", title: "账号与权限", sub: "机构 · 角色 · 权限矩阵",
    render: () => <AccountSessionPage /> },
  { path: "/childcare", module: "childcare", title: "儿童保健", sub: "月龄节点轴 · 六项保健清单",
    render: () => <ChildcareVisitPage /> },
  { path: "/vaccine", module: "vaccine", title: "疫苗接种", sub: "按月龄时间线 · 到期未种召回",
    render: () => <VaccinePlanPage /> },
  { path: "/institution", module: "institution", title: "机构运营", sub: "科室 · 排班 · 服务量", role: "admin",
    render: () => <InstitutionOverviewPage /> },
];

/** 命中当前 hash 的路由（精确优先，其次带参路由） */
export function matchRoute(path: string): { def: RouteDef; params: Record<string, string> } | null {
  const cp = path.split("/").filter(Boolean);
  for (const def of ROUTES) {
    const pp = def.path.split("/").filter(Boolean);
    if (pp.length !== cp.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < pp.length; i++) {
      if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(cp[i]);
      else if (pp[i] !== cp[i]) { ok = false; break; }
    }
    if (ok) return { def, params };
  }
  return null;
}

/** 当前路由（未命中时回落到首个模块，避免白屏 —— 与站点外壳的失效 hash 回退同一纪律） */
export function useCurrentRoute(): { def: RouteDef; params: Record<string, string> } {
  const { path } = useRouter();
  return matchRoute(path) ?? { def: ROUTES[0], params: {} };
}

export default ROUTES;
