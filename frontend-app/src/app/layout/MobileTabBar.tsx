import React from "react";
import { NavLink } from "@/shared/router";
import { NAV } from "@/shared/constants/nav";

/** 底部 TabBar（10.3.2）：3–5 项、激活为玫瑰渐变胶囊；桌面档隐藏 */
export function MobileTabBar() {
  return (
    <nav className="app-tabbar" aria-label="主导航">
      {NAV.filter((n) => n.mobile).slice(0, 4).map((n) => (
        <NavLink key={n.path} to={n.path}>{n.label}</NavLink>
      ))}
    </nav>
  );
}

export default MobileTabBar;
