import type { App, Plugin } from "vue";

/**
 * 样式副作用导入：base（Token/语义变量）→ components（组件视觉），顺序不可调换。
 * 构建后被合并进 dist/style.css；消费方显式 `import "@goodmom/vue/style.css"` 亦可。
 */
import "./styles/index.css";

import GmAvatar from "./components/GmAvatar.vue";
import GmButton from "./components/GmButton.vue";
import GmButtonGroup from "./components/GmButtonGroup.vue";
import GmCard from "./components/GmCard.vue";
import GmCascader from "./components/GmCascader.vue";
import GmClientCard from "./components/GmClientCard.vue";
import GmEmpty from "./components/GmEmpty.vue";
import GmLink from "./components/GmLink.vue";
import GmProgress from "./components/GmProgress.vue";
import GmResponsiveView from "./components/GmResponsiveView.vue";
import GmRiskPicker from "./components/GmRiskPicker.vue";
import GmResult from "./components/GmResult.vue";
import GmToast from "./components/GmToast.vue";
import GmSkeleton from "./components/GmSkeleton.vue";
import GmSpin from "./components/GmSpin.vue";
import GmStatusTag from "./components/GmStatusTag.vue";
import GmSteps from "./components/GmSteps.vue";
import GmTag from "./components/GmTag.vue";
import GmVirtualList from "./components/GmVirtualList.vue";
import GmTable from "./components/GmTable.vue";
import GmCollapse from "./components/GmCollapse.vue";
import GmDescriptions from "./components/GmDescriptions.vue";
import GmModal from "./components/GmModal.vue";
import GmPopconfirm from "./components/GmPopconfirm.vue";
import GmPopover from "./components/GmPopover.vue";
import GmTooltip from "./components/GmTooltip.vue";
import GmGrowthCard from "./components/GmGrowthCard.vue";
import GmNavBar from "./components/GmNavBar.vue";
import GmTabBar from "./components/GmTabBar.vue";
import GmBottomSheet from "./components/GmBottomSheet.vue";
import GmActionSheet from "./components/GmActionSheet.vue";
import GmCell from "./components/GmCell.vue";
import GmSearchBar from "./components/GmSearchBar.vue";
import GmPullRefresh from "./components/GmPullRefresh.vue";
import GmLoadMore from "./components/GmLoadMore.vue";
import GmSwipeAction from "./components/GmSwipeAction.vue";
import GmPicker from "./components/GmPicker.vue";
import GmCalendar from "./components/GmCalendar.vue";
import GmStepper from "./components/GmStepper.vue";
import GmOTP from "./components/GmOTP.vue";
import GmNumberKeyboard from "./components/GmNumberKeyboard.vue";
import GmNoticeBar from "./components/GmNoticeBar.vue";
import GmImageViewer from "./components/GmImageViewer.vue";
import GmErrorBlock from "./components/GmErrorBlock.vue";
import GmSafeArea from "./components/GmSafeArea.vue";
import GmSticky from "./components/GmSticky.vue";
import GmWaterMark from "./components/GmWaterMark.vue";
import GmFooter from "./components/GmFooter.vue";
import GmCapsuleTabs from "./components/GmCapsuleTabs.vue";
import GmSelector from "./components/GmSelector.vue";
import GmPregnancyCard from "./components/GmPregnancyCard.vue";
import GmCheckupPlan from "./components/GmCheckupPlan.vue";
import GmVaccinePlan from "./components/GmVaccinePlan.vue";
import GmChildCheckup from "./components/GmChildCheckup.vue";
import GmBabyCard from "./components/GmBabyCard.vue";
import GmRecordFlow from "./components/GmRecordFlow.vue";
import GmBirthPrep from "./components/GmBirthPrep.vue";

/** 全量组件表（用于 app.use 全局注册，键名即模板标签名） */
export const components = {
  GmAvatar,
  GmButton,
  GmButtonGroup,
  GmCard,
  GmCascader,
  GmClientCard,
  GmEmpty,
  GmLink,
  GmProgress,
  GmResponsiveView,
  GmRiskPicker,
  GmResult,
  GmToast,
  GmSkeleton,
  GmSpin,
  GmStatusTag,
  GmSteps,
  GmTag,
  GmVirtualList,
  GmTable,
  GmCollapse,
  GmDescriptions,
  GmModal,
  GmPopconfirm,
  GmPopover,
  GmTooltip,
  GmGrowthCard,
  GmNavBar,
  GmTabBar,
  GmBottomSheet,
  GmActionSheet,
  GmCell,
  GmSearchBar,
  GmPullRefresh,
  GmLoadMore,
  GmSwipeAction,
  GmPicker,
  GmCalendar,
  GmStepper,
  GmOTP,
  GmNumberKeyboard,
  GmNoticeBar,
  GmImageViewer,
  GmErrorBlock,
  GmSafeArea,
  GmSticky,
  GmWaterMark,
  GmFooter,
  GmCapsuleTabs,
  GmSelector,
  GmPregnancyCard,
  GmCheckupPlan,
  GmVaccinePlan,
  GmChildCheckup,
  GmBabyCard,
  GmRecordFlow,
  GmBirthPrep,
} as const;

