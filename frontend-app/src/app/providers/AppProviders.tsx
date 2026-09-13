/**
 * 组合根（19.2 / 19.6）
 *
 * 这里只做**装配**：把 shared 提供的平台能力（路由 / 会话 / 反馈）按依赖顺序挂一次。
 * 业务模块不得自己挂 Provider —— 否则同一状态会有两份实例（Toast 的"同类仅 1 条"、
 * 会话的角色判定都会随之失效）。
 */
import React from "react";
import { RouterProvider } from "@/shared/router";
import { AuthProvider } from "@/shared/session";
import { ToastProvider } from "@/shared/feedback";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RouterProvider fallback="/workbench">
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

export default AppProviders;
