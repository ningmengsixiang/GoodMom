/**
 * 机构运营 —— 接口契约（19.2）
 *
 * 模块只声明"要什么"，不自己 fetch：统一走 `shared/api/client`，
 * 于是超时 / 401 / 403 / 5xx 的错误三通道只有一份实现，页面拿到即可渲染。
 * 离线演示期由 `shared/api/mock.ts` 供数；配置 `VITE_API_BASE` 后自动走真实网关。
 */
export const endpoints = {
  /** 机构运营页：科室与人员 + 医生排班 + 服务量统计（机构维度聚合） */
  institution_overview: "/institution/overview",
} as const;
