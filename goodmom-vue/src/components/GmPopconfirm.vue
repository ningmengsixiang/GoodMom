<script setup lang="ts">
/**
 * GmPopconfirm —— 气泡确认（规范 08 · 8.2.17 / Part 18 · MD-18-01/03）
 *
 * 与 React 版同契约：非模态 role="dialog"（气泡带交互内容）+ 触发器
 * aria-haspopup="dialog" + aria-expanded；打开焦点进首按钮，ESC / 外点关闭归还焦点；
 * 进出 180ms / Y4px（Part 18 落地值）；danger 确认钮走 D5 深档实底。
 * 移动端由 ActionSheet 承担（10.4），调用方在 ≤767 时改走底部操作表。
 * 触发器内容**只能是图标/文字**（整块就是按钮，别再放 GmButton）。
 */
import { onUnmounted, ref, useId } from "vue";

const props = withDefaults(
  defineProps<{
    /** 确认问题文案（13px 600） */
    title?: string;
    /** 补充说明（12px 次级色） */
    description?: string;
    /** 确认钮文案，默认「确定」 */
    okText?: string;
    /** 取消钮文案，默认「取消」 */
    cancelText?: string;
    /** 危险操作：确认钮转 danger 深档实底（D5），默认 false */
    danger?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>(),
  { okText: "确定", cancelText: "取消", danger: false }
);

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const trgRef = ref<HTMLButtonElement | null>(null);
const btnRef = ref<HTMLButtonElement | null>(null);
const titleId = useId();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const openPop = () => {
  open.value = true;
  window.setTimeout(() => btnRef.value && btnRef.value.focus(), 0);
};
const closePop = () => {
  open.value = false;
  trgRef.value && trgRef.value.focus();
};

const onDoc = (e: MouseEvent) => {
  if (!open.value) return;
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) closePop();
};
const onKey = (e: KeyboardEvent) => {
  if (!open.value) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    closePop();
  }
};
document.addEventListener("mousedown", onDoc);
document.addEventListener("keydown", onKey);
onUnmounted(() => {
  document.removeEventListener("mousedown", onDoc);
  document.removeEventListener("keydown", onKey);
});

const confirm = () => {
  closePop();
  if (props.onConfirm) props.onConfirm();
  emit("confirm");
};
const cancel = () => {
  closePop();
  if (props.onCancel) props.onCancel();
  emit("cancel");
};
</script>

<template>
  <span ref="rootRef" class="gm-popconfirm">
    <button
      ref="trgRef"
      type="button"
      class="gm-popconfirm__trg"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open ? closePop() : openPop()"
    >
      <slot />
    </button>
    <div
      class="gm-popconfirm__pop"
      :class="{ 'is-on': open }"
      role="dialog"
      :aria-labelledby="titleId"
    >
      <div class="gm-popconfirm__t" :id="titleId">{{ title }}</div>
      <div v-if="description" class="gm-popconfirm__d">{{ description }}</div>
      <div class="gm-popconfirm__btns">
        <button type="button" class="gm-popconfirm__btn" @click="cancel">{{ cancelText }}</button>
        <button
          ref="btnRef"
          type="button"
          class="gm-popconfirm__btn"
          :class="danger ? 'gm-popconfirm__btn--danger' : 'gm-popconfirm__btn--primary'"
          @click="confirm"
        >
          {{ okText }}
        </button>
      </div>
    </div>
  </span>
</template>
