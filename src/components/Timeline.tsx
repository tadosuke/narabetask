import React, { useState } from 'react';
import type { Task, BusinessHours, LunchBreak } from '../types';
import { generateTimeSlots, canPlaceTask, getTaskSlots } from '../utils/timeUtils';
import { TaskCard } from './TaskCard';
import './Timeline.css';

/**
 * Timelineコンポーネントのプロパティ
 */
interface TimelineProps {
  /** タスクの配列 */
  tasks: Task[];
  /** 選択中のタスク */
  selectedTask: Task | null;
  /** 営業時間設定 */
  businessHours: BusinessHours;
  /** 昼休み時間設定 */
  lunchBreak: LunchBreak;
  /** タスクドロップ時のハンドラ */
  onTaskDrop: (taskId: string, startTime: string) => void;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** 現在ドラッグ中のタスクのID（外部から渡される） */
  draggedTaskId?: string | null;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (taskId: string) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
}

/**
 * タイムラインコンポーネント
 * 営業時間に基づいたタイムスロットを表示し、タスクの配置を管理します
 */

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  selectedTask,
  businessHours,
  lunchBreak,
  onTaskDrop,
  onTaskClick,
  draggedTaskId = null,
  onDragStart,
  onDragEnd
}) => {
  /** ドラッグオーバー中のタイムスロット */
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  
  /** 営業時間と昼休みを考慮したタイムスロットを生成 */
  const timeSlots = generateTimeSlots(businessHours, lunchBreak);
  /** タイムラインに配置済みのタスク一覧 */
  const placedTasks = tasks.filter(task => task.isPlaced && task.startTime);
  
  /** 占有されているタイムスロットのセットを作成 */
  const occupiedSlots = new Set<string>();
  placedTasks.forEach(task => {
    if (task.startTime) {
      const taskSlots = getTaskSlots(task.startTime, task.duration);
      taskSlots.forEach(slot => occupiedSlots.add(slot));
    }
  });

  /** ドラッグオーバー時の処理 */
  const handleDragOver = (e: React.DragEvent, time: string) => {
    e.preventDefault();
    setDragOverSlot(time);
  };

  /** ドラッグエンター時の処理 - スロットにドラッグが入った時 */
  const handleDragEnter = (e: React.DragEvent, time: string) => {
    e.preventDefault();
    setDragOverSlot(time);
  };

  /** ドラッグリーブ時の処理 - スロットからドラッグが離れた時 */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear dragOverSlot if we're leaving the slot element itself
    // Check if the related target is not a child of the current target
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverSlot(null);
    }
  };

  /** ドロップ時の処理 - タスクを指定した時刻に配置 */
  const handleDrop = (e: React.DragEvent, dropTime: string) => {
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
  };

  /** 指定した時刻のタイムスロットをレンダリング */
  const renderTimeSlot = (time: string) => {
    const task = placedTasks.find(t => t.startTime === time);
    const isOccupied = occupiedSlots.has(time);
    const isLunchTime = time >= lunchBreak.start && time < lunchBreak.end;
    
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
        key={time}
        className={`timeline__slot ${isLunchTime ? 'timeline__slot--lunch' : ''} ${isOccupied ? 'timeline__slot--occupied' : ''} ${dragFeedbackClass} ${dragSpanningClass}`}
        onDragOver={(e) => handleDragOver(e, time)}
        onDragEnter={(e) => handleDragEnter(e, time)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, time)}
        data-time={time}
      >
        <div className="timeline__time-label">{time}</div>
        {task && (
          <TaskCard
            task={task}
            isSelected={selectedTask?.id === task.id}
            onClick={() => onTaskClick(task)}
            onDragStart={onDragStart ? () => onDragStart(task.id) : undefined}
            onDragEnd={onDragEnd}
            onDragOver={draggedTaskId === task.id ? (e) => handleDragOver(e, time) : undefined}
            onDragEnter={draggedTaskId === task.id ? (e) => handleDragEnter(e, time) : undefined}
            onDrop={draggedTaskId === task.id ? (e) => handleDrop(e, time) : undefined}
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

  return (
    <div className="timeline">
      <div className="timeline__header">
        <h3>タイムライン</h3>
        <div className="timeline__business-hours">
          業務時間: {businessHours.start} - {businessHours.end}
        </div>
      </div>
      <div className="timeline__grid">
        {timeSlots.map(renderTimeSlot)}
      </div>
    </div>
  );
};