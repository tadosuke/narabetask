import React, { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import './TaskStaging.css';

/**
 * TaskStagingコンポーネントのプロパティ
 */
interface TaskStagingProps {
  /** タスクの配列 */
  tasks: Task[];
  /** 選択中のタスク */
  selectedTask: Task | null;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** 新しいタスク追加時のハンドラ */
  onAddTask: () => void;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (taskId: string) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
  /** タスクを一覧に戻す時のハンドラ */
  onTaskReturn?: (taskId: string) => void;
}

/**
 * タスクステージングコンポーネント
 * 配置前のタスク一覧を表示し、新しいタスクの作成機能を提供します
 */
export const TaskStaging: React.FC<TaskStagingProps> = ({
  tasks,
  selectedTask,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragEnd,
  onTaskReturn
}) => {
  /** まだタイムラインに配置されていないタスクを取得 */
  const unplacedTasks = tasks.filter(task => !task.isPlaced);
  
  /** ドラッグオーバー状態の管理 */
  const [isDragOver, setIsDragOver] = useState(false);

  /** ドラッグオーバー時の処理 */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  /** ドラッグエンター時の処理 */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  /** ドラッグリーブ時の処理 */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear drag over state if leaving the container itself
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  };

  /** ドロップ時の処理 - タスクを一覧に戻す */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    // Only allow returning placed tasks to staging
    if (task && task.isPlaced && onTaskReturn) {
      onTaskReturn(taskId);
    }
    
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div 
      className={`task-staging ${isDragOver ? 'task-staging--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="task-staging__header">
        <h3>タスク一覧</h3>
        <button 
          className="task-staging__add-button"
          onClick={onAddTask}
        >
          + 新しいタスク
        </button>
      </div>
      
      <div className="task-staging__content">
        {unplacedTasks.length === 0 ? (
          <div className="task-staging__empty">
            タスクがありません。<br />
            「新しいタスク」ボタンでタスクを作成してください。
          </div>
        ) : (
          <div className="task-staging__list">
            {unplacedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                isOverlapping={false} // Unplaced tasks cannot overlap
                onClick={() => onTaskClick(task)}
                onDragStart={onDragStart ? () => onDragStart(task.id) : undefined}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        )}
        
        <div className="task-staging__instructions">
          <p><strong>使い方:</strong></p>
          <ul>
            <li>タスクをクリックして設定を編集</li>
            <li>タスクをドラッグしてタイムラインに配置</li>
            <li>配置したタスクをドラッグしてここに戻すことも可能</li>
          </ul>
        </div>
      </div>
    </div>
  );
};