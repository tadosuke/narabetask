import React from 'react';
import './TaskTotalTimeDisplay.css';

/**
 * TaskTotalTimeDisplayコンポーネントのプロパティ
 */
interface TaskTotalTimeDisplayProps {
  /** 作業時間（分） */
  workTime: number;
  /** 待ち時間（分） */
  waitTime: number;
}

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
 * 合計時間表示コンポーネント
 */
export const TaskTotalTimeDisplay: React.FC<TaskTotalTimeDisplayProps> = ({
  workTime,
  waitTime,
}) => {
  const totalTime = workTime + waitTime;

  return (
    <div className="task-total-time-display">
      <div className="task-total-time-display__label">合計時間</div>
      <div className="task-total-time-display__time">
        {formatTime(totalTime)}
      </div>
    </div>
  );
};