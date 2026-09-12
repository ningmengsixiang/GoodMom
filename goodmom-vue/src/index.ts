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
  GmRiskPicker,
  GmSkeleton,
  GmSpin,
  GmStatusTag,
  GmSteps,
  GmTag,
  GmVirtualList,
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
