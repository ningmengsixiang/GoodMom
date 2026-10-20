<script setup lang="ts">
/**
 * GmBabyCard —— 宝宝首页头像卡（规范 13.1 #5）
 *
 * 与 React 版同契约（DOM / aria / data-gender 逐项对应）：
 * 1. avatar 是图片地址（http(s) / 绝对路径 / data:image）时渲染 img，否则当文字头像，
 *    文字头像缺省取 name 首字；gender 挂 data-gender 供 CSS 选择，同时并入 meta 文案。
 * 2. 指标最多渲染 3 个，label / value 分离，单位单独弱化（tabular-nums 由 CSS 给）。
 * 3. 编辑钮是图标按钮，带可访问名，点击派发 edit。
 */
export interface GmBabyMetric {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

const props = withDefaults(
  defineProps<{
    /** 姓名（必填） */
    name: string;
    /** 生日 YYYY-MM-DD，默认空 */
    birthday?: string;
    /** 月龄，默认 0 */
    monthAge?: number;
    /** 头像地址或文字，默认空 */
    avatar?: string;
    /** 性别，默认 "unknown" */
    gender?: "boy" | "girl" | "unknown";
    /** 指标（建议 3 个），默认空数组 */
    metrics?: GmBabyMetric[];
  }>(),
  {
    birthday: "",
    monthAge: 0,
    avatar: "",
    gender: "unknown",
    metrics: () => [],
  }
);

const emit = defineEmits(["edit"]);

const GENDER_LABEL: Record<"boy" | "girl" | "unknown", string> = {
  boy: "男宝",
  girl: "女宝",
  unknown: "",
};

const isImage = () => /^(https?:\/\/|\/|data:image\/)/.test(props.avatar);

const metaText = () =>
  [GENDER_LABEL[props.gender], `${props.monthAge} 月龄`, props.birthday ? `生日 ${props.birthday}` : ""]
    .filter(Boolean)
    .join(" · ");

const visibleMetrics = () => props.metrics.slice(0, 3);

const onEdit = () => emit("edit");
</script>

<template>
  <section class="gm-babycard" :data-gender="gender">
    <div>
      <img
        v-if="isImage()"
        class="gm-babycard__avatar"
        :src="avatar"
        :alt="name"
      />
      <span v-else class="gm-babycard__avatar" aria-hidden="true">{{ avatar || name.charAt(0) }}</span>
      <div class="gm-babycard__main">
        <p class="gm-babycard__name">{{ name }}</p>
        <p class="gm-babycard__meta">{{ metaText() }}</p>
      </div>
      <button type="button" class="gm-babycard__edit" aria-label="编辑宝宝信息" @click="onEdit">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      </button>
    </div>
    <div v-if="visibleMetrics().length > 0" class="gm-babycard__metrics">
      <div v-for="metric in visibleMetrics()" :key="metric.key" class="gm-babycard__metric">
        <span>{{ metric.label }}</span>
        <span>{{ metric.value }}<small v-if="metric.unit">{{ metric.unit }}</small></span>
      </div>
    </div>
  </section>
</template>
