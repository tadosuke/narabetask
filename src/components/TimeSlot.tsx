import React from 'react';
import type { Task } from '../types';
import { canPlaceTask, getTaskSlots } from '../utils/timeUtils';
import { TaskCard } from './TaskCard';
import './TimeSlot.css';

/**
 * TimeSlotコンポーネントのプロパティ
 */
interface TimeSlotProps {
  /** 時刻 */
  time: string;
  /** このスロットに配置されたタスク */
  task?: Task;
  /** 占有されているかどうか */
  isOccupied: boolean;
  /** ドラッグオーバー中のタイムスロット */
  dragOverSlot: string | null;
  /** 現在ドラッグ中のタスクのID */
  draggedTaskId?: string | null;
  /** 全タスクの配列 */
  tasks: Task[];
  /** 利用可能なタイムスロットの配列 */
  timeSlots: string[];
  /** 占有されているタイムスロットのセット */
  occupiedSlots: Set<string>;
  /** 選択中のタスク */
  selectedTask: Task | null;
  /** 重複しているタスクのIDのセット */
  overlappingTaskIds: Set<string>;
  /** ドラッグオーバー時のハンドラ */
  onDragOver: (e: React.DragEvent, time: string) => void;
  /** ドラッグエンター時のハンドラ */
  onDragEnter: (e: React.DragEvent, time: string) => void;
  /** ドラッグリーブ時のハンドラ */
  onDragLeave: (e: React.DragEvent) => void;
  /** ドロップ時のハンドラ */
  onDrop: (e: React.DragEvent, time: string) => void;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (taskId: string) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
}

/**
 * タイムスロットコンポーネント
 * 個別の時間スロットを表示し、タスクの配置とドラッグ&ドロップを管理します
 */
export const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  task,
  isOccupied,
  dragOverSlot,
  draggedTaskId,
  tasks,
  timeSlots,
  occupiedSlots,
  selectedTask,
  overlappingTaskIds,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onTaskClick,
  onDragStart,
  onDragEnd
}) => {
  // ドラッグ中の視覚的フィードバック用のクラス決定
  const isDragOver = dragOverSlot === time;
  let dragFeedbackClass = '';
  
  if (isDragOver && draggedTaskId) {
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (draggedTask) {
      // For placed tasks being moved, exclude their current slots from collision detection
      const occupiedSlotsForCheck = new Set(occupiedSlots);
      if (draggedTask.isPlaced && draggedTask.startTime) {
        const taskSlots = getTaskSlots(draggedTask.startTime, draggedTask.duration);
        taskSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
      }
      
      const canPlace = canPlaceTask(time, draggedTask.duration, occupiedSlotsForCheck, timeSlots);
      dragFeedbackClass = canPlace ? 'timeline__slot--drag-over' : 'timeline__slot--drag-invalid';
    }
  }

  // ドラッグ中のタスクが複数スロットにまたがる場合の視覚フィードバック
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

  return (
    <div
      className={`timeline__slot ${isOccupied ? 'timeline__slot--occupied' : ''} ${dragFeedbackClass} ${dragSpanningClass}`}
      onDragOver={(e) => onDragOver(e, time)}
      onDragEnter={(e) => onDragEnter(e, time)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, time)}
      data-time={time}
    >
      <div className="timeline__time-label">{time}</div>
      {task && (
        <TaskCard
          task={task}
          isSelected={selectedTask?.id === task.id}
          isOverlapping={overlappingTaskIds.has(task.id)}
          onClick={() => onTaskClick(task)}
          onDragStart={onDragStart ? () => onDragStart(task.id) : undefined}
          onDragEnd={onDragEnd}
          style={{
            position: 'absolute',
            left: '60px',
            right: '8px',
            top: '2px',
            zIndex: 2
          }}
        />
      )}
    </div>
  );
};