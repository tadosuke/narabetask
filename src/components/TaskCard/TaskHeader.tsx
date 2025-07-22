import React from 'react';
import type { Task, ResourceType } from '../../types';
import './TaskHeader.css';

/**
 * TaskHeaderコンポーネントのプロパティ
 */
interface TaskHeaderProps {
  /** 表示するタスク */
  task: Task;
}

/**
 * リソースタイプ情報の表示名
 */
const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  self: '自分',
  others: '他人',
  machine: 'マシンパワー',
  network: 'ネットワーク',
};

/**
 * タスクカードのヘッダーコンポーネント
 * タスク名と所要時間、リソースタイプを表示します
 */
export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  /** 所要時間を読みやすい形式でフォーマット */
  const durationText = task.duration >= 60 
    ? `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`
    : `${task.duration}m`;

  /** リソースタイプの表示名を作成 */
  const resourceTypeLabels = task.resourceTypes.map(type => RESOURCE_TYPE_LABELS[type]).join(', ');

  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
      <div className="task-card__header-right">
        <span className="task-card__duration">{durationText}</span>
        {task.resourceTypes.length > 0 && (
          <div className="task-card__resources" title={resourceTypeLabels}>
            <span className="material-symbols-outlined">person</span>
          </div>
        )}
      </div>
    </div>
  );
};