<script setup lang="ts">
/**
 * GmButtonGroup —— 按钮组（对应 03 · 3.2.7）
 *
 * 三种形态：
 *  - `attached`（默认）兄弟按钮相连：首左 / 末右保留外圆角，中间直角共享边；
 *  - `round`    同上但两端全圆角（胶囊组）；
 *  - `segmented` 分段控件：组内**有且只有一个**选中项。
 *
 * 语义与键盘（与 React 版一致）：
 *  - attached / round → `role="group"`，子项是普通 `<GmButton>`，各自 Tab 可达；
 *  - segmented        → `role="radiogroup"`，子项用 `role="radio"` + `aria-checked`，
 *    ←/→/Home/End 移动焦点并激活，roving tabindex。
 *
 * 分段控件用 **radio 语义**而不是 toggle 语义：它的本质是「多选一」，
 * 读屏需要播报「第 2 项，共 4 项，已选中」。这也与 `GmRiskPicker` 的既有做法一致。
 *
 * 开发期自检：`segmented` 必须给 `ariaLabel`，且组内必须恰好有一个
 * `aria-checked="true"` —— 这两条在生产环境最难发现，且只影响读屏用户。
 */
import { computed, onMounted, ref, watch } from "vue";
import { cx } from "../utils";

type GmButtonGroupShape = "attached" | "round" | "segmented";

const props = withDefaults(
  defineProps<{
    /** 形态，默认 attached */
    shape?: GmButtonGroupShape;
    /** 组的可访问名（segmented 必填） */
    ariaLabel?: string;
  }>(),
  { shape: "attached", ariaLabel: undefined }
);

const rootRef = ref<HTMLElement | null>(null);

const classes = computed(() =>
  cx("gm-btn-group", props.shape !== "attached" && `gm-btn-group--${props.shape}`)
);

function onKeydown(e: KeyboardEvent) {
  if (props.shape !== "segmented") return;
  const root = rootRef.value;
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[role="radio"]'));
  if (!items.length) return;
  const i = items.indexOf(document.activeElement as HTMLElement);
  let next = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i < 0 ? 0 : (i + 1) % items.length;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i <= 0 ? items.length - 1 : i - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = items.length - 1;
  else return;
  e.preventDefault();
  const el = items[next];
  el.focus();
  /* 移动焦点同时激活（原生 radio 组的既有心智模型）；选中态仍由消费方受控 */
  el.click();
}

function selfCheck() {
  if (!import.meta.env.DEV || props.shape !== "segmented") return;
  if (!props.ariaLabel) {
    console.warn("[@goodmom/vue] GmButtonGroup(segmented)：必须传 ariaLabel —— 读屏需要「当前是哪个分段组」。");
  }
  const root = rootRef.value;
  if (!root) return;
  const n = root.querySelectorAll('[role="radio"][aria-checked="true"]').length;
  if (n !== 1) {
    console.warn(
      `[@goodmom/vue] GmButtonGroup(segmented)：组内 aria-checked="true" 的项应为 1 个，实际 ${n} 个。`
    );
  }
}

onMounted(selfCheck);
watch(() => props.shape, selfCheck);
</script>

<template>
  <div
    ref="rootRef"
    :class="classes"
    :role="shape === 'segmented' ? 'radiogroup' : 'group'"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>
