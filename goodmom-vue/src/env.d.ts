/// <reference types="vite/client" />

/**
 * 仅声明样式模块；**.vue 不在此声明**——
 * vue-tsc 会为每个 SFC 生成真实类型（props / emits / slots），
 * 若这里再加一条 `declare module "*.vue"` 兜底声明，会覆盖真实类型，
 * 导致消费方拿到的组件 props 全是 any（vue-tsc 会报 TS2300 重复标识符）。
 */
declare module "*.css";
