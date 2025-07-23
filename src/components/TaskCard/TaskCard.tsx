import React from 'react';
import type { Task } from '../../types';
import { TaskHeader } from './TaskHeader';
import { TaskFooter } from './TaskFooter';
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
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
  /** 追加のスタイル */
  style?: React.CSSProperties;
  /** 選択中かどうか */
  isSelected?: boolean;
  /** 重複しているかどうか */
  isOverlapping?: boolean;
}

/**
 * タスクカードコンポーネント
 * タスクの情報を表示し、ドラッグ&ドロップに対応します
 */

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  onLockToggle,
  style,
  isSelected = false,
  isOverlapping = false
}) => {
  /** ドラッグ開始時の処理 */
  const handleDragStart = (e: React.DragEvent) => {
    // ロックされているタスクはドラッグできない
    if (task.isLocked) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) {
      onDragStart(e);
    }
  };

  /** タスクの高さを計算（15分 = 40px の基本高さ） */
  const calculateHeight = (duration: number): number => {
    const baseSlotHeight = 40; // timeline__slotの最小高さに合わせる
    const slotsNeeded = Math.ceil(duration / 15);
    return slotsNeeded * baseSlotHeight;
  };

  const taskHeight = task.isPlaced ? calculateHeight(task.duration) : 60; // デフォルトの高さは60px

  return (
    <div
      className={`task-card ${task.isPlaced ? 'task-card--placed' : 'task-card--staging'} ${isSelected ? 'task-card--selected' : ''} ${isOverlapping ? 'task-card--overlapping' : ''} ${task.isLocked ? 'task-card--locked' : ''}`}
      onClick={onClick}
      draggable={!task.isLocked}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        ...style,
        width: task.isPlaced ? '120px' : '200px',
        height: `${taskHeight}px`,
        minHeight: `${taskHeight}px`
      }}
    >
      {/* Time visualization background */}
      <div className="task-card__time-visualization">
        <div 
          className="task-card__work-time"
          style={{
            [task.isPlaced ? 'height' : 'width']: `${(task.workTime / task.duration) * 100}%`
          }}
        />
        <div 
          className="task-card__wait-time"
          style={{
            [task.isPlaced ? 'height' : 'width']: `${(task.waitTime / task.duration) * 100}%`
          }}
        />
      </div>
      
      {/* Content overlay */}
      <div className="task-card__content">
        <TaskHeader task={task} />
        <TaskFooter task={task} onLockToggle={onLockToggle} />
      </div>
    </div>
  );
};