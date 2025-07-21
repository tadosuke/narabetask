import React, { useState } from 'react';
import type { Task } from '../../types';
import { TaskStagingHeader } from './TaskStagingHeader';
import { TaskStagingContents } from './TaskStagingContents';
import { TaskStagingInstructions } from './TaskStagingInstructions';
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
      <TaskStagingHeader onAddTask={onAddTask} />
      
      <TaskStagingContents
        tasks={tasks}
        selectedTask={selectedTask}
        onTaskClick={onTaskClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
      
      <TaskStagingInstructions />
    </div>
  );
};