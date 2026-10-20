import React from "react";

/**
 * GmModal —— 弹窗（规范 03 · 3.9 / 11 · 11.2.15 / **Part 18 · MD-18-01/02/03/05**）
 *
 * 站点演示已达标（V2.9：role=dialog / aria-modal / ESC / 焦点归还），本组件把
 * MD-18 全量行为收进库，一次钉死：
 *
 * 1. **时序**（MD-18-01）：遮罩淡入 **250ms** + 面板 **320ms**（scale .98→1、
 *    下移 12px）；退场 240ms 播完再卸载（两阶段挂载，与 GmToast 同构）。
 * 2. **焦点管理**（MD-18-02）：打开锁 body 滚动、焦点进面板；ESC / 遮罩点击 /
 *    × 关闭；关闭把焦点**归还触发点**（打开前记住 document.activeElement）。
 * 3. **层叠 ≤2**（MD-18-02）：受控组件 + 单一实例，由调用方保证（弹窗内不再开弹窗）。
 * 4. **移动端**（11 · 11.2.15）：双按钮**竖排**（确认在下、取消在上）、单按钮全宽；
 *    宽 ≤ 屏宽-64、圆角 24（CSS 内建）。
 *
 * 确认按钮的 busyFor（MD-18-03 的 600–950ms 防双击）由调用方在 onOk 里控制；
 * 危险确认把 `okText` 换成语义文案并配合 `.gm-modal__btn--danger`（调用方可用
 * `footer` 覆盖整个按钮区）。
 */
export interface GmModalProps {
  /** 是否显示（受控），默认 false。与 Vue 侧同名 —— Vue 另有 v-model:open */
  open?: boolean;
  title?: React.ReactNode;
  /** 确认钮文案，默认「确定」 */
  okText?: string;
  /** 取消钮文案，默认「取消」 */
  cancelText?: string;
  /** 右上角 ×，默认 true */
  closable?: boolean;
  /** 点击遮罩关闭，默认 true（同时保留 ESC 与取消钮两条等价路径） */
  maskClosable?: boolean;
  /** 面板宽度 px，默认 480（MD-18-02 常规 480–720；CSS 同时收口 ≤ 屏宽-64） */
  width?: number;
  /** 覆盖整个按钮区；传了就不再渲染 ok/cancel 默认按钮 */
  footer?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  /** 任一关闭通道（ESC/遮罩/×/取消）最终都走这里；缺省回落 onCancel */
  onClose?: () => void;
  children?: React.ReactNode;
}

const LEAVE_MS = 240; /* 退场时长：与 theme.css 的 gmModalMaskOut/gmModalOut 同源 */

const GmModal = ({
  open = false,
  title,
  okText = "确定",
  cancelText = "取消",
  closable = true,
  maskClosable = true,
  width = 480,
  footer,
  onOk,
  onCancel,
  onClose,
  children,
}: GmModalProps) => {
  /* 两阶段挂载：open 落下先播 240ms 退场再卸载（MD-18-01；与 GmToast 同构） */
  const [mounted, setMounted] = React.useState(open);
  const [leaving, setLeaving] = React.useState(false);
  const prevFocusRef = React.useRef<HTMLElement | null>(null);
  const bodyOverflowRef = React.useRef<string>("");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const requestClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
    } else if (mounted) {
      setLeaving(true);
      const t = setTimeout(() => {
        setMounted(false);
        setLeaving(false);
      }, LEAVE_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  /* 打开：锁 body 滚动 + 焦点进面板（MD-18-02）；记住触发点待关闭归还 */
  React.useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      panelRef.current && panelRef.current.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  /* 关闭：还原滚动 + 焦点归还触发点（MD-18-02） */
  React.useEffect(() => {
    if (!open && mounted) {
      document.body.style.overflow = bodyOverflowRef.current;
      if (prevFocusRef.current && prevFocusRef.current.isConnected) {
        prevFocusRef.current.focus();
      }
    }
  }, [open, mounted]);

  /* ESC 关闭（MD-18-02） */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        requestClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className={"gm-modal" + (leaving ? " is-leaving" : "")}>
      {/* 遮罩点击关闭：e.target === currentTarget 才关（面板内的点击不误关） */}
      <div
        className="gm-modal__mask"
        onClick={(e) => {
          if (maskClosable && e.target === e.currentTarget) requestClose();
        }}
      >
        <div
          className="gm-modal__panel"
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : "对话框"}
          style={{ width }}
        >
          {(title || closable) && (
            <div className="gm-modal__head">
              <div className="gm-modal__title" id={titleId}>
                {title}
              </div>
              {closable && (
                <button type="button" className="gm-modal__close" aria-label="关闭" onClick={requestClose}>
                  ×
                </button>
              )}
            </div>
          )}
          <div className="gm-modal__body">{children}</div>
          <div className="gm-modal__foot">
            {footer !== undefined ? (
              footer
            ) : (
              <>
                <button type="button" className="gm-modal__btn" onClick={requestClose}>
                  {cancelText}
                </button>
                <button type="button" className="gm-modal__btn gm-modal__btn--primary" onClick={onOk}>
                  {okText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GmModal;
