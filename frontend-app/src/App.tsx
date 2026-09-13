/**
 * 应用装配（19.2 / 19.4）
 *
 * 这里只做三件事：Provider 组合 → 路由匹配 → 交给页面壳渲染。
 * 业务一律在 `modules/*`，壳一律在 `app/*`，本文件不允许出现任何业务判断。
 */
import React from "react";
import AppProviders from "@/app/providers/AppProviders";
import AppShell from "@/app/layout/AppShell";
import RequireRole from "@/app/guards/RequireRole";
import { ROUTES, useCurrentRoute } from "@/app/routes";
import { GmButton } from "@goodmom/gm-arco-ui";
import { navigate } from "@/shared/router";

void ROUTES;   // 路由表由 useCurrentRoute 命中，这里保留引用便于阅读

function AppRoutes() {
  const { def, params } = useCurrentRoute();
  const page = def.render(params);

  return (
    <AppShell
      title={def.title}
      sub={def.sub}
      actions={
        <GmButton type="outline" size="small" onClick={() => navigate("/dev/preview")}>
          组件演示
        </GmButton>
      }
    >
      {def.role ? <RequireRole need={def.role}>{page}</RequireRole> : page}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
