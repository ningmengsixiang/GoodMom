import React from "react";
import { GmFive, GmSemantic, SEMANTIC_LABEL, SEMANTIC_VAR, FIVE_COLOR, FIVE_VAR, semTintFill, semTintBorder } from "../tokens/status";
import { semanticOf } from "../tokens/business";

/**
 * GmStatusTag —— 状态标签（六语义 + 孕产妇五色）
 * 对应规范：14 · 4.4.5（六语义）、15.2（业务状态文案）、15.2.10 / 02.10（五色）
 *
 * ## 视觉契约（P1-1 / P1-2 / P1-12，与 Vue 版 `<GmStatusTag>` **完全一致**）
 *
 * 「浅底 + 加深档文字 + 色点」三通道：
 *   color: var(--lg-sem-x) ｜ background: color-mix(… 13% …) ｜ 色点同色。
 *
 * 历史缺陷（勿回退）：
 *  · React 版曾用 `<Tag color={hex}>`：Arco 对自定义色的处理是**实底 + 白字**
 *    （`colorStyle.backgroundColor = color` + `.arco-tag-custom-color{color:var(--color-white)}`）。
 *    六项里 5 项"白字压实底"只有 3.67–4.38:1，不达 AA；而 Vue 版是 13% 淡底 + 语义字，
 *    于是**同名组件在两库里视觉不可互换**。
 *  · 取色曾读 `SEMANTIC_COLOR` 里的**静态浅色 hex**，暗色模式下不切换
 *    （变量对、组件错、门禁绿、报告 ✅ 同时成立）。现改为引用 CSS 变量。
 *
 *   五色分支的文字**不用五色亮值**（V2.9 实测）：#4CB98A/#F2C14E/#F0954A 作 12px 文字只有
 *   1.57–2.19:1 —— 与站点手册 D6「亮渐变=装饰，文字承载=深档」和站点五色图例
 *   （色点承载颜色 + 普通文字）一致，故文字走主文字色，颜色由色点承载
 *   （WCAG 1.4.1 双通道：色点 + 文案「黄 · 一般风险」）。
 *
 * 需要"实底 + 白字"形态时请显式使用 `SEMANTIC_SOLID`（D5 达标档），
 * 不要再让 Arco 用自定义色自行铺底。
 *
 * ## 与 Vue 版的零差异口径（P1-12）
 *
 * 改动本文件时**必须**同步 `goodmom-vue/src/components/GmStatusTag.vue`，逐条对应关系：
 *  1. **语义从文案推导**：`semantic` 不再默认 `"neutral"`；不传时两库都用 15 章词库
 *     `semanticOf(文案)` 推导（读不出文本时同样回落 `neutral`）。历史缺陷：React 恒为
 *     `"neutral"` 不推导、Vue 会推导 —— `<GmStatusTag>待随访</GmStatusTag>` 在 React 是灰、
 *     在 Vue 是琥珀，同一段写法换一个包就换一种颜色。
 *  2. **尺寸默认 `"default"`**（原 React 是 `"small"`）。`small` 仍接受，但与 `default`
 *     **同档**：两库 CSS 只定义了 `.gm-status-tag--default` / `--large`，没有 `--small`。
 *  3. **尺寸类名 `gm-status-tag--{size}`**。历史缺陷：`size="large"` 输出的是
 *     `gm-status-tag lg` —— `lg` 这个类名两库都没有，该档**实际无效**。
 *  4. **`closeLabel`**（默认「移除」）补入：原来关闭钮的 `aria-label` 是硬编码的，
 *     Vue 侧可换文案，同一个组件在两库里一个可配、一个是死的。
 *  5. **`onClose` 载荷是 `React.MouseEvent`**：Vue 的 `close` 事件一直传 `MouseEvent`，
 *     回调签名不一致会让跨库迁移时拿不到 `currentTarget` / 无法阻止冒泡。
 *  6. **同一套 DOM 钩子**：`data-semantic`（只在语义通道生效时输出，显式 `color` / `five`
 *     时省略 —— 与 `GmTag` 及 Vue 版同约定）与内层 `data-gm-text`（文案容器）。
 *  7. 取色优先级两侧一致：**显式 `color` > `five` > `semantic`**；语义走 `var(--lg-sem-*)`、
 *     五色走 `var(--mmh-m5-*)`，组件内不出现裸色值。
 */
export interface GmStatusTagProps {
  children: React.ReactNode;
  /** 六语义之一；不传则由 children 文案自动推导（推荐，与 Vue 版同口径） */
  semantic?: GmSemantic;
  /** 孕产妇五色之一（优先级高于 semantic） */
  five?: GmFive;
  /** 显式覆盖颜色（hex 或 CSS 变量表达式）；传入后不再走语义通道 */
  color?: string;
  /** 尺寸档；`small` 与 `default` 同档（两库 CSS 只有 --default / --large） */
  size?: "small" | "default" | "large";
  /** 可关闭：显示关闭按钮并触发 onClose（与 Vue 版 `close` 事件同契约） */
  closable?: boolean;
  /** 关闭按钮的可访问名，默认「移除」（与 Vue 版同默认值） */
  closeLabel?: string;
  /** 关闭回调，载荷为 MouseEvent（与 Vue 版 `close` 事件同契约） */
  onClose?: (ev: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 从 children 里安全提取"文案"。
 *
 * 只读字符串 / 数字与其数组，以及 React 元素的 `props.children`（与 Vue 版 `textOfVNode`
 * 的递归口径一致，这样 `<GmStatusTag><b>待随访</b></GmStatusTag>` 在两库都推导出 attention）；
 * 其余类型读不出文本 → 返回 `null`，由调用方回落 `neutral`。
 * **绝不**对任意对象调 `toString()`：那会把 `"[object Object]"` 喂给词库，
 * 白名单外静默变灰，属于"变量对、组件错"式的隐性错误。
 */
function textOfChildren(node: React.ReactNode): string | null {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    let text = "";
    for (const child of node) {
      const part = textOfChildren(child);
      /* 任一段读不出来就整体放弃推导，不拿"半截文本"去查词库
         （否则 `<GmStatusTag>待随访<未知节点/></GmStatusTag>` 会按半截文案给出错误语义） */
      if (part === null) return null;
      text += part;
    }
    return text;
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOfChildren(node.props.children);
  return null;
}

/* `= undefined` 是**显式**写出的：语义上等同于省略（"不传就按文案推导"），
   但 scripts/check-component-contract.py 只比对两侧都出现的默认值键 ——
   省略会让这项静默跳过，显式写出才能把它纳入双库契约门禁。 */
const GmStatusTag = ({
  children,
  semantic = undefined,
  five = undefined,
  color = undefined,
  size = "default",
  closable = false,
  closeLabel = "移除",
  onClose,
}: GmStatusTagProps) => {
  /* 取色优先级：显式 color > 五色 > 语义。
     语义/五色走 CSS 变量（可随暗色档与业务覆盖切换），显式 color 则原样使用。 */
  const text = textOfChildren(children);
  /* 文案 → 语义：仅在调用方未显式传 semantic 时推导；取不到文本时回落 neutral。
     与 Vue 版 `derived` 同口径 —— 两库对同一段文案必须给出同一个语义。 */
  const derived: GmSemantic = semantic || (text === null ? "neutral" : semanticOf(text));

  const base = color
    ? color
    : five
      ? `var(${FIVE_VAR[five]},${FIVE_COLOR[five]})`
      : `var(${SEMANTIC_VAR[derived]})`;

  const style: React.CSSProperties = {
    color: five && !color ? "var(--lg-text-primary,#343A46)" : base,
    background: semTintFill(base),
    borderColor: semTintBorder(base),
  };

  /* 尺寸类映射（与 Vue 版 `sizeClass` 同规则）：`small` 复用 default 档视觉。
     类名一律 `gm-status-tag--{size}`；旧实现给 large 挂的是 `" lg"`（类名不存在 → 档位失效）。 */
  const sizeCls = size === "small" ? "default" : size;

  /* 「颜色 + 文字」双通道（WCAG 1.4.1）：色点旁始终有文字；
     色点自身 aria-hidden，语义名通过 sr-only 供给读屏（颜色之外的第二通道）。 */
  const srLabel = color || five ? "" : SEMANTIC_LABEL[derived];

  return (
    <span
      /* 只挂 gm-status-tag：`.gm-status-tag` 已是完整的胶囊样式，
         再挂通用的 `.gm-tag` 会叠加两层内边距与描边（视觉发胖）。 */
      className={`gm-status-tag gm-status-tag--${sizeCls}`}
      style={style}
      /* data-semantic 只在**语义通道**生效时输出（显式 color / five 时省略）：
         该属性描述的是"语义档名"，自定义着色没有档名可说 —— 与 GmTag、Vue 版同约定。
         `goodmom-ui/playground/smoke.mjs` 依赖它（"状态标签走 data-semantic 而非内联色"）。 */
      data-semantic={color || five ? undefined : derived}
    >
      <span className="gm-status-dot" style={{ background: base }} aria-hidden="true" />
      {/* 用三元而不是 `&&`：srLabel 为空串时 `&&` 会渲染一个空文本节点，Vue 的 v-if 不会 */}
      {srLabel ? <span className="gm-sr-only">{srLabel}：</span> : null}
      {/* 文案包一层 data-gm-text：与 Vue 版 DOM 结构一致，同时给脚本一个稳定的取文案钩子
          （Vue 冒烟正是靠它把状态文案与 GmTag 的色分开，避免把关闭钮文案混进来）。
          值显式写 `""`，因为 Vue 模板里的无值属性 `data-gm-text` 渲染出的就是 `data-gm-text=""`。 */}
      <span data-gm-text="">{children}</span>
      {closable ? (
        <button
          type="button"
          className="gm-status-tag__close"
          aria-label={closeLabel}
          onClick={(ev) => onClose?.(ev)}
        >
          ✕
        </button>
      ) : null}
    </span>
  );
};
export default GmStatusTag;
