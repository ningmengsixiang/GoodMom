/**
 * 主导航登记（19.5 模块边界 + 10.3 三端形态）
 *
 * 规则：
 *  · `module` 必须是 `@/modules/<name>` 里的**已声明模块**（边界门禁核对）；
 *  · 移动端 TabBar 只取 `mobile: true` 的前 4 项（10.3.2 规定 3–5 项）；
 *  · 图标名走 09 章 `lg-icon-*`，这里只登记名字，渲染由 layout 决定。
 */
export interface NavItem {
  module: NavModule;
  path: string;
  label: string;
  icon: string;
  mobile?: boolean;
}

/**
 * 已声明模块名（19.5.1 的九个模块）—— 收窄成联合类型，让"导航项漏登记"变成
 * 编译期错误：account 的权限矩阵按模块名建表（`Record<NavModule, …>`），
 * 新增导航项却忘了给权限行时 `tsc` 直接红，而不是界面上静默少一行。
 */
export type NavModule =
  | "workbench" | "archive" | "followup" | "dashboard" | "pregnancy"
  | "childcare" | "vaccine" | "institution" | "account";

export const NAV: NavItem[] = [
  { module: "workbench", path: "/workbench", label: "今日待办", icon: "lg-icon-vital", mobile: true },
  { module: "archive", path: "/archive", label: "健康档案", icon: "lg-icon-user", mobile: true },
  { module: "followup", path: "/followup", label: "随访队列", icon: "lg-icon-bell", mobile: true },
  { module: "dashboard", path: "/dashboard", label: "数据中心", icon: "lg-icon-chart", mobile: true },
  { module: "pregnancy", path: "/pregnancy", label: "孕期管理", icon: "lg-icon-vital" },
  { module: "childcare", path: "/childcare", label: "儿童保健", icon: "lg-icon-growth" },
  { module: "vaccine", path: "/vaccine", label: "疫苗接种", icon: "lg-icon-vaccine" },
  { module: "institution", path: "/institution", label: "机构运营", icon: "lg-icon-org" },
  /* account 不设 mobile：移动端 TabBar 取 `mobile: true` 的前 4 项（10.3.2 规定 3–5 项），
     账号与权限属于低频设置类入口，不进底部 TabBar（19.5 / 10.3.2）。 */
  { module: "account", path: "/account", label: "账号与权限", icon: "lg-icon-shield-check" },
];
