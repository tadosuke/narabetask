import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Task, ResourceType } from '../types';

/**
 * TaskSidebarContextの型定義
 */
interface TaskSidebarContextType {
  /** フォームの名前フィールド */
  name: string;
  /** フォームの所要時間フィールド */
  duration: number;
  /** フォームのリソースタイプフィールド */
  resourceTypes: ResourceType[];
  /** 名前変更ハンドラ */
  handleNameChange: (newName: string) => void;
  /** 所要時間変更ハンドラ */
  handleDurationChange: (newDuration: number) => void;
  /** リソースタイプ変更ハンドラ */
  handleResourceTypeChange: (resourceType: ResourceType, checked: boolean) => void;
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
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

  // selectedTaskが変更された時にフォームを同期
  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setDuration(selectedTask.duration);
      setResourceTypes(selectedTask.resourceTypes || ["self"]);
    } else {
      setName("");
      setDuration(30);
      setResourceTypes(["self"]);
    }
  }, [selectedTask]);

  /** タスクの変更を自動保存 */
  const autoSaveTask = useCallback((
    updatedName: string,
    updatedDuration: number,
    updatedResourceTypes: ResourceType[]
  ) => {
    if (selectedTask && updatedName.trim()) {
      const updatedTask: Task = {
        ...selectedTask,
        name: updatedName.trim(),
        duration: updatedDuration,
        resourceTypes: updatedResourceTypes,
      };
      onTaskUpdate(updatedTask);
    }
  }, [selectedTask, onTaskUpdate]);

  /** タスク名の変更処理 */
  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    autoSaveTask(newName, duration, resourceTypes);
  }, [autoSaveTask, duration, resourceTypes]);

  /** 所要時間の変更処理 */
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    autoSaveTask(name, newDuration, resourceTypes);
  }, [autoSaveTask, name, resourceTypes]);

  /** リソースタイプの選択状態を切り替え */
  const handleResourceTypeChange = useCallback((
    resourceType: ResourceType,
    checked: boolean
  ) => {
    let newResourceTypes: ResourceType[];
    if (checked) {
      newResourceTypes = [...resourceTypes, resourceType];
    } else {
      newResourceTypes = resourceTypes.filter((type) => type !== resourceType);
    }
    setResourceTypes(newResourceTypes);
    autoSaveTask(name, duration, newResourceTypes);
  }, [autoSaveTask, name, duration, resourceTypes]);

  const contextValue: TaskSidebarContextType = {
    name,
    duration,
    resourceTypes,
    handleNameChange,
    handleDurationChange,
    handleResourceTypeChange,
  };

  return (
    <TaskSidebarContext.Provider value={contextValue}>
      {children}
    </TaskSidebarContext.Provider>
  );
};