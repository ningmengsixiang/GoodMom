import React, { forwardRef } from "react";
import Button, { ButtonProps } from "@arco-design/web-react/es/Button";

/**
 * GmButton —— 按钮（对齐 Arco Button 全谱，见 03 · 3.2.4）
 * 类型 type: primary(蜜桃粉渐变主) | secondary | outline | dashed | text | default
 * 状态 status: default | success(薄荷) | warning | danger
 * 尺寸 size: mini | small | default | large；形状 shape: round | circle | square
 * long=全宽；其余透传 Arco ButtonProps
 */
export interface GmButtonProps extends ButtonProps {
  /** 附加 GoodMom 语义类（可选），不影响 Arco 逻辑 */
  gm?: string;
}

const GmButton = forwardRef<HTMLButtonElement, GmButtonProps>(
  ({ gm, className, children, ...rest }, ref) => {
    return (
      <Button ref={ref} className={["gm-btn", gm, className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </Button>
    );
  }
);
GmButton.displayName = "GmButton";
export default GmButton;
