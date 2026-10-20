<script setup lang="ts">
/**
 * GmGrowthCard —— 生长曲线卡（百分位带，规范 13 · 13.2）
 *
 * 与 React 版同契约（数据契约与站点 window.gmGrowth **逐字一致**）：
 * 参考带 alpha .12 + 细白上界；主曲线 #F77FA3 2.5px round + 端点白芯粉描边；
 * 警戒线 1.5px 三级色虚线（可一键开关，aria-pressed）；P50 中线细白 1px 虚线；
 * 带外点转琥珀/红 + 玻璃气泡建议；轴刻度 12px 次级色 tabular-nums。
 * 交互：PC 悬停单点 / 鼠标框选区间（role="status" 播报）；M 端长按单点、
 * 滑动回看（touch 不进框选）；mini 形态只留带 + 线 + 端点。
 * 无障碍：svg role="img" + aria-label；.gm-sr-only 隐藏数据表；移动热区 ≥44。
 * 百分位：P3–P50–P97 分段线性（单一线性偏 6–8 分位），带外外推夹 1/99。
 */
import { computed, ref } from "vue";

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

const props = withDefaults(defineProps<GmGrowthCardProps>(), {
  showP50: true,
  showWarnToggle: true,
  interactive: true,
});

const emit = defineEmits<{
  (e: "point", index: number): void;
  (e: "range", range: GmGrowthRange): void;
}>();

const d = computed(() => props.data);
const mini = computed(() => !!d.value.mini);
const W = computed(() => (mini.value ? 200 : 380));
const H = computed(() => (mini.value ? 74 : 168));
const M = computed(() => (mini.value ? { t: 4, r: 4, b: 4, l: 4 } : { t: 10, r: 12, b: 26, l: 34 }));
const iw = computed(() => W.value - M.value.l - M.value.r);
const ih = computed(() => H.value - M.value.t - M.value.b);

const xmin = computed(() => d.value.x[0]);
const xmax = computed(() => d.value.x[d.value.x.length - 1]);
const ymin = computed(() => {
  const lo = Math.min(...d.value.p3);
  const hi = Math.max(...d.value.p97);
  return lo - (hi - lo) * 0.18;
});
const ymax = computed(() => {
  const lo = Math.min(...d.value.p3);
  const hi = Math.max(...d.value.p97);
  return hi + (hi - lo) * 0.18;
});

const X = (v: number) => M.value.l + ((v - xmin.value) / (xmax.value - xmin.value)) * iw.value;
const Y = (v: number) => M.value.t + (1 - (v - ymin.value) / (ymax.value - ymin.value)) * ih.value;

const line = (vals: number[]) =>
  vals
    .map((v, i) => (i ? "L" : "M") + X(d.value.x[i]).toFixed(1) + "," + Y(v).toFixed(1))
    .join(" ");
const band = () => {
  const up = line(d.value.p97);
  const back = d.value.p3
    .map(
      (_, i) =>
        "L" +
        X(d.value.x[d.value.x.length - 1 - i]).toFixed(1) +
        "," +
        Y(d.value.p3[d.value.p3.length - 1 - i]).toFixed(1)
    )
    .join(" ");
  return up + " " + back + " Z";
};

const yTicks = computed(() => (d.value.yTicks || []).filter((v) => v > ymin.value && v < ymax.value));
const fi = computed(() => d.value.x.indexOf(d.value.focus));
const fv = computed(() => (fi.value >= 0 ? d.value.actual[fi.value] : null));
const fp = computed(() =>
  fi.value >= 0 && fv.value != null ? pctlOf(d.value.focus, fv.value) : null
);
const ariaLabel = computed(
  () =>
    (d.value.title || "生长曲线") +
    "：" +
    (d.value.source || "") +
    "，" +
    d.value.xName +
    " " +
    d.value.focus +
    " 时 " +
    d.value.yName +
    " " +
    fv.value +
    (d.value.yUnit || "") +
    "，约 P" +
    (fp.value ?? "—")
);

function pctlOf(x: number, v: number): number | null {
  const i = d.value.x.indexOf(x);
  if (i < 0) return null;
  const lo = d.value.p3[i];
  const mid = d.value.p50[i];
  const hi = d.value.p97[i];
  if (!(lo < mid && mid < hi)) return null;
  const p = v <= mid ? 3 + ((v - lo) / (mid - lo)) * 47 : 50 + ((v - mid) / (hi - mid)) * 47;
  return Math.max(1, Math.min(99, Math.round(p)));
}
function toneOf(x: number, v: number): "" | "attention" | "risk" {
  const i = d.value.x.indexOf(x);
  if (i < 0) return "";
  if (v < d.value.p3[i]) return "attention";
  if (v > d.value.p97[i]) return "risk";
  return "";
}

const tip = ref<{ i: number; left: number; top: number } | null>(null);
const warnsOn = ref(true);
const rangeNote = ref<GmGrowthRange | null>(null);
const stageRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const selRef = ref<SVGRectElement | null>(null);
let dragFrom: number | null = null;

function show(i: number) {
  const svg = svgRef.value;
  const stage = stageRef.value;
  if (!svg || !stage) return;
  const box = svg.getBoundingClientRect();
  const px = box.left - stage.getBoundingClientRect().left + (X(d.value.x[i]) / W.value) * box.width;
  const py =
    box.top - stage.getBoundingClientRect().top + (Y(d.value.actual[i]) / H.value) * box.height;
  tip.value = {
    i,
    left: Math.max(38, Math.min(stage.clientWidth - 38, px)),
    top: Math.max(4, py - 10),
  };
  if (props.onPoint) props.onPoint(i);
  emit("point", i);
}
function hide() {
  tip.value = null;
}
function nearest(clientX: number) {
  const svg = svgRef.value;
  if (!svg) return 0;
  const box = svg.getBoundingClientRect();
  const px = ((clientX - box.left) / box.width) * W.value;
  let best = 0;
  let bd = Infinity;
  d.value.x.forEach((v, i) => {
    const dd = Math.abs(X(v) - px);
    if (dd < bd) {
      bd = dd;
      best = i;
    }
  });
  return best;
}

function onSvgDown(e: PointerEvent) {
  const svg = svgRef.value;
  if (!svg) return;
  const box = svg.getBoundingClientRect();
  const px = ((e.clientX - box.left) / box.width) * W.value;
  if (e.pointerType !== "mouse") {
    show(nearest(e.clientX)); /* 触摸不进框选：长按单点 / 滑动回看（13.2） */
    return;
  }
  if (px < M.value.l - 4 || px > W.value - M.value.r + 4) return;
  dragFrom = px;
  if (selRef.value) {
    selRef.value.setAttribute("x", px.toFixed(1));
    selRef.value.setAttribute("width", "0");
    selRef.value.setAttribute("y", String(M.value.t));
    selRef.value.setAttribute("height", String(ih.value));
    selRef.value.style.display = "";
  }
}
function onSvgMove(e: PointerEvent) {
  if (dragFrom == null || !selRef.value) return;
  const svg = svgRef.value;
  if (!svg) return;
  const box = svg.getBoundingClientRect();
  const px = ((e.clientX - box.left) / box.width) * W.value;
  const a = Math.min(dragFrom, px);
  const b = Math.max(dragFrom, px);
  selRef.value.setAttribute("x", a.toFixed(1));
  selRef.value.setAttribute("width", (b - a).toFixed(1));
}
function endDrag() {
  if (dragFrom == null || !selRef.value) return;
  dragFrom = null;
  const a = parseFloat(selRef.value.getAttribute("x") || "0");
  const b = a + parseFloat(selRef.value.getAttribute("width") || "0");
  const xa = xmin.value + ((a - M.value.l) / iw.value) * (xmax.value - xmin.value);
  const xb = xmin.value + ((b - M.value.l) / iw.value) * (xmax.value - xmin.value);
  const hit = d.value.x
    .map((x, i) => ({ x, i }))
    .filter((o) => o.x >= xa - 1e-6 && o.x <= xb + 1e-6);
  if (hit.length < 2) {
    selRef.value.style.display = "none";
    rangeNote.value = null;
    return;
  }
  const bad = hit.filter((o) => toneOf(o.x, d.value.actual[o.i]));
  const note: GmGrowthRange = {
    from: Math.round(xa),
    to: Math.round(xb),
    count: hit.length,
    outOfBand: bad.length,
  };
  rangeNote.value = note;
  if (props.onRange) props.onRange(note);
  emit("range", note);
}
function onSvgLeave(e: PointerEvent) {
  endDrag();
  if (e.pointerType === "mouse") hide();
}
</script>

<template>
  <div
    class="gm-growth"
    :class="{ 'gm-growth--mini': mini }"
    :data-tone="data.tone === 'rose' ? 'rose' : undefined"
    :data-warn-alert="warnsOn ? undefined : '1'"
  >
    <div class="gm-growth__head">
      <b>{{ data.title || "生长曲线" }}</b>
      <span class="gm-growth__src">
        {{ (data.source || "") + (data.bandLabel ? " · " + data.bandLabel : "") }}
      </span>
      <span class="gm-growth__val">
        {{ fp ? "P" + fp : "—" }}
        <i>{{ data.focus + " " + data.xName + " · " + data.yName + " " + fv + (data.yUnit || "") }}</i>
      </span>
      <span v-if="showWarnToggle" class="gm-growth__tools">
        <button
          type="button"
          class="gm-growth__toggle"
          :aria-pressed="warnsOn"
          @click="warnsOn = !warnsOn"
        >
          P3 / P97
        </button>
      </span>
    </div>
    <div ref="stageRef" class="gm-growth__stage">
      <svg
        ref="svgRef"
        class="gm-growth__svg"
        :class="{ 'gm-growth__svg--mini': mini }"
        :viewBox="`0 0 ${W} ${H}`"
        role="img"
        :aria-label="ariaLabel"
        @pointerdown="interactive ? onSvgDown($event) : undefined"
        @pointermove="interactive ? onSvgMove($event) : undefined"
        @pointerup="interactive ? endDrag() : undefined"
        @pointercancel="interactive ? endDrag() : undefined"
        @pointerleave="interactive ? onSvgLeave($event) : undefined"
      >
        <g class="gm-growth__plot">
          <g v-for="v in yTicks" :key="'y' + v">
            <line class="gm-growth__grid" :x1="X(xmin)" :y1="Y(v)" :x2="X(xmax)" :y2="Y(v)" />
            <text class="gm-growth__tick" :x="M.l - 6" :y="Y(v) + 4" text-anchor="end">
              {{ v }}
            </text>
          </g>
          <path class="gm-growth__band" :d="band()" />
          <path class="gm-growth__band-top" :d="line(data.p97)" />
          <g class="gm-growth__warns" :display="warnsOn ? undefined : 'none'">
            <path class="gm-growth__warn" :d="line(data.p3)" />
            <path class="gm-growth__warn" :d="line(data.p97)" />
          </g>
          <path class="gm-growth__line" :d="line(data.actual)" />
          <path v-if="showP50" class="gm-growth__p50" :d="line(data.p50)" />
          <circle
            v-if="fi >= 0 && fv != null"
            class="gm-growth__dot gm-growth__dot--focus"
            :cx="X(data.focus)"
            :cy="Y(fv)"
            r="3"
          />
          <circle
            v-for="(x, i) in data.x"
            :key="x"
            class="gm-growth__pt"
            :class="{ 'is-on': tip && tip.i === i }"
            :data-i="i"
            :data-tone="toneOf(x, data.actual[i]) || undefined"
            :cx="X(x)"
            :cy="Y(data.actual[i])"
            r="4"
            @pointerenter="interactive ? show(i) : undefined"
            @pointerdown="
              interactive
                ? ($event.preventDefault(), show(i))
                : undefined
            "
          />
          <text
            v-for="x in data.xTicks || data.x"
            :key="'x' + x"
            class="gm-growth__tick"
            :x="X(x)"
            :y="H - 8"
            text-anchor="middle"
          >
            {{ x }}
          </text>
          <text class="gm-growth__axname" :x="M.l + iw" :y="H - 8" text-anchor="end">
            {{ data.xName }}
          </text>
          <rect
            v-if="!mini"
            ref="selRef"
            class="gm-growth__sel"
            x="0"
            y="0"
            width="0"
            height="0"
            rx="6"
            display="none"
          />
        </g>
      </svg>
      <div
        v-if="!mini"
        class="gm-growth__tip"
        :class="{ 'is-on': tip }"
        aria-hidden="true"
        :style="tip ? { left: tip.left + 'px', top: tip.top + 'px' } : undefined"
      >
        <template v-if="tip">
          <b>{{ data.xName }} {{ data.x[tip.i] }} {{ data.xUnit || "" }}</b>
          <span>
            {{ data.yName }} {{ data.actual[tip.i] }}{{ data.yUnit || "" }} · P{{
              pctlOf(data.x[tip.i], data.actual[tip.i]) ?? "—"
            }}
          </span>
        </template>
      </div>
    </div>
    <div v-if="!mini" class="gm-growth__legend">
      <span class="gm-growth__li gm-growth__li--band"><i aria-hidden="true" />P3–P97 参考带</span>
      <span class="gm-growth__li gm-growth__li--line">
        <i aria-hidden="true" />{{ data.seriesName || "实测" }}
      </span>
      <span class="gm-growth__li gm-growth__li--warn"><i aria-hidden="true" />P3 / P97 警戒线</span>
    </div>
    <div
      v-for="(a, i) in data.advisories || []"
      :key="i"
      class="gm-growth__note"
      :data-tone="a.tone || 'attention'"
      role="status"
    >
      <i aria-hidden="true" />
      <span>{{ a.text }}</span>
    </div>
    <div
      v-if="rangeNote"
      class="gm-growth__note gm-growth__note--range"
      :data-tone="rangeNote.outOfBand ? 'risk' : 'positive'"
      role="status"
    >
      <i aria-hidden="true" />
      <span>
        已框选 {{ rangeNote.from }}–{{ rangeNote.to }} {{ data.xName }} · {{ rangeNote.count }}
        个点{{
          rangeNote.outOfBand
            ? "，其中 " + rangeNote.outOfBand + " 个超出 P3–P97"
            : "，全部落在 P3–P97 内"
        }}
      </span>
    </div>
    <div v-if="!mini" class="gm-growth__hint">
      {{ data.hint || "悬停查看单点明细 · 拖拽框选区间 · 开关 P3/P97 警戒线" }}
    </div>
    <table v-if="!mini" class="gm-sr-only">
      <caption>{{ (data.title || "") + " " + (data.source || "") }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ data.xName }}</th>
          <th scope="col">{{ data.yName }}</th>
          <th scope="col">P3</th>
          <th scope="col">P97</th>
          <th scope="col">百分位</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(x, i) in data.x" :key="x">
          <td>{{ x }}</td>
          <td>{{ data.actual[i] }}{{ data.yUnit || "" }}</td>
          <td>{{ data.p3[i] }}</td>
          <td>{{ data.p97[i] }}</td>
          <td>P{{ pctlOf(x, data.actual[i]) ?? "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
