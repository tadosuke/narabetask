import React from 'react';

/**
 * TaskDurationFieldコンポーネントのプロパティ
 */
interface TaskDurationFieldProps {
  /** 作業時間（分） */
  workTime: number;
  /** 待ち時間（分） */
  waitTime: number;
  /** 作業時間変更時のハンドラ */
  onWorkTimeChange: (workTime: number) => void;
  /** 待ち時間変更時のハンドラ */
  onWaitTimeChange: (waitTime: number) => void;
}

/** 所要時間のスライダー設定 */
const DURATION_MIN = 0; // 最小値: 0分（待ち時間は0でも可）
const DURATION_MAX = 240; // 最大値: 4時間 = 240分
const DURATION_STEP = 15; // 15分刻み
const WORK_TIME_MIN = 15; // 作業時間の最小値: 15分

/**
 * 所要時間を読みやすい日本語形式にフォーマット
 */
const formatDuration = (minutes: number) => {
  if (minutes === 0) {
    return "0分";
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
 * タスク所要時間スライダーコンポーネント
 */
export const TaskDurationField: React.FC<TaskDurationFieldProps> = ({
  workTime,
  waitTime,
  onWorkTimeChange,
  onWaitTimeChange,
}) => {
  const totalDuration = workTime + waitTime;

  return (
    <div className="task-sidebar__field">
      <label>工数</label>
      
      <div className="task-sidebar__field">
        <label htmlFor="task-work-time">作業時間</label>
        <div className="task-sidebar__slider-container">
          <input
            id="task-work-time"
            type="range"
            min={WORK_TIME_MIN}
            max={DURATION_MAX}
            step={DURATION_STEP}
            value={workTime}
            onChange={(e) => onWorkTimeChange(Number(e.target.value))}
            className="task-sidebar__slider"
          />
          <div className="task-sidebar__slider-display">
            {formatDuration(workTime)}
          </div>
        </div>
      </div>

      <div className="task-sidebar__field">
        <label htmlFor="task-wait-time">待ち時間</label>
        <div className="task-sidebar__slider-container">
          <input
            id="task-wait-time"
            type="range"
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={DURATION_STEP}
            value={waitTime}
            onChange={(e) => onWaitTimeChange(Number(e.target.value))}
            className="task-sidebar__slider"
          />
          <div className="task-sidebar__slider-display">
            {formatDuration(waitTime)}
          </div>
        </div>
      </div>

      <div className="task-sidebar__total-duration">
        <strong>合計: {formatDuration(totalDuration)}</strong>
      </div>
    </div>
  );
};