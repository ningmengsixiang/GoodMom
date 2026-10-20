<script setup lang="ts">
/**
 * GmCalendar —— 月历（规范 11.6.5）
 *
 * 与 React 版同契约（受控 value / month / events + 两个事件逐项对应）：
 * 1. 周日到周六表头；月视图由 month 推导（空则取 value 所在月，再空取当月），
 *    左右箭头切月并派发 monthChange(YYYY-MM)。
 * 2. 点日期派发 change(YYYY-MM-DD)；value 命中日期挂 is-active，今天挂 is-today。
 * 3. events 是日期串集合，命中的格子挂 has-event（事件点由 CSS 绘制）。
 * 4. 日期格是真 button，键盘可 Tab + Enter 选择；补位空格 aria-hidden 不参与读屏。
 */
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** 选中日期 YYYY-MM-DD，默认空 */
    value?: string;
    /** 展示月份 YYYY-MM，默认空（空则取 value 所在月或当月） */
    month?: string;
    /** 有事件的日期串集合，默认空数组 */
    events?: string[];
  }>(),
  {
    value: "",
    month: "",
    events: () => [],
  }
);

const emit = defineEmits(["change", "monthChange"]);

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const todayKey = (): string => {
  const d = new Date();
  return `${currentMonth()}-${pad2(d.getDate())}`;
};

/** 从 YYYY-MM-DD 取 YYYY-MM；非法值返回空串 */
const monthOf = (value: string): string => (/^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : "");

const parseMonth = (month: string): [number, number] => {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1];
  }
  return [Number(m[1]), Number(m[2])];
};

const formatDate = (year: number, mon: number, day: number): string =>
  `${year}-${pad2(mon)}-${pad2(day)}`;

const shiftMonth = (month: string, delta: number): string => {
  const [year, mon] = parseMonth(month);
  const d = new Date(year, mon - 1 + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const view = ref(props.month || monthOf(props.value) || currentMonth());

/* month / value 变化时跟随（切月是内部状态，不会因 props 未变而被重置） */
watch([() => props.month, () => props.value], () => {
  const next = props.month || monthOf(props.value);
  if (next) view.value = next;
});

const parsed = computed(() => parseMonth(view.value));

const title = computed(() => {
  const [year, mon] = parsed.value;
  return `${year} 年 ${mon} 月`;
});

const today = computed(() => todayKey());

const eventSet = computed(() => new Set(props.events));

const cells = computed<Array<number | null>>(() => {
  const [year, mon] = parsed.value;
  const out: Array<number | null> = [];
  const firstWeekday = new Date(year, mon - 1, 1).getDay();
  for (let i = 0; i < firstWeekday; i += 1) out.push(null);
  const daysInMonth = new Date(year, mon, 0).getDate();
  for (let d = 1; d <= daysInMonth; d += 1) out.push(d);
  while (out.length % 7 !== 0) out.push(null);
  return out;
});

const dateOf = (day: number): string => {
  const [year, mon] = parsed.value;
  return formatDate(year, mon, day);
};

const isActive = (day: number): boolean => props.value === dateOf(day);
const isToday = (day: number): boolean => dateOf(day) === today.value;
const hasEvent = (day: number): boolean => eventSet.value.has(dateOf(day));

const shift = (delta: number) => {
  const next = shiftMonth(view.value, delta);
  view.value = next;
  emit("monthChange", next);
};

const onDay = (day: number) => emit("change", dateOf(day));
</script>

<template>
  <div class="gm-calendar">
    <div class="gm-calendar__head">
      <button type="button" class="gm-calendar__nav" aria-label="上个月" @click="shift(-1)">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
      <span class="gm-calendar__title">{{ title }}</span>
      <button type="button" class="gm-calendar__nav" aria-label="下个月" @click="shift(1)">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
    <div class="gm-calendar__week">
      <span v-for="label in WEEK_LABELS" :key="label" aria-hidden="true">{{ label }}</span>
    </div>
    <div class="gm-calendar__grid">
      <template v-for="(day, i) in cells" :key="day === null ? `pad-${i}` : day">
        <span v-if="day === null" class="gm-calendar__day is-empty" aria-hidden="true" />
        <button
          v-else
          type="button"
          class="gm-calendar__day"
          :class="{
            'is-active': isActive(day),
            'is-today': isToday(day),
            'has-event': hasEvent(day),
          }"
          :aria-pressed="isActive(day)"
          :aria-current="isToday(day) ? 'date' : undefined"
          :aria-label="dateOf(day)"
          @click="onDay(day)"
        >
          {{ day }}
        </button>
      </template>
    </div>
  </div>
</template>
