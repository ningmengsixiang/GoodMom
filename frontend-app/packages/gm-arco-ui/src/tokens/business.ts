import type { GmSemantic } from "./status";

/**
 * 业务状态文案 → 六语义（对应 15.2 / 15.2.10）
 *
 * ⚠️ 与 15 章 15.2.x 各节逐条对齐（🟢→positive / 🔵→info / 🟠→attention / 🔴→risk /
 * ⚪→neutral / 🟣→special）。漏登记会**静默**回落 neutral 灰（不报错），
 * 线上表现为「高危显示成灰色」。新增文案必须同时登记本表与 15 章。
 * 历史缺陷：`高危` 漏登记（15.2.9 明确标 🔴）、`异常` 漏登记（15.2.2），已补。
 * 同步：@goodmom/vue 的 tokens/business.ts 必须与本表保持一致。
 */
const MAP: Record<string, GmSemantic> = {
  // 档案 / 人员
  正常:"positive", 已建档:"info", 管理中:"info", 待完善:"attention", 待审核:"attention",
  已审核:"positive", 已归档:"neutral", 已注销:"neutral", 已迁出:"neutral", 暂停管理:"special",
  // 15.2.9 组合标签
  高危:"risk", 重点关注:"special", 失访:"risk", 已转出:"neutral",
  // 筛查 / 检查结果
  待筛查:"neutral", 筛查中:"info", 待复查:"attention", 检查异常:"risk", 高风险:"risk", 待转诊:"attention",
  已转诊:"special", 待随访:"attention", 随访中:"info", 已结案:"neutral", 未见异常:"positive", 阴性:"positive",
  可疑:"attention", 阳性:"risk", 待复核:"attention", 待补检:"attention", 未出结果:"neutral", 异常:"risk",
  // 随访 / 转诊 / 预约 / 任务 / 审核 / 人员
  已预约:"info", 已完成:"positive", 未随访:"neutral", 拒绝随访:"attention", 无法联系:"attention",
  待再次随访:"attention", 转诊中:"info", 已接诊:"info", 待反馈:"attention", 已反馈:"positive", 已取消:"neutral",
  待预约:"neutral", 待确认:"attention", 已确认:"positive", 已签到:"info", 服务中:"info", 已过期:"attention", 未到诊:"risk",
  待处理:"attention", 进行中:"info", 即将到期:"attention", 已逾期:"attention", 已关闭:"neutral",
  草稿:"neutral", 审核中:"info", 审核通过:"positive", 已驳回:"risk", 已撤回:"neutral",
};

export function semanticOf(label: string): GmSemantic {
  return MAP[label.trim()] || "neutral";
}

export const BUSINESS_LABELS = Object.keys(MAP);

/** 语义 → 是否属于「风险/异常」档（列表行危险色描边等二次加工用） */
export function isRiskLike(semantic: GmSemantic): boolean {
  return semantic === "risk" || semantic === "attention";
}
