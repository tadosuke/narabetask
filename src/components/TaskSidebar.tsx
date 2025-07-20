import React, { useState, useEffect } from 'react';
import type { Task, ResourceType } from '../types';
import './TaskSidebar.css';

interface TaskSidebarProps {
  selectedTask: Task | null;
  onTaskUpdate: (task: Task) => void;
  onTaskRemove: (taskId: string) => void;
  onClose: () => void;
}

const resourceTypes: Array<{ value: ResourceType; label: string }> = [
  { value: 'self', label: '自分' },
  { value: 'others', label: '他人' },
  { value: 'machine', label: 'マシンパワー' },
  { value: 'network', label: 'ネットワーク' }
];

const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  selectedTask,
  onTaskUpdate,
  onTaskRemove,
  onClose
}) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [resourceType, setResourceType] = useState<ResourceType>('self');

  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setDuration(selectedTask.duration);
      setResourceType(selectedTask.resourceType);
    } else {
      setName('');
      setDuration(30);
      setResourceType('self');
    }
  }, [selectedTask]);

  const handleSave = () => {
    if (selectedTask && name.trim()) {
      const updatedTask: Task = {
        ...selectedTask,
        name: name.trim(),
        duration,
        resourceType
      };
      onTaskUpdate(updatedTask);
    }
  };

  const handleRemove = () => {
    if (selectedTask && window.confirm('このタスクを削除しますか？')) {
      onTaskRemove(selectedTask.id);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
    }
    return `${minutes}分`;
  };

  if (!selectedTask) {
    return (
      <div className="task-sidebar task-sidebar--empty">
        <div className="task-sidebar__empty-message">
          タスクを選択してください
        </div>
      </div>
    );
  }

  return (
    <div className="task-sidebar">
      <div className="task-sidebar__header">
        <h3>タスク設定</h3>
        <button
          className="task-sidebar__close"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>

      <div className="task-sidebar__content">
        <div className="task-sidebar__field">
          <label htmlFor="task-name">タスク名</label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="タスク名を入力"
          />
        </div>

        <div className="task-sidebar__field">
          <label htmlFor="task-duration">工数</label>
          <select
            id="task-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {durationOptions.map(option => (
              <option key={option} value={option}>
                {formatDuration(option)}
              </option>
            ))}
          </select>
        </div>

        <div className="task-sidebar__field">
          <label htmlFor="task-resource">リソースタイプ</label>
          <select
            id="task-resource"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
          >
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {selectedTask.isPlaced && selectedTask.startTime && (
          <div className="task-sidebar__info">
            <strong>配置時間:</strong> {selectedTask.startTime}
          </div>
        )}
      </div>

      <div className="task-sidebar__actions">
        <button
          className="task-sidebar__save"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          保存
        </button>
        <button
          className="task-sidebar__remove"
          onClick={handleRemove}
        >
          削除
        </button>
      </div>
    </div>
  );
};