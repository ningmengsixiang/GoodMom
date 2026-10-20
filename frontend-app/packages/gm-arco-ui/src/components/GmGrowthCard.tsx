import React from "react";

/**
 * GmGrowthCard —— 生长曲线卡（百分位带，规范 13 · 13.2）
 *
 * 站点唯一实现是外壳 `window.gmGrowth(el, data)`（V2.9 收敛），本组件把同一份
 * 图形与交互搬进库 —— 数据契约与站点**逐字一致**，页面侧可无缝迁移：
 *
 * 视觉硬约定（13.2，不可被 props 改掉）：
 *  · 参考带 P3–P97 淡薄荷 alpha **.12**（.10–.14 档；rose 档 #FFD0D8 .12）+ 细白上界；
 *  · 主曲线 #F77FA3 **2.5px** round + 端点白芯粉描边（r3）；
 *  · 警戒线 P3/P97 虚线 **1.5px** 三级色（`--gm-guide`，告警转 attention），可一键开关；
 *  · P50 中线细白 1px 虚线；带外数据点转琥珀/红 + 玻璃气泡建议；
 *  · 轴刻度 12px 次级色 tabular-nums（D 裁决：三级色只给非文字导引件）。
 *
 * 交互（双端，13.2）：
 *  · PC：悬停单点明细（白玻璃泡「月龄 18 月 · 体重 11.2kg · P62」）、
 *    鼠标拖拽框选区间 → role="status" 气泡播报「已框选 18–24 月 · N 个点…」；
 *  · M：长按单点 / 滑动沿曲线回看（touch 不进框选，直接取最近节点）；
 *  · `mini` 形态只留带 + 线 + 端点（200×74），无坐标轴与图例。
 *
 * 无障碍：svg `role="img"` + aria-label（含最新读数）；`.gm-sr-only` 隐藏数据表
 * （逐点 P3/P97/百分位，供读屏）；开关 `aria-pressed`；移动端开关热区 ≥44。
 *
 * 百分位算法：P3–P50–P97 **分段线性**（单一线性在带内偏 6–8 分位，实测踩过），
 * 带外按同斜率外推并夹到 1/99。
 */
export interface GmGrowthAdvisory {
  x?: number;
  tone?: "attention" | "risk" | "positive";
  text: string;
}
export interface GmGrowthData {
  title?: string;
  xName: string;
  xUnit?: string;
  yName: string;
  yUnit?: string;
  source?: string;
  bandLabel?: string;
  seriesName?: string;
  x: number[];
  p3: number[];
  p50: number[];
  p97: number[];
  actual: number[];
  /** 聚焦点（X 值），与 actual 同节点 */
  focus: number;
  xTicks?: number[];
  yTicks?: number[];
  advisories?: GmGrowthAdvisory[];
  hint?: string;
  /** rose = 孕期版参考带（13.2：mint 儿童 / rose 孕期） */
  tone?: "mint" | "rose";
  /** M 家长端形态：只留参考带 / 主曲线 / 端点 */
  mini?: boolean;
}
export interface GmGrowthRange {
  from: number;
  to: number;
  count: number;
  outOfBand: number;
}
export interface GmGrowthCardProps {
  data: GmGrowthData;
  /** P50 中线，默认 true */
  showP50?: boolean;
  /** P3/P97 一键开关，默认 true */
  showWarnToggle?: boolean;
  /** 悬停/长按单点 + 鼠标框选，默认 true */
  interactive?: boolean;
  onPoint?: (index: number) => void;
  onRange?: (range: GmGrowthRange) => void;
}

function pctlOf(d: GmGrowthData, x: number, v: number): number | null {
  const i = d.x.indexOf(x);
  if (i < 0) return null;
  const lo = d.p3[i];
  const mid = d.p50[i];
  const hi = d.p97[i];
  if (!(lo < mid && mid < hi)) return null;
  const p = v <= mid ? 3 + ((v - lo) / (mid - lo)) * 47 : 50 + ((v - mid) / (hi - mid)) * 47;
  return Math.max(1, Math.min(99, Math.round(p)));
}

