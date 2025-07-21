import React from 'react';
import type { Task } from '../types';

/**
 * TaskFooterコンポーネントのプロパティ
 */
interface TaskFooterProps {
  /** 表示するタスク */
  task: Task;
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
 * リソースアイコンを表示します
 */
export const TaskFooter: React.FC<TaskFooterProps> = ({ task }) => {
  if (!task.resourceTypes || task.resourceTypes.length === 0) {
    return null;
  }

  return (
    <div className="task-card__resource-squares">
      {task.resourceTypes.map(resourceType => (
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
  );
};