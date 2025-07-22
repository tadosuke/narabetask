import React, { createContext, useState, useCallback } from 'react';
import type { Task } from '../types';

/**
 * TaskStagingContextの型定義
 */
interface TaskStagingContextType {
  /** ドラッグオーバー状態 */
  isDragOver: boolean;
  /** ドラッグオーバー時の処理 */
  handleDragOver: (e: React.DragEvent) => void;
  /** ドラッグエンター時の処理 */
  handleDragEnter: (e: React.DragEvent) => void;
  /** ドラッグリーブ時の処理 */
  handleDragLeave: (e: React.DragEvent) => void;
  /** ドロップ時の処理 */
  handleDrop: (e: React.DragEvent, onTaskReturn?: (taskId: string) => void, onDragEnd?: () => void, tasks?: Task[]) => void;
  /** 配置されていないタスクを取得 */
  getUnplacedTasks: (tasks: Task[]) => Task[];
  /** 配置されていないタスクが存在するかチェック */
  hasUnplacedTasks: (tasks: Task[]) => boolean;
  /** タスクリストが空かどうかをチェック */
  isEmpty: (tasks: Task[]) => boolean;
}

/**
 * TaskStagingContext
 */
export const TaskStagingContext = createContext<TaskStagingContextType | undefined>(
  undefined
);

/**
 * TaskStagingProviderコンポーネントのプロパティ
 */
interface TaskStagingProviderProps {
  children: React.ReactNode;
}

/**
 * TaskStagingProviderコンポーネント
 * TaskStagingの状態管理とビューに依存しないロジックを提供します
 */
export const TaskStagingProvider: React.FC<TaskStagingProviderProps> = ({ children }) => {
  /** ドラッグオーバー状態の管理 */
  const [isDragOver, setIsDragOver] = useState(false);

  /** ドラッグオーバー時の処理 */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  /** ドラッグエンター時の処理 */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  /** ドラッグリーブ時の処理 */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear drag over state if leaving the container itself
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  /** ドロップ時の処理 - タスクを一覧に戻す */
  const handleDrop = useCallback((
    e: React.DragEvent,
    onTaskReturn?: (taskId: string) => void,
    onDragEnd?: () => void,
    tasks: Task[] = []
  ) => {
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
  }, []);

  /** 配置されていないタスクを取得 */
  const getUnplacedTasks = useCallback((tasks: Task[]): Task[] => {
    return tasks.filter(task => !task.isPlaced);
  }, []);

  /** 配置されていないタスクが存在するかチェック */
  const hasUnplacedTasks = useCallback((tasks: Task[]): boolean => {
    return getUnplacedTasks(tasks).length > 0;
  }, [getUnplacedTasks]);

  /** タスクリストが空かどうかをチェック */
  const isEmpty = useCallback((tasks: Task[]): boolean => {
    return tasks.length === 0;
  }, []);

  const contextValue: TaskStagingContextType = {
    isDragOver,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    getUnplacedTasks,
    hasUnplacedTasks,
    isEmpty,
  };

  return (
    <TaskStagingContext.Provider value={contextValue}>
      {children}
    </TaskStagingContext.Provider>
  );
};