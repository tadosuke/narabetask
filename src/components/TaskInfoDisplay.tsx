import React from 'react';
import type { Task } from '../types';
import { calculateEndTime } from '../utils/timeUtils';
import './TaskInfoDisplay.css';

/**
 * TaskInfoDisplayコンポーネントのプロパティ
 */
interface TaskInfoDisplayProps {
  /** タスク */
  task: Task;
}

/**
 * 配置されたタスクの時間情報表示コンポーネント
 */
export const TaskInfoDisplay: React.FC<TaskInfoDisplayProps> = ({
  task,
}) => {
  if (!task.isPlaced || !task.startTime) {
    return null;
  }

  return (
    <div className="task-sidebar__info">
      <div><strong>開始時間:</strong> {task.startTime}</div>
      <div><strong>終了時間:</strong> {calculateEndTime(task.startTime, task.duration)}</div>
    </div>
  );
};