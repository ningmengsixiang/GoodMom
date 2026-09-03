/**
 * 状态语义 / 五色字典（对应规范：14 · 4.4.5、15.5、15.2.10）
 */
export type GmSemantic = "positive" | "info" | "attention" | "risk" | "neutral" | "special";

export const SEMANTIC_COLOR: Record<GmSemantic, string> = {
  positive: "#2f8f76",  // 正常/正向（绿）
  info: "#4a76d0",      // 信息/进行（蓝）
  attention: "#b9771c", // 注意/待办（琥珀）
  risk: "#d35466",      // 风险/异常（珊瑚）
  neutral: "#757e8e",   // 中性/未动（灰）
  special: "#7a5ce0",   // 特殊/协作（紫）
};

/** 孕产妇五色（02.10） */
export type GmFive = "m1" | "m2" | "m3" | "m4" | "m5";
export const FIVE_COLOR: Record<GmFive, string> = {
  m1: "#4CB98A", // 绿 · 低风险
  m2: "#F2C14E", // 黄 · 一般风险
  m3: "#F0954A", // 橙 · 较高风险
  m4: "#EE5C70", // 红 · 高风险
  m5: "#8F6AE0", // 紫 · 合并传染病
};
