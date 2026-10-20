<script setup lang="ts">
/**
 * GmErrorBlock —— 异常 / 空状态块（规范 11.6.9）
 *
 * 与 React 版同契约（四态 / 默认文案 / 重试逐项对应）：
 * 1. status 四态各有一套默认文案：error=加载失败、network=网络异常、
 *    permission=无访问权限、empty=暂无内容；title / description 传空时取默认。
 * 2. retryText 非空才渲染重试按钮（原生 button，44 热区由 CSS 给）。
 * 3. 图标是装饰性内联 SVG（aria-hidden），语义完全由标题 / 说明文字承担。
 */
type GmErrorStatus = "error" | "network" | "permission" | "empty";

const props = withDefaults(
  defineProps<{
    /** 状态，默认 "error" */
    status?: GmErrorStatus;
    /** 标题，默认空（空则用状态默认文案） */
    title?: string;
    /** 说明，默认空（空则用状态默认文案） */
    description?: string;
    /** 重试按钮文案，默认空（空则不渲染按钮） */
    retryText?: string;
  }>(),
  {
    status: "error",
    title: "",
    description: "",
    retryText: "",
  }
);

const emit = defineEmits(["retry"]);

const STATUS_TEXT: Record<GmErrorStatus, { title: string; desc: string }> = {
  error: { title: "加载失败", desc: "请稍后重试" },
  network: { title: "网络异常", desc: "请检查网络连接后重试" },
  permission: { title: "无访问权限", desc: "请联系管理员开通权限" },
  empty: { title: "暂无内容", desc: "换个筛选条件试试" },
};

const onRetry = () => emit("retry");
</script>

<template>
  <div class="gm-errorblock" :class="`is-${status}`" :data-status="status">
    <span class="gm-errorblock__icon" aria-hidden="true">
      <svg
        v-if="status === 'error'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <path d="M12 3 2.8 19.2a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z" />
        <path d="M12 9v4.5M12 17h.01" />
      </svg>
      <svg
        v-else-if="status === 'network'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <path d="M3 3l18 18" />
        <path d="M8.5 15.5a5 5 0 0 1 7 0" />
        <path d="M5 12a10 10 0 0 1 3.5-2.4M19 12a10 10 0 0 0-3.5-2.4" />
        <path d="M12 19h.01" />
      </svg>
      <svg
        v-else-if="status === 'permission'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <rect x="4" y="10" width="16" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
        <path d="M4 8.5 12 13l8-4.5M12 13v7" />
      </svg>
    </span>
    <p class="gm-errorblock__title">{{ title || STATUS_TEXT[status].title }}</p>
    <p class="gm-errorblock__desc">{{ description || STATUS_TEXT[status].desc }}</p>
    <button v-if="retryText" type="button" class="gm-errorblock__retry" @click="onRetry">
      {{ retryText }}
    </button>
  </div>
</template>