export const version = "0.1.0";

/**
 * 全量注册插件：
 * ```ts
 * import { createApp } from "vue";
 * import GoodMomVue from "@goodmom/vue";
 * import "@goodmom/vue/style.css";
 *
 * createApp(App).use(GoodMomVue).mount("#app");
 * ```
 * ⚠️ 全量注册会让所有组件进入产物；生产项目**推荐按需具名导入**
 * （`import { GmButton } from "@goodmom/vue"` + 摇树），仅原型/内部工具用全量注册。
 */
const GoodMomVue: Plugin = {
  install(app: App) {
    for (const [name, comp] of Object.entries(components)) {
      app.component(name, comp);
    }
  },
};

export default GoodMomVue;

/* ── 具名组件导出（推荐用法：支持 tree-shaking） ───────────────────── */
export {
  GmAvatar,
  GmButton,
  GmButtonGroup,
  GmCard,
  GmCascader,
  GmClientCard,
  GmEmpty,
  GmLink,
  GmProgress,
  GmResponsiveView,
  GmResult,
  GmRiskPicker,
  GmSkeleton,
  GmSpin,
  GmStatusTag,
  GmSteps,
  GmTag,
  GmToast,
  GmVirtualList,
  GmTable,
  GmCollapse,
  GmDescriptions,
  GmModal,
  GmPopconfirm,
  GmPopover,
  GmTooltip,
  GmGrowthCard,
  GmNavBar,
  GmTabBar,
  GmBottomSheet,
  GmActionSheet,
  GmCell,
  GmSearchBar,
  GmPullRefresh,
  GmLoadMore,
  GmSwipeAction,
  GmPicker,
  GmCalendar,
  GmStepper,
  GmOTP,
  GmNumberKeyboard,
  GmNoticeBar,
  GmImageViewer,
  GmErrorBlock,
  GmSafeArea,
  GmSticky,
  GmWaterMark,
  GmFooter,
  GmCapsuleTabs,
  GmSelector,
  GmPregnancyCard,
  GmCheckupPlan,
  GmVaccinePlan,
  GmChildCheckup,
  GmBabyCard,
  GmRecordFlow,
  GmBirthPrep,
};

/* ── Token / 业务字典 / i18n ─────────────────────────────────────── */
export { DesignTokens, type GmTheme } from "./tokens/design";
export {
  SEMANTIC_COLOR,
  SEMANTIC_VAR,
  SEMANTIC_LABEL,
  FIVE_COLOR,
  FIVE_VAR,
  SEMANTIC_CSS_SUFFIX,
  type GmSemantic,
  type GmFive,
} from "./tokens/status";
export { semanticOf, isRiskLike, BUSINESS_LABELS } from "./tokens/business";
export { DICT, t, createT, type GmLang, type GmKey } from "./i18n";

/* ── 组件公共类型（消费方无需深入源码目录） ───────────────────────── */
export type { GmCascaderOption } from "./components/GmCascader.vue";
export type { GmResponsiveMode, GmResolvedMode } from "./components/GmResponsiveView.vue";
export type { GmVirtualListProps } from "./components/GmVirtualList.vue";
export type { GmTableProps, GmTableColumn } from "./components/GmTable.vue";
export type { GmFoldItem } from "./components/GmCollapse.vue";
export type { GmDescItem } from "./components/GmDescriptions.vue";
export type { GmGrowthCardProps, GmGrowthData, GmGrowthAdvisory, GmGrowthRange } from "./components/GmGrowthCard.vue";
export type { GmTabBarItem } from "./components/GmTabBar.vue";
export type { GmActionSheetItem } from "./components/GmActionSheet.vue";
export type { GmSwipeActionItem } from "./components/GmSwipeAction.vue";
export type { GmFooterLink } from "./components/GmFooter.vue";
export type { GmCapsuleTabItem } from "./components/GmCapsuleTabs.vue";
export type { GmSelectorItem } from "./components/GmSelector.vue";
export type {
  GmPregnancyTask,
  GmPregnancyMilestone,
} from "./components/GmPregnancyCard.vue";
export type { GmCheckupItem } from "./components/GmCheckupPlan.vue";
export type { GmVaccineItem } from "./components/GmVaccinePlan.vue";
export type { GmChildCheckupItem } from "./components/GmChildCheckup.vue";
export type { GmBabyMetric } from "./components/GmBabyCard.vue";
export type { GmRecordLog } from "./components/GmRecordFlow.vue";
export type { GmBirthPrepItem } from "./components/GmBirthPrep.vue";
