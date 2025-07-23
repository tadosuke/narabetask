import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';

/**
 * TaskSidebarContextの型定義
 */
interface TaskSidebarContextType {
  /** フォームの名前フィールド */
  name: string;
  /** フォームの作業時間フィールド */
  workTime: number;
  /** フォームの待ち時間フィールド */
  waitTime: number;
  /** 名前変更ハンドラ */
  handleNameChange: (newName: string) => void;
  /** 作業時間変更ハンドラ */
  handleWorkTimeChange: (newWorkTime: number) => void;
  /** 待ち時間変更ハンドラ */
  handleWaitTimeChange: (newWaitTime: number) => void;
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
  const [workTime, setWorkTime] = useState(15);
  const [waitTime, setWaitTime] = useState(15);

  // selectedTaskが変更された時にフォームを同期
  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setWorkTime(selectedTask.workTime);
      setWaitTime(selectedTask.waitTime);
    } else {
      setName("");
      setWorkTime(15);
      setWaitTime(15);
    }
  }, [selectedTask]);

  /** タスクの変更を自動保存 */
  const autoSaveTask = useCallback((
    updatedName: string,
    updatedWorkTime: number,
    updatedWaitTime: number
  ) => {
    if (selectedTask && updatedName.trim()) {
      const updatedTask: Task = {
        ...selectedTask,
        name: updatedName.trim(),
        workTime: updatedWorkTime,
        waitTime: updatedWaitTime,
        duration: updatedWorkTime + updatedWaitTime, // 計算値
      };
      onTaskUpdate(updatedTask);
    }
  }, [selectedTask, onTaskUpdate]);

  /** タスク名の変更処理 */
  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    autoSaveTask(newName, workTime, waitTime);
  }, [autoSaveTask, workTime, waitTime]);

  /** 作業時間の変更処理 */
  const handleWorkTimeChange = useCallback((newWorkTime: number) => {
    setWorkTime(newWorkTime);
    autoSaveTask(name, newWorkTime, waitTime);
  }, [autoSaveTask, name, waitTime]);

  /** 待ち時間の変更処理 */
  const handleWaitTimeChange = useCallback((newWaitTime: number) => {
    setWaitTime(newWaitTime);
    autoSaveTask(name, workTime, newWaitTime);
  }, [autoSaveTask, name, workTime]);

  const contextValue: TaskSidebarContextType = {
    name,
    workTime,
    waitTime,
    handleNameChange,
    handleWorkTimeChange,
    handleWaitTimeChange,
  };

  return (
    <TaskSidebarContext.Provider value={contextValue}>
      {children}
    </TaskSidebarContext.Provider>
  );
};