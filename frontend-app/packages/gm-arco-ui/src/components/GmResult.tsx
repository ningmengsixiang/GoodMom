import React from "react";

/**
 * GmResult —— 结果 / 错误页（规范 03 · 3.2.2 结果页、**Part 19 · EL-19-03**）
 *
 * ## 为什么补它（本轮「状态与加载」深化最大的缺口）
 *
 * `Part 19 · EL-19-03` 明确要求「Error 三通道（色 + 文案 + 动作）」，`00-组件总目录`
 * 也早已登记 **#40 Result 结果页**（移动端 11.2.10）—— 但**两个库里都没有实现**：
 * 出错时各页面只能自己拼一个红色文字块，于是"三通道"退化成单通道。
 *
 * ## 三通道怎么落
 *
 * | 通道 | 实现 |
 * | --- | --- |
 * | 色 | `gm-result--{status}` → `--lg-sem-*` 语义 alias（暗色档自动换浅档） |
 * | 文案 | `title`（一句话说明）+ `desc`（可理解的下一步），**不给技术细节** |
 * | 动作 | `actionText` + `onAction`（如「稍后重试」「联系客服」「保持现场数据」） |
 *
 * ## 医疗场景纪律（EL-19-03 / 15 章）
 *
 * - **不暴露内部结构**：故**有意不提供 `code`/`stack` 之类的 prop**。要显示受理号这类
 *   *用户可见* 的编号，用 `desc` 写清楚即可；错误码属于内部结构，不应出现在界面上。
 * - 文案由调用方给可执行引导，组件不写死「出错了」这类无信息量的兜底话术。
 * - `error` 用 `role="alert"`（需要立刻被听到），其余用 `role="status"`（polite 播报）。
 *
 * 与 `GmEmpty` 的分工：**Empty = 没有数据但一切正常**；**Result = 操作有结论（成功/失败）**。
 */
export interface GmResultProps {
  /** 结论类型：success 成功 / error 失败 / warning 需注意 / info 中性说明 */
  status?: "success" | "error" | "warning" | "info";
  /** 一句话结论 */
  title?: string;
  /** 补充说明：可理解的原因 + 用户可做的动作（禁技术堆栈） */
  desc?: React.ReactNode;
  /** 主行动文案（如「稍后重试」）；为空则不渲染按钮 */
  actionText?: string;
  onAction?: () => void;
  /** 自定义图标，默认用内置状态图标 */
  icon?: React.ReactNode;
  /** 无 title 时的读屏名称 */
  ariaLabel?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** 内置状态图标（线性、24×24、1.7px 圆头，符合 09 · 9.2 绘制标准；由 CSS 继承语义色） */
const ICONS: Record<string, React.ReactNode> = {
  success: <path d="M4.5 12.5l5 5L19.5 7" />,
  error: (
    <>
      <path d="M12 7.5v6" />
      <circle cx="12" cy="17" r=".9" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r=".9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r=".9" />
    </>
  ),
};

const GmResult = ({
  status = "info",
  title,
  desc,
  actionText,
  onAction,
  icon,
  ariaLabel,
  children,
  style,
}: GmResultProps) => (
  <div
    className={["gm-result", `gm-result--${status}`].join(" ")}
    role={status === "error" ? "alert" : "status"}
    aria-label={title ? undefined : ariaLabel || "操作结果"}
    style={style}
  >
    <span className="gm-result__ic" aria-hidden="true">
      {icon || (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONS[status] || ICONS.info}
        </svg>
      )}
    </span>
    {title && <div className="gm-result__t">{title}</div>}
    {desc && <div className="gm-result__d">{desc}</div>}
    {actionText && (
      <button type="button" className="gm-result__act" onClick={onAction}>
        {actionText}
      </button>
    )}
    {children}
  </div>
);
export default GmResult;
