<script setup lang="ts">
/**
 * GmChildCheckup —— 儿保体检卡（规范 13.3.4）
 *
 * 与 React 版同契约（月龄节点轴 / 摘要 / 异常节点）：
 * 1. 月龄徽章 + 日期 + 摘要 + 状态；整行是原生 button。
 * 2. 已完成显示摘要（身高 / 体重 / 头围由调用方拼好传入）。
 * 3. 异常节点用 data-tone + 状态文案表达（不只靠颜色）。
 */
type GmDomainTone = "neutral" | "positive" | "attention" | "risk" | "info" | "special";

export interface GmChildCheckupItem {
  key: string;
  monthAge: number;
  date: string;
  status: string;
  tone?: GmDomainTone;
  summary?: string;
}

const props = defineProps<{
  /** 儿保节点（必填） */
  items: GmChildCheckupItem[];
}>();

const emit = defineEmits(["item"]);

const onItem = (key: string) => emit("item", key);
</script>

<template>
  <div class="gm-childcheckup">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="gm-childcheckup__item"
      :data-tone="it.tone || 'neutral'"
      @click="onItem(it.key)"
    >
      <span class="gm-childcheckup__badge">{{ it.monthAge }} 月</span>
      <span class="gm-childcheckup__main">
        <span class="gm-childcheckup__title">{{ it.monthAge }} 月龄体检</span>
        <span class="gm-childcheckup__summary">{{ it.summary ? it.summary + " · " + it.date : it.date }}</span>
      </span>
      <span class="gm-childcheckup__status">{{ it.status }}</span>
    </button>
  </div>
</template>
