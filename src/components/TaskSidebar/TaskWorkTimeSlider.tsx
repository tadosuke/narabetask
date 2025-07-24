import React from 'react';

/**
 * TaskWorkTimeSliderコンポーネントのプロパティ
 */
interface TaskWorkTimeSliderProps {
  /** 作業時間（分） */
  workTime: number;
  /** 作業時間変更時のハンドラ */
  onWorkTimeChange: (workTime: number) => void;
}

/** 作業時間のスライダー設定 */
const WORK_TIME_MIN = 0; // 最小値: 0分
const WORK_TIME_MAX = 240; // 最大値: 4時間 = 240分
const WORK_TIME_STEP = 15; // 15分刻み

/**
 * 作業時間を読みやすい日本語形式にフォーマット
 */
const formatWorkTime = (minutes: number) => {
  if (minutes === 0) {
    return '0分';
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}時間${remainingMinutes}分`
      : `${hours}時間`;
  }
  return `${minutes}分`;
};

/**
 * タスク作業時間スライダーコンポーネント
 */
export const TaskWorkTimeSlider: React.FC<TaskWorkTimeSliderProps> = ({
  workTime,
  onWorkTimeChange,
}) => {
  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-work-time">作業時間</label>
      <div className="task-sidebar__slider-container">
        <input
          id="task-work-time"
          type="range"
          min={WORK_TIME_MIN}
          max={WORK_TIME_MAX}
          step={WORK_TIME_STEP}
          value={workTime}
          onChange={(e) => onWorkTimeChange(Number(e.target.value))}
          className="task-sidebar__slider"
        />
        <div className="task-sidebar__slider-display">
          {formatWorkTime(workTime)}
        </div>
      </div>
    </div>
  );
};