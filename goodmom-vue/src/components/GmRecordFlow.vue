<script setup lang="ts">
/**
 * GmRecordFlow —— 记录流（规范 13.3.7：胎动/体重/宫高/喂养/睡眠/尿布）
 *
 * 与 React 版同契约（kind / logs + 两个事件，DOM 逐项对应）：
 * 1. 列表按 time 倒序渲染（同一时间保持原顺序）；每行是 button，点击派发 item(key)。
 * 2. 快捷记录大圆钮派发 add(kind)，可访问名随类型变化；空列表显示「暂无记录」。
 * 3. 图标随 kind 变化，纯装饰（aria-hidden）；数值单位单独弱化。
 */
import { computed } from "vue";

type GmRecordKind = "fetal" | "weight" | "fundal" | "feed" | "sleep" | "diaper";

export interface GmRecordLog {
  key: string;
  time: string;
  value: string;
  unit?: string;
  note?: string;
}

const props = withDefaults(
  defineProps<{
    /** 记录类型，默认 "feed" */
    kind?: GmRecordKind;
    /** 记录列表，默认空数组 */
    logs?: GmRecordLog[];
  }>(),
  {
    kind: "feed",
    logs: () => [],
  }
);

const emit = defineEmits(["add", "item"]);

const KIND_TITLE: Record<GmRecordKind, string> = {
  fetal: "胎动记录",
  weight: "体重记录",
  fundal: "宫高记录",
  feed: "喂养记录",
  sleep: "睡眠记录",
  diaper: "尿布记录",
};

const sorted = computed(() =>
  props.logs.slice().sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
);

const onAdd = () => emit("add", props.kind);

const onItem = (key: string) => emit("item", key);
</script>

<template>
  <section class="gm-recordflow" :data-kind="kind">
    <div class="gm-recordflow__head">
      <h3 class="gm-recordflow__title">{{ KIND_TITLE[kind] }}</h3>
      <button
        type="button"
        class="gm-recordflow__add"
        :aria-label="`新增${KIND_TITLE[kind]}`"
        @click="onAdd"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
    <div class="gm-recordflow__list">
      <p v-if="sorted.length === 0" class="gm-recordflow__note">暂无记录</p>
      <template v-else>
        <button
          v-for="log in sorted"
          :key="log.key"
          type="button"
          class="gm-recordflow__item"
          @click="onItem(log.key)"
        >
          <span class="gm-recordflow__icon" aria-hidden="true">
            <svg
              v-if="kind === 'fetal'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <path d="M3 12h4l2-5 3 10 2-5h5" />
            </svg>
            <svg
              v-else-if="kind === 'weight'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <rect x="3" y="5" width="18" height="15" rx="3" />
              <path d="M8 5V4h8v1M9 10a3 3 0 0 1 6 0l-1.5 4h-3L9 10Z" />
            </svg>
            <svg
              v-else-if="kind === 'fundal'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <rect x="3" y="8" width="18" height="8" rx="2" />
              <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
            </svg>
            <svg
              v-else-if="kind === 'feed'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <path d="M9 3h6v3l2 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l2-4V3Z" />
              <path d="M7.5 13h9M9 3h6" />
            </svg>
            <svg
              v-else-if="kind === 'sleep'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
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
              <path d="M12 3c4 3.5 6 7.5 6 12l-6 6-6-6c0-4.5 2-8.5 6-12Z" />
            </svg>
          </span>
          <span class="gm-recordflow__time">{{ log.time }}</span>
          <span class="gm-recordflow__value">
            {{ log.value }}<small v-if="log.unit">{{ log.unit }}</small>
          </span>
          <span v-if="log.note" class="gm-recordflow__note">{{ log.note }}</span>
        </button>
      </template>
    </div>
  </section>
</template>
