import React from 'react';
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
  /** 営業時間設定 */
  businessHours: BusinessHours;
  /** 昼休み時間設定 */
  lunchBreak: LunchBreak;
  /** タスクドロップ時のハンドラ */
  onTaskDrop: (taskId: string, startTime: string) => void;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
}

/**
 * タイムラインコンポーネント
 * 営業時間に基づいたタイムスロットを表示し、タスクの配置を管理します
 */

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  businessHours,
  lunchBreak,
  onTaskDrop,
  onTaskClick
}) => {
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
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  /** ドロップ時の処理 - タスクを指定した時刻に配置 */

  const handleDrop = (e: React.DragEvent, dropTime: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
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

    return (
      <div
        key={time}
        className={`timeline__slot ${isLunchTime ? 'timeline__slot--lunch' : ''} ${isOccupied ? 'timeline__slot--occupied' : ''}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, time)}
        data-time={time}
      >
        <div className="timeline__time-label">{time}</div>
        {task && (
          <TaskCard
            task={task}
            onClick={() => onTaskClick(task)}
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