import React, { useState, useEffect } from 'react';
import type { Task, ResourceType } from '../types';
import './TaskSidebar.css';

/**
 * TaskSidebarコンポーネントのプロパティ
 */
interface TaskSidebarProps {
  /** 選択されているタスク */
  selectedTask: Task | null;
  /** タスク更新時のハンドラ */
  onTaskUpdate: (task: Task) => void;
  /** タスク削除時のハンドラ */
  onTaskRemove: (taskId: string) => void;
  /** サイドバーを閉じる際のハンドラ */
  onClose: () => void;
}

/** リソースタイプの選択肢一覧 */
const resourceTypeOptions: Array<{ value: ResourceType; label: string }> = [
  { value: 'self', label: '自分' },
  { value: 'others', label: '他人' },
  { value: 'machine', label: 'マシンパワー' },
  { value: 'network', label: 'ネットワーク' }
];

/** 所要時間の選択肢一覧（15分刻み） */
const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

/**
 * タスクサイドバーコンポーネント
 * 選択されたタスクの詳細編集機能を提供します
 */

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  selectedTask,
  onTaskUpdate,
  onTaskRemove,
  onClose
}) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setDuration(selectedTask.duration);
      setResourceTypes(selectedTask.resourceTypes || ['self']);
    } else {
      setName('');
      setDuration(30);
      setResourceTypes(['self']);
    }
  }, [selectedTask]);

  /** リソースタイプの選択状態を切り替え */
  const handleResourceTypeChange = (resourceType: ResourceType, checked: boolean) => {
    if (checked) {
      setResourceTypes(prev => [...prev, resourceType]);
    } else {
      setResourceTypes(prev => prev.filter(type => type !== resourceType));
    }
  };

  /** タスクの変更を保存 */
  const handleSave = () => {
    if (selectedTask && name.trim() && resourceTypes.length > 0) {
      const updatedTask: Task = {
        ...selectedTask,
        name: name.trim(),
        duration,
        resourceTypes
      };
      onTaskUpdate(updatedTask);
    }
  };

  /** タスクを削除 */
  const handleRemove = () => {
    if (selectedTask && window.confirm('このタスクを削除しますか？')) {
      onTaskRemove(selectedTask.id);
    }
  };

  /** 所要時間を読みやすい日本語形式にフォーマット */

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
          <label>リソースタイプ</label>
          <div className="task-sidebar__checkbox-group">
            {resourceTypeOptions.map(type => (
              <label key={type.value} className="task-sidebar__checkbox-label">
                <input
                  type="checkbox"
                  checked={resourceTypes.includes(type.value)}
                  onChange={(e) => handleResourceTypeChange(type.value, e.target.checked)}
                  className="task-sidebar__checkbox"
                />
                <span className="task-sidebar__checkbox-text">{type.label}</span>
              </label>
            ))}
          </div>
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
          disabled={!name.trim() || resourceTypes.length === 0}
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