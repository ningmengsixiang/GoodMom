import React from "react";

/**
 * GmToast —— 轻提示（规范 03 · 3.9 / 07 · 7.3.7 / **Part 18 · MD-18-01/04**）
 *
 * ## 为什么补它（本轮「反馈与提示」深化）
 *
 * `00-组件总目录` 登记了 **8 个反馈类组件**（Toast #63 / Notification #64 / Modal #65 /
 * ActionSheet #66 / Popconfirm #67 / Popover·Tooltip #68 / Banner #69 / Drawer #26 /
 * NoticeBar #36），**两个库里一个都没有实现** —— 于是每个页面各自造 Toast：
 * 实测站点三处实现里，**没有一处**同时满足规范的位置、时序与无障碍要求：
 *
 * | 实现 | 违反 |
 * | --- | --- |
 * | `preview-index` 的 `.copied` | 在**底部**（MD-18-04 要求顶部偏上）、350ms（应 320ms）、无 `role`/`aria-live` |
 * | `preview-examples` 的 `.fx` | 同样在底部、250ms、无无障碍语义 |
 * | 演示稿的 `.toast` | 位置与"同类仅 1 条"是对的，但 250/220ms、驻留 2.3s（应 2.4s）、无 `role` |
 *
 * ## 本组件按规范钉死的四件事
 *
 * 1. **位置**：顶部居中偏上（`top`），移动端自动避让 TabBar（见 CSS 的 `--gm-toast-top`）。
 * 2. **时序**（MD-18-01）：滑入 **320ms** → 驻留 **2.4s** → 淡出上滑 **240ms**。
 *    驻留计时**由组件内置**，不由调用方记 —— 否则每个调用点都会写错一次。
 * 3. **同类仅 1 条**（MD-18-04）：堆叠会显得乱。本组件是**受控**的，故约定
 *    "同一时刻至多一个 `open`"；站点侧的最小实现用 `document.querySelector('.gm-toast')`
 *    先移除同类再挂载（见 `site/fragments/*` 的 `toast()`），本契约由
 *    `scripts/audit.py feedback-spec` 守门。
 * 4. **无障碍**：`role="alert"`（error 需立刻被听到）/ `role="status"` + `aria-live="polite"`
 *    （其余）；语义由**色点 + 文案**双通道承载（14 · 4.4.5），不靠颜色单独传义。
 */
/** MD-18-01：淡出上滑 240ms（与 theme.css 的 gmToastOut 动画时长同源） */
const LEAVE_MS = 240;

export interface GmToastProps {
  /** 是否显示（受控） */
  open: boolean;
  message?: string;
  /** 语义：success 成功 / error 失败 / warning 注意 / info 中性（默认） */
  status?: "success" | "error" | "warning" | "info";
  /** 驻留毫秒数，默认 2400（MD-18-01 的 2.4s）。传 0 表示不自动关闭 */
  duration?: number;
  /** 可选单行动作（如「撤销」）；为空则不渲染 */
  actionText?: string;
  onAction?: () => void;
  /** 自动关闭或手动关闭时触发 */
  onClose?: () => void;
  /** 无 message 时的读屏名称 */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

const GmToast = ({
  open,
  message,
  status = "info",
  duration = 2400,
  actionText,
  onAction,
  onClose,
  ariaLabel,
  style,
}: GmToastProps) => {
  /* 两阶段挂载：`open` 落下的瞬间**不能**立刻卸载 —— MD-18-01 要求
     "淡出上滑 240ms"，节点若当场消失，这 240ms 就只是一句空话。
     故 open=false → 先挂 `.is-leaving` 播完退场，再卸载。 */
  const [mounted, setMounted] = React.useState(open);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
    }
  }, [open]);

  /* 驻留计时内置：避免每个调用点各写一遍 setTimeout 且写错数值（MD-18-01 明确 2.4s） */
  React.useEffect(() => {
    if (!open || duration <= 0 || !onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose, message, status]);

  /* 退场：240ms 后才真正卸载；期间若又被 open（连续触发），本 effect 的
     cleanup 会清掉计时器，不会把刚挂上的节点撤掉。 */
  React.useEffect(() => {
    if (open || !mounted) return;
    setLeaving(true);
    const t = setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, LEAVE_MS);
    return () => clearTimeout(t);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div
      className={["gm-toast", `gm-toast--${status}`, leaving ? "is-leaving" : ""]
        .filter(Boolean)
        .join(" ")}
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      aria-label={message ? undefined : ariaLabel || "提示"}
      style={style}
    >
      <i className="gm-toast__dot" aria-hidden="true" />
      {message && <span className="gm-toast__t">{message}</span>}
      {actionText && (
        <button type="button" className="gm-toast__act" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
export default GmToast;
