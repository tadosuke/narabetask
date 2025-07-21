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
 * タスクカードのフッターコンポーネント
 * リソースアイコンとロックボタンを表示します
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
      <div className="task-card__resource-squares">
        {task.resourceTypes && task.resourceTypes.length > 0 && 
          task.resourceTypes.map(resourceType => (
            <span
              key={resourceType}
              className="task-card__resource-square"
              style={{ backgroundColor: resourceTypeColors[resourceType] }}
              title={resourceTypeLabels[resourceType]}
            >
              ■
            </span>
          ))
        }
      </div>
      
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