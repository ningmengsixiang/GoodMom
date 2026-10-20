import React from "react";

/**
 * GmBabyCard —— 宝宝首页头像卡（规范 13 · 13.1 #5）
 *
 * 与 `@goodmom/vue` 同契约：name / birthday / monthAge / avatar / gender / metrics，
 * 事件 edit。视觉（圆形玻璃头像、指标三连、44 编辑钮）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. avatar 是图片地址（http(s) / 绝对路径 / data:image）时渲染 img，否则当文字头像，
 *    文字头像缺省取 name 首字；gender 挂 data-gender 供 CSS 选择，同时并入 meta 文案。
 * 2. 指标最多渲染 3 个，label / value 分离，单位单独弱化（tabular-nums 由 CSS 给）。
 * 3. 编辑钮是图标按钮，带可访问名，点击派发 edit。
 */
export interface GmBabyMetric {
  key: string;
  label: string;
  value: string;
  unit?: string;
}
export interface GmBabyCardProps {
  name: string;
  /** 生日 YYYY-MM-DD，默认 "" */
  birthday?: string;
  /** 月龄，默认 0 */
  monthAge?: number;
  /** 头像地址或文字，默认 "" */
  avatar?: string;
  /** 性别，默认 "unknown" */
  gender?: "boy" | "girl" | "unknown";
  /** 指标（建议 3 个），默认 [] */
  metrics?: GmBabyMetric[];
  onEdit?: () => void;
}

const GmBabyCard = ({
  name,
  birthday = "",
  monthAge = 0,
  avatar = "",
  gender = "unknown",
  metrics = [],
  onEdit,
}: GmBabyCardProps) => {
  const isImage = /^(https?:\/\/|\/|data:image\/)/.test(avatar);
  const metaParts = [
    GENDER_LABEL[gender],
    monthAge + " 月龄",
    birthday ? "生日 " + birthday : "",
  ].filter(Boolean);
  const visibleMetrics = metrics.slice(0, 3);

  return (
    <section className="gm-babycard" data-gender={gender}>
      <div>
        {isImage ? (
          <img className="gm-babycard__avatar" src={avatar} alt={name} />
        ) : (
          <span className="gm-babycard__avatar" aria-hidden="true">
            {avatar || name.charAt(0)}
          </span>
        )}
        <div className="gm-babycard__main">
          <p className="gm-babycard__name">{name}</p>
          <p className="gm-babycard__meta">{metaParts.join(" · ")}</p>
        </div>
        <button
          type="button"
          className="gm-babycard__edit"
          aria-label="编辑宝宝信息"
          onClick={onEdit}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
            <path d="m13.5 6.5 4 4" />
          </svg>
        </button>
      </div>
      {visibleMetrics.length > 0 ? (
        <div className="gm-babycard__metrics">
          {visibleMetrics.map((metric) => (
            <div key={metric.key} className="gm-babycard__metric">
              <span>{metric.label}</span>
              <span>
                {metric.value}
                {metric.unit ? <small>{metric.unit}</small> : null}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
export default GmBabyCard;

const GENDER_LABEL: Record<"boy" | "girl" | "unknown", string> = {
  boy: "男宝",
  girl: "女宝",
  unknown: "",
};
