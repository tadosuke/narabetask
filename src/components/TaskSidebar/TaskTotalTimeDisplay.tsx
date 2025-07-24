import React from 'react';

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
 * タスク合計時間表示コンポーネント
 */
export const TaskTotalTimeDisplay: React.FC<TaskTotalTimeDisplayProps> = ({
  workTime,
  waitTime,
}) => {
  const totalTime = workTime + waitTime;
  
  return (
    <div className="task-sidebar__field">
      <label>合計時間</label>
      <div className="task-sidebar__total-time-display">
        <div className="task-sidebar__total-time-breakdown">
          <span className="task-sidebar__time-component">
            作業: {formatTime(workTime)}
          </span>
          <span className="task-sidebar__time-separator">+</span>
          <span className="task-sidebar__time-component">
            待ち: {formatTime(waitTime)}
          </span>
        </div>
        <div className="task-sidebar__total-time-value">
          = {formatTime(totalTime)}
        </div>
      </div>
    </div>
  );
};