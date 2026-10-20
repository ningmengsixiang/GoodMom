<script setup lang="ts">
/**
 * GmModal —— 弹窗（规范 03 · 3.9 / 11 · 11.2.15 / **Part 18 · MD-18-01/02/03/05**）
 *
 * 与 React 版同契约（时序 / 焦点 / 锁滚动 / 移动端竖排全部内建）：
 * 1. 遮罩淡入 250ms + 面板 320ms（scale .98→1、下移 12px）；退场 240ms 播完再卸载。
 * 2. 打开锁 body 滚动、焦点进面板；ESC / 遮罩点击 / × 关闭；关闭归还焦点到触发点。
 * 3. 层叠 ≤2：受控组件 + 单一实例，由调用方保证。
 * 4. 移动端双按钮竖排（确认在下、取消在上）、单按钮全宽；宽 ≤ 屏宽-64、圆角 24。
 */
import { onUnmounted, ref, useId, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否显示（受控）。与 React 侧同名 —— 双库契约由 check-component-contract 守门 */
    open?: boolean;
    title?: string;
    /** 确认钮文案，默认「确定」 */
    okText?: string;
    /** 取消钮文案，默认「取消」 */
    cancelText?: string;
    /** 右上角 ×，默认 true */
    closable?: boolean;
    /** 点击遮罩关闭，默认 true */
    maskClosable?: boolean;
    /** 面板宽度 px，默认 480 */
    width?: number;
    onOk?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }>(),
  { open: false, okText: "确定", cancelText: "取消", closable: true, maskClosable: true, width: 480 }
);

defineSlots<{
  default?: () => unknown;
  /** 覆盖整个按钮区；传了就不再渲染 ok/cancel 默认按钮 */
  footer?: () => unknown;
}>();

const emit = defineEmits<{
  /** 支持 v-model:open（与 React 的 open + onClose 等价） */
  (e: "update:open", v: boolean): void;
  (e: "ok"): void;
  (e: "cancel"): void;
  (e: "close"): void;
}>();

const LEAVE_MS = 240; /* 退场时长：与 components.css 的 gmModalMaskOut/gmModalOut 同源 */

const mounted = ref(props.open);
const leaving = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const prevFocus = ref<HTMLElement | null>(null);
const bodyOverflow = ref("");
const titleId = useId();

const requestClose = () => {
  if (props.onClose) props.onClose();
  else if (props.onCancel) props.onCancel();
  emit("close");
  emit("update:open", false); /* v-model:open 惯用写法；未绑定时空发无副作用 */
};
const onOkClick = () => {
  if (props.onOk) props.onOk();
  emit("ok");
};

watch(
  () => props.open,
  (v) => {
    if (v) {
      mounted.value = true;
      leaving.value = false;
    } else if (mounted.value) {
      leaving.value = true;
      window.setTimeout(() => {
        mounted.value = false;
        leaving.value = false;
      }, LEAVE_MS);
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (v) => {
    if (v) {
      prevFocus.value = document.activeElement as HTMLElement | null;
      bodyOverflow.value = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.setTimeout(() => panelRef.value && panelRef.value.focus(), 0);
    } else if (mounted.value) {
      document.body.style.overflow = bodyOverflow.value;
      if (prevFocus.value && prevFocus.value.isConnected) prevFocus.value.focus();
    }
  }
);

const onKey = (e: KeyboardEvent) => {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    requestClose();
  }
};
document.addEventListener("keydown", onKey);
onUnmounted(() => document.removeEventListener("keydown", onKey));

const onMask = (e: MouseEvent) => {
  if (props.maskClosable && e.target === e.currentTarget) requestClose();
};
</script>

<template>
  <div v-if="mounted" class="gm-modal" :class="{ 'is-leaving': leaving }">
    <!-- 遮罩点击关闭：e.target === currentTarget 才关（面板内的点击不误关） -->
    <div class="gm-modal__mask" @click="onMask">
      <div
        ref="panelRef"
        class="gm-modal__panel"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="title ? undefined : '对话框'"
        :style="{ width: width + 'px' }"
      >
        <div v-if="title || closable" class="gm-modal__head">
          <div class="gm-modal__title" :id="titleId">{{ title }}</div>
          <button
            v-if="closable"
            type="button"
            class="gm-modal__close"
            aria-label="关闭"
            @click="requestClose"
          >
            ×
          </button>
        </div>
        <div class="gm-modal__body"><slot /></div>
        <div class="gm-modal__foot">
          <slot name="footer">
            <button type="button" class="gm-modal__btn" @click="requestClose">{{ cancelText }}</button>
            <button type="button" class="gm-modal__btn gm-modal__btn--primary" @click="onOkClick">
              {{ okText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
