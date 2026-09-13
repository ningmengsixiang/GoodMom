/**
 * 网络唯一出入口（19.2）
 *
 * 规则：**模块内不得直接 `fetch`**，一律经此客户端，理由：
 *  · 401/403/超时/断网/5xx 的**错误三通道**（色 + 文案 + 动作）只在这里映射一次，
 *    页面拿到的是可直接渲染的 `ApiError`，不会各页自己拼提示；
 *  · 超时与取消只有一份实现（AbortController）；
 *  · 未来换 baseURL / 加签名 / 接 SSO，只改这一个文件。
 */
export type ApiErrorKind = "network" | "timeout" | "auth" | "forbidden" | "server" | "business";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  /** 面向用户的可执行文案（禁技术堆栈，08 · 8.2.15 / 13.5） */
  hint: string;
  constructor(kind: ApiErrorKind, message: string, hint: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.hint = hint;
    this.status = status;
  }
}

const HINT: Record<ApiErrorKind, string> = {
  network: "网络不可用，请检查后重试；已填写的内容会保留在本机",
  timeout: "请求超时，请稍后重试",
  auth: "登录已过期，请重新登录",
  forbidden: "当前账号没有这项权限，请联系机构管理员",
  server: "服务暂时不可用，请稍后重试",
  business: "操作未完成，请按提示调整后重试",
};

const DEFAULT_TIMEOUT = 10000;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  /** 接口路径，如 "/followup/tasks" */
  path: string;
}

/** 业务接口基址：离线演示默认同源 mock；接入真实网关时只改这里 */
export const API_BASE = (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE ?? "";

export async function request<T>(opt: RequestOptions): Promise<T> {
  /* 未配置真实网关时走离线数据源（见 mock.ts）：注入延迟让骨架/空态/错误态都能被真实走一遍 */
  if (!API_BASE) {
    const { mockOf, MOCK_DELAY, installMockCtl } = await import("./mock");
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) installMockCtl();
    const hit = mockOf(opt.path);
    await new Promise((r) => setTimeout(r, MOCK_DELAY[0] + Math.random() * (MOCK_DELAY[1] - MOCK_DELAY[0])));
    if (hit?.fail) throw new ApiError("server", "mock-500", HINT.server, 500);
    if (hit) return (hit.empty ? (hit.emptyValue ?? []) : hit.data) as T;
    throw new ApiError("business", "mock-404", "该接口尚未接入，请先在 shared/api/mock.ts 登记", 404);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException("timeout", "TimeoutError")), opt.timeout ?? DEFAULT_TIMEOUT);
  opt.signal?.addEventListener("abort", () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(`${API_BASE}${opt.path}`, {
      method: opt.method ?? "GET",
      headers: { "content-type": "application/json" },
      body: opt.body === undefined ? undefined : JSON.stringify(opt.body),
      signal: ctrl.signal,
    });
    if (res.status === 401) throw new ApiError("auth", "401", HINT.auth, 401);
    if (res.status === 403) throw new ApiError("forbidden", "403", HINT.forbidden, 403);
    if (res.status >= 500) throw new ApiError("server", String(res.status), HINT.server, res.status);
    if (!res.ok) throw new ApiError("business", String(res.status), HINT.business, res.status);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const err = e as { name?: string };
    if (err?.name === "TimeoutError" || err?.name === "AbortError") throw new ApiError("timeout", "timeout", HINT.timeout);
    throw new ApiError("network", "network", HINT.network);
  } finally {
    clearTimeout(timer);
  }
}
