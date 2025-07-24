import React from 'react';
import type { Task } from '../../types';
import './TaskHeader.css';

/**
 * TaskHeaderコンポーネントのプロパティ
 */
interface TaskHeaderProps {
  /** 表示するタスク */
  task: Task;
}

/**
 * タスクカードのヘッダーコンポーネント
 * タスク名と所要時間を表示します
 */
export const TaskHeader: React.FC<TaskHeaderProps> = ({ task }) => {
  /** 時間を読みやすい形式でフォーマット（分単位） */
  const formatTime = (minutes: number): string => {
    return minutes >= 60 
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`;
  };

  /** 所要時間の表示テキストを決定 */
  const getTimeDisplayText = (): string => {
    // ステージングエリアかつworkTimeとwaitTimeが両方定義されている場合は分割表示
    if (!task.isPlaced && task.workTime !== undefined && task.waitTime !== undefined) {
      return `${formatTime(task.workTime)} + ${formatTime(task.waitTime)}`;
    }
    
    // その他の場合は従来の合計時間表示
    return formatTime(task.duration);
  };

  const timeDisplayText = getTimeDisplayText();

  return (
    <div className="task-card__header">
      <span className="task-card__name">{task.name}</span>
      <div className="task-card__header-right">
        <span className="task-card__duration">{timeDisplayText}</span>
      </div>
    </div>
  );
};