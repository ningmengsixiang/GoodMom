/**
 * 模块占位页（交付脚手架用）
 *
 * 用途：把"已定义边界、但页面待排期"的模块做成**可访问、可验收**的状态，
 * 而不是让它 404 —— 侧栏点得进来、能看到该模块拥有什么、依赖什么、下一步做什么。
 * 等该模块排期时，替换本页即可（路由与边界都不用动）。
 */
import React from "react";
import { GmCard, GmTag } from "@goodmom/gm-arco-ui";
import SectionCard from "@/shared/components/SectionCard";

export default function ModulePlaceholderPage({
  title, owns, next,
}: { title: string; owns: string[]; next: string }) {
  return (
    <SectionCard title={title} desc="边界已定义 · 页面待排期">
      <GmCard>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <GmTag semantic="info">已立边界</GmTag>
          <GmTag semantic="neutral">待排期</GmTag>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>本模块拥有</div>
        <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 14, lineHeight: 2 }}>
          {owns.map((o) => <li key={o}>{o}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>下一步</div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--lg-text-secondary,#4F5B6E)" }}>{next}</p>
      </GmCard>
    </SectionCard>
  );
}
