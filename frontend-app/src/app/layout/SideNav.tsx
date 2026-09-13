import React from "react";
import { NavLink } from "@/shared/router";
import { NAV } from "@/shared/constants/nav";

/** 桌面侧栏（17 章：Logo → 主导航 → 底部用户；移动端禁用左侧栏） */
export function SideNav({ orgName, userName }: { orgName: string; userName: string }) {
  return (
    <aside className="app-side" aria-label="主导航">
      <div className="app-side__card">
        <div style={{ padding: "4px 12px 10px" }}>
          <b style={{ display: "block", fontSize: 15 }}>妈咪好 GoodMom</b>
          <span style={{ fontSize: 12, color: "var(--lg-text-secondary,#4F5B6E)" }}>{orgName}</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <NavLink key={n.path} to={n.path} className="app-navlink">{n.label}</NavLink>
          ))}
        </nav>
      </div>
      <div className="app-side__card" style={{ marginTop: "auto" }}>
        <span className="app-navlink" aria-hidden="true">{userName}</span>
      </div>
    </aside>
  );
}

export default SideNav;
