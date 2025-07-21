import React from 'react';
import type { Task } from '../../types';
import { calculateEndTime } from '../../utils/timeUtils';

interface TaskInfoDisplayProps {
  selectedTask: Task;
}

export const TaskInfoDisplay: React.FC<TaskInfoDisplayProps> = ({
  selectedTask,
}) => {
  if (!selectedTask.isPlaced || !selectedTask.startTime) {
    return null;
  }

  return (
    <div className="task-sidebar__info">
      <div><strong>開始時間:</strong> {selectedTask.startTime}</div>
      <div><strong>終了時間:</strong> {calculateEndTime(selectedTask.startTime, selectedTask.duration)}</div>
    </div>
  );
};