import React from 'react';
import type { Task } from '../../types';
import './TaskFooter.css';

/**
 * TaskFooterコンポーネントのプロパティ
 */
interface TaskFooterProps {
  /** 表示するタスク */
  task: Task;
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
}

/**
 * タスクカードのフッターコンポーネント
 * ロックボタンを表示します
 */
export const TaskFooter: React.FC<TaskFooterProps> = ({ task, onLockToggle }) => {
  /** ロックボタンのクリックハンドラ */
  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // タスクカードのクリックイベントを防ぐ
    if (onLockToggle && task.isPlaced) {
      onLockToggle(task.id);
    }
  };

  return (
    <div className="task-card__footer">
      <button
        className={`task-card__lock-button ${task.isLocked ? 'task-card__lock-button--locked' : ''} ${!task.isPlaced ? 'task-card__lock-button--disabled' : ''}`}
        onClick={handleLockClick}
        disabled={!task.isPlaced}
        title={task.isPlaced ? (task.isLocked ? 'ロックを解除' : 'ロックする') : 'タイムラインに配置されたタスクのみロック可能'}
      >
        <span className="material-symbols-outlined">
          {task.isLocked ? 'lock' : 'lock_open'}
        </span>
      </button>
    </div>
  );
};