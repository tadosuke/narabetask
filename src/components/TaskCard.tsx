import React from 'react';
import type { Task } from '../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  style?: React.CSSProperties;
}

const resourceTypeColors: Record<string, string> = {
  self: '#4CAF50',
  others: '#2196F3',
  machine: '#FF9800',
  network: '#9C27B0'
};

const resourceTypeLabels: Record<string, string> = {
  self: '自分',
  others: '他人',
  machine: 'マシン',
  network: 'ネットワーク'
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  style
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const durationText = task.duration >= 60 
    ? `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`
    : `${task.duration}m`;

  return (
    <div
      className={`task-card ${task.isPlaced ? 'task-card--placed' : 'task-card--staging'}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        ...style,
        backgroundColor: resourceTypeColors[task.resourceType],
        width: task.isPlaced ? `${(task.duration / 15) * 60}px` : '200px'
      }}
    >
      <div className="task-card__header">
        <span className="task-card__name">{task.name}</span>
        <span className="task-card__duration">{durationText}</span>
      </div>
      <div className="task-card__footer">
        <span className="task-card__resource">
          {resourceTypeLabels[task.resourceType]}
        </span>
        {task.startTime && (
          <span className="task-card__time">{task.startTime}</span>
        )}
      </div>
    </div>
  );
};