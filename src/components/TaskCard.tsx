import React from 'react';
import type { Task } from '../types';
import './TaskCard.css';

/**
 * TaskCardコンポーネントのプロパティ
 */
interface TaskCardProps {
  /** 表示するタスク */
  task: Task;
  /** クリック時のハンドラ */
  onClick?: () => void;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (e: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: (e: React.DragEvent) => void;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/** リソースタイプごとの色設定 */
const resourceTypeColors: Record<string, string> = {
  self: '#4CAF50',
  others: '#2196F3',
  machine: '#FF9800',
  network: '#9C27B0'
};

/** リソースタイプごとの日本語ラベル */
const resourceTypeLabels: Record<string, string> = {
  self: '自分',
  others: '他人',
  machine: 'マシン',
  network: 'ネットワーク'
};

/**
 * タスクカードコンポーネント
 * タスクの情報を表示し、ドラッグ&ドロップに対応します
 */

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  style
}) => {
  /** ドラッグ開始時の処理 */
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) {
      onDragStart(e);
    }
  };

  /** 所要時間を読みやすい形式でフォーマット */
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
        width: task.isPlaced ? `${(task.duration / 15) * 60}px` : '200px'
      }}
    >
      <div className="task-card__header">
        <span className="task-card__name">{task.name}</span>
        <div className="task-card__header-right">
          <div className="task-card__resource-squares">
            {task.resourceTypes && task.resourceTypes.map(resourceType => (
              <span
                key={resourceType}
                className="task-card__resource-square"
                style={{ backgroundColor: resourceTypeColors[resourceType] }}
                title={resourceTypeLabels[resourceType]}
              >
                ■
              </span>
            ))}
          </div>
          <span className="task-card__duration">{durationText}</span>
        </div>
      </div>
      <div className="task-card__footer">
        {task.startTime && (
          <span className="task-card__time">{task.startTime}</span>
        )}
      </div>
    </div>
  );
};