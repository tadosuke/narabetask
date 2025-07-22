import React from 'react';
import type { Task } from '../../types';
import { useTimelineContext } from '../../contexts/useTimelineContext';
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
  /** 現在ドラッグ中のタスクのID */
  draggedTaskId?: string | null;
  /** 全タスクの配列 */
  tasks: Task[];
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
  draggedTaskId,
  tasks,
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
  const { getDragFeedbackClass, getDragSpanningClass } = useTimelineContext();
  
  // ドラッグ中の視覚的フィードバック用のクラス決定
  const dragFeedbackClass = getDragFeedbackClass(time, draggedTaskId || null, tasks);
  
  // ドラッグ中のタスクが複数スロットにまたがる場合の視覚フィードバック
  const dragSpanningClass = getDragSpanningClass(time, draggedTaskId || null, tasks);

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