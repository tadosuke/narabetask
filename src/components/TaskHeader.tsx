import React from 'react';
import type { Task } from '../types';

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
  /** 所要時間を読みやすい形式でフォーマット */
  const durationText = task.duration >= 60 
    ? `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`
    : `${task.duration}m`;

  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
      <div className="task-card__header-right">
        <span className="task-card__duration">{durationText}</span>
      </div>
    </div>
  );
};