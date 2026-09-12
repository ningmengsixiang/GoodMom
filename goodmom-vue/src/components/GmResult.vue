<script setup lang="ts">
/**
 * GmResult —— 结果 / 错误页（规范 03 · 3.2.2 结果页、**Part 19 · EL-19-03**）
 *
 * ## 为什么补它（V2.9「状态与加载」深化最大的缺口）
 *
 * `Part 19 · EL-19-03` 明确要求「Error 三通道（色 + 文案 + 动作）」，`00-组件总目录`
 * 也已登记 **#40 Result 结果页**（移动端 11.2.10）—— 但**两个库里都没有实现**：
 * 出错时各页面只能自己拼一个红色文字块，"三通道"退化成单通道。
 *
 * ## 三通道怎么落
 *
 * | 通道 | 实现 |
 * | --- | --- |
 * | 色 | `gm-result--{status}` → `--lg-sem-*` 语义 alias（暗色档自动换浅档） |
 * | 文案 | `title` + `desc`（可理解的原因与下一步），**不给技术细节** |
 * | 动作 | `actionText` + emit `action`（如「稍后重试」「联系客服」） |
 *
 * ## 医疗场景纪律（EL-19-03 / 15 章）
 *
 * - **不暴露内部结构**：故**有意不提供 `code`/`stack` 类 prop**。要显示受理号等
 *   *用户可见* 编号，写进 `desc` 即可；错误码属内部结构，不应出现在界面上。
 * - `error` 用 `role="alert"`（需立刻被听到），其余 `role="status"`（polite）。
 *
 * 与 `GmEmpty` 的分工：**Empty = 没有数据但一切正常**；**Result = 操作有结论**。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 结论类型：success / error / warning / info */
    status?: "success" | "error" | "warning" | "info";
    /** 一句话结论 */
    title?: string;
    /** 补充说明：可理解的原因 + 用户可做的动作（禁技术堆栈） */
    desc?: string;
    /** 主行动文案；为空则不渲染按钮 */
    actionText?: string;
    /** 自定义图标（传入则覆盖默认状态图标；与 React 侧同 prop 名，仓库既有约定同 GmEmpty） */
    icon?: unknown;
    /** 无 title 时的读屏名称 */
    ariaLabel?: string;
  }>(),
  { status: "info", title: undefined, desc: undefined, actionText: undefined, icon: undefined, ariaLabel: undefined }
);

const emit = defineEmits<{ (e: "action"): void }>();

const role = computed(() => (props.status === "error" ? "alert" : "status"));
</script>

<template>
  <div
    :class="['gm-result', `gm-result--${status}`]"
    :role="role"
    :aria-label="title ? undefined : ariaLabel || '操作结果'"
  >
    <!-- 内置状态图标：24×24 / 1.7px 圆头（09 · 9.2），颜色由 CSS 继承语义 alias -->
    <span class="gm-result__ic" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" v-if="icon" />
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="status === 'error'">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v6" />
            <circle cx="12" cy="17" r=".9" />
          </template>
          <template v-else-if="status === 'warning'">
            <path d="M12 4.5 21 19.5H3z" />
            <path d="M12 10v4" />
            <circle cx="12" cy="17" r=".9" />
          </template>
          <template v-else-if="status === 'info'">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5.5" />
            <circle cx="12" cy="7.8" r=".9" />
          </template>
          <template v-else>
            <path d="M4.5 12.5l5 5L19.5 7" />
          </template>
        </svg>
      </slot>
    </span>
    <div v-if="title" class="gm-result__t">{{ title }}</div>
    <div v-if="desc" class="gm-result__d">{{ desc }}</div>
    <button v-if="actionText" type="button" class="gm-result__act" @click="emit('action')">
      {{ actionText }}
    </button>
    <slot />
  </div>
</template>
