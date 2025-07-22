import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';

/**
 * TaskSidebarContextの型定義
 */
interface TaskSidebarContextType {
  /** フォームの名前フィールド */
  name: string;
  /** フォームの所要時間フィールド */
  duration: number;
  /** 名前変更ハンドラ */
  handleNameChange: (newName: string) => void;
  /** 所要時間変更ハンドラ */
  handleDurationChange: (newDuration: number) => void;
}

/**
 * TaskSidebarContext
 */
export const TaskSidebarContext = createContext<TaskSidebarContextType | undefined>(
  undefined
);

/**
 * TaskSidebarProviderコンポーネントのプロパティ
 */
interface TaskSidebarProviderProps {
  children: React.ReactNode;
  /** 選択されているタスク */
  selectedTask: Task | null;
  /** タスク更新時のハンドラ */
  onTaskUpdate: (task: Task) => void;
}

/**
 * TaskSidebarProviderコンポーネント
 * TaskSidebarの状態管理を提供します
 */
export const TaskSidebarProvider: React.FC<TaskSidebarProviderProps> = ({
  children,
  selectedTask,
  onTaskUpdate,
}) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);

  // selectedTaskが変更された時にフォームを同期
  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setDuration(selectedTask.duration);
    } else {
      setName("");
      setDuration(30);
    }
  }, [selectedTask]);

  /** タスクの変更を自動保存 */
  const autoSaveTask = useCallback((
    updatedName: string,
    updatedDuration: number
  ) => {
    if (selectedTask && updatedName.trim()) {
      const updatedTask: Task = {
        ...selectedTask,
        name: updatedName.trim(),
        duration: updatedDuration,
      };
      onTaskUpdate(updatedTask);
    }
  }, [selectedTask, onTaskUpdate]);

  /** タスク名の変更処理 */
  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    autoSaveTask(newName, duration);
  }, [autoSaveTask, duration]);

  /** 所要時間の変更処理 */
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    autoSaveTask(name, newDuration);
  }, [autoSaveTask, name]);

  const contextValue: TaskSidebarContextType = {
    name,
    duration,
    handleNameChange,
    handleDurationChange,
  };

  return (
    <TaskSidebarContext.Provider value={contextValue}>
      {children}
    </TaskSidebarContext.Provider>
  );
};