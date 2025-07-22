import React from 'react';
import type { Task } from '../../types';
import { calculateEndTime } from '../../utils/timeUtils';
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
  const startTime = (task.isPlaced && task.startTime) ? task.startTime : '-';
  const endTime = (task.isPlaced && task.startTime) ? calculateEndTime(task.startTime, task.duration) : '-';

  return (
    <div className="task-sidebar__info">
      <div><strong>開始時間:</strong> {startTime}</div>
      <div><strong>終了時間:</strong> {endTime}</div>
    </div>
  );
};