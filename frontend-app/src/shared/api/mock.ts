/**
 * 离线演示数据源（19.2）
 *
 * 为什么需要：产品工程在接入真实网关前，必须能**真实走完四态**（加载/空/错/有数据），
 * 否则骨架、空态、错误三通道永远是"照规范写的但没人验过"。
 * 机制：`client.ts` 在未配置 `VITE_API_BASE` 时把请求路由到这里，并注入 180–420ms 延迟
 * （骨架才看得见）。配了真实网关就自动走 HTTP，页面代码零改动。
 *
 * 数据口径：状态词**全部取自 15 章已登记词**，不新造（skill R4）。
 */
import { clearCache } from "./cache";

export interface MockRoute {
  data: unknown;
  /** 演示空态：返回 `emptyValue` —— **必须与接口形状一致** */
  empty?: boolean;
  /**
   * 空态的返回值。数组接口用 `[]`（默认），对象接口必须显式给
   * `{ ...计数清零, list: [] }`。
   * ⚠️ 实测踩到：原先"空态一律返回 `[]`"，于是 `/workbench/today`（对象接口）
   * 的空态把 `[]` 交给了页面的 `isEmpty: d => d.tasks.length === 0` →
   * 直接抛 "Cannot read properties of undefined"（看着像页面 bug，根因在数据源）。
   */
  emptyValue?: unknown;
  /** 演示错误态 */
  fail?: boolean;
}

const clients = [
  { id: "a1", name: "张敏", archiveNo: "MMH-2025-0102", kind: "pregnant", stage: { week: 28, day: 2 }, risk: "m2", status: "管理中", manager: "王医生", avatarText: "张" },
  { id: "a2", name: "李念", archiveNo: "MMH-2024-0871", kind: "child", stage: { month: 12 }, risk: "m1", status: "已建档", manager: "刘医生", avatarText: "李" },
  { id: "a3", name: "王小雨", archiveNo: "MMH-2024-0233", kind: "child", stage: { month: 18 }, risk: "m4", status: "高危", manager: "张医生", avatarText: "王" },
  { id: "a4", name: "赵果果", archiveNo: "MMH-2025-0044", kind: "child", stage: { month: 3 }, risk: "m1", status: "已建档", manager: "刘医生", avatarText: "赵" },
];

const tasks = [
  { id: "t1", clientId: "a3", clientName: "王小雨", title: "生长低于 P3 · 复查随访", status: "已逾期", dueAt: "2026-09-11", channel: "电话" },
  { id: "t2", clientId: "a2", clientName: "李念", title: "乙肝疫苗第 2 剂 · 逾期召回", status: "即将到期", dueAt: "2026-09-14", channel: "电话" },
  { id: "t3", clientId: "a1", clientName: "张敏", title: "孕 28 周产检提醒", status: "待随访", dueAt: "2026-09-15", channel: "线上" },
  { id: "t4", clientId: "a4", clientName: "赵果果", title: "3 月龄儿保体检", status: "已完成", dueAt: "2026-09-12", channel: "上门" },
  { id: "t5", clientId: "a1", clientName: "张敏", title: "妊娠风险复核", status: "待处理", dueAt: "2026-09-13", channel: "线上" },
];

const pregnancy = {
  clientId: "a1",
  week: 28,
  day: 2,
  risk: "m2",
  plan: [
    { name: "建档", done: true },
    { name: "NT 筛查", done: true },
    { name: "大排畸", done: true },
    { name: "糖耐量", done: false },
    { name: "胎心监护", done: false },
  ],
};

export const MOCK: Record<string, MockRoute> = {
  "/workbench/today": {
    data: { pending: 3, overdue: 1, done: 1, tasks },
    emptyValue: { pending: 0, overdue: 0, done: 0, tasks: [] },
  },
  "/archive/clients": { data: clients },
  "/followup/tasks": { data: tasks },
  "/pregnancy/home": { data: pregnancy },
  "/dashboard/summary": { data: { manage: 1284, high: 96, vaccineRate: 96, followupRate: 68, archiveRate: 72 } },
};

/** 取 mock；未登记的路径按"服务端未实现"处理（走错误三通道，而不是静默空数据） */
export function mockOf(path: string): MockRoute | undefined {
  return MOCK[path.split("?")[0]];
}

/* ── QA 开关（仅开发期暴露）─────────────────────────────────────────────
 * 目的：让"加载 / 空 / 错"三态**可以被确定性地演出来**，而不是靠断网或改代码。
 * 否则骨架、空态、错误三通道永远只是"照规范写的、没人真验过"。
 *   window.__GM_MOCK.setDelay(2000)              // 骨架能看清
 *   window.__GM_MOCK.empty("/workbench/today", true)
 *   window.__GM_MOCK.fail("/followup/tasks", true)
 * 生产构建里不存在（import.meta.env.DEV 为 false 时整段被摇掉）。 */
export interface MockCtl {
  setDelay: (ms: number) => void;
  fail: (path: string, on?: boolean) => void;
  empty: (path: string, on?: boolean) => void;
  /** 清空请求缓存：重放"加载/空/错"三态时要先清，否则会直接命中缓存 */
  clearCache: () => void;
}
export let MOCK_DELAY: [number, number] = [180, 420];

export function installMockCtl(): void {
  if (typeof window === "undefined") return;
  const ctl: MockCtl = {
    setDelay: (ms) => { MOCK_DELAY = [ms, ms]; },
    fail: (path, on = true) => { if (MOCK[path]) MOCK[path].fail = on; },
    clearCache: () => clearCache(),
    empty: (path, on = true) => { if (MOCK[path]) MOCK[path].empty = on; },
  };
  (window as unknown as { __GM_MOCK: MockCtl }).__GM_MOCK = ctl;
}
