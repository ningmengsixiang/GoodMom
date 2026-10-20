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
export { default as GmTable } from "./components/GmTable";
export type { GmTableProps, GmTableColumn } from "./components/GmTable";
export { default as GmCollapse } from "./components/GmCollapse";
export type { GmCollapseProps, GmFoldItem } from "./components/GmCollapse";
export { default as GmDescriptions } from "./components/GmDescriptions";
export type { GmDescriptionsProps, GmDescItem } from "./components/GmDescriptions";
export { default as GmModal } from "./components/GmModal";
export type { GmModalProps } from "./components/GmModal";
export { default as GmPopconfirm } from "./components/GmPopconfirm";
export type { GmPopconfirmProps } from "./components/GmPopconfirm";
export { default as GmPopover } from "./components/GmPopover";
export type { GmPopoverProps } from "./components/GmPopover";
export { default as GmTooltip } from "./components/GmTooltip";
export type { GmTooltipProps } from "./components/GmTooltip";
export { default as GmGrowthCard } from "./components/GmGrowthCard";
export type { GmGrowthCardProps, GmGrowthData, GmGrowthAdvisory, GmGrowthRange } from "./components/GmGrowthCard";
export { default as GmNavBar } from "./components/GmNavBar";
export type { GmNavBarProps } from "./components/GmNavBar";
export { default as GmTabBar } from "./components/GmTabBar";
export type { GmTabBarProps, GmTabBarItem } from "./components/GmTabBar";
export { default as GmBottomSheet } from "./components/GmBottomSheet";
export type { GmBottomSheetProps } from "./components/GmBottomSheet";
export { default as GmActionSheet } from "./components/GmActionSheet";
export type { GmActionSheetProps, GmActionSheetItem } from "./components/GmActionSheet";
export { default as GmCell } from "./components/GmCell";
export type { GmCellProps } from "./components/GmCell";
export { default as GmSearchBar } from "./components/GmSearchBar";
export type { GmSearchBarProps } from "./components/GmSearchBar";
export { default as GmPullRefresh } from "./components/GmPullRefresh";
export type { GmPullRefreshProps } from "./components/GmPullRefresh";
export { default as GmLoadMore } from "./components/GmLoadMore";
export type { GmLoadMoreProps } from "./components/GmLoadMore";
export { default as GmSwipeAction } from "./components/GmSwipeAction";
export type { GmSwipeActionProps, GmSwipeActionItem } from "./components/GmSwipeAction";
export { default as GmPicker } from "./components/GmPicker";
export type { GmPickerProps } from "./components/GmPicker";
export { default as GmCalendar } from "./components/GmCalendar";
export type { GmCalendarProps } from "./components/GmCalendar";
export { default as GmStepper } from "./components/GmStepper";
export type { GmStepperProps } from "./components/GmStepper";
export { default as GmOTP } from "./components/GmOTP";
export type { GmOTPProps } from "./components/GmOTP";
export { default as GmNumberKeyboard } from "./components/GmNumberKeyboard";
export type { GmNumberKeyboardProps } from "./components/GmNumberKeyboard";
export { default as GmNoticeBar } from "./components/GmNoticeBar";
export type { GmNoticeBarProps } from "./components/GmNoticeBar";
export { default as GmImageViewer } from "./components/GmImageViewer";
export type { GmImageViewerProps } from "./components/GmImageViewer";
export { default as GmErrorBlock } from "./components/GmErrorBlock";
export type { GmErrorBlockProps } from "./components/GmErrorBlock";
export { default as GmSafeArea } from "./components/GmSafeArea";
export type { GmSafeAreaProps } from "./components/GmSafeArea";
export { default as GmSticky } from "./components/GmSticky";
export type { GmStickyProps } from "./components/GmSticky";
export { default as GmWaterMark } from "./components/GmWaterMark";
export type { GmWaterMarkProps } from "./components/GmWaterMark";
export { default as GmFooter } from "./components/GmFooter";
export type { GmFooterProps, GmFooterLink } from "./components/GmFooter";
export { default as GmCapsuleTabs } from "./components/GmCapsuleTabs";
export type { GmCapsuleTabsProps, GmCapsuleTabItem } from "./components/GmCapsuleTabs";
export { default as GmSelector } from "./components/GmSelector";
export type { GmSelectorProps, GmSelectorItem } from "./components/GmSelector";
export { default as GmPregnancyCard } from "./components/GmPregnancyCard";
export type {
  GmPregnancyCardProps,
  GmPregnancyTask,
  GmPregnancyMilestone,
} from "./components/GmPregnancyCard";
export { default as GmCheckupPlan } from "./components/GmCheckupPlan";
export type { GmCheckupPlanProps, GmCheckupItem } from "./components/GmCheckupPlan";
export { default as GmVaccinePlan } from "./components/GmVaccinePlan";
export type { GmVaccinePlanProps, GmVaccineItem } from "./components/GmVaccinePlan";
export { default as GmChildCheckup } from "./components/GmChildCheckup";
export type { GmChildCheckupProps, GmChildCheckupItem } from "./components/GmChildCheckup";
export { default as GmBabyCard } from "./components/GmBabyCard";
export type { GmBabyCardProps, GmBabyMetric } from "./components/GmBabyCard";
export { default as GmRecordFlow } from "./components/GmRecordFlow";
export type { GmRecordFlowProps, GmRecordLog } from "./components/GmRecordFlow";
export { default as GmBirthPrep } from "./components/GmBirthPrep";
export type { GmBirthPrepProps, GmBirthPrepItem } from "./components/GmBirthPrep";
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
