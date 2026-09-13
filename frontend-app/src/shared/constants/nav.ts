/**
 * 主导航登记（19.5 模块边界 + 10.3 三端形态）
 *
 * 规则：
 *  · `module` 必须是 `@/modules/<name>` 里的**已声明模块**（边界门禁核对）；
 *  · 移动端 TabBar 只取 `mobile: true` 的前 4 项（10.3.2 规定 3–5 项）；
 *  · 图标名走 09 章 `lg-icon-*`，这里只登记名字，渲染由 layout 决定。
 */
export interface NavItem {
  module: string;
  path: string;
  label: string;
  icon: string;
  mobile?: boolean;
}

export const NAV: NavItem[] = [
  { module: "workbench", path: "/workbench", label: "今日待办", icon: "lg-icon-vital", mobile: true },
  { module: "archive", path: "/archive", label: "健康档案", icon: "lg-icon-user", mobile: true },
  { module: "followup", path: "/followup", label: "随访队列", icon: "lg-icon-bell", mobile: true },
  { module: "dashboard", path: "/dashboard", label: "数据中心", icon: "lg-icon-chart", mobile: true },
  { module: "pregnancy", path: "/pregnancy", label: "孕期管理", icon: "lg-icon-vital" },
  { module: "childcare", path: "/childcare", label: "儿童保健", icon: "lg-icon-growth" },
  { module: "vaccine", path: "/vaccine", label: "疫苗接种", icon: "lg-icon-vaccine" },
  { module: "institution", path: "/institution", label: "机构运营", icon: "lg-icon-org" },
];
