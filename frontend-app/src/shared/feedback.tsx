/**
 * 全局反馈（19.6 · 平台能力，放 shared；Part 18 · MD-18-01/04）
 *
 * 为什么放在 app 层而不是 shared/hooks：Toast 必须**全应用唯一实例** ——
 * "同类仅 1 条"这条纪律是按实例算的，页面各自 `useToast()` 就会出现两条同时在场。
 * 位置（顶部偏上）、驻留（2.4s）、role（error→alert，其余 status）都由 GmToast 钉死，
 * 页面只表达"要说什么"。
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { GmToast } from "@goodmom/gm-arco-ui";

export type ToastStatus = "success" | "error" | "warning" | "info";

const Ctx = createContext<(message: string, status?: ToastStatus) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; message: string; status: ToastStatus }>({
    open: false, message: "", status: "info",
  });

  const toast = useCallback((message: string, status: ToastStatus = "info") => {
    setState({ open: true, message, status });
  }, []);

  const value = useMemo(() => toast, [toast]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <GmToast
        open={state.open}
        message={state.message}
        status={state.status}
        onClose={() => setState((s) => ({ ...s, open: false }))}
      />
    </Ctx.Provider>
  );
}

/** 页面唯一的反馈入口：`const toast = useAppToast()` */
export const useAppToast = () => useContext(Ctx);
