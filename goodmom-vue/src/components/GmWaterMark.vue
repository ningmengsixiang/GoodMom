<script setup lang="ts">
/**
 * GmWaterMark —— 水印覆盖层（规范 11.6.13）
 *
 * 与 React 版同契约（text / opacity / gap，内容用默认插槽）：
 * 1. 背景是内联 SVG data URI（45° 平铺文字），按 gap 生成正方形图块，
 *    background-size / repeat 随 gap 走；字符串与 React 版逐字一致。
 * 2. opacity / gap 通过内联 CSS 变量 `--gm-wm-opacity`、`--gm-wm-gap` 交给 CSS。
 * 3. text 为空则不渲染图层（只留默认插槽内容）。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 水印文字，默认空（空则不渲染图层） */
    text?: string;
    /** 不透明度，默认 0.06 */
    opacity?: number;
    /** 平铺间距 px，默认 80 */
    gap?: number;
  }>(),
  {
    text: "",
    opacity: 0.06,
    gap: 80,
  }
);

/** 45° 平铺文字的 SVG 图块（与 React 版同算法、同字符串：encodeURIComponent 后作 data URI） */
const watermarkImage = (text: string, gap: number): string => {
  const half = gap / 2;
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" +
    gap +
    "' height='" +
    gap +
    "' viewBox='0 0 " +
    gap +
    " " +
    gap +
    "'>" +
    "<text x='50%' y='50%' fill='black' font-size='12' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 " +
    half +
    " " +
    half +
    ")'>" +
    escapeXml(text) +
    "</text></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const layerStyle = computed(() => ({
  backgroundImage: props.text ? watermarkImage(props.text, props.gap) : undefined,
  backgroundSize: `${props.gap}px ${props.gap}px`,
  backgroundRepeat: "repeat",
  "--gm-wm-opacity": String(props.opacity),
  "--gm-wm-gap": `${props.gap}px`,
}));
</script>

<template>
  <div class="gm-watermark">
    <slot />
    <div v-if="text" class="gm-watermark__layer" aria-hidden="true" :style="layerStyle" />
  </div>
</template>
