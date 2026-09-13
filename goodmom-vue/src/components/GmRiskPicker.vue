<script setup lang="ts">
/**
 * GmRiskPicker —— 妊娠风险五色单选（对应 02.10 / 15.2.10）
 *
 * 支持 `v-model`（Vue 3.4+ defineModel）。
 * 无障碍（D 审查 P0-2 结论，Vue 版必须保持）：
 *  - 容器 role="radiogroup" + aria-label
 *  - 每项 role="radio" + aria-checked；native button 但**不**用 type=radio，
 *    而是走 roving tabindex：仅选中项 tabIndex=0，其余 -1
 *  - 键盘：←/↑ 上一项、→/↓ 下一项、Home 首项、End 末项；移动即选中（符合 ARIA radiogroup 惯例）
 *  - 颜色不是唯一通道：每项都带「绿 · 低风险」文字（WCAG 1.4.1）
 */
import { computed, ref } from "vue";
import { FIVE_COLOR, FIVE_VAR, type GmFive } from "../tokens/status";
import { cx, varOf } from "../utils";

const model = defineModel<GmFive | undefined>({ default: undefined });

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    /** radiogroup 的可访问名，默认「妊娠风险等级」 */
    ariaLabel?: string;
  }>(),
  { disabled: false, ariaLabel: "妊娠风险等级" }
);

const emit = defineEmits<{ (e: "change", value: GmFive): void }>();

const LABEL: Record<GmFive, string> = {
  m1: "绿 · 低风险",
  m2: "黄 · 一般风险",
  m3: "橙 · 较高风险",
  m4: "红 · 高风险",
  m5: "紫 · 合并传染病",
};
const ORDER: GmFive[] = ["m1", "m2", "m3", "m4", "m5"];

const groupRef = ref<HTMLDivElement | null>(null);

/** 显式 hex → var(--mmh-m5-*, fallback)：业务侧可覆盖区域配色 */
/* V2.9：chip 文字**不用五色亮值** —— #4CB98A 等作 12.5px 文字只有 1.57–2.19:1，
   违反站点手册 D6「亮渐变=装饰，文字承载=深档」。颜色由色点 + 描边 + 选中环承载
   （模板标签内不能写块注释符号，会被 HTML 当成属性名而白屏 —— 已踩过）。 */
function cssColor(k: GmFive): string {
  return varOf(FIVE_VAR[k], FIVE_COLOR[k]);
}

function select(k: GmFive) {
  if (props.disabled) return;
  model.value = k;
  emit("change", k);
}

/** roving tabindex：无选中时第一项可聚焦，保证键盘能进入组内 */
const tabIndexFor = (k: GmFive) => (props.disabled ? -1 : model.value === k || (!model.value && k === "m1") ? 0 : -1);

function focusIndex(i: number) {
  const btns = groupRef.value?.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
  btns?.[i]?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  const target = e.target as HTMLElement | null;
  if (!target || target.getAttribute("role") !== "radio") return;

  const btns = Array.from(groupRef.value?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []);
  const i = btns.indexOf(target as HTMLButtonElement);
  if (i < 0) return;

  let next = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = ORDER.length - 1;
  else return;

  e.preventDefault();
  if (next < 0 || next >= ORDER.length) return;
  select(ORDER[next]);
  focusIndex(next);
}

const items = computed(() =>
  ORDER.map((k) => ({ key: k, label: LABEL[k], color: cssColor(k) }))
);
</script>

<template>
  <div ref="groupRef" :class="cx('gm-risk')" role="radiogroup" :aria-label="ariaLabel" @keydown="onKeydown">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      role="radio"
      :class="['gm-risk-it', model === it.key && 'on']"
      :style="{ color: 'var(--lg-text-primary,#343A46)', borderColor: it.color, outlineColor: it.color }"
      :aria-checked="model === it.key"
      :aria-disabled="disabled || undefined"
      :tabindex="tabIndexFor(it.key)"
      :disabled="disabled"
      @click="select(it.key)"
    >
      <i :style="{ background: it.color }" aria-hidden="true" />{{ it.label }}
    </button>
  </div>
</template>
