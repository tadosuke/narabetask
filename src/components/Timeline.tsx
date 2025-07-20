import React from 'react';
import type { Task, BusinessHours, LunchBreak } from '../types';
import { generateTimeSlots, canPlaceTask, getTaskSlots } from '../utils/timeUtils';
import { TaskCard } from './TaskCard';
import './Timeline.css';

interface TimelineProps {
  tasks: Task[];
  businessHours: BusinessHours;
  lunchBreak: LunchBreak;
  onTaskDrop: (taskId: string, startTime: string) => void;
  onTaskClick: (task: Task) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  businessHours,
  lunchBreak,
  onTaskDrop,
  onTaskClick
}) => {
  const timeSlots = generateTimeSlots(businessHours, lunchBreak);
  const placedTasks = tasks.filter(task => task.isPlaced && task.startTime);
  
  // Create a map of occupied time slots
  const occupiedSlots = new Set<string>();
  placedTasks.forEach(task => {
    if (task.startTime) {
      const taskSlots = getTaskSlots(task.startTime, task.duration);
      taskSlots.forEach(slot => occupiedSlots.add(slot));
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropTime: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.isPlaced) {
      // Check if the task can be placed at this time
      if (canPlaceTask(dropTime, task.duration, occupiedSlots, timeSlots)) {
        onTaskDrop(taskId, dropTime);
      }
    }
  };

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