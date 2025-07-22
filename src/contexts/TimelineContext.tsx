import { createContext, useState, useCallback, useMemo } from "react";
import type { Task, BusinessHours } from "../types";
import { generateTimeSlots, canPlaceTask, getTaskSlots, findOverlappingTasks } from "../utils/timeUtils";

/**
 * TimelineContextの型定義
 */
interface TimelineContextType {
  /** ドラッグオーバー中のタイムスロット */
  dragOverSlot: string | null;
  /** 営業時間に基づいたタイムスロット */
  timeSlots: string[];
  /** 全タスクの配列 */
  tasks: Task[];
  /** タイムラインに配置済みのタスク一覧 */
  placedTasks: Task[];
  /** 重複しているタスクのIDのセット */
  overlappingTaskIds: Set<string>;
  /** 占有されているタイムスロットのセット */
  occupiedSlots: Set<string>;
  /** ドラッグオーバー時のハンドラ */
  handleDragOver: (e: React.DragEvent, time: string) => void;
  /** ドラッグエンター時のハンドラ */
  handleDragEnter: (e: React.DragEvent, time: string) => void;
  /** ドラッグリーブ時のハンドラ */
  handleDragLeave: (e: React.DragEvent) => void;
  /** ドロップ時のハンドラ */
  handleDrop: (e: React.DragEvent, dropTime: string) => void;
}

/**
 * TimelineContext
 */
export const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

/**
 * TimelineProviderコンポーネントのプロパティ
 */
interface TimelineProviderProps {
  children: React.ReactNode;
  /** タスクの配列 */
  tasks: Task[];
  /** 営業時間設定 */
  businessHours: BusinessHours;
  /** タスクドロップ時のハンドラ */
  onTaskDrop: (taskId: string, startTime: string) => void;
  /** 現在ドラッグ中のタスクのID */
  draggedTaskId?: string | null;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
}

/**
 * TimelineProviderコンポーネント
 * タイムラインの状態管理と業務ロジックを提供します
 */
export const TimelineProvider: React.FC<TimelineProviderProps> = ({
  children,
  tasks,
  businessHours,
  onTaskDrop,
  draggedTaskId: _draggedTaskId = null,
  onDragEnd
}) => {
  /** ドラッグオーバー中のタイムスロット */
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  /** 営業時間に基づいたタイムスロットを生成 */
  const timeSlots = useMemo(() => generateTimeSlots(businessHours), [businessHours]);

  /** タイムラインに配置済みのタスク一覧 */
  const placedTasks = useMemo(() => 
    tasks.filter(task => task.isPlaced && task.startTime), 
    [tasks]
  );

  /** 重複しているタスクのIDのセット */
  const overlappingTaskIds = useMemo(() => 
    findOverlappingTasks(placedTasks), 
    [placedTasks]
  );

  /** 占有されているタイムスロットのセットを作成 */
  const occupiedSlots = useMemo(() => {
    const occupied = new Set<string>();
    placedTasks.forEach(task => {
      if (task.startTime) {
        const taskSlots = getTaskSlots(task.startTime, task.duration);
        taskSlots.forEach(slot => occupied.add(slot));
      }
    });
    return occupied;
  }, [placedTasks]);

  /** ドラッグオーバー時の処理 */
  const handleDragOver = useCallback((e: React.DragEvent, time: string) => {
    e.preventDefault();
    setDragOverSlot(time);
  }, []);

  /** ドラッグエンター時の処理 - スロットにドラッグが入った時 */
  const handleDragEnter = useCallback((e: React.DragEvent, time: string) => {
    e.preventDefault();
    setDragOverSlot(time);
  }, []);

  /** ドラッグリーブ時の処理 - スロットからドラッグが離れた時 */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear dragOverSlot if we're leaving the slot element itself
    // Check if the related target is not a child of the current target
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverSlot(null);
    }
  }, []);

  /** ドロップ時の処理 - タスクを指定した時刻に配置 */
  const handleDrop = useCallback((e: React.DragEvent, dropTime: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    // Clear drag state
    setDragOverSlot(null);
    if (onDragEnd) {
      onDragEnd();
    }
    
    if (task) {
      // For placed tasks being moved, exclude their current slots from collision detection
      const occupiedSlotsForCheck = new Set(occupiedSlots);
      if (task.isPlaced && task.startTime) {
        const taskSlots = getTaskSlots(task.startTime, task.duration);
        taskSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
      }
      
      // Check if the task can be placed at this time
      if (canPlaceTask(dropTime, task.duration, occupiedSlotsForCheck, timeSlots)) {
        onTaskDrop(taskId, dropTime);
      }
    }
  }, [tasks, occupiedSlots, timeSlots, onTaskDrop, onDragEnd]);

  const contextValue: TimelineContextType = {
    dragOverSlot,
    timeSlots,
    tasks,
    placedTasks,
    overlappingTaskIds,
    occupiedSlots,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };

  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
};