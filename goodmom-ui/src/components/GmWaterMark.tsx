import React from "react";

/**
 * GmWaterMark —— 水印覆盖层（规范 11 · 11.6.13）
 *
 * 与 `@goodmom/vue` 同契约：text / opacity / gap，内容 children。
 * 覆盖层定位与显隐由组件 CSS 提供，本文件无色值。
 *
 * 实现：
 * 1. 背景是**内联 SVG data URI**（45° 平铺文字），按 gap 生成正方形图块，
 *    background-size / repeat 随 gap 走；Vue 侧必须生成完全相同的字符串。
 * 2. opacity / gap 通过内联 CSS 变量 `--gm-wm-opacity`、`--gm-wm-gap` 交给 CSS，
 *    组件不直接写 opacity，方便暗色主题或父级覆盖。
 * 3. text 为空则不渲染图层（只留 children）。
 */
export interface GmWaterMarkProps {
  /** 水印文字，默认 ""（空则不渲染图层） */
  text?: string;
  /** 不透明度，默认 0.06 */
  opacity?: number;
  /** 平铺间距 px，默认 80 */
  gap?: number;
  children?: React.ReactNode;
}

const GmWaterMark = ({
  text = "",
  opacity = 0.06,
  gap = 80,
  children,
}: GmWaterMarkProps) => {
  const layerStyle = {
    backgroundImage: text ? watermarkImage(text, gap) : undefined,
    backgroundSize: gap + "px " + gap + "px",
    backgroundRepeat: "repeat",
    "--gm-wm-opacity": String(opacity),
    "--gm-wm-gap": gap + "px",
  } as React.CSSProperties;

  return (
    <div className="gm-watermark">
      {children}
      {text ? <div className="gm-watermark__layer" aria-hidden="true" style={layerStyle} /> : null}
    </div>
  );
};
export default GmWaterMark;

/** 45° 平铺文字的 SVG 图块（Vue 侧同算法、同字符串：encodeURIComponent 后作 data URI） */
function watermarkImage(text: string, gap: number): string {
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
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
