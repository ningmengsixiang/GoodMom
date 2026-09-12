<script setup lang="ts">
/**
 * GmToast —— 轻提示（规范 03 · 3.9 / 07 · 7.3.7 / **Part 18 · MD-18-01/04**）
 *
 * ## 为什么补它（V2.9「反馈与提示」深化）
 *
 * `00-组件总目录` 登记了 **8 个反馈类组件**（Toast #63 / Notification #64 / Modal #65 /
 * ActionSheet #66 / Popconfirm #67 / Popover·Tooltip #68 / Banner #69 / Drawer #26 /
 * NoticeBar #36），**两个库里一个都没有实现** —— 于是每个页面各自造 Toast。
 * 实测站点三处实现，**没有一处**同时满足规范的位置、时序与无障碍要求：
 * 两处在**底部**（MD-18-04 要求顶部偏上）、时长 350/250ms（应 320ms）、全都没有 `role`/`aria-live`。
 *
 * ## 本组件按规范钉死的四件事
 *
 * 1. **位置**：顶部居中偏上，移动端自动避让 TabBar（见 `--gm-toast-top`）。
 * 2. **时序**（MD-18-01）：滑入 **320ms** → 驻留 **2.4s** → 淡出上滑 **240ms**；
 *    驻留计时**由组件内置**，不由调用方记。
 * 3. **同类仅 1 条**（MD-18-04）：受控组件，约定"同一时刻至多一个 `open`"；
 *    站点侧最小实现用选择器先移除同类再挂载，由 `scripts/audit.py feedback-spec` 守门。
 * 4. **无障碍**：`error` → `role="alert"`；其余 → `role="status"` + `aria-live="polite"`。
 *    语义走**色点 + 文案**双通道（14 · 4.4.5），不靠颜色单独传义。
 */
import { onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 是否显示（受控）。与 React 侧同名 —— 双库契约由
     *  `scripts/check-component-contract.py` 逐字比对，名字必须一致 */
    open?: boolean;
    message?: string;
    /** 语义：success / error / warning / info（默认） */
    status?: "success" | "error" | "warning" | "info";
    /** 驻留毫秒数，默认 2400（MD-18-01）。传 0 表示不自动关闭 */
    duration?: number;
    /** 可选单行动作文案（如「撤销」） */
    actionText?: string;
    /** 无 message 时的读屏名称 */
    ariaLabel?: string;
  }>(),
  /* 默认值集合必须与 React 侧逐项一致（契约门禁比对默认值条数与取值） */
  { status: "info", duration: 2400 }
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "action"): void;
  /** 支持 `v-model:open`（与 React 的 `open` + `onClose` 等价） */
  (e: "update:open", v: boolean): void;
}>();

/** MD-18-01：淡出上滑 240ms（与 components.css 的 gmToastOut 动画时长同源） */
const LEAVE_MS = 240;

/* 两阶段挂载：`open` 落下的瞬间**不能**立刻卸载 —— 否则 MD-18-01 要求的
   "淡出上滑 240ms" 只是一句空话。故 open=false → 先挂 `.is-leaving`
   播完退场，再卸载。与 React 侧逐行同构。 */
const mounted = ref(props.open);
const leaving = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;
let leaveTimer: ReturnType<typeof setTimeout> | undefined;
const stop = () => timer && (clearTimeout(timer), (timer = undefined));

watch(
  () => [props.open, props.duration, props.message, props.status] as const,
  () => {
    stop();
    if (props.open) {
      mounted.value = true;
      leaving.value = false;
      if (props.duration > 0) {
        timer = setTimeout(() => {
          emit("update:open", false);
          emit("close");
        }, props.duration);
      }
      return;
    }
    // 退场：240ms 后才真正卸载；期间若又被打开，watch 重入会清掉计时器
    if (!mounted.value) return;
    leaving.value = true;
    leaveTimer = setTimeout(() => {
      mounted.value = false;
      leaving.value = false;
    }, LEAVE_MS);
  },
  { immediate: true }
);
onUnmounted(() => {
  stop();
  leaveTimer && clearTimeout(leaveTimer);
});
</script>

<template>
  <div
    v-if="mounted"
    :class="['gm-toast', `gm-toast--${status}`, leaving ? 'is-leaving' : '']"
    :role="status === 'error' ? 'alert' : 'status'"
    :aria-live="status === 'error' ? 'assertive' : 'polite'"
    :aria-label="message ? undefined : ariaLabel || '提示'"
  >
    <i class="gm-toast__dot" aria-hidden="true" />
    <span v-if="message" class="gm-toast__t">{{ message }}</span>
    <button v-if="actionText" type="button" class="gm-toast__act" @click="emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>
