<script setup lang="ts">
/**
 * GmPregnancyCard —— 孕周首页卡（规范 13.3.1）
 *
 * 与 React 版同契约（DOM / aria / 进度变量逐项对应）：
 * 1. 头像为首字气泡；大数字 week + day、阶段 chip、预产期倒计时（无 dueDate 不显示）。
 * 2. 任务最多渲染 3 个，整行 button，点击派发 task(key)。
 * 3. progress 为 -1 时按 (week*7+day)/280 折算并夹在 0–100，传值则直接用。
 * 4. 进度条为 role=progressbar；bar 宽度由内联 width 驱动，水平过渡由 CSS 承担；
 *    里程碑 done 同时挂 is-done 与 data-done。
 */
import { computed } from "vue";

export interface GmPregnancyTask {
  key: string;
  label: string;
}

export interface GmPregnancyMilestone {
  key: string;
  label: string;
  done?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** 孕周（必填） */
    week: number;
    /** 周内天数，默认 0 */
    day?: number;
    /** 预产期 YYYY-MM-DD，默认空（不显示倒计时） */
    dueDate?: string;
    /** 孕期阶段，默认 "middle" */
    stage?: "early" | "middle" | "late";
    /** 宝宝小名，默认空 */
    babyName?: string;
    /** 进度 0–100；默认 -1 表示按 week/day 计算 */
    progress?: number;
    /** 待办任务，默认空数组（最多渲染 3 个） */
    tasks?: GmPregnancyTask[];
    /** 关键节点，默认空数组 */
    milestones?: GmPregnancyMilestone[];
  }>(),
  {
    day: 0,
    dueDate: "",
    stage: "middle",
    babyName: "",
    progress: -1,
    tasks: () => [],
    milestones: () => [],
  }
);

const emit = defineEmits(["task"]);

const STAGE_LABEL: Record<"early" | "middle" | "late", string> = {
  early: "孕早期",
  middle: "孕中期",
  late: "孕晚期",
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** 预产期倒计时文案；非法日期返回空串（不渲染） */
const countdownText = (dueDate: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
  if (!m) return "";
  const due = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return `距预产期 ${diff} 天`;
  if (diff === 0) return "今天是预产期";
  return `已超过预产期 ${Math.abs(diff)} 天`;
};

const percent = computed(() =>
  props.progress >= 0
    ? clamp(Math.round(props.progress), 0, 100)
    : clamp(Math.round(((props.week * 7 + props.day) / 280) * 100), 0, 100)
);

const countdown = computed(() => countdownText(props.dueDate));

const visibleTasks = computed(() => props.tasks.slice(0, 3));

const avatarText = computed(() => (props.babyName ? props.babyName.charAt(0) : "孕"));

const onTask = (key: string) => emit("task", key);
</script>

<template>
  <section class="gm-pregnancy">
    <div class="gm-pregnancy__head">
      <span class="gm-pregnancy__avatar" aria-hidden="true">{{ avatarText }}</span>
      <div>
        <p class="gm-pregnancy__name">{{ babyName || "我的宝宝" }}</p>
        <p class="gm-pregnancy__week"><strong>{{ week }}</strong> 周 <span>{{ day }}</span> 天</p>
        <span class="gm-pregnancy__stage">{{ STAGE_LABEL[stage] }}</span>
      </div>
      <p v-if="countdown" class="gm-pregnancy__countdown">{{ countdown }}</p>
    </div>
    <div v-if="visibleTasks.length > 0" class="gm-pregnancy__tasks">
      <button
        v-for="task in visibleTasks"
        :key="task.key"
        type="button"
        class="gm-pregnancy__task"
        @click="onTask(task.key)"
      >
        {{ task.label }}
      </button>
    </div>
    <div
      class="gm-pregnancy__progress"
      role="progressbar"
      aria-label="孕期进度"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="percent"
    >
      <div class="gm-pregnancy__bar" :style="{ width: `${percent}%` }" />
    </div>
    <div v-if="milestones.length > 0" class="gm-pregnancy__milestones">
      <span
        v-for="item in milestones"
        :key="item.key"
        class="gm-pregnancy__milestone"
        :class="{ 'is-done': item.done }"
        :data-done="item.done ? 'true' : undefined"
      >
        {{ item.label }}
      </span>
    </div>
  </section>
</template>
