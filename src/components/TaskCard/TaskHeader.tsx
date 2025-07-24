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
 * タスク名を表示します
 */
export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
    </div>
  );
};