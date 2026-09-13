/**
 * 校验规则唯一源（19.6）：Arco Form 的 rules 从这里取，禁止页面内联正则。
 * 妇幼领域的字段口径来自 13 章与 14 章词表。
 */
export const RE = {
  /** 中国大陆手机号 */
  phone: /^1[3-9]\d{9}$/,
  /** 身份证（15/18 位，含 X） */
  idCard: /^\d{15}$|^\d{17}[\dXx]$/,
  /** 档案号 MMH-YYYY-NNNN */
  archiveNo: /^MMH-\d{4}-\d{4}$/,
} as const;

export const rules = {
  phone: {
    validator: (v: string) => (!v || RE.phone.test(v) ? undefined : "请填写 11 位手机号"),
  },
  required: (label: string) => ({
    validator: (v: unknown) => (v === undefined || v === null || v === "" ? `请填写${label}` : undefined),
  }),
  /** 孕周 0–42（超出即数据错误，13.1） */
  gestWeek: {
    validator: (v: number) => (v >= 0 && v <= 42 ? undefined : "孕周应在 0–42 之间"),
  },
  /** 身高体重区间做合理性提示而不阻断（医疗场景不制造恐慌，13.5） */
  plausible: (min: number, max: number, label: string) => ({
    validator: (v: number) => (v >= min && v <= max ? undefined : `${label}超出常见范围，请复核`),
  }),
} as const;
