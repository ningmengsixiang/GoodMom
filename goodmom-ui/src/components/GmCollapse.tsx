import React from "react";

/**
 * GmCollapse —— 折叠面板（规范 11 · 11.2.6）
 *
 * 站点已落地 `.gm-fold`（V2.9：300ms grid-rows + 220ms 箭头 + 一屏 ≤3），
 * 本组件把外壳脚本里的驱动逻辑搬进库，一次钉死四个实测坑：
 *
 * 1. **动画时序**：原生 `<details>` 收起时内容立刻被 slot 隐藏，transition 根本
 *    播不出来 —— 必须拦截 summary 点击：展开 = 先 `open` 再 0fr→1fr；
 *    收起 = 先推 0fr 等 **300ms** 再摘 `open`（07 M3 档）。
 * 2. **代理层不得带 padding**：`.gm-fold__body>div` 的 0fr 轨道基尺寸取子项
 *    min-content，padding 不可压缩（实测收起后残留 14px）——padding 在下一层。
 * 3. **aria**：原生 details 不报展开态 —— summary 补 `aria-expanded` +
 *    `aria-controls`（指向 body id），键盘 Enter/Space 由原生 summary 承担。
 * 4. **一屏 ≤3**：同组展开超过 `maxOpen`（默认 3，规范写死）时自动收起最早展开的。
 *
 * 受控由 `defaultOpenKeys` 起步（非受控组件，页面上限规则由组件内建）。
 */
export interface GmFoldItem {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** 状态点五色（14 · 4.4.5）；缺省 neutral 灰点 */
  tone?: "neutral" | "positive" | "attention" | "risk" | "info";
}
export interface GmCollapseProps {
  items: GmFoldItem[];
  /** 初始展开的 key 列表，默认 [] */
  defaultOpenKeys?: string[];
  /** 手风琴：同一时刻只展开一项，默认 false */
  accordion?: boolean;
  /** 同组同时展开上限（11 · 11.2.6 写死一屏 ≤3），默认 3 */
  maxOpen?: number;
}

const DUR = 300; /* 07 M3：高度过渡 300ms（与 CSS grid-template-rows 300ms 同源） */

const GmCollapse = ({ items, defaultOpenKeys = [], accordion = false, maxOpen = 3 }: GmCollapseProps) => {
  const [openKeys, setOpenKeys] = React.useState<string[]>(defaultOpenKeys);
  const [closing, setClosing] = React.useState<Record<string, boolean>>({});
  const baseId = React.useId();

  const handleSummary = (item: GmFoldItem) => (e: React.MouseEvent) => {
    e.preventDefault(); /* 动画由组件驱动，不能让原生 toggle 直接切换 */
    if (closing[item.key]) return;
    if (openKeys.includes(item.key)) {
      /* 收起：先推 0fr（CSS 过渡 300ms），播完再摘 open —— 顺序反了动画就没了 */
      setClosing((c) => ({ ...c, [item.key]: true }));
      window.setTimeout(() => {
        setOpenKeys((prev) => prev.filter((k) => k !== item.key));
        setClosing((c) => {
          const next = { ...c };
          delete next[item.key];
          return next;
        });
      }, DUR);
    } else {
      setOpenKeys((prev) => {
        let next = accordion ? [item.key] : [...prev, item.key];
        if (next.length > maxOpen) next = next.slice(next.length - maxOpen); /* 一屏 ≤3：收最早 */
        return next;
      });
    }
  };

  return (
    <>
      {items.map((it, i) => {
        const open = openKeys.includes(it.key);
        const sumId = baseId + "-sum-" + i;
        const bodyId = baseId + "-body-" + i;
        return (
          <details
            key={it.key}
            className={"gm-fold" + (closing[it.key] ? " is-closing" : "")}
            open={open}
            data-tone={it.tone && it.tone !== "neutral" ? it.tone : undefined}
          >
            <summary id={sumId} aria-expanded={open} aria-controls={bodyId} onClick={handleSummary(it)}>
              <span className="gm-fold__dot" aria-hidden="true" />
              {it.title}
              <svg
                className="gm-fold__arr"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="gm-fold__body" id={bodyId}>
              <div>
                <div>{it.content}</div>
              </div>
            </div>
          </details>
        );
      })}
    </>
  );
};
export default GmCollapse;
