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

/* ── 儿童保健（13.3.4 + 13.3.8）────────────────────────────────────────────
 * 出处：
 *  · 月龄节点轴 1/3/6/8/12/18/24/36、已完成节点结果摘要（身高/体重/头围 + 百分位）、
 *    异常节点「本次随访建议复查」气泡 → 13.3.4。
 *  · 六项清单（生长发育/营养喂养/心理行为发育/视力保健/听力保健/口腔保健）、
 *    行 = 图标 + 项目名 + 口径说明 + 状态标签、异常项进高危儿队列 → 13.3.8。
 *  · `icon` 与 `scope`（口径说明）取自 09 章 H 类图标表「对应业务项」列
 *    （13.3.8 原文：“图标用 H 类（lg-icon-wj-*，09）”）——不另造口径。
 *  · 状态词全部来自 15.2.3 已登记词：正常 / 异常 / 待补检 / 待复查 / 待转诊。
 *  · 百分位与标准来源：13.3.4（百分位 chip）+ 13.5.1/13.5.2（WHO 0–5 岁标准，小字标注）。
 *  · `highRisk` 是 13.3.8「异常项自动进入高危儿 / 重点随访队列」的结果位：
 *    由数据源给出，页面不得自行按状态推断临床含义。
 */
const childcareVisit = {
  childId: "a2",
  childName: "李念",
  archiveNo: "MMH-2024-0871",
  month: 12,
  nodes: [
    { month: 1, done: true, result: { heightCm: 51.2, weightKg: 3.9, headCm: 36.1, percentile: "P50" } },
    { month: 3, done: true, result: { heightCm: 60.5, weightKg: 6.2, headCm: 40.0, percentile: "P50" } },
    { month: 6, done: true, result: { heightCm: 66.1, weightKg: 7.4, headCm: 42.8, percentile: "P25" } },
    { month: 8, done: true, result: { heightCm: 69.4, weightKg: 8.1, headCm: 44.0, percentile: "P10" } },
    { month: 12, done: true, abnormal: true, advice: "本次随访建议复查",
      result: { heightCm: 74.2, weightKg: 9.0, headCm: 45.5, percentile: "低于 P3" } },
    { month: 18, done: false },
    { month: 24, done: false },
    { month: 36, done: false },
  ],
  checklist: [
    { key: "growth", name: "生长发育", icon: "lg-icon-wj-growth", scope: "身高体重测量 · 生长曲线（P3–P97）", status: "异常", highRisk: true },
    { key: "nutrition", name: "营养喂养", icon: "lg-icon-wj-nutrition", scope: "喂养指导 / 辅食 · 营养评估", status: "待复查", highRisk: true },
    { key: "develop", name: "心理行为发育", icon: "lg-icon-wj-develop", scope: "发育筛查 / 心理行为评估", status: "正常", highRisk: false },
    { key: "vision", name: "视力保健", icon: "lg-icon-wj-vision", scope: "眼保健 / 视力筛查", status: "待转诊", highRisk: true },
    { key: "hearing", name: "听力保健", icon: "lg-icon-wj-hearing", scope: "听力筛查 / 耳保健", status: "正常", highRisk: false },
    { key: "oral", name: "口腔保健", icon: "lg-icon-wj-oral", scope: "口腔检查 · 龋齿防治（涂氟、窝沟封闭提示）", status: "待补检", highRisk: false },
  ],
};

/* ── 疫苗接种（13.3.3）────────────────────────────────────────────────────
 * 出处：
 *  · 按月龄时间线（疫苗徽章 + 疫苗名 + 应种月龄 + 状态）→ 13.3.3；
 *    徽章图标 lg-icon-vaccine 见 13.3.3 与 09 章。
 *  · 机构端视图：覆盖率统计条 + 到期未种名单（红字行 + 一键随访）→ 13.3.3。
 *  · 到期前 3 天提醒 → 13.3.3（原文要求 NoticeBar/Banner；本工程按 19.3.3 不自造
 *    NoticeBar，用 GmCard + GmTag 承载同一句话）。
 *  · 状态词映射（13.3.3 的「未到/可接种/已预约/已完成/延后」**不在** 15.2 里）：
 *      可接种 → 待预约（15.2.6）· 已预约 → 已预约（15.2.6）· 已完成 → 已完成（15.2.6）
 *      逾期未种 → 已过期（15.2.6 任务级）· 未到月龄 → **不挂状态标签**（页面用灰字）
 *  · 疫苗名与应种月龄取国家免疫规划儿童免疫程序（13.3.3 只给形态，未给疫苗清单；
 *    仓内既有 `乙肝疫苗第 2 剂` 任务沿用同一命名口径）。
 *  · 覆盖率口径：15.3.4 未逐字登记「疫苗应种率」；沿用 dashboard 既有文案「疫苗应种率」，
 *    疑义已在交付说明中标注。
 */
const vaccinePlan = {
  childId: "a3",
  childName: "王小雨",
  archiveNo: "MMH-2024-0233",
  month: 18,
  reminder: { vaccine: "百白破疫苗", dose: "第 4 剂", month: 18, dueAt: "2026-09-16" },
  items: [
    { id: "v01", vaccine: "卡介苗", dose: "第 1 剂", month: 0, status: "已完成", doneAt: "2024-03-21" },
    { id: "v02", vaccine: "乙肝疫苗", dose: "第 1 剂", month: 0, status: "已完成", doneAt: "2024-03-21" },
    { id: "v03", vaccine: "乙肝疫苗", dose: "第 2 剂", month: 1, status: "已完成", doneAt: "2024-04-20" },
    { id: "v04", vaccine: "脊灰疫苗", dose: "第 1 剂", month: 2, status: "已完成", doneAt: "2024-05-22" },
    { id: "v05", vaccine: "百白破疫苗", dose: "第 1 剂", month: 3, status: "已完成", doneAt: "2024-06-19" },
    { id: "v06", vaccine: "脊灰疫苗", dose: "第 2 剂", month: 3, status: "已完成", doneAt: "2024-06-19" },
    { id: "v07", vaccine: "百白破疫苗", dose: "第 2 剂", month: 4, status: "已完成", doneAt: "2024-07-18" },
    { id: "v08", vaccine: "脊灰疫苗", dose: "第 3 剂", month: 4, status: "已完成", doneAt: "2024-07-18" },
    { id: "v09", vaccine: "百白破疫苗", dose: "第 3 剂", month: 5, status: "已完成", doneAt: "2024-08-15" },
    { id: "v10", vaccine: "乙肝疫苗", dose: "第 3 剂", month: 6, status: "已完成", doneAt: "2024-09-12" },
    { id: "v11", vaccine: "流脑 A 群多糖疫苗", dose: "第 1 剂", month: 6, status: "已完成", doneAt: "2024-09-12" },
    { id: "v12", vaccine: "麻腮风疫苗", dose: "第 1 剂", month: 8, status: "已完成", doneAt: "2024-11-14" },
    { id: "v13", vaccine: "乙脑减毒活疫苗", dose: "第 1 剂", month: 8, status: "已过期", dueAt: "2024-11-14" },
    { id: "v14", vaccine: "流脑 A 群多糖疫苗", dose: "第 2 剂", month: 9, status: "待预约", dueAt: "2024-12-14" },
    { id: "v15", vaccine: "百白破疫苗", dose: "第 4 剂", month: 18, status: "已预约", dueAt: "2026-09-16" },
    { id: "v16", vaccine: "麻腮风疫苗", dose: "第 2 剂", month: 18, status: "待预约", dueAt: "2026-09-20" },
    { id: "v17", vaccine: "甲肝减毒活疫苗", dose: "第 1 剂", month: 18, status: "待预约", dueAt: "2026-09-27" },
    { id: "v18", vaccine: "乙脑减毒活疫苗", dose: "第 2 剂", month: 24 },
  ],
  /* 机构端视图（13.3.3）：覆盖率统计条 + 到期未种名单 */
  coverage: { rate: 96, done: 1156, should: 1204 },
  overdue: [
    { id: "o1", childId: "a3", childName: "王小雨", vaccine: "乙脑减毒活疫苗", dose: "第 1 剂", month: 8, dueAt: "2026-09-04", status: "已过期" },
    { id: "o2", childId: "a4", childName: "赵果果", vaccine: "脊灰疫苗", dose: "第 3 剂", month: 4, dueAt: "2026-09-08", status: "已过期" },
    { id: "o3", childId: "a1", childName: "张敏（新生儿）", vaccine: "乙肝疫苗", dose: "第 2 剂", month: 1, dueAt: "2026-09-11", status: "已过期" },
  ],
};

/* ── 机构运营（仅 admin；19.5.3 机构侧只看聚合）──────────────────────────
 * 出处：
 *  · 科室与人员的称谓词（管理医生 / 建档机构 / 管理对象）→ 15.3.2 档案词 + 15.3.1 人员称谓。
 *  · 医生排班状态词 → 15.2.6 / 15.2.7 已登记词：已签到 / 服务中 / 已取消 / 已关闭。
 *  · 服务量指标名 → 15.3.4 数据大屏核心指标词表（儿童建档数 / 儿童体检人数 /
 *    生长发育异常 / 高危儿 / 视力异常 / 听力异常 / 随访完成率）；「疫苗应种率」见上条说明。
 *  · 数值为演示 mock，不代表真实机构口径。
 */
const institutionOverview = {
  org: { id: "org-001", name: "市妇幼保健院", level: "三甲" },
  depts: [
    { id: "d1", name: "儿童保健科", manager: "刘医生", archiveOrg: "市妇幼保健院", managed: 486 },
    { id: "d2", name: "孕产保健科", manager: "王医生", archiveOrg: "市妇幼保健院", managed: 512 },
    { id: "d3", name: "预防接种门诊", manager: "张医生", archiveOrg: "市妇幼保健院", managed: 1204 },
  ],
  shifts: [
    { id: "s1", doctor: "刘医生", dept: "儿童保健科", shift: "上午 08:00–12:00", status: "已签到" },
    { id: "s2", doctor: "王医生", dept: "孕产保健科", shift: "上午 08:00–12:00", status: "服务中" },
    { id: "s3", doctor: "张医生", dept: "预防接种门诊", shift: "下午 13:30–17:30", status: "已签到" },
    { id: "s4", doctor: "李医生", dept: "儿童保健科", shift: "下午 13:30–17:30", status: "已取消" },
    { id: "s5", doctor: "赵医生", dept: "孕产保健科", shift: "夜间 18:00–22:00", status: "已关闭" },
  ],
  metrics: [
    { name: "儿童建档数", value: 1284, unit: "人", kind: "count" },
    { name: "儿童体检人数", value: 962, unit: "人", kind: "count" },
    { name: "生长发育异常", value: 41, unit: "人", kind: "count" },
    { name: "高危儿", value: 96, unit: "人", kind: "count" },
    { name: "视力异常", value: 23, unit: "人", kind: "count" },
    { name: "听力异常", value: 7, unit: "人", kind: "count" },
    { name: "随访完成率", value: 68, unit: "%", kind: "rate" },
    { name: "疫苗应种率", value: 96, unit: "%", kind: "rate" },
  ],
};

/* ── 账号与权限（account 模块；19.5 边界）────────────────────────────────
 * 出处：
 *  · 机构（名称/等级）与当前角色 → shared/session（account 模块拥有的会话契约）；
 *  · 科室列表 → 15.3.2 档案词「建档机构」下属科室口径；
 *  · 权限矩阵**不入接口**：它是 account 模块 model.ts 里的一张常量契约表
 *    （19.5「角色与权限点」属 account），接口只回会话与科室。
 */
const accountSession = {
  role: "doctor",
  institution: { id: "org-001", name: "市妇幼保健院", level: "三甲" },
  depts: ["儿童保健科", "孕产保健科", "预防接种门诊"],
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

  /* 新增四接口：空态值必须与接口形状一致（对象接口不能返回 `[]`） */
  "/childcare/visits": {
    data: childcareVisit,
    emptyValue: { childId: "", childName: "", archiveNo: "", month: 0, nodes: [], checklist: [] },
  },
  "/vaccine/plan": {
    data: vaccinePlan,
    emptyValue: {
      childId: "", childName: "", archiveNo: "", month: 0,
      reminder: null, items: [],
      coverage: { rate: 0, done: 0, should: 0 }, overdue: [],
    },
  },
  "/institution/overview": {
    data: institutionOverview,
    emptyValue: { org: { id: "", name: "", level: "" }, depts: [], shifts: [], metrics: [] },
  },
  "/account/session": {
    data: accountSession,
    emptyValue: { role: "doctor", institution: { id: "", name: "", level: "" }, depts: [] },
  },
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
