/**
 * @goodmom/ui —— React + Arco 组件库入口
 *
 * 目录约定（P1-12 收口）：**全部组件都在 `src/components/`**。
 * 历史上 GmTag / GmSteps 放在 `src/adapters/`，而 Vue 包把所有组件都放在
 * `src/components/`，同一个组件在两个包里目录不同 —— 现已统一（adapters/ 已清空移除）。
 */
export { default as GmButton } from "./components/GmButton";
export type { GmButtonProps, GmButtonType, GmButtonStatus, GmButtonSize, GmButtonShape } from "./components/GmButton";
export { default as GmButtonGroup } from "./components/GmButtonGroup";
export type { GmButtonGroupProps, GmButtonGroupShape } from "./components/GmButtonGroup";
export { default as GmStatusTag } from "./components/GmStatusTag";
export { default as GmCard } from "./components/GmCard";
export { default as GmAvatar } from "./components/GmAvatar";
export { default as GmProgress } from "./components/GmProgress";
export { default as GmEmpty } from "./components/GmEmpty";
export { default as GmSpin } from "./components/GmSpin";
export { default as GmSkeleton } from "./components/GmSkeleton";
export { default as GmRiskPicker } from "./components/GmRiskPicker";
export { default as GmClientCard } from "./components/GmClientCard";
export { default as GmLink } from "./components/GmLink";
export { default as GmCascader } from "./components/GmCascader";
export { default as GmResponsiveView } from "./components/GmResponsiveView";
export { default as GmVirtualList } from "./components/GmVirtualList";
export * from "./tokens/status";
export * from "./tokens/business";
export { DesignTokens } from "./tokens/design";
export { default as GmToast } from "./components/GmToast";
export { default as GmResult } from "./components/GmResult";
export { default as GmTag } from "./components/GmTag";
export { default as GmSteps } from "./components/GmSteps";
export * from "./i18n";

/**
 * Arco 原生 Button 逃生口。
 *
 * GmButton 已改为**自包含实现**（与 @goodmom/vue 同契约、同 DOM、同 CSS）；
 * 需要 Arco 原生能力（如自定 icon 组件、Arco 特有属性）时从这里取，
 * 不要再去改 GmButton 的契约 —— 那会让两个库重新分叉。
 */
export { default as ArcoButton } from "@arco-design/web-react/es/Button";
export type { ButtonProps as ArcoButtonProps } from "@arco-design/web-react/es/Button";
