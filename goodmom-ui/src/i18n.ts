/**
 * @goodmom/ui 国际化最小实现：键值字典（15 章词库为唯一语言源）
 */
export const DICT = {
  "待随访": { zh: "待随访", en: "Pending follow-up" },
  "已建档": { zh: "已建档", en: "Registered" },
  "已完成": { zh: "已完成", en: "Completed" },
  "高危":   { zh: "高危",   en: "High risk" },
  "提交":   { zh: "提交",   en: "Submit" },
  "保存并提交": { zh: "保存并提交", en: "Save & Submit" },
} as const;

export type GmLang = "zh" | "en";
export type GmKey = keyof typeof DICT;

export function t(key: GmKey, lang: GmLang = "zh"): string {
  return DICT[key][lang];
}
