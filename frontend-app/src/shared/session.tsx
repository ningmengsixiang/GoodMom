/**
 * 会话与角色（19.6 · 平台能力，放 shared）
 *
 * 为什么不做全局 store：全应用真正跨模块共享的只有"当前机构 + 角色 + 会话"，
 * 一个 Context 就够。引入 store 库会让"谁在什么时机改了状态"变得难以追踪，
 * 而这些库在本工程还装不上（离线）。等出现第二个真正的跨模块状态再加。
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Role = "nurse" | "doctor" | "admin";

export interface Institution { id: string; name: string; level: string }

export interface Session {
  role: Role;
  name: string;
  institution: Institution;
}

interface AuthCtx extends Session {
  /** 未登录（离线演示默认已登录，用于演示守卫） */
  authed: boolean;
  login: (role: Role) => void;
  logout: () => void;
  /** 角色判定唯一入口：页面禁写 `role === "doctor"` 这类散落判断 */
  can: (need: Role | Role[]) => boolean;
}

/* 演示默认角色取 `doctor`：可覆盖工作台 / 档案 / 随访 / 数据中心，
   一眼能看到应用全貌；`institution`（仅 admin）继续用来演示权限守卫 ——
   接真实登录后这里由 SSO 返回值决定，页面代码不用改。 */
const DEFAULT: Session = {
  role: "doctor",
  name: "张护士",
  institution: { id: "org-001", name: "市妇幼保健院", level: "三甲" },
};

const Ctx = createContext<AuthCtx>({ ...DEFAULT, authed: true, login: () => {}, logout: () => {}, can: () => true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(DEFAULT);
  const [authed, setAuthed] = useState(true);

  const login = useCallback((role: Role) => {
    setSession({ ...DEFAULT, role });
    setAuthed(true);
  }, []);
  const logout = useCallback(() => setAuthed(false), []);
  const can = useCallback(
    (need: Role | Role[]) => (Array.isArray(need) ? need.includes(session.role) : session.role === need),
    [session.role]
  );

  const value = useMemo<AuthCtx>(() => ({ ...session, authed, login, logout, can }),
    [session, authed, login, logout, can]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthCtx => useContext(Ctx);
