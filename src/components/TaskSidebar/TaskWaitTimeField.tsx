import React from 'react';

/**
 * TaskWaitTimeFieldコンポーネントのプロパティ
 */
interface TaskWaitTimeFieldProps {
  /** 待ち時間（分） */
  waitTime: number;
  /** 待ち時間変更時のハンドラ */
  onWaitTimeChange: (waitTime: number) => void;
}

/** 待ち時間のスライダー設定 */
const WAIT_TIME_MIN = 0; // 最小値: 0分
const WAIT_TIME_MAX = 240; // 最大値: 4時間 = 240分
const WAIT_TIME_STEP = 15; // 15分刻み

/**
 * 時間を読みやすい日本語形式にフォーマット
 */
const formatTime = (minutes: number) => {
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
 * タスク待ち時間スライダーコンポーネント
 */
export const TaskWaitTimeField: React.FC<TaskWaitTimeFieldProps> = ({
  waitTime,
  onWaitTimeChange,
}) => {
  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-wait-time">待ち時間</label>
      <div className="task-sidebar__slider-container">
        <input
          id="task-wait-time"
          type="range"
          min={WAIT_TIME_MIN}
          max={WAIT_TIME_MAX}
          step={WAIT_TIME_STEP}
          value={waitTime}
          onChange={(e) => onWaitTimeChange(Number(e.target.value))}
          className="task-sidebar__slider"
        />
        <div className="task-sidebar__slider-display">
          {formatTime(waitTime)}
        </div>
      </div>
    </div>
  );
};