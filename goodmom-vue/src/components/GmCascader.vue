<script setup lang="ts">
/**
 * GmCascader —— 级联选择（对应 03 · 3.5.5 / 10 · 10.11.3）
 *
 * 自包含实现（零外部依赖）。三形态：
 *  - popup（默认）：PC 下拉面板，点外部关闭、Escape 关闭并归还焦点
 *  - inline：面板常驻展开，用于表单内嵌/侧栏
 *  - picker：移动端遮罩 + 底部弹层（role="dialog" aria-modal），点遮罩=取消，**确定才提交**
 *
 * 支持 `v-model`（defineModel）：传了即受控，不传即非受控（defaultValue 仅作初始值）。
 *
 * 无障碍契约（改动前务必读）：
 *  - 触发点为 <button aria-haspopup="listbox" aria-expanded>
 *  - 每列 role="listbox"（带「第 N 级选项」标签），选项为 <button role="option" aria-selected>
 *  - 列内 roving tabindex：只有高亮项 tabIndex=0，整列不会变成 N 个 Tab 停靠点
 *  - 键盘：↑/↓ 移动高亮、→ 进下一列、← 回上一列、Enter/Space 选中、Home/End 首尾、Escape 关闭
 *  - 收起面板时**必须**把焦点还给触发点，否则焦点掉到 body，键盘用户直接迷路
 *
 * 选项数约定：列渲染用普通 v-for（选项 < 200）。超大量级请改用 VirtualList 或搜索式选择。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";
import { cx } from "../utils";

export interface GmCascaderOption {
  value: string;
  label: string;
  children?: GmCascaderOption[];
  disabled?: boolean;
}

const model = defineModel<string[]>({ default: () => [] });

const props = withDefaults(
  defineProps<{
    options: GmCascaderOption[];
    /** 非受控初始值 */
    defaultValue?: string[];
    mode?: "popup" | "inline" | "picker";
    placeholder?: string;
    disabled?: boolean;
    /** 默认 false：仅叶子可提交；true 时点任意层级即提交 */
    changeOnSelect?: boolean;
    /** 展示分隔符，默认 " / " */
    separator?: string;
    /** 默认 true：悬停/聚焦触发点时显示清空按钮（显隐由 CSS 控制） */
    allowClear?: boolean;
  }>(),
  {
    defaultValue: () => [],
    mode: "popup",
    placeholder: "请选择",
    disabled: false,
    changeOnSelect: false,
    separator: " / ",
    allowClear: true,
  }
);

const emit = defineEmits<{
  (e: "change", value: string[], selectedOptions: GmCascaderOption[]): void;
}>();

interface FocusReq {
  col: number;
  idx: number;
}
interface NavState {
  path: string[];
  focus: FocusReq | null;
}

/** 按 value 查子项 */
function findOption(list: GmCascaderOption[], value: string): GmCascaderOption | undefined {
  for (let i = 0; i < list.length; i++) {
    if (list[i].value === value) return list[i];
  }
  return undefined;
}

/** 沿 path 展开列：[第 1 列, 第 2 列, …] */
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

/** 沿 path 解析出完整选项链（onChange 与展示用） */
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

/* ── 状态 ───────────────────────────────────────────────────────────── */
const open = ref(props.mode === "inline");
const nav = ref<NavState>({ path: props.defaultValue.slice(), focus: null });
const active = ref<number[]>([0]);

const rootRef = ref<HTMLDivElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
let didMount = false;

/** 已提交值：v-model 受控 / defaultValue 非受控统一走 model */
const selected = computed<string[]>(() => model.value ?? []);

/* 面板展开时以 nav.path 为准；收起时回落到已提交值 */
const path = computed(() => (open.value ? nav.value.path : selected.value));
const columns = computed(() => buildColumns(props.options, path.value));

const selOpts = computed(() => resolveOptions(props.options, selected.value));
const hasValue = computed(() => selOpts.value.length > 0);
const showClear = computed(() => props.allowClear && !props.disabled && hasValue.value);

const navLast = computed(() => {
  const o = resolveOptions(props.options, nav.value.path);
  return o.length > 0 ? o[o.length - 1] : undefined;
});
const canConfirm = computed(
  () => !!navLast.value && (props.changeOnSelect || !navLast.value.children || navLast.value.children.length === 0)
);

/* ── 动作 ───────────────────────────────────────────────────────────── */
function commit(next: string[]) {
  model.value = next;
  emit("change", next, resolveOptions(props.options, next));
}

function closePanel(returnFocus: boolean) {
  open.value = false;
  nav.value = { path: nav.value.path, focus: null };
  if (returnFocus) nextTick(() => triggerRef.value?.focus());
}

function toggle() {
  if (props.disabled) return;
  if (open.value) {
    closePanel(false);
    return;
  }
  open.value = true;
}

function clear(e: MouseEvent) {
  e.stopPropagation();
  nav.value = { path: [], focus: null };
  commit([]);
}

function pick(col: number, idx: number) {
  const list = columns.value[col] || [];
  const opt = list[idx];
  if (!opt || opt.disabled) return;
  const next = path.value.slice(0, col).concat(opt.value);
  const kids = opt.children && opt.children.length > 0 ? opt.children : null;

  /* picker：点选只暂存，确定时才提交 */
  if (props.mode === "picker") {
    nav.value = { path: next, focus: kids ? { col: col + 1, idx: firstEnabledIndex(kids) } : null };
    return;
  }
  if (kids) {
    nav.value = { path: next, focus: { col: col + 1, idx: firstEnabledIndex(kids) } };
    if (props.changeOnSelect) commit(next);
    return;
  }
  commit(next);
  if (props.mode === "popup") {
    /* 收起后高亮项会卸载：焦点必须归还触发点，避免焦点掉到 body */
    closePanel(true);
    return;
  }
  nav.value = { path: next, focus: null };
}

function confirm() {
  if (!canConfirm.value) return;
  commit(nav.value.path);
  closePanel(false);
}

function cancel() {
  nav.value = { path: selected.value, focus: null };
  closePanel(true);
}

/* ── 键盘 ───────────────────────────────────────────────────────────── */
function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return;

  if (e.key === "Escape") {
    if (!open.value) return;
    e.preventDefault();
    if (props.mode === "picker") cancel();
    else closePanel(true);
    return;
  }
  if (!open.value) return;

  const t = e.target as HTMLElement | null;
  if (!t || typeof t.getAttribute !== "function") return;
  const colAttr = t.getAttribute("data-col");
  const idxAttr = t.getAttribute("data-idx");
  if (colAttr === null || idxAttr === null) return;
  const col = Number(colAttr);
  const idx = Number(idxAttr);
  const list = columns.value[col] || [];
  if (!list.length) return;

  const moveTo = (target: number) => {
    if (target < 0 || target >= list.length) return;
    e.preventDefault();
    const a = active.value.slice();
    while (a.length <= col) a.push(0);
    a[col] = target;
    active.value = a;
    /* 仅更新焦点请求，path 不变 → 高亮态不会被重置 */
    nav.value = { path: nav.value.path, focus: { col, idx: target } };
  };

  if (e.key === "ArrowDown") return moveTo(stepEnabled(list, idx + 1, 1));
  if (e.key === "ArrowUp") return moveTo(stepEnabled(list, idx - 1, -1));
  if (e.key === "Home") return moveTo(stepEnabled(list, 0, 1));
  if (e.key === "End") return moveTo(stepEnabled(list, list.length - 1, -1));

  if (e.key === "ArrowRight") {
    const opt = list[idx];
    const kids = opt && opt.children && opt.children.length > 0 ? opt.children : null;
    if (!kids) return;
    e.preventDefault();
    const nextIdx = firstEnabledIndex(kids);
    const a = active.value.slice();
    while (a.length <= col + 1) a.push(0);
    a[col + 1] = nextIdx;
    active.value = a;
    nav.value = { path: path.value.slice(0, col).concat(opt.value), focus: { col: col + 1, idx: nextIdx } };
    return;
  }

  if (e.key === "ArrowLeft") {
    if (col <= 0) return;
    e.preventDefault();
    const pc = col - 1;
    const prevList = columns.value[pc] || [];
    const pIdx = active.value[pc] === undefined ? firstEnabledIndex(prevList) : active.value[pc];
    const a = active.value.slice();
    while (a.length <= pc) a.push(0);
    a[pc] = pIdx;
    active.value = a;
    nav.value = { path: nav.value.path, focus: { col: pc, idx: pIdx } };
    return;
  }

  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    pick(col, idx);
  }
}

/* 高亮态与列结构同步；箭头移动时不改 path，因此不会被重置 */
watch(
  () => columns.value.map((c) => c.map((o) => o.value).join(",")).join("|") + "@@" + path.value.join(","),
  () => {
    const next = columns.value.map((col, i) => {
      const hit = col.findIndex((o) => o.value === path.value[i]);
      return hit >= 0 ? hit : firstEnabledIndex(col);
    });
    const prev = active.value;
    if (prev.length === next.length && prev.every((v, i) => v === next[i])) return;
    active.value = next;
  }
);

/* 焦点请求：等本批渲染完成后执行，保证目标节点已存在 */
watch(
  () => nav.value.focus,
  (f) => {
    if (!f) return;
    nextTick(() => {
      const host = panelRef.value;
      if (!host) return;
      host
        .querySelector<HTMLButtonElement>(`[data-col="${f.col}"][data-idx="${f.idx}"]`)
        ?.focus();
    });
  }
);

/* 展开时重置导航路径；首帧（inline 默认展开）不抢焦点 */
watch(open, (isOpen) => {
  if (!isOpen) return;
  const base = selected.value;
  if (!didMount) {
    nav.value = { path: base, focus: null };
    return;
  }
  const cols = buildColumns(props.options, base);
  const last = cols.length - 1;
  nav.value = { path: base, focus: last >= 0 ? { col: last, idx: firstEnabledIndex(cols[last]) } : null };
});

onMounted(() => {
  didMount = true;
});

/* 点击面板外部关闭（document 级监听，随 open 装卸） */
function onDocMouseDown(ev: MouseEvent) {
  const root = rootRef.value;
  /* P1-12：用 `composedPath()` 的派发时快照判断内外。`root.contains(ev.target)`
     在"面板内点击触发重渲染 → 目标节点随即脱离文档"时会返回 false，
     把面板内点击误判为外部点击而关闭面板。 */
  const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
  const inside = !!root && (path.indexOf(root) >= 0 || (ev.target instanceof Node && root.contains(ev.target)));
  if (inside) return;
  open.value = false;
  nav.value = { path: nav.value.path, focus: null };
}

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMouseDown);
});

watch(
  () => [open.value, props.mode] as const,
  ([isOpen, mode]) => {
    document.removeEventListener("mousedown", onDocMouseDown);
    if (isOpen && mode !== "inline") document.addEventListener("mousedown", onDocMouseDown);
  },
  { immediate: true }
);

const rootClass = computed(() =>
  cx(
    "gm-cascader",
    props.mode === "inline" && "gm-cascader--inline",
    props.mode === "picker" && "gm-cascader--picker",
    open.value && "is-open",
    props.disabled && "is-disabled"
  )
);
</script>

<template>
  <div :class="rootClass" ref="rootRef" @keydown="onKeydown">
    <button
      type="button"
      ref="triggerRef"
      class="gm-cascader__trigger"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :disabled="disabled"
      @click="toggle"
    >
      <span v-if="hasValue" class="gm-cascader__val">
        <template v-for="(o, i) in selOpts" :key="o.value">
          <template v-if="i > 0">{{ separator }}</template>{{ o.label }}
        </template>
      </span>
      <span v-else class="gm-cascader__ph">{{ placeholder }}</span>
      <span class="gm-cascader__arrow" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7"
          stroke-linecap="round" stroke-linejoin="round" focusable="false">
          <path d="M3 4.6 6 7.6l3-3" />
        </svg>
      </span>
    </button>

    <button v-if="showClear" type="button" class="gm-cascader__clear" aria-label="清空" @click="clear">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" aria-hidden="true" focusable="false">
        <path d="M3 3l6 6M9 3l-6 6" />
      </svg>
    </button>

    <!-- 面板：picker 形态包遮罩 + 底部弹层；其余形态直接展开 -->
    <div v-if="open && mode === 'picker'" class="gm-cascader__mask" @click="cancel">
      <div class="gm-cascader__sheet" role="dialog" aria-modal="true" aria-label="级联选择" @click.stop>
        <div class="gm-cascader__panel" ref="panelRef">
          <div v-if="columns.length === 0" class="gm-cascader__empty">暂无可选项</div>
          <div v-for="(col, ci) in columns" v-else :key="ci" class="gm-cascader__col" role="listbox"
            :aria-label="`第 ${ci + 1} 级选项`" :data-col="ci">
            <button
              v-for="(opt, oi) in col"
              :key="opt.value"
              type="button"
              role="option"
              :data-col="ci"
              :data-idx="oi"
              class="gm-cascader__opt"
              :class="[(active[ci] ?? 0) === oi && 'is-active', path[ci] === opt.value && 'is-selected', opt.disabled && 'is-disabled']"
              :aria-selected="path[ci] === opt.value"
              :tabindex="(active[ci] ?? 0) === oi ? 0 : -1"
              :disabled="opt.disabled"
              @click="pick(ci, oi)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="gm-cascader__foot">
          <button type="button" class="gm-cascader__btn" @click="cancel">取消</button>
          <button type="button" class="gm-cascader__btn is-primary" :disabled="!canConfirm" @click="confirm">确定</button>
        </div>
      </div>
    </div>

    <div v-else-if="open" class="gm-cascader__panel" ref="panelRef">
      <div v-if="columns.length === 0" class="gm-cascader__empty">暂无可选项</div>
      <div v-for="(col, ci) in columns" v-else :key="ci" class="gm-cascader__col" role="listbox"
        :aria-label="`第 ${ci + 1} 级选项`" :data-col="ci">
        <button
          v-for="(opt, oi) in col"
          :key="opt.value"
          type="button"
          role="option"
          :data-col="ci"
          :data-idx="oi"
          class="gm-cascader__opt"
          :class="[(active[ci] ?? 0) === oi && 'is-active', path[ci] === opt.value && 'is-selected', opt.disabled && 'is-disabled']"
          :aria-selected="path[ci] === opt.value"
          :tabindex="(active[ci] ?? 0) === oi ? 0 : -1"
          :disabled="opt.disabled"
          @click="pick(ci, oi)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>
