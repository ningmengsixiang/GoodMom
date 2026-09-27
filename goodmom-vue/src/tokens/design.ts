/**
 * GoodMom Design Tokens（Vue 版单一数值源；字段与 02 / 12 章及 React 版 @goodmom/ui 保持一致，
 *   一致性由 scripts/audit.py 的 mirror/status 检查与 check-status-map.py 守门）
 *
 * 口径约定（与 React 版 D 系列裁决一致）：
 * - 组件内**不出现裸色值**，一律引用 CSS 变量（`--lg-*` / `--mmh-*` / `--lg-sem-*`）；
 *   本文件仅供主题切换、图表配置、JS 侧计算（如动态色点、canvas）使用。
 * - 数值变更必须同步 `02-Token规范.md`，并回归 `npm run build -w @goodmom/vue` 与预览页。
 */
export const DesignTokens = {
  rose: { "700": "#A9315B", "600": "#E85D8F", "500": "#F77FA3", "400": "#FFA3BE", "300": "#FFC4D6", "200": "#FFDEE8", "100": "#FFF0F4" },
  mint: { "600": "#4FB59C", "500": "#6FC9B4", "400": "#7FD8C2", "300": "#A9E3D4", "100": "#E2F6F0" },
  info: "#6D9EFF", warning: "#F2B25C", danger: "#EF6A7B", purple: "#9A78FF",
  gradPrimary: "linear-gradient(135deg,#FFA9C2,#F77FA3 45%,#E85D8F)",
  /* 三档头像（仅 GmAvatar 使用）：**浅底渐变 + 同色系深墨字**，与站点 `.avt` 配方一致。
     V2.9 实测：旧实现是「深渐变 + 白字」（--lg-text-on-inverse），压在亮粉渐变上只有 2.81:1；
     深端 #E85D8F 配深墨字 3.48:1、#8066F0 配深墨字 2.76:1 —— 两头都不达标。
     现渐变收到浅档（各色标亮度 0.65→0.51，深墨字 7.7:1 / 6.1:1），墨色用固定色值：
     **刻意不用会换档的语义变量** —— 头像底是固定浅色，墨色若跟随暗色档翻浅就会掉到 ~1.5:1。 */
  gradRose: "linear-gradient(150deg,#FFDEE8,#FFF0F4)",
  gradMint: "linear-gradient(150deg,#A5F1EE,#E0F8F6)",
  gradPurple: "linear-gradient(150deg,#D9CBFE,#EDE7FE)",
  /* 头像墨色（同色系深档，固定值不随档位变） */
  avatarInkRose: "#B23A63", avatarInkMint: "#25715D", avatarInkPurple: "#6242B8",
  /** D9 主行动档：品牌粉上半段 Rose-300→Rose-500，承载深字 #343A46（全尺寸 ≥4.89:1） */
  gradActionHc: "linear-gradient(135deg,#FFC4D6 0%,#F77FA3 100%)",
  /** 卡片/按钮/控件圆角档（02 · 2.4） */
  radius: { card: 22, btn: 22, btnLg: 26, btnSm: 18, control: 20, chip: 999 },
  /** 边框宽度档 + 焦点环（02 · 2.7.1）；加粗态用 box-shadow/outline，禁改 border-width */
  border: { hairline: 1, half: 0.5, thin: 1, strong: 1.5, heavy: 2, ring: 2, ringOffset: 2 },
  ring: { light: "rgba(232,93,143,.6)", dark: "rgba(255,196,214,.7)" },
  /** 链接（03 · 3.10） */
  link: { default: "#A9315B", hover: "#9E3054", danger: "#B72F42" },
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
} as const;

/** 主题模式（02 · 2.1.9）：在任意容器根节点设置 data-theme，变量即整体切换 */
export type GmTheme = "light" | "dark";

export default DesignTokens;
