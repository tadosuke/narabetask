import React, { useState } from 'react';
import type { Task, BusinessHours } from '../../types';
import { generateTimeSlots, canPlaceTaskWithWorkTime, getWorkTimeSlots, findOverlappingTasksWithWorkTime } from '../../utils/timeUtils';
import { TimeSlot } from './TimeSlot';
import { TaskCard } from '../TaskCard';
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
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
}

/**
 * タイムラインコンポーネント
 * 営業時間に基づいたタイムスロットを表示し、タスクの配置を管理します
 */

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  selectedTask,
  businessHours,
  onTaskDrop,
  onTaskClick,
  draggedTaskId = null,
  onDragStart,
  onDragEnd,
  onLockToggle
}) => {
  /** ドラッグオーバー中のタイムスロット */
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  
  /** 営業時間に基づいたタイムスロットを生成 */
  const timeSlots = generateTimeSlots(businessHours);
  /** タイムラインに配置済みのタスク一覧 */
  const placedTasks = tasks.filter(task => task.isPlaced && task.startTime);
  
  /** 重複しているタスクのIDのセット */
  const overlappingTaskIds = findOverlappingTasksWithWorkTime(placedTasks);
  
  /** 占有されているタイムスロットのセットを作成（作業時間のみ） */
  const occupiedSlots = new Set<string>();
  placedTasks.forEach(task => {
    if (task.startTime) {
      const workSlots = getWorkTimeSlots(task.startTime, task.duration, task.workTime, task.waitTime);
      workSlots.forEach(slot => occupiedSlots.add(slot));
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
      // For placed tasks being moved, exclude their current work time slots from collision detection
      const occupiedSlotsForCheck = new Set(occupiedSlots);
      if (task.isPlaced && task.startTime) {
        const taskWorkSlots = getWorkTimeSlots(task.startTime, task.duration, task.workTime, task.waitTime);
        taskWorkSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
      }
      
      // Check if the task can be placed at this time (considering work time only)
      if (canPlaceTaskWithWorkTime(dropTime, task.duration, task.workTime, task.waitTime, occupiedSlotsForCheck, timeSlots)) {
        onTaskDrop(taskId, dropTime);
      }
    }
  };

  /** 指定した時刻のタイムスロットをレンダリング */
  const renderTimeSlot = (time: string) => {
    // 横並び表示では個別のタイムスロットにタスクは表示しない
    const isOccupied = occupiedSlots.has(time);

    return (
      <TimeSlot
        key={time}
        time={time}
        task={undefined}
        isOccupied={isOccupied}
        dragOverSlot={dragOverSlot}
        draggedTaskId={draggedTaskId}
        tasks={tasks}
        timeSlots={timeSlots}
        occupiedSlots={occupiedSlots}
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

  /** 配置済みタスクを開始時間順にソートして横並びで表示 */
  const renderHorizontalTasks = () => {
    if (placedTasks.length === 0) return null;

    // 開始時間順にソート
    const sortedTasks = [...placedTasks].sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });

    return (
      <div className="timeline__horizontal-tasks">
        {sortedTasks.map((task, index) => (
          <div
            key={task.id}
            className="timeline__horizontal-task"
            style={{
              left: `${index * 140}px`, // 140px間隔で配置（120px幅 + 20pxマージン）
            }}
          >
            <TaskCard
              task={task}
              isSelected={selectedTask?.id === task.id}
              isOverlapping={overlappingTaskIds.has(task.id)}
              onClick={() => onTaskClick(task)}
              onDragStart={onDragStart ? () => onDragStart(task.id) : undefined}
              onDragEnd={onDragEnd}
              onLockToggle={onLockToggle}
              style={{
                width: '120px',
                height: '80px',
                minHeight: '80px'
              }}
            />
          </div>
        ))}
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
        {renderHorizontalTasks()}
        {timeSlots.map(renderTimeSlot)}
      </div>
    </div>
  );
};