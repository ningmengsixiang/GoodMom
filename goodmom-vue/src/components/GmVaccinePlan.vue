<script setup lang="ts">
/**
 * GmVaccinePlan —— 疫苗计划卡（规范 13.3.3）
 *
 * 与 React 版同契约（月龄时间线 / 徽章 / 状态文字齐全）：
 * 1. 徽章 + 名称/剂次 + 月龄·日期 + 状态；整行是原生 button。
 * 2. 状态色只用 data-tone（neutral/positive/attention/risk/info/special）。
 * 3. 状态文案由调用方传入（未到 / 可接种 / 已预约 / 已完成 / 延后）。
 */
type GmDomainTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmVaccineItem {
  key: string;
  name: string;
  dose: string;
  monthAge: number;
  dueDate: string;
  status: string;
  tone?: GmDomainTone;
}

const props = defineProps<{
  /** 疫苗项目（必填） */
  items: GmVaccineItem[];
}>();

const emit = defineEmits(["item"]);

const onItem = (key: string) => emit("item", key);
</script>

<template>
  <div class="gm-vaccine">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="gm-vaccine__item"
      :data-tone="it.tone || 'neutral'"
      @click="onItem(it.key)"
    >
      <span class="gm-vaccine__badge">{{ it.monthAge }} 月</span>
      <span class="gm-vaccine__main">
        <span class="gm-vaccine__name">{{ it.name }}</span>
        <span class="gm-vaccine__meta">{{ it.dose }} · {{ it.monthAge }} 月龄 · {{ it.dueDate }}</span>
      </span>
      <span class="gm-vaccine__status">{{ it.status }}</span>
    </button>
  </div>
</template>
