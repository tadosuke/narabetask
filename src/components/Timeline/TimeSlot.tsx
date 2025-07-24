import React from 'react';
import type { Task } from '../../types';
import { canPlaceTaskWithWorkTime, getTaskSlots, getWorkTimeSlots } from '../../utils/timeUtils';
import { TaskCard } from '../TaskCard';
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
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
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
  onDragEnd,
  onLockToggle
}) => {
  // ドラッグ中の視覚的フィードバック用のクラス決定
  const isDragOver = dragOverSlot === time;
  let dragFeedbackClass = '';
  
  if (isDragOver && draggedTaskId) {
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (draggedTask) {
      // For placed tasks being moved, exclude their current work time slots from collision detection
      const occupiedSlotsForCheck = new Set(occupiedSlots);
      if (draggedTask.isPlaced && draggedTask.startTime) {
        const taskWorkSlots = getWorkTimeSlots(draggedTask.startTime, draggedTask.duration, draggedTask.workTime, draggedTask.waitTime);
        taskWorkSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
      }
      
      const canPlace = canPlaceTaskWithWorkTime(dragOverSlot, draggedTask.duration, draggedTask.workTime, draggedTask.waitTime, occupiedSlotsForCheck, timeSlots);
      dragFeedbackClass = canPlace ? 'timeline__slot--drag-over' : 'timeline__slot--drag-invalid';
    }
  }

  // ドラッグ中のタスクが複数スロットにまたがる場合の視覚フィードバック
  let dragSpanningClass = '';
  let isInvalidDrag = false;
  
  if (dragOverSlot && draggedTaskId) {
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (draggedTask) {
      // Check if this slot is part of the dragged task's span
      const draggedTaskSlots = getTaskSlots(dragOverSlot, draggedTask.duration);
      if (draggedTaskSlots.includes(time)) {
        // Determine if the drag is invalid (check placement from the drag over slot)
        const occupiedSlotsForCheck = new Set(occupiedSlots);
        if (draggedTask.isPlaced && draggedTask.startTime) {
          const taskWorkSlots = getWorkTimeSlots(draggedTask.startTime, draggedTask.duration, draggedTask.workTime, draggedTask.waitTime);
          taskWorkSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
        }
        isInvalidDrag = !canPlaceTaskWithWorkTime(dragOverSlot, draggedTask.duration, draggedTask.workTime, draggedTask.waitTime, occupiedSlotsForCheck, timeSlots);
        
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
  
  // Apply invalid class to spanning slots when drag is invalid
  if (isInvalidDrag && dragSpanningClass) {
    dragFeedbackClass = 'timeline__slot--drag-invalid';
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
          onLockToggle={onLockToggle}
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