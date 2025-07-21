import { createContext, useState, useCallback, useEffect } from 'react';
import type { Task } from '../types';
import { generateId } from '../utils/idGenerator';
import { saveToStorage, loadFromStorage } from '../utils/storage';

/**
 * TaskContextの型定義
 */
interface TaskContextType {
  /** タスク一覧 */
  tasks: Task[];
  /** 選択されているタスク */
  selectedTask: Task | null;
  /** ドラッグ中のタスクID */
  draggedTaskId: string | null;
  /** 新しいタスクを追加する */
  addTask: () => void;
  /** タスクの情報を更新する */
  updateTask: (updatedTask: Task) => void;
  /** タスクを削除する */
  removeTask: (taskId: string) => void;
  /** タスクをタイムラインにドロップした際の処理 */
  dropTask: (taskId: string, startTime: string) => void;
  /** タスクをタイムラインから一覧に戻す処理 */
  returnTask: (taskId: string) => void;
  /** ロック状態を切り替える処理 */
  toggleLock: (taskId: string) => void;
  /** タスクをクリックした際の処理 */
  selectTask: (task: Task | null) => void;
  /** ドラッグ開始時の処理 */
  startDrag: (taskId: string) => void;
  /** ドラッグ終了時の処理 */
  endDrag: () => void;
}

/**
 * TaskContext
 */
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

/**
 * TaskProviderコンポーネントのプロパティ
 */
interface TaskProviderProps {
  children: React.ReactNode;
}

/**
 * TaskProviderコンポーネント
 * タスクの状態管理を提供します
 */
export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Load saved state on component mount
  useEffect(() => {
    const savedState = loadFromStorage();
    if (savedState) {
      setTasks(savedState.tasks);
      
      // Restore selected task if it exists in the loaded tasks
      if (savedState.selectedTaskId) {
        const task = savedState.tasks.find(t => t.id === savedState.selectedTaskId);
        if (task) {
          setSelectedTask(task);
        }
      }
    }
  }, []);

  // Save state whenever tasks or selectedTask change
  useEffect(() => {
    // Don't save immediately on mount when state might be initializing
    const timeoutId = setTimeout(() => {
      saveToStorage(tasks, selectedTask);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [tasks, selectedTask]);

  /** 新しいタスクを追加する */
  const addTask = useCallback(() => {
    const newTask: Task = {
      id: generateId(),
      name: '新しいタスク',
      duration: 30,
      resourceTypes: ['self'],
      isPlaced: false
    };
    
    setTasks(prev => [...prev, newTask]);
    setSelectedTask(newTask);
  }, []);

  /** タスクの情報を更新する */
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(task => {
      if (task.id === updatedTask.id) {
        // If the original task was placed but the update doesn't include placement info,
        // preserve the placement state to prevent tasks from returning to staging
        if (task.isPlaced && task.startTime && 
            (updatedTask.isPlaced === undefined || updatedTask.startTime === undefined)) {
          return {
            ...updatedTask,
            isPlaced: task.isPlaced,
            startTime: task.startTime
          };
        }
        return updatedTask;
      }
      return task;
    }));
    setSelectedTask(updatedTask);
  }, []);

  /** タスクを削除する */
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

  /** タスクをタイムラインにドロップした際の処理 */
  const dropTask = useCallback((taskId: string, startTime: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, startTime, isPlaced: true }
        : task
    ));
    
    // 選択中のタスクが移動された場合は、selectedTaskも更新する
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, startTime, isPlaced: true } : null);
    }
  }, [selectedTask]);

  /** タスクをタイムラインから一覧に戻す処理 */
  const returnTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, startTime: undefined, isPlaced: false, isLocked: false } // ロックも解除
        : task
    ));
    
    // 選択中のタスクが戻された場合は、selectedTaskも更新する
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, startTime: undefined, isPlaced: false, isLocked: false } : null);
    }
  }, [selectedTask]);

  /** ロック状態を切り替える処理 */
  const toggleLock = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, isLocked: !task.isLocked }
        : task
    ));
  }, []);

  /** タスクをクリックした際の処理 */
  const selectTask = useCallback((task: Task | null) => {
    setSelectedTask(task);
  }, []);

  /** ドラッグ開始時の処理 */
  const startDrag = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
    // ドラッグ中のタスクを選択状態にする
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
      return prev;
    });
  }, []);

  /** ドラッグ終了時の処理 */
  const endDrag = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  const contextValue: TaskContextType = {
    tasks,
    selectedTask,
    draggedTaskId,
    addTask,
    updateTask,
    removeTask,
    dropTask,
    returnTask,
    toggleLock,
    selectTask,
    startDrag,
    endDrag,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};