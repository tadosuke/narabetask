import React from 'react';
import type { Task, BusinessHours } from '../../types';
import { useTimelineContext } from '../../contexts/useTimelineContext';
import { TimeSlot } from './TimeSlot';
import './Timeline.css';

/**
 * Timelineコンポーネントのプロパティ
 */
interface TimelineProps {
  /** 選択中のタスク */
  selectedTask: Task | null;
  /** 営業時間設定 */
  businessHours: BusinessHours;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** 現在ドラッグ中のタスクのID（外部から渡される） */
  draggedTaskId?: string | null;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (taskId: string) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
}

/**
 * タイムラインコンポーネント
 * 営業時間に基づいたタイムスロットを表示し、タスクの配置を管理します
 */

export const Timeline: React.FC<TimelineProps> = ({
  selectedTask,
  businessHours,
  onTaskClick,
  draggedTaskId = null,
  onDragStart,
  onDragEnd,
  onLockToggle
}) => {
  const {
    dragOverSlot,
    timeSlots,
    placedTasks,
    overlappingTaskIds,
    occupiedSlots,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useTimelineContext();

  /** 指定した時刻のタイムスロットをレンダリング */
  const renderTimeSlot = (time: string) => {
    const task = placedTasks.find(t => t.startTime === time);
    const isOccupied = occupiedSlots.has(time);

    return (
      <TimeSlot
        key={time}
        time={time}
        task={task}
        isOccupied={isOccupied}
        dragOverSlot={dragOverSlot}
        draggedTaskId={draggedTaskId}
        selectedTask={selectedTask}
        overlappingTaskIds={overlappingTaskIds}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTaskClick={onTaskClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onLockToggle={onLockToggle}
      />
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