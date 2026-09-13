/**
 * 页面四态容器（08.2.12 / 08.2.15 / 11.6.9）
 *
 * 为什么必须存在：加载/空/错三态如果各页各写一遍，必然出现
 * "有的页骨架带扫光、有的页错误只标红不给动作"这类漂移。四态一律走这里。
 *   loading → GmSkeleton（胶囊 + 1.6s 呼吸，禁左右扫光）
 *   error   → GmResult（三通道：色 + 可理解原因 + 可执行动作）
 *   empty   → GmEmpty（图标 large + 一句话 + 可选行动）
 *   ready   → children
 */
import React from "react";
import { GmButton, GmEmpty, GmResult, GmSkeleton } from "@goodmom/gm-arco-ui";
import type { AsyncState } from "@/shared/api/useRequest";

export interface PageStateProps<T> {
  state: AsyncState<T>;
  /** 骨架行数（贴近终态高度，避免跳动） */
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDesc?: React.ReactNode;
  /** 空态的主行动（有操作含义的空态才给） */
  emptyAction?: { text: string; onClick: () => void };
  children: (data: T) => React.ReactNode;
}

export function PageState<T>({
  state, skeletonRows = 3, emptyTitle = "暂无数据", emptyDesc, emptyAction, children,
}: PageStateProps<T>) {
  if (state.loading) return <GmSkeleton rows={skeletonRows} rowHeight={16} />;
  if (state.error) {
    return (
      <GmResult
        status="error"
        title="加载失败"
        desc={state.error.hint}
        actionText="重新加载"
        onAction={state.reload}
      />
    );
  }
  if (state.empty) {
    return (
      <GmEmpty iconSize="large" title={emptyTitle} desc={emptyDesc}>
        {emptyAction ? (
          /* 空态主行动复用组件库按钮 —— 不手搓：手搓会丢掉 loading/disabled/焦点环/深字口径 */
          <GmButton type="primary" onClick={emptyAction.onClick}>{emptyAction.text}</GmButton>
        ) : null}
      </GmEmpty>
    );
  }
  return <>{state.data === undefined ? null : children(state.data as T)}</>;
}

export default PageState;