function toneOf(d: GmGrowthData, x: number, v: number): "" | "attention" | "risk" {
  const i = d.x.indexOf(x);
  if (i < 0) return "";
  if (v < d.p3[i]) return "attention";
  if (v > d.p97[i]) return "risk";
  return "";
}

const GmGrowthCard = ({
  data,
  showP50 = true,
  showWarnToggle = true,
  interactive = true,
  onPoint,
  onRange,
}: GmGrowthCardProps) => {
  const mini = !!data.mini;
  const W = mini ? 200 : 380;
  const H = mini ? 74 : 168;
  const M = mini ? { t: 4, r: 4, b: 4, l: 4 } : { t: 10, r: 12, b: 26, l: 34 };
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;

  const xmin = data.x[0];
  const xmax = data.x[data.x.length - 1];
  const lo0 = Math.min(...data.p3);
  const hi0 = Math.max(...data.p97);
  const pad = (hi0 - lo0) * 0.18;
  const ymin = lo0 - pad;
  const ymax = hi0 + pad;
  const X = (v: number) => M.l + ((v - xmin) / (xmax - xmin)) * iw;
  const Y = (v: number) => M.t + (1 - (v - ymin) / (ymax - ymin)) * ih;

  const line = (vals: number[]) =>
    vals.map((v, i) => (i ? "L" : "M") + X(data.x[i]).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
  const band = () => {
    const up = line(data.p97);
    const back = data.p3
      .map(
        (_, i) =>
          "L" + X(data.x[data.x.length - 1 - i]).toFixed(1) + "," + Y(data.p3[data.p3.length - 1 - i]).toFixed(1)
      )
      .join(" ");
    return up + " " + back + " Z";
  };

  const yTicks = (data.yTicks || []).filter((v) => v > ymin && v < ymax);
  const fi = data.x.indexOf(data.focus);
  const fv = fi >= 0 ? data.actual[fi] : null;
  const fp = fi >= 0 && fv != null ? pctlOf(data, data.focus, fv) : null;
  const ariaLabel =
    (data.title || "生长曲线") +
    "：" +
    (data.source || "") +
    "，" +
    data.xName +
    " " +
    data.focus +
    " 时 " +
    data.yName +
    " " +
    fv +
    (data.yUnit || "") +
    "，约 P" +
    (fp ?? "—");

  const [tip, setTip] = React.useState<{ i: number; left: number; top: number } | null>(null);
  const [warnsOn, setWarnsOn] = React.useState(true);
  const [rangeNote, setRangeNote] = React.useState<GmGrowthRange | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const selRef = React.useRef<SVGRectElement>(null);
  const dragRef = React.useRef<number | null>(null);

  const show = (i: number) => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage) return;
    const box = svg.getBoundingClientRect();
    const px = box.left - stage.getBoundingClientRect().left + (X(data.x[i]) / W) * box.width;
    const py = box.top - stage.getBoundingClientRect().top + (Y(data.actual[i]) / H) * box.height;
    setTip({
      i,
      left: Math.max(38, Math.min(stage.clientWidth - 38, px)),
      top: Math.max(4, py - 10),
    });
    if (onPoint) onPoint(i);
  };
  const hide = () => setTip(null);

  const nearest = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const box = svg.getBoundingClientRect();
    const px = ((clientX - box.left) / box.width) * W;
    let best = 0;
    let bd = Infinity;
    data.x.forEach((v, i) => {
      const dd = Math.abs(X(v) - px);
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    });
    return best;
  };

  const onSvgDown = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    if (e.pointerType !== "mouse") {
      /* 触摸不进框选：13.2 的 M 端是「长按单点 / 滑动沿曲线回看」 */
      show(nearest(e.clientX));
      return;
    }
    if (px < M.l - 4 || px > W - M.r + 4) return;
    dragRef.current = px;
    if (selRef.current) {
      selRef.current.setAttribute("x", px.toFixed(1));
      selRef.current.setAttribute("width", "0");
      selRef.current.setAttribute("y", String(M.t));
      selRef.current.setAttribute("height", String(ih));
      selRef.current.style.display = "";
    }
  };
  const onSvgMove = (e: React.PointerEvent) => {
    if (dragRef.current == null || !selRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const a = Math.min(dragRef.current, px);
    const b = Math.max(dragRef.current, px);
    selRef.current.setAttribute("x", a.toFixed(1));
    selRef.current.setAttribute("width", (b - a).toFixed(1));
  };
  const endDrag = () => {
    if (dragRef.current == null || !selRef.current) return;
    dragRef.current = null;
    const a = parseFloat(selRef.current.getAttribute("x") || "0");
    const b = a + parseFloat(selRef.current.getAttribute("width") || "0");
    const xa = xmin + ((a - M.l) / iw) * (xmax - xmin);
    const xb = xmin + ((b - M.l) / iw) * (xmax - xmin);
    const hit = data.x.map((x, i) => ({ x, i })).filter((o) => o.x >= xa - 1e-6 && o.x <= xb + 1e-6);
    if (hit.length < 2) {
      selRef.current.style.display = "none";
      setRangeNote(null);
      return;
    }
    const bad = hit.filter((o) => toneOf(data, o.x, data.actual[o.i]));
    const note: GmGrowthRange = {
      from: Math.round(xa),
      to: Math.round(xb),
      count: hit.length,
      outOfBand: bad.length,
    };
    setRangeNote(note);
    if (onRange) onRange(note);
  };

  const ti = tip ? tip.i : -1;

  return (
    <div
      className={"gm-growth" + (mini ? " gm-growth--mini" : "")}
      data-tone={data.tone === "rose" ? "rose" : undefined}
      data-warn-alert={warnsOn ? undefined : "1"}
    >
      <div className="gm-growth__head">
        <b>{data.title || "生长曲线"}</b>
        <span className="gm-growth__src">
          {(data.source || "") + (data.bandLabel ? " · " + data.bandLabel : "")}
        </span>
        <span className="gm-growth__val">
          {fp ? "P" + fp : "—"} <i>{data.focus + " " + data.xName + " · " + data.yName + " " + fv + (data.yUnit || "")}</i>
        </span>
        {showWarnToggle && (
          <span className="gm-growth__tools">
            <button
              type="button"
              className="gm-growth__toggle"
              aria-pressed={warnsOn}
              onClick={() => setWarnsOn((v) => !v)}
            >
              P3 / P97
            </button>
          </span>
        )}
      </div>
      <div className="gm-growth__stage" ref={stageRef}>
        <svg
          className={"gm-growth__svg" + (mini ? " gm-growth__svg--mini" : "")}
          viewBox={"0 0 " + W + " " + H}
          role="img"
          aria-label={ariaLabel}
          ref={svgRef}
          onPointerDown={interactive ? onSvgDown : undefined}
          onPointerMove={interactive ? onSvgMove : undefined}
          onPointerUp={interactive ? endDrag : undefined}
          onPointerCancel={interactive ? endDrag : undefined}
          onPointerLeave={
            interactive
              ? (e) => {
                  endDrag();
                  if (e.pointerType === "mouse") hide();
                }
              : undefined
          }
        >
          <g className="gm-growth__plot">
            {yTicks.map((v) => (
              <g key={"y" + v}>
                <line className="gm-growth__grid" x1={X(xmin)} y1={Y(v)} x2={X(xmax)} y2={Y(v)} />
                <text className="gm-growth__tick" x={M.l - 6} y={Y(v) + 4} textAnchor="end">
                  {v}
                </text>
              </g>
            ))}
            <path className="gm-growth__band" d={band()} />
            <path className="gm-growth__band-top" d={line(data.p97)} />
            <g className="gm-growth__warns" display={warnsOn ? undefined : "none"}>
              <path className="gm-growth__warn" d={line(data.p3)} />
              <path className="gm-growth__warn" d={line(data.p97)} />
            </g>
            <path className="gm-growth__line" d={line(data.actual)} />
            {showP50 && <path className="gm-growth__p50" d={line(data.p50)} />}
            {fi >= 0 && fv != null && (
              <circle className="gm-growth__dot gm-growth__dot--focus" cx={X(data.focus)} cy={Y(fv)} r={3} />
            )}
            {data.x.map((x, i) => {
              const t = toneOf(data, x, data.actual[i]);
              return (
                <circle
                  key={x}
                  className={"gm-growth__pt" + (tip && tip.i === i ? " is-on" : "")}
                  data-i={i}
                  data-tone={t || undefined}
                  cx={X(x)}
                  cy={Y(data.actual[i])}
                  r={4}
                  onPointerEnter={interactive ? () => show(i) : undefined}
                  onPointerDown={
                    interactive
                      ? (e) => {
                          e.preventDefault();
                          show(i);
                        }
                      : undefined
                  }
                />
              );
            })}
            {(data.xTicks || data.x).map((x) => (
              <text key={"x" + x} className="gm-growth__tick" x={X(x)} y={H - 8} textAnchor="middle">
                {x}
              </text>
            ))}
            <text className="gm-growth__axname" x={M.l + iw} y={H - 8} textAnchor="end">
              {data.xName}
            </text>
            {!mini && (
              <rect className="gm-growth__sel" ref={selRef} x={0} y={0} width={0} height={0} rx={6} display="none" />
            )}
          </g>
        </svg>
        {!mini && (
          <div
            className={"gm-growth__tip" + (tip ? " is-on" : "")}
            aria-hidden="true"
            style={tip ? { left: tip.left, top: tip.top } : undefined}
          >
            {ti >= 0 && (
              <>
                <b>
                  {data.xName} {data.x[ti]} {data.xUnit || ""}
                </b>
                <span>
                  {data.yName} {data.actual[ti]}
                  {data.yUnit || ""} · P{pctlOf(data, data.x[ti], data.actual[ti]) ?? "—"}
                </span>
              </>
            )}
          </div>
        )}
      </div>
      {!mini && (
        <div className="gm-growth__legend">
          <span className="gm-growth__li gm-growth__li--band">
            <i aria-hidden="true" />
            P3–P97 参考带
          </span>
          <span className="gm-growth__li gm-growth__li--line">
            <i aria-hidden="true" />
            {data.seriesName || "实测"}
          </span>
          <span className="gm-growth__li gm-growth__li--warn">
            <i aria-hidden="true" />
            P3 / P97 警戒线
          </span>
        </div>
      )}
      {(data.advisories || []).map((a, i) => (
        <div key={i} className="gm-growth__note" data-tone={a.tone || "attention"} role="status">
          <i aria-hidden="true" />
          <span>{a.text}</span>
        </div>
      ))}
      {rangeNote && (
        <div
          className="gm-growth__note gm-growth__note--range"
          data-tone={rangeNote.outOfBand ? "risk" : "positive"}
          role="status"
        >
          <i aria-hidden="true" />
          <span>
            已框选 {rangeNote.from}–{rangeNote.to} {data.xName} · {rangeNote.count} 个点
            {rangeNote.outOfBand
              ? "，其中 " + rangeNote.outOfBand + " 个超出 P3–P97"
              : "，全部落在 P3–P97 内"}
          </span>
        </div>
      )}
      {!mini && (
        <div className="gm-growth__hint">
          {data.hint || "悬停查看单点明细 · 拖拽框选区间 · 开关 P3/P97 警戒线"}
        </div>
      )}
      {!mini && (
        <table className="gm-sr-only">
          <caption>{(data.title || "") + " " + (data.source || "")}</caption>
          <thead>
            <tr>
              <th scope="col">{data.xName}</th>
              <th scope="col">{data.yName}</th>
              <th scope="col">P3</th>
              <th scope="col">P97</th>
              <th scope="col">百分位</th>
            </tr>
          </thead>
          <tbody>
            {data.x.map((x, i) => (
              <tr key={x}>
                <td>{x}</td>
                <td>
                  {data.actual[i]}
                  {data.yUnit || ""}
                </td>
                <td>{data.p3[i]}</td>
                <td>{data.p97[i]}</td>
                <td>P{pctlOf(data, x, data.actual[i]) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default GmGrowthCard;
