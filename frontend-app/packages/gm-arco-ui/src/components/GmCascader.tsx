import React, { useEffect, useRef, useState } from "react";

/** GmCascader —— 级联选择（规范 03 · 3.5.5 / 10 · 10.11.3）
 *  自包含实现（零外部依赖，不用 Arco）：popup / inline / picker 三形态 · 受控与非受控双模式。
 *  交互与语义：触发点为 <button aria-haspopup="listbox" aria-expanded>；每列 role="listbox"，
 *  选项为 <button role="option" aria-selected>；列内 roving tabindex（仅高亮项 tabIndex=0）。
 *  键盘：↑/↓ 移动高亮、→ 进入下一列、← 返回上一列、Enter/Space 选中、Home/End 首尾、Escape 关闭并归还焦点。
 *  picker 形态渲染遮罩 + 底部弹层（role="dialog" aria-modal），点遮罩 = 取消，确定才提交。
 *  视觉全部由 class 提供（统一写入 theme.css），组件内不出现任何色值；
 *  列渲染用普通 map（选项数 < 200 场景，按约定不引入虚拟滚动）。
 */
export interface GmCascaderOption {
  value: string;
  label: React.ReactNode;
  children?: GmCascaderOption[];
  disabled?: boolean;
}

export interface GmCascaderProps {
  options: GmCascaderOption[];
  /** 受控值（级联路径）；传入即为受控模式 */
  value?: string[];
  /** 非受控初始值 */
  defaultValue?: string[];
  onChange?: (value: string[], selectedOptions: GmCascaderOption[]) => void;
  /** 形态，默认 "popup" */
  mode?: "popup" | "inline" | "picker";
  placeholder?: string;
  disabled?: boolean;
  /** 默认 false：仅叶子可提交；true 时点任意层级即提交 */
  changeOnSelect?: boolean;
  /** 展示分隔符，默认 " / " */
  separator?: string;
  /** 默认 true：悬停/聚焦触发点时显示清空按钮（显隐由 CSS 控制） */
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface GmFocusReq {
  col: number;
  idx: number;
}

interface GmNavState {
  path: string[];
  focus: GmFocusReq | null;
}

/** 按 value 查子项（独立函数：避免 level 的流类型与 find 推断互相依赖） */
function findOption(list: GmCascaderOption[], value: string): GmCascaderOption | undefined {
  for (let i = 0; i < list.length; i++) {
    if (list[i].value === value) return list[i];
  }
  return undefined;
}

/** 沿 path 展开列：返回 [第 1 列, 第 2 列, …] */
function buildColumns(options: GmCascaderOption[], path: string[]): GmCascaderOption[][] {
  const cols: GmCascaderOption[][] = [];
  let level: GmCascaderOption[] | undefined = options;
  for (let i = 0; level && level.length > 0; i++) {
    cols.push(level);
    const v = path[i];
    if (v === undefined) break;
    const hit = findOption(level, v);
    if (!hit || !hit.children || hit.children.length === 0) break;
    level = hit.children;
  }
  return cols;
}

/** 沿 path 解析出完整选项链（用于 onChange 与展示） */
function resolveOptions(options: GmCascaderOption[], path: string[]): GmCascaderOption[] {
  const out: GmCascaderOption[] = [];
  let level: GmCascaderOption[] | undefined = options;
  for (let i = 0; i < path.length; i++) {
    if (!level) break;
    const hit = findOption(level, path[i]);
    if (!hit) break;
    out.push(hit);
    level = hit.children;
  }
  return out;
}

function firstEnabledIndex(list: GmCascaderOption[]): number {
  for (let i = 0; i < list.length; i++) {
    if (!list[i].disabled) return i;
  }
  return 0;
}

/** 跳过禁用项，向 dir 方向找下一个可用下标；找不到返回 -1 */
function stepEnabled(list: GmCascaderOption[], from: number, dir: number): number {
  let i = from;
  while (i >= 0 && i < list.length) {
    if (!list[i].disabled) return i;
    i += dir;
  }
  return -1;
}

function colKey(columns: GmCascaderOption[][], path: string[]): string {
  return columns.map((c) => c.map((o) => o.value).join(",")).join("|") + "@@" + path.join(",");
}

const GmCascader = ({
  options,
  value,
  defaultValue,
  onChange,
  mode = "popup",
  placeholder = "请选择",
  disabled = false,
  changeOnSelect = false,
  separator = " / ",
  allowClear = true,
  className,
  style,
}: GmCascaderProps) => {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<string[]>(() => defaultValue || []);
  const selected: string[] = controlled ? (value as string[]) : inner;

  const [open, setOpen] = useState<boolean>(mode === "inline");
  const [navState, setNavState] = useState<GmNavState>({ path: selected, focus: null });
  const [active, setActive] = useState<number[]>([0]);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const didMountRef = useRef(false);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  /* 面板展开时以 navState.path 为准；收起时回落到已提交值 */
  const path = open ? navState.path : selected;
  const columns = buildColumns(options, path);
  const columnsKey = colKey(columns, path);

  const selOpts = resolveOptions(options, selected);
  const hasValue = selOpts.length > 0;
  const showClear = allowClear && !disabled && hasValue;

  const navOpts = resolveOptions(options, navState.path);
  const navLast = navOpts.length > 0 ? navOpts[navOpts.length - 1] : undefined;
  const canConfirm = !!navLast && (changeOnSelect || !navLast.children || navLast.children.length === 0);

  const commit = (next: string[]) => {
    if (!controlled) setInner(next);
    if (onChange) onChange(next, resolveOptions(options, next));
  };

  const closePanel = (returnFocus: boolean) => {
    setOpen(false);
    setNavState((prev) => ({ path: prev.path, focus: null }));
    if (returnFocus && triggerRef.current) triggerRef.current.focus();
  };

  const toggle = () => {
    if (disabled) return;
    if (open) {
      closePanel(false);
      return;
    }
    setOpen(true);
  };

  const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setNavState({ path: [], focus: null });
    commit([]);
  };

  const pick = (col: number, idx: number) => {
    const list = columns[col] || [];
    const opt = list[idx];
    if (!opt || opt.disabled) return;
    const next = path.slice(0, col).concat(opt.value);
    const kids = opt.children && opt.children.length > 0 ? opt.children : null;

    /* picker：点选只暂存，确定时才提交 */
    if (mode === "picker") {
      setNavState({ path: next, focus: kids ? { col: col + 1, idx: firstEnabledIndex(kids) } : null });
      return;
    }
    if (kids) {
      setNavState({ path: next, focus: { col: col + 1, idx: firstEnabledIndex(kids) } });
      if (changeOnSelect) commit(next);
      return;
    }
    commit(next);
    if (mode === "popup") {
      /* 收起后高亮项会卸载：焦点必须归还触发点，避免焦点掉到 body */
      closePanel(true);
      return;
    }
    setNavState({ path: next, focus: null });
  };

  const confirm = () => {
    if (!canConfirm) return;
    commit(navState.path);
    closePanel(false);
  };

  const cancel = () => {
    setNavState({ path: selectedRef.current, focus: null });
    closePanel(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      if (mode === "picker") cancel();
      else closePanel(true);
      return;
    }
    if (!open) return;
    const t = e.target as HTMLElement | null;
    if (!t || typeof t.getAttribute !== "function") return;
    const colAttr = t.getAttribute("data-col");
    const idxAttr = t.getAttribute("data-idx");
    if (colAttr === null || idxAttr === null) return;
    const col = Number(colAttr);
    const idx = Number(idxAttr);
    const list = columns[col] || [];
    if (!list.length) return;

    const moveTo = (target: number) => {
      if (target < 0 || target >= list.length) return;
      e.preventDefault();
      setActive((prev) => {
        const a = prev.slice();
        while (a.length <= col) a.push(0);
        a[col] = target;
        return a;
      });
      /* 仅更新焦点请求，path 不变 → 高亮态不会被重置 */
      setNavState((prev) => ({ path: prev.path, focus: { col, idx: target } }));
    };

    if (e.key === "ArrowDown") {
      moveTo(stepEnabled(list, idx + 1, 1));
      return;
    }
    if (e.key === "ArrowUp") {
      moveTo(stepEnabled(list, idx - 1, -1));
      return;
    }
    if (e.key === "Home") {
      moveTo(stepEnabled(list, 0, 1));
      return;
    }
    if (e.key === "End") {
      moveTo(stepEnabled(list, list.length - 1, -1));
      return;
    }
    if (e.key === "ArrowRight") {
      const opt = list[idx];
      const kids = opt && opt.children && opt.children.length > 0 ? opt.children : null;
      if (!kids) return;
      e.preventDefault();
      const nextIdx = firstEnabledIndex(kids);
      setActive((prev) => {
        const a = prev.slice();
        while (a.length <= col + 1) a.push(0);
        a[col + 1] = nextIdx;
        return a;
      });
      setNavState({ path: path.slice(0, col).concat(opt.value), focus: { col: col + 1, idx: nextIdx } });
      return;
    }
    if (e.key === "ArrowLeft") {
      if (col <= 0) return;
      e.preventDefault();
      const pc = col - 1;
      const prevList = columns[pc] || [];
      const pIdx = active[pc] === undefined ? firstEnabledIndex(prevList) : active[pc];
      setActive((prev) => {
        const a = prev.slice();
        while (a.length <= pc) a.push(0);
        a[pc] = pIdx;
        return a;
      });
      setNavState((prev) => ({ path: prev.path, focus: { col: pc, idx: pIdx } }));
      return;
    }
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      pick(col, idx);
    }
  };

  /* 高亮态与列结构同步；箭头移动时不改 path，因此不会被重置 */
  useEffect(() => {
    setActive((prev) => {
      const next = columns.map((col, i) => {
        const hit = col.findIndex((o) => o.value === path[i]);
        return hit >= 0 ? hit : firstEnabledIndex(col);
      });
      if (prev.length === next.length && prev.every((v, i) => v === next[i])) return prev;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnsKey]);

  /* 焦点请求：只在同一批渲染完成后执行，保证目标节点已存在 */
  useEffect(() => {
    const f = navState.focus;
    if (!f) return;
    const host = panelRef.current;
    if (!host) return;
    const el = host.querySelector('[data-col="' + f.col + '"][data-idx="' + f.idx + '"]') as HTMLButtonElement | null;
    if (el) el.focus();
  }, [navState]);

  /* 展开时重置导航路径；首帧（inline 默认展开）不抢焦点 */
  useEffect(() => {
    if (!open) return;
    const base = selectedRef.current;
    if (!didMountRef.current) {
      setNavState({ path: base, focus: null });
      return;
    }
    const cols = buildColumns(options, base);
    const last = cols.length - 1;
    setNavState({
      path: base,
      focus: last >= 0 ? { col: last, idx: firstEnabledIndex(cols[last]) } : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    didMountRef.current = true;
  }, []);

  /* 点击面板外部关闭（document 级监听，随 open 清理） */
  useEffect(() => {
    if (!open || mode === "inline") return;
    if (typeof document === "undefined") return;
    const onDown = (ev: MouseEvent) => {
      const root = rootRef.current;
      /* P1-12：必须用 `composedPath()` 的**派发时快照**判断内外。
         `root.contains(ev.target)` 在"面板内点击触发重渲染 → 目标节点随即脱离文档"时
         返回 false，于是面板内点击被误判为外部点击、面板立刻关闭
         （表现为"点了选项没反应 / 展开又收起"）。
         该修复此前**只存在于站点演示产物里**，两个库都还是旧写法。 */
      const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
      const inside = root && (path.indexOf(root) >= 0 || (ev.target instanceof Node && root.contains(ev.target)));
      if (inside) return;
      setOpen(false);
      setNavState((prev) => ({ path: prev.path, focus: null }));
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, mode]);

  const valNodes = selOpts.map((o, i) => (
    <React.Fragment key={o.value}>
      {i > 0 ? separator : null}
      {o.label}
    </React.Fragment>
  ));

  const colNodes = columns.map((col, ci) => (
    <div
      className="gm-cascader__col"
      role="listbox"
      aria-label={"第 " + (ci + 1) + " 级选项"}
      key={ci}
      data-col={ci}
    >
      {col.map((opt, oi) => {
        const isActive = (active[ci] === undefined ? 0 : active[ci]) === oi;
        const isSelected = path[ci] === opt.value;
        return (
          <button
            type="button"
            role="option"
            key={opt.value}
            data-col={ci}
            data-idx={oi}
            className={
              "gm-cascader__opt" +
              (isActive ? " is-active" : "") +
              (isSelected ? " is-selected" : "") +
              (opt.disabled ? " is-disabled" : "")
            }
            aria-selected={isSelected}
            tabIndex={isActive ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => pick(ci, oi)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  ));

  const panelNode =
    columns.length === 0 ? (
      <div className="gm-cascader__panel" ref={panelRef}>
        <div className="gm-cascader__empty">暂无可选项</div>
      </div>
    ) : (
      <div className="gm-cascader__panel" ref={panelRef}>
        {colNodes}
      </div>
    );

  const overlay =
    mode === "picker" && open ? (
      <div className="gm-cascader__mask" onClick={cancel}>
        <div
          className="gm-cascader__sheet"
          role="dialog"
          aria-modal="true"
          aria-label="级联选择"
          onClick={(e) => e.stopPropagation()}
        >
          {panelNode}
          <div className="gm-cascader__foot">
            <button type="button" className="gm-cascader__btn" onClick={cancel}>
              取消
            </button>
            <button
              type="button"
              className="gm-cascader__btn is-primary"
              disabled={!canConfirm}
              onClick={confirm}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    ) : open ? (
      panelNode
    ) : null;

  const cls = [
    "gm-cascader",
    mode === "inline" ? "gm-cascader--inline" : "",
    mode === "picker" ? "gm-cascader--picker" : "",
    open ? "is-open" : "",
    disabled ? "is-disabled" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={style} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={triggerRef}
        className="gm-cascader__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
      >
        {hasValue ? <span className="gm-cascader__val">{valNodes}</span> : <span className="gm-cascader__ph">{placeholder}</span>}
        <span className="gm-cascader__arrow" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M3 4.6 6 7.6l3-3" />
          </svg>
        </span>
      </button>
      {showClear ? (
        <button type="button" className="gm-cascader__clear" aria-label="清空" onClick={clear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      ) : null}
      {overlay}
    </div>
  );
};

export default GmCascader;
