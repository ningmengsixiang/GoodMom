import React from "react";

/**
 * GmPregnancyCard —— 孕周首页卡（规范 13 · 13.3.1）
 *
 * 与 `@goodmom/vue` 同契约：week / day / dueDate / stage / babyName / progress /
 * tasks / milestones，事件 task（(key)）。视觉（玻璃卡、大数字、进度带、节点圆点）
 * 由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. progress 为 -1 时按孕周折算（week*7+day）/280，夹在 0–100；传值则直接用。
 * 2. dueDate 合法才显示倒计时（提前「距预产期 N 天」、当天、超期三种文案）。
 * 3. 任务最多渲染 3 个，整行是 button，点击派发 task(key)。
 * 4. 里程碑 done 同时挂 is-done 状态类与 data-done，CSS 任选其一即可。
 */
export interface GmPregnancyTask {
  key: string;
  label: string;
}
export interface GmPregnancyMilestone {
  key: string;
  label: string;
  done?: boolean;
}
export interface GmPregnancyCardProps {
  week: number;
  /** 周内天数，默认 0 */
  day?: number;
  /** 预产期 YYYY-MM-DD，默认 ""（空则不显示倒计时） */
  dueDate?: string;
  /** 孕期阶段，默认 "middle" */
  stage?: "early" | "middle" | "late";
  /** 宝宝小名，默认 "" */
  babyName?: string;
  /** 进度 0–100；默认 -1 表示按 week/day 计算 */
  progress?: number;
  /** 待办任务，默认 []（最多渲染 3 个） */
  tasks?: GmPregnancyTask[];
  /** 关键节点，默认 [] */
  milestones?: GmPregnancyMilestone[];
  onTask?: (key: string) => void;
}

const GmPregnancyCard = ({
  week,
  day = 0,
  dueDate = "",
  stage = "middle",
  babyName = "",
  progress = -1,
  tasks = [],
  milestones = [],
  onTask,
}: GmPregnancyCardProps) => {
  const percent =
    progress >= 0
      ? clamp(Math.round(progress), 0, 100)
      : clamp(Math.round(((week * 7 + day) / 280) * 100), 0, 100);
  const countdown = countdownText(dueDate);
  const visibleTasks = tasks.slice(0, 3);

  return (
    <section className="gm-pregnancy">
      <div className="gm-pregnancy__head">
        <span className="gm-pregnancy__avatar" aria-hidden="true">
          {babyName ? babyName.charAt(0) : "孕"}
        </span>
        <div>
          <p className="gm-pregnancy__name">{babyName || "我的宝宝"}</p>
          <p className="gm-pregnancy__week">
            <strong>{week}</strong> 周 <span>{day}</span> 天
          </p>
          <span className="gm-pregnancy__stage">{STAGE_LABEL[stage]}</span>
        </div>
        {countdown ? <p className="gm-pregnancy__countdown">{countdown}</p> : null}
      </div>
      {visibleTasks.length > 0 ? (
        <div className="gm-pregnancy__tasks">
          {visibleTasks.map((task) => (
            <button
              key={task.key}
              type="button"
              className="gm-pregnancy__task"
              onClick={() => onTask?.(task.key)}
            >
              {task.label}
            </button>
          ))}
        </div>
      ) : null}
      <div
        className="gm-pregnancy__progress"
        role="progressbar"
        aria-label="孕期进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="gm-pregnancy__bar" style={{ width: percent + "%" }} />
      </div>
      {milestones.length > 0 ? (
        <div className="gm-pregnancy__milestones">
          {milestones.map((item) => (
            <span
              key={item.key}
              className={"gm-pregnancy__milestone" + (item.done ? " is-done" : "")}
              data-done={item.done ? "true" : undefined}
            >
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
};
export default GmPregnancyCard;

const STAGE_LABEL: Record<"early" | "middle" | "late", string> = {
  early: "孕早期",
  middle: "孕中期",
  late: "孕晚期",
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** 预产期倒计时文案；非法日期返回 ""（不渲染） */
function countdownText(dueDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
  if (!m) return "";
  const due = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return "距预产期 " + diff + " 天";
  if (diff === 0) return "今天是预产期";
  return "已超过预产期 " + Math.abs(diff) + " 天";
}
