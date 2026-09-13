import dayjs from "dayjs";

/** 数值千分位（KPI 大数字统一走这里，保证全应用一致） */
export const num = (v: number, digits = 0): string =>
  v.toLocaleString("zh-CN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 孕周文案：20 周 + 3（13.1 孕周卡的唯一口径） */
export const gestWeek = (week?: number, day?: number): string =>
  week === undefined ? "—" : day === undefined ? `${week} 周` : `${week} 周 + ${day}`;

/** 月龄文案：18 月龄（<12 月龄按「N 月龄」；≥24 按「N 岁 M 月」） */
export const monthAge = (month?: number): string => {
  if (month === undefined) return "—";
  if (month < 24) return `${month} 月龄`;
  return `${Math.floor(month / 12)} 岁 ${month % 12} 月`;
};

/** 日期：列表用 YYYY-MM-DD，详情用带时分 */
export const date = (v: string | Date, withTime = false): string =>
  dayjs(v).format(withTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD");

/** 相对到期：今天 / 明天 / 逾期 N 天（随访队列唯一文案口径，15.2.4） */
export const dueText = (due: string): string => {
  const d = dayjs(due).startOf("day");
  const today = dayjs().startOf("day");
  const diff = d.diff(today, "day");
  if (diff === 0) return "今日到期";
  if (diff === 1) return "明日到期";
  if (diff > 1) return `剩余 ${diff} 天`;
  return `已逾期 ${Math.abs(diff)} 天`;
};
