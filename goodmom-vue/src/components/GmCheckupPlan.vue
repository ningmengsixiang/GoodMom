<script setup lang="ts">
/**
 * GmCheckupPlan —— 产检计划卡（规范 13.3.2）
 *
 * 与 React 版同契约（竖版时间线 / 整行可点 / data-tone 状态色）：
 * 1. week 徽章 + 项目 + 日期 + 状态；整行是原生 button，键盘可 Tab + Enter。
 * 2. 状态色只用 data-tone（neutral/positive/attention/risk/info/special），不新增 tone 类。
 * 3. 状态文字由调用方传入（未到 / 可产检 / 已预约 / 已完成 / 延后）。
 */
type GmDomainTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmCheckupItem {
  key: string;
  week: number;
  title: string;
  date: string;
  status: string;
  tone?: GmDomainTone;
}

const props = defineProps<{
  /** 产检项目（必填） */
  items: GmCheckupItem[];
}>();

const emit = defineEmits(["item"]);

const onItem = (key: string) => emit("item", key);
</script>

<template>
  <div class="gm-checkup">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="gm-checkup__item"
      :data-tone="it.tone || 'neutral'"
      @click="onItem(it.key)"
    >
      <span class="gm-checkup__week">{{ it.week }} 周</span>
      <span class="gm-checkup__main">
        <span class="gm-checkup__title">{{ it.title }}</span>
        <span class="gm-checkup__date">{{ it.date }}</span>
      </span>
      <span class="gm-checkup__status">{{ it.status }}</span>
    </button>
  </div>
</template>
