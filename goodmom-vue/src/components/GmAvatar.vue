<script setup lang="ts">
/**
 * GmAvatar —— 服务对象首字头像（对应 03 · 3.4.2）
 *
 * 视觉：渐变玻璃圆 + 白描边 + 首字；字号 = 尺寸 × 0.42（随尺寸等比缩放，避免硬编码）。
 * 无障碍：纯装饰或已有邻近姓名时 aria-hidden；若独立承载信息（无邻近文字），
 * 传 `label` 让读屏读出全名（读到「张」不如「张女士」）。
 */
import { computed } from "vue";
import { DesignTokens } from "../tokens/design";

const props = withDefaults(
  defineProps<{
    /** 显示文字，取首字。中文取姓，英文取首字母 */
    text: string;
    /** 直径 px，默认 36 */
    size?: number;
    /** 色调：rose 品牌粉（默认）/ mint 正向 / purple 特殊 */
    tone?: "rose" | "mint" | "purple";
    /** 独立承载信息时传入完整可访问名（如「张女士」）；不传则为装饰性 */
    label?: string;
  }>(),
  { size: 36, tone: "rose", label: undefined }
);

const TONE: Record<"rose" | "mint" | "purple", string> = {
  rose: DesignTokens.gradRose,
  mint: DesignTokens.gradMint,
  purple: DesignTokens.gradPurple,
};

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.42)}px`,
  background: TONE[props.tone],
}));

const initial = computed(() => String(props.text ?? "").trim().slice(0, 1));
</script>

<template>
  <span class="gm-avatar" :style="style" :role="label ? 'img' : undefined" :aria-label="label" :aria-hidden="label ? undefined : true">
    {{ initial }}
  </span>
</template>
