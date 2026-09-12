/**
 * @goodmom/vue 国际化最小实现：键值字典（15 章词库为唯一语言源）
 *
 * 设计口径：组件**不自带**语言状态，由页面通过 `lang` prop 或全局注入传入，
 * 避免组件库持有全局可变状态（见 skill R6）。
 */
export const DICT = {
  待随访: { zh: "待随访", en: "Pending follow-up" },
  已建档: { zh: "已建档", en: "Registered" },
  已完成: { zh: "已完成", en: "Completed" },
  高危: { zh: "高危", en: "High risk" },
  提交: { zh: "提交", en: "Submit" },
  保存并提交: { zh: "保存并提交", en: "Save & Submit" },
  暂无数据: { zh: "暂无数据", en: "No data" },
  加载中: { zh: "加载中…", en: "Loading…" },
  请选择: { zh: "请选择", en: "Please select" },
  取消: { zh: "取消", en: "Cancel" },
  确定: { zh: "确定", en: "Confirm" },
  清空: { zh: "清空", en: "Clear" },
} as const;

export type GmLang = "zh" | "en";
export type GmKey = keyof typeof DICT;

/** 取词：命中字典返回对应语言，未命中原样返回 key（保证不显示空白） */
export function t(key: GmKey | string, lang: GmLang = "zh"): string {
  const hit = (DICT as Record<string, { zh: string; en: string }>)[key];
  return hit ? hit[lang] : key;
}

/** 创建绑定语言的取词函数（页面级注入用） */
export function createT(lang: GmLang = "zh") {
  return (key: GmKey | string) => t(key, lang);
}
