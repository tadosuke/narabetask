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
 * タスク名と所要時間を表示します
 */
export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  /** 作業時間と待ち時間を簡潔な形式でフォーマット（タスク一覧用） */
  const formatTimeShort = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // タスク一覧での表示: "15m + 30m"形式
  const timeText = task.isPlaced 
    ? task.name // タイムライン上ではタイトルのみ
    : `${formatTimeShort(task.workTime)} + ${formatTimeShort(task.waitTime)}`;

  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
      <div className="task-card__header-right">
        {!task.isPlaced && (
          <span className="task-card__duration">{timeText}</span>
        )}
      </div>
    </div>
  );
};