<script setup lang="ts">
/**
 * GmNoticeBar —— 通知栏（规范 11.2.8）
 *
 * 与 React 版同契约（DOM / aria / 状态类逐项对应）：
 * 1. role=status：读屏把通知文本当状态消息播报；text 单行省略由 CSS 处理。
 * 2. tone 同时挂状态类与 data-tone，CSS 任选一种选择器都能命中。
 * 3. 关闭钮是 44 热区图标按钮（aria-label「关闭」），点击只派发 close，不冒泡成整条 click。
 */
const props = withDefaults(
  defineProps<{
    /** 文案（必填） */
    text: string;
    /** 左侧语义图标，默认 true */
    icon?: boolean;
    /** 右侧关闭钮，默认 true */
    closable?: boolean;
    /** 语义色调，默认 "info" */
    tone?: "info" | "warning" | "danger" | "positive";
  }>(),
  {
    icon: true,
    closable: true,
    tone: "info",
  }
);

const emit = defineEmits(["close", "click"]);

const onClick = () => emit("click");
const onClose = () => emit("close");
</script>

<template>
  <div
    class="gm-noticebar"
    :class="`is-${tone}`"
    :data-tone="tone"
    role="status"
    @click="onClick"
  >
    <span v-if="icon" class="gm-noticebar__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    </span>
    <span class="gm-noticebar__text">{{ text }}</span>
    <button
      v-if="closable"
      type="button"
      class="gm-noticebar__close"
      aria-label="关闭"
      @click.stop="onClose"
    >
      ×
    </button>
  </div>
</template>
