import { createContext, useState, useMemo, useCallback } from "react";
import type { Task, BusinessHours } from "../types";
import { generateTimeSlots, canPlaceTask, getTaskSlots, findOverlappingTasks } from "../utils/timeUtils";

/**
 * TimelineContextの型定義
 */
interface TimelineContextType {
  /** 営業時間に基づいたタイムスロット */
  timeSlots: string[];
  /** タイムラインに配置済みのタスク一覧 */
  placedTasks: Task[];
  /** 重複しているタスクのIDのセット */
  overlappingTaskIds: Set<string>;
  /** 占有されているタイムスロットのセット */
  occupiedSlots: Set<string>;
  /** ドラッグオーバー中のタイムスロット */
  dragOverSlot: string | null;
  /** ドラッグオーバー時の処理 */
  handleDragOver: (e: React.DragEvent, time: string) => void;
  /** ドラッグエンター時の処理 */
  handleDragEnter: (e: React.DragEvent, time: string) => void;
  /** ドラッグリーブ時の処理 */
  handleDragLeave: (e: React.DragEvent) => void;
  /** ドロップ時の処理 */
  handleDrop: (e: React.DragEvent, dropTime: string, tasks: Task[], timeSlots: string[], onTaskDrop: (taskId: string, startTime: string) => void, onDragEnd?: () => void) => void;
  /** タスクが配置可能かチェック */
  canTaskBePlaced: (time: string, duration: number, taskId?: string) => boolean;
  /** ドラッグフィードバック用のクラス名を取得 */
  getDragFeedbackClass: (time: string, draggedTaskId: string | null, tasks: Task[]) => string;
  /** ドラッグスパニング用のクラス名を取得 */
  getDragSpanningClass: (time: string, draggedTaskId: string | null, tasks: Task[]) => string;
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
}

/**
 * TimelineProviderコンポーネント
 * タイムライン関連の状態管理とビジネスロジックを提供します
 */
export const TimelineProvider: React.FC<TimelineProviderProps> = ({
  children,
  tasks,
  businessHours,
}) => {
  /** ドラッグオーバー中のタイムスロット */
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  /** 営業時間に基づいたタイムスロットを生成 */
  const timeSlots = useMemo(() => {
    return generateTimeSlots(businessHours);
  }, [businessHours]);

  /** タイムラインに配置済みのタスク一覧 */
  const placedTasks = useMemo(() => {
    return tasks.filter(task => task.isPlaced && task.startTime);
  }, [tasks]);

  /** 重複しているタスクのIDのセット */
  const overlappingTaskIds = useMemo(() => {
    return findOverlappingTasks(placedTasks);
  }, [placedTasks]);

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
  const handleDrop = useCallback((
    e: React.DragEvent, 
    dropTime: string, 
    tasks: Task[], 
    timeSlots: string[], 
    onTaskDrop: (taskId: string, startTime: string) => void, 
    onDragEnd?: () => void
  ) => {
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
  }, [occupiedSlots]);

  /** タスクが配置可能かチェック */
  const canTaskBePlaced = useCallback((time: string, duration: number, taskId?: string) => {
    let occupiedSlotsForCheck = occupiedSlots;
    
    // For tasks being moved, exclude their current slots from collision detection
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task?.isPlaced && task.startTime) {
        occupiedSlotsForCheck = new Set(occupiedSlots);
        const taskSlots = getTaskSlots(task.startTime, task.duration);
        taskSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
      }
    }
    
    return canPlaceTask(time, duration, occupiedSlotsForCheck, timeSlots);
  }, [occupiedSlots, timeSlots, tasks]);

  /** ドラッグフィードバック用のクラス名を取得 */
  const getDragFeedbackClass = useCallback((time: string, draggedTaskId: string | null, tasks: Task[]) => {
    const isDragOver = dragOverSlot === time;
    let dragFeedbackClass = '';
    
    if (isDragOver && draggedTaskId) {
      const draggedTask = tasks.find(t => t.id === draggedTaskId);
      if (draggedTask) {
        const canPlace = canTaskBePlaced(time, draggedTask.duration, draggedTaskId);
        dragFeedbackClass = canPlace ? 'timeline__slot--drag-over' : 'timeline__slot--drag-invalid';
      }
    }
    
    return dragFeedbackClass;
  }, [dragOverSlot, canTaskBePlaced]);

  /** ドラッグスパニング用のクラス名を取得 */
  const getDragSpanningClass = useCallback((time: string, draggedTaskId: string | null, tasks: Task[]) => {
    let dragSpanningClass = '';
    
    if (dragOverSlot && draggedTaskId) {
      const draggedTask = tasks.find(t => t.id === draggedTaskId);
      if (draggedTask && dragOverSlot) {
        const draggedTaskSlots = getTaskSlots(dragOverSlot, draggedTask.duration);
        if (draggedTaskSlots.includes(time)) {
          const slotIndex = draggedTaskSlots.indexOf(time);
          const totalSlots = draggedTaskSlots.length;
          
          if (totalSlots === 1) {
            dragSpanningClass = 'timeline__slot--drag-spanning-single';
          } else if (slotIndex === 0) {
            dragSpanningClass = 'timeline__slot--drag-spanning-first';
          } else if (slotIndex === totalSlots - 1) {
            dragSpanningClass = 'timeline__slot--drag-spanning-last';
          } else {
            dragSpanningClass = 'timeline__slot--drag-spanning-middle';
          }
          
          // 基本の spanning クラスも追加
          dragSpanningClass = `timeline__slot--drag-spanning ${dragSpanningClass}`;
        }
      }
    }
    
    return dragSpanningClass;
  }, [dragOverSlot]);

  const contextValue: TimelineContextType = {
    timeSlots,
    placedTasks,
    overlappingTaskIds,
    occupiedSlots,
    dragOverSlot,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    canTaskBePlaced,
    getDragFeedbackClass,
    getDragSpanningClass,
  };

  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
};