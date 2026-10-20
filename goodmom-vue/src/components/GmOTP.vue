<script setup lang="ts">
/**
 * GmOTP —— 验证码输入（规范 11.2.14）
 *
 * 与 React 版同契约（受控 value / 跳格 / 退格 / 粘贴分发 / complete 逐项对应）：
 * 1. 每格一个真 input；输入数字自动跳下一格，退格（当前格为空时）回上一格并清空。
 * 2. 整串粘贴 / 系统验证码自动填充产生的多字符输入从当前格起逐格分发。
 * 3. 填满且与旧值不同时派发 complete；← / → 在格间移动焦点。
 * 4. 容器 role=group + aria-label「验证码」；每格 inputmode=numeric 并带序号可访问名。
 */
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    /** 验证码位数，默认 6 */
    length?: number;
    /** 受控值，默认空 */
    value?: string;
    /** 禁用，默认 false */
    disabled?: boolean;
  }>(),
  {
    length: 6,
    value: "",
    disabled: false,
  }
);

const emit = defineEmits(["change", "complete"]);

const inputsRef = ref<HTMLInputElement[]>([]);

const setInputRef = (el: unknown, i: number) => {
  if (el instanceof HTMLInputElement) inputsRef.value[i] = el;
};

const chars = computed(() => {
  const out: string[] = [];
  for (let i = 0; i < props.length; i += 1) out.push(props.value.charAt(i));
  return out;
});

const focusCell = (index: number) => {
  const target = inputsRef.value[Math.max(0, Math.min(props.length - 1, index))];
  if (!target) return;
  target.focus();
  target.select();
};

const commit = (nextChars: string[]) => {
  const next = nextChars.join("").slice(0, props.length);
  emit("change", next);
  if (next.length === props.length && next !== props.value) emit("complete", next);
};

const onInput = (index: number, e: Event) => {
  const el = e.target as HTMLInputElement;
  const digits = el.value.replace(/\D/g, "");
  const next = chars.value.slice();
  if (digits.length > 1) {
    /* 自动填充 / 一次输入多位：从当前格起逐格分发 */
    for (let i = 0; i < digits.length && index + i < props.length; i += 1) {
      next[index + i] = digits.charAt(i);
    }
    commit(next);
    focusCell(index + digits.length);
    return;
  }
  next[index] = digits;
  commit(next);
  if (digits) focusCell(index + 1);
};

const onKeydown = (index: number, e: KeyboardEvent) => {
  if (e.key === "Backspace") {
    e.preventDefault();
    const next = chars.value.slice();
    if (next[index]) {
      next[index] = "";
      commit(next);
      return;
    }
    if (index > 0) {
      next[index - 1] = "";
      commit(next);
      focusCell(index - 1);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    focusCell(index - 1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    focusCell(index + 1);
  }
};

const onPaste = (index: number, e: ClipboardEvent) => {
  const text = e.clipboardData ? e.clipboardData.getData("text") : "";
  const digits = text.replace(/\D/g, "");
  if (!digits) return;
  e.preventDefault();
  const next = chars.value.slice();
  for (let i = 0; i < digits.length && index + i < props.length; i += 1) {
    next[index + i] = digits.charAt(i);
  }
  commit(next);
  focusCell(index + digits.length);
};

const onFocus = (e: Event) => {
  const el = e.target as HTMLInputElement | null;
  if (el) el.select();
};
</script>

<template>
  <div class="gm-otp" role="group" aria-label="验证码">
    <span v-for="(char, index) in chars" :key="index" class="gm-otp__cell">
      <input
        :ref="(el) => setInputRef(el, index)"
        class="gm-otp__input"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :autocomplete="index === 0 ? 'one-time-code' : 'off'"
        :maxlength="1"
        :value="char"
        :disabled="disabled"
        :aria-label="`验证码第 ${index + 1} 位`"
        @input="onInput(index, $event)"
        @keydown="onKeydown(index, $event)"
        @paste="onPaste(index, $event)"
        @focus="onFocus"
      />
    </span>
  </div>
</template>
