/**
 * 角色守卫（19.5：权限是**模块边界**的一部分，不是页面里的一句 if）
 *
 * 医生/护士/管理员三档：机构运营与数据中心只对 admin 开放，其余前端只做
 * 可见性收敛 —— 真正的鉴权必须在服务端，前端守卫只解决"不该看到的入口不出现"。
 */
import React from "react";
import { GmResult } from "@goodmom/gm-arco-ui";
import { useAuth, type Role } from "@/shared/session";

export function RequireRole({ need, children }: { need: Role | Role[]; children: React.ReactNode }) {
  const { can, name } = useAuth();
  if (can(need)) return <>{children}</>;
  return (
    <GmResult
      status="warning"
      title="没有访问权限"
      desc={`当前登录账号「${name}」无权访问该模块，请联系机构管理员开通。`}
      ariaLabel="权限不足"
    />
  );
}

export default RequireRole;
