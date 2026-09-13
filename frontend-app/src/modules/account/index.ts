/**
 * 账号与权限 —— **公共出口**（19.6）
 *
 * 只有这里导出的东西允许被其它模块或 app 引用。模块内部（pages/ components/ hooks/）
 * 对外部是不存在的 —— 边界门禁 `scripts/check-module-boundary.py` 会拦下任何深链。
 */
export * from "./model";
export { endpoints } from "./api";
export { default as AccountSessionPage } from "./pages/AccountSessionPage";
/* 注：`pages/ModulePlaceholderPage.tsx` 保留在模块内，作为后续新模块的交付脚手架
   （它不属于 account 的契约面，故不从公共出口导出；四个待排期模块本次均已落成真实页面）。 */
