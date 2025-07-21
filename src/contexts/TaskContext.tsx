import { createContext, useState, useCallback, useEffect } from "react";
import type { Task } from "../types";
import { generateId } from "../utils/idGenerator";
import { saveToStorage, loadFromStorage } from "../utils/storage";

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
export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

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
  // コンポーネントのマウント時に保存された状態を読み込む
  useEffect(() => {
    const savedState = loadFromStorage();
    if (savedState) {
      setTasks(savedState.tasks);

      // 保存されたselectedTaskIdが存在し、tasks内に該当タスクがあれば選択状態を復元
      if (savedState.selectedTaskId) {
        const task = savedState.tasks.find(
          (t) => t.id === savedState.selectedTaskId
        );
        if (task) {
          setSelectedTask(task);
        }
      }
    }
  }, []);

  // tasksやselectedTaskが変更されるたびに状態を保存する
  useEffect(() => {
    // マウント直後の初期化時に即保存しないように少し遅延させる
    const timeoutId = setTimeout(() => {
      saveToStorage(tasks, selectedTask);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [tasks, selectedTask]);

  /**
   * 元のタスクのプレースメント状態を更新されたタスクに保持する
   * @param originalTask 元のタスク
   * @param updatedTask 更新されたタスク
   * @returns プレースメント状態が保持された更新タスク
   */
  const preservePlacementState = (
    originalTask: Task,
    updatedTask: Task
  ): Task => {
    // 元のタスクが配置されていて、更新タスクに配置情報が含まれていない場合
    if (
      originalTask.isPlaced &&
      originalTask.startTime &&
      (updatedTask.isPlaced === undefined ||
        updatedTask.startTime === undefined)
    ) {
      return {
        ...updatedTask,
        isPlaced: originalTask.isPlaced,
        startTime: originalTask.startTime,
      };
    }
    return updatedTask;
  };

  /**
   * タスクリストの中で指定されたタスクを配置状態に更新する
   * @param tasks 現在のタスクリスト
   * @param taskId 更新対象のタスクID
   * @param startTime 開始時刻
   * @returns 更新されたタスクリスト
   */
  const updateTaskPlacement = (
    tasks: Task[],
    taskId: string,
    startTime: string
  ): Task[] => {
    return tasks.map((task) =>
      task.id === taskId ? { ...task, startTime, isPlaced: true } : task
    );
  };

  /**
   * タスクリストの中で指定されたタスクをステージング状態にリセットする
   * @param tasks 現在のタスクリスト
   * @param taskId リセット対象のタスクID
   * @returns 更新されたタスクリスト
   */
  const resetTaskToStaging = (tasks: Task[], taskId: string): Task[] => {
    return tasks.map((task) =>
      task.id === taskId
        ? { ...task, startTime: undefined, isPlaced: false, isLocked: false }
        : task
    );
  };

  /**
   * 選択されているタスクが指定されたタスクIDの場合、提供された更新内容で同期する
   * @param selectedTask 現在選択されているタスク
   * @param taskId 対象のタスクID
   * @param updates 適用する更新内容
   * @param setSelectedTask selectedTask更新用のsetter関数
   */
  const syncSelectedTaskWithUpdate = (
    selectedTask: Task | null,
    taskId: string,
    updates: Partial<Task>,
    setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
  ): void => {
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  /**
   * 指定されたタスクIDのタスクを検索して選択状態にする
   * @param tasks 現在のタスクリスト
   * @param taskId 選択対象のタスクID
   * @param setSelectedTask selectedTask更新用のsetter関数
   */
  const findAndSelectTask = (
    tasks: Task[],
    taskId: string,
    setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
  ): void => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  /**
   * タスクリストの中で指定されたタスクのロック状態を切り替える
   * @param tasks 現在のタスクリスト
   * @param taskId ロック状態を切り替えるタスクID
   * @returns ロック状態が切り替えられたタスクリスト
   */
  const toggleTaskLock = (tasks: Task[], taskId: string): Task[] => {
    return tasks.map((task) =>
      task.id === taskId ? { ...task, isLocked: !task.isLocked } : task
    );
  };

  /** 新しいタスクを追加する */
  const addTask = useCallback(() => {
    const newTask: Task = {
      id: generateId(),
      name: "新しいタスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setSelectedTask(newTask);
  }, []);

  /** タスクの情報を更新する */
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === updatedTask.id) {
          return preservePlacementState(task, updatedTask);
        }
        return task;
      })
    );
    setSelectedTask(updatedTask);
  }, []);

  /** タスクを削除する */
  const removeTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    },
    [selectedTask]
  );

  /** タスクをタイムラインにドロップした際の処理 */
  const dropTask = useCallback(
    (taskId: string, startTime: string) => {
      setTasks((prev) => updateTaskPlacement(prev, taskId, startTime));

      // 選択中のタスクが移動された場合は、selectedTaskも更新する
      syncSelectedTaskWithUpdate(
        selectedTask,
        taskId,
        { startTime, isPlaced: true },
        setSelectedTask
      );
    },
    [selectedTask]
  );

  /** タスクをタイムラインから一覧に戻す処理 */
  const returnTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => resetTaskToStaging(prev, taskId));

      // 選択中のタスクが戻された場合は、selectedTaskも更新する
      syncSelectedTaskWithUpdate(
        selectedTask,
        taskId,
        { startTime: undefined, isPlaced: false, isLocked: false },
        setSelectedTask
      );
    },
    [selectedTask]
  );

  /** ロック状態を切り替える処理 */
  const toggleLock = useCallback((taskId: string) => {
    setTasks((prev) => toggleTaskLock(prev, taskId));
  }, []);

  /** タスクをクリックした際の処理 */
  const selectTask = useCallback((task: Task | null) => {
    setSelectedTask(task);
  }, []);

  /** ドラッグ開始時の処理 */
  const startDrag = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
    // ドラッグ中のタスクを選択状態にする
    setTasks((prev) => {
      findAndSelectTask(prev, taskId, setSelectedTask);
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
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
};
