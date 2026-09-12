/**
 * GoodMom Design Tokens（汇总导出，数值与 02/12 章一致）
 */
export const DesignTokens = {
  rose: { "700": "#B23A63", "600": "#E85D8F", "500": "#F77FA3", "400": "#FFA3BE", "300": "#FFC4D6", "200": "#FFDEE8", "100": "#FFF0F4" },
  mint: { "600": "#4FB59C", "500": "#6FC9B4", "400": "#7FD8C2", "300": "#A9E3D4", "100": "#E2F6F0" },
  info: "#6D9EFF", warning: "#F2B25C", danger: "#EF6A7B", purple: "#9A78FF",
  /** D9 主行动档：品牌粉上半段 Rose-300→Rose-500，承载深字（全尺寸 ≥4.89:1） */
  gradActionHc: "linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%)",
  gradPrimary: "linear-gradient(135deg,#FFA9C2,#F77FA3 45%,#E85D8F)",
  gradRose: "linear-gradient(150deg,#FFA9C2,#E85D8F)",
  gradMint: "linear-gradient(150deg,#7FD8C2,#4FB59C)",
  gradPurple: "linear-gradient(150deg,#B9A0FF,#8066F0)",
  radius: { card: 22, btn: 22, btnLg: 26, btnSm: 18, control: 20, chip: 999 }, // 对齐 02 · 2.4
  /** 边框宽度档 + 焦点环（02 · 2.7.1）；加粗态用 box-shadow/outline，禁改 border-width */
  border: { hairline: 1, half: 0.5, thin: 1, strong: 1.5, heavy: 2, ring: 2, ringOffset: 2 },
  ring: { light: "rgba(232,93,143,.6)", dark: "rgba(255,196,214,.7)" },
  /** 链接（03 · 3.10） */
  link: { default: "#B23A63", hover: "#9E3054", danger: "#B72F42" },
  /** 暗黑模式映射（02 · 2.1.9）：夜间暖石板；运行时以 [data-theme="dark"] CSS 变量为准 */
  dark: {
    pageBg: "#1B1A21", surface: "#23222A",
    textPrimary: "#F3EFEC", textSecondary: "#C9C4CE", textTertiary: "#A6ADB9",
    link: "#FFC4D6",
    glassPanel: "rgba(255,255,255,.06)", glassCard: "rgba(255,255,255,.09)",
    glassControl: "rgba(255,255,255,.12)", glassPopover: "rgba(38,36,46,.92)",
    divider: "rgba(255,255,255,.10)",
    sem: { positive: "#6FC9B4", info: "#9CAEFF", attention: "#F2C14E", risk: "#F79AA8", neutral: "#A6ADB9", special: "#B9A0FF" },
  },
  font: '"Inter","PingFang SC","MiSans","Noto Sans SC",sans-serif',
};
