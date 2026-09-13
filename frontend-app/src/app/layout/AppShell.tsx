/**
 * 页面壳（19.1 视觉基调 / 17 章组合规范）
 *
 * 三端一体：≥1024 左侧玻璃侧栏 + 内容区；≤1023 顶栏 + 底部 TabBar。
 * 壳负责"占位与间距"，不负责业务；业务一律在 modules/*。
 */
import React from "react";
import { GmButton } from "@goodmom/gm-arco-ui";
import { useAuth } from "@/shared/session";
import { useTheme } from "@/shared/hooks/useTheme";
import SideNav from "./SideNav";
import MobileTabBar from "./MobileTabBar";

export interface AppShellProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  toast?: React.ReactNode;
}

export function AppShell({ title, sub, actions, children, toast }: AppShellProps) {
  const { institution, name } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="app-shell">
      <SideNav orgName={institution.name} userName={name} />
      <div className="app-main">
        <header className="app-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="app-top__title">{title}</h1>
            {sub ? <span className="app-top__sub">{sub}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 8, flex: "none" }}>
            {actions}
            {/* 暗色档开关：只切 <html data-theme>，颜色由 Token 自动换挡（02 · 2.1.9） */}
            <GmButton type="text" size="small" onClick={toggle} ariaLabel="切换暗色模式">
              {theme === "dark" ? "浅色" : "暗色"}
            </GmButton>
          </div>
        </header>
        <main className="app-page">{children}</main>
        <MobileTabBar />
        {toast}
      </div>
    </div>
  );
}

export default AppShell;
