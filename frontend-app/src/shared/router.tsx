/**
 * 最小路由内核（19.6 · 平台能力，放 shared 而非 app）
 *
 * 为什么在 shared：`modules/*` 必须能跳转（列表点进详情），但模块**不允许依赖 app/**
 * （分层方向单向：app → modules → shared）。所以"路由"作为平台能力下沉到这里，
 * app 只负责把 `<RouterProvider>` 挂上。反馈（Toast）与会话（Auth）同理。
 *
 * 为什么自研而不引 react-router：本工程要求**离线可构建**（依赖已固定为
 * react / react-dom / arco / dayjs，沙箱与外网隔离）。产品路由需求只有
 * 「模块级页面 + 详情页带参数 + 权限守卫」三件事，hash 路由 60 行足够，
 * 且不引入需要联网安装的依赖。
 *
 * 升级路径（评审后执行，成本被刻意收在一个文件里）：
 *   · 需要嵌套路由 / 懒加载分包 / history 模式 → 换 `react-router-dom@6`；
 *   · 页面侧只依赖下面这四个 API（useRouter / navigate / NavLink / useRouteMatch），
 *     换库时改本文件即可，业务页面零改动。
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface RouterCtx {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
}

const Ctx = createContext<RouterCtx>({ path: "/", navigate: () => {} });

/** 把 `#/archive/12` 归一成 `/archive/12`；空 hash 落到默认页 */
function readHash(fallback = "/workbench"): string {
  const raw = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  if (!raw) return fallback;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function RouterProvider({ children, fallback }: { children: React.ReactNode; fallback?: string }) {
  const [path, setPath] = useState(() => readHash(fallback));

  useEffect(() => {
    const on = () => setPath(readHash(fallback));
    window.addEventListener("hashchange", on);
    // 首次进入补一个 hash，保证刷新/分享的地址稳定
    if (!window.location.hash) window.location.replace(`#${readHash(fallback)}`);
    return () => window.removeEventListener("hashchange", on);
  }, [fallback]);

  const navigate = useCallback((to: string, replace = false) => {
    if (replace) window.location.replace(`#${to}`);
    else window.location.hash = to;
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRouter = (): RouterCtx => useContext(Ctx);

/**
 * 模块级跳转：给事件回调与非组件代码用（组件内优先用 `useRouter().navigate`）。
 * 走 hash 赋值 → 触发 hashchange → Provider 更新，全应用只有这一条跳转实现。
 */
export function navigate(to: string, replace = false): void {
  if (replace) window.location.replace(`#${to}`);
  else window.location.hash = to;
}

/** 匹配 `/archive/:id` 形态；返回参数或 null */
export function useRouteMatch(pattern: string): Record<string, string> | null {
  const { path } = useRouter();
  const pp = pattern.split("/").filter(Boolean);
  const cp = path.split("/").filter(Boolean);
  if (pp.length !== cp.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(cp[i]);
    else if (pp[i] !== cp[i]) return null;
  }
  return params;
}

/** 当前路径是否命中（用于导航高亮）；详情页也点亮其父模块 */
export function isActive(path: string, to: string): boolean {
  return path === to || path.startsWith(`${to}/`);
}

export function NavLink({
  to, children, className, ariaLabel,
}: { to: string; children: React.ReactNode; className?: string; ariaLabel?: string }) {
  const { path, navigate } = useRouter();
  const active = isActive(path, to);
  return (
    <a
      href={`#${to}`}
      className={className}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
    >
      {children}
    </a>
  );
}
