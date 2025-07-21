import React from 'react';

/**
 * TaskDurationFieldコンポーネントのプロパティ
 */
interface TaskDurationFieldProps {
  /** 所要時間（分） */
  duration: number;
  /** 所要時間変更時のハンドラ */
  onDurationChange: (duration: number) => void;
}

/** 所要時間のスライダー設定 */
const DURATION_MIN = 15; // 最小値: 15分
const DURATION_MAX = 240; // 最大値: 4時間 = 240分
const DURATION_STEP = 15; // 15分刻み

/**
 * 所要時間を読みやすい日本語形式にフォーマット
 */
const formatDuration = (minutes: number) => {
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
 * タスク所要時間スライダーコンポーネント
 */
export const TaskDurationField: React.FC<TaskDurationFieldProps> = ({
  duration,
  onDurationChange,
}) => {
  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-duration">工数</label>
      <div className="task-sidebar__slider-container">
        <input
          id="task-duration"
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={DURATION_STEP}
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="task-sidebar__slider"
        />
        <div className="task-sidebar__slider-display">
          {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
};