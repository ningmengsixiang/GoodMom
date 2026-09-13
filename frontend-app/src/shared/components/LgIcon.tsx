/**
 * LG 图标（09 章 · 方式 B 雪碧图）
 *
 * 为什么放在 `shared/components/`：09.5 的三种接入方式里，方式 B（雪碧图）是
 * "一枚图标被多处用到"时的口径；本工程现有两个模块要真实渲染图标
 * （childcare 的 13.3.8 六项要用 H 类 `lg-icon-wj-*`，vaccine 的 13.3.3 徽章要用
 * `lg-icon-vaccine`），按 19.6.1「第二个月就提为共享件」的判据落在 shared。
 *
 * 图标名**只允许来自 09 章 9.3 清单**（`lg-icon-*`）：本组件不接受任意 path，
 * 也不做颜色决策 —— 颜色一律继承 `currentColor`（09.4 颜色规则：语义色由 Token 控制）。
 * 装饰性图标 `aria-hidden`：信息通道永远是旁边的文字（19.7.5「色 + 词」双通道）。
 *
 * `plate`（图标底）是 13.3.8「图标 44 底」与 13.3.3「白玻璃疫苗徽章」共用的那一格：
 * 两块都要求同一个"图标 + 玻璃底盘"的视觉，故按 19.6.3 提到这里而不是各页内联一遍。
 * 底盘只引用 Token（`--lg-glass-control` / `--lg-border-white-70` / `--lg-radius-control`），
 * 配方本身仍在组件库与 `styles/layout.css`（19.7 硬约束）。
 *
 * 雪碧图同步：`frontend-app/public/icons/lg-icons.svg` 是仓库根 `icons/lg-icons.svg`
 * 的**副本**（前端构建只能把 public/ 下的静态资源原样发布，无法直接引用应用根之外的文件）。
 * 09 章图标增删后必须重新同步一次，否则新图标名会渲染成空白（不报错）。
 */
import React from "react";

export interface LgIconProps {
  /** 09 章 9.3 清单里的图标名，如 `lg-icon-wj-growth` */
  name: string;
  /** 视觉尺寸（09.4 尺寸档：列表内 16–18，按钮内 16，独立 20–24） */
  size?: number;
  /** 图标底尺寸（px）。传值即渲染玻璃底盘：13.3.8 = 44，13.3.3 疫苗徽章 = 44 */
  plate?: number;
  /** 允许的只有排版类补充（如 verticalAlign），颜色请用 currentColor */
  style?: React.CSSProperties;
}

export function LgIcon({ name, size = 20, plate, style }: LgIconProps) {
  const svg = (
    <svg
      className="lg-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
      style={plate ? undefined : style}
    >
      <use href={`/icons/lg-icons.svg#${name}`} />
    </svg>
  );
  if (!plate) return svg;
  return (
    <span
      aria-hidden="true"
      style={{
        width: plate, height: plate, flex: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--lg-radius-control,16px)",
        background: "var(--lg-glass-control,rgba(255,255,255,.5))",
        border: "1px solid var(--lg-border-white-70,rgba(255,255,255,.66))",
        color: "var(--lg-text-secondary,#4F5B6E)",
        ...style,
      }}
    >
      {svg}
    </span>
  );
}

export default LgIcon;
