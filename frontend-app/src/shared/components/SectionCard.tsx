import React from "react";

/** 区块卡（17 章组合规范：区块标题 + 内容；标题层级 h2，供读屏导航） */
export function SectionCard({
  title, desc, extra, children,
}: { title: string; desc?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "0 2px 10px" }}>
        <h2 style={{ fontSize: 17, lineHeight: "24px", fontWeight: 600, margin: 0 }}>{title}</h2>
        {desc ? <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>{desc}</span> : null}
        <span style={{ marginLeft: "auto" }}>{extra}</span>
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
