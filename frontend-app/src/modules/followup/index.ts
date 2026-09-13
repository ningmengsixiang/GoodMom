/**
 * 随访队列 —— **公共出口**（19.6）
 *
 * 只有这里导出的东西允许被其它模块或 app 引用。模块内部（pages/ components/ hooks/）
 * 对外部是不存在的 —— 边界门禁 `scripts/check-module-boundary.py` 会拦下任何深链。
 */
export * from "./model";
export { endpoints } from "./api";
export { default as FollowupQueuePage } from "./pages/FollowupQueuePage";
