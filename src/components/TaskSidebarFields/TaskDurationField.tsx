import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';

interface TaskDurationFieldProps {
  selectedTask: Task;
  onTaskUpdate: (task: Task) => void;
}

/** 所要時間のスライダー設定 */
const DURATION_MIN = 15; // 最小値: 15分
const DURATION_MAX = 240; // 最大値: 4時間 = 240分
const DURATION_STEP = 15; // 15分刻み

export const TaskDurationField: React.FC<TaskDurationFieldProps> = ({
  selectedTask,
  onTaskUpdate,
}) => {
  const [duration, setDuration] = useState(selectedTask.duration);

  useEffect(() => {
    setDuration(selectedTask.duration);
  }, [selectedTask.id, selectedTask.duration]);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    const updatedTask: Task = {
      ...selectedTask,
      duration: newDuration,
    };
    onTaskUpdate(updatedTask);
  };

  /** 所要時間を読みやすい日本語形式にフォーマット */
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}時間${remainingMinutes}分`
        : `${hours}時間`;
    }
    return `${minutes}分`;
  };

  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-duration">工数</label>
      <div className="task-sidebar__slider-container">
        <input
          id="task-duration"
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={DURATION_STEP}
          value={duration}
          onChange={(e) => handleDurationChange(Number(e.target.value))}
          className="task-sidebar__slider"
        />
        <div className="task-sidebar__slider-display">
          {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
};