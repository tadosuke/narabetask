import React from 'react';
import type { Task } from '../../types';
import { useTaskStagingContext } from '../../contexts/useTaskStagingContext';
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
  const {
    isDragOver,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  } = useTaskStagingContext();

  /** ドロップ時の処理 - タスクを一覧に戻す */
  const onDrop = (e: React.DragEvent) => {
    handleDrop(e, onTaskReturn, onDragEnd, tasks);
  };

  return (
    <div 
      className={`task-staging ${isDragOver ? 'task-staging--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={onDrop}
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