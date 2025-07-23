import React from 'react';
import type { Task } from '../../types';
import './TaskHeader.css';

/**
 * TaskHeaderコンポーネントのプロパティ
 */
interface TaskHeaderProps {
  /** 表示するタスク */
  task: Task;
}

/**
 * タスクカードのヘッダーコンポーネント
 * タスク名、作業時間、待ち時間を表示します
 */
export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  /** 所要時間を読みやすい形式でフォーマット */
  const formatTime = (minutes: number) => {
    if (minutes === 0) return "";
    return minutes >= 60 
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`;
  };

  const workTimeText = formatTime(task.workTime);
  const waitTimeText = formatTime(task.waitTime);

  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
      <div className="task-card__header-right">
        <div className="task-card__time-breakdown">
          {workTimeText && <span className="task-card__work-time">{workTimeText}</span>}
          {waitTimeText && <span className="task-card__wait-time">+{waitTimeText}</span>}
        </div>
      </div>
    </div>
  );
};