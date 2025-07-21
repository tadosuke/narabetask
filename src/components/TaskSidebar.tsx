import React, { useState, useEffect } from 'react';
import type { Task, ResourceType } from '../types';
import { calculateEndTime } from '../utils/timeUtils';
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
}

/** リソースタイプの選択肢一覧 */
const resourceTypeOptions: Array<{ value: ResourceType; label: string }> = [
  { value: "self", label: "自分" },
  { value: "others", label: "他人" },
  { value: "machine", label: "マシンパワー" },
  { value: "network", label: "ネットワーク" },
];

/** 所要時間のスライダー設定 */
const DURATION_MIN = 15; // 最小値: 15分
const DURATION_MAX = 240; // 最大値: 4時間 = 240分
const DURATION_STEP = 15; // 15分刻み

/**
 * タスクサイドバーコンポーネント
 * 選択されたタスクの詳細編集機能を提供します
 */

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  selectedTask,
  onTaskUpdate,
  onTaskRemove,
}) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

  useEffect(() => {
    if (selectedTask) {
      setName(selectedTask.name);
      setDuration(selectedTask.duration);
      setResourceTypes(selectedTask.resourceTypes || ["self"]);
    } else {
      setName("");
      setDuration(30);
      setResourceTypes(["self"]);
    }
  }, [selectedTask]);

  /** タスクの変更を自動保存 */
  const autoSaveTask = (
    updatedName: string,
    updatedDuration: number,
    updatedResourceTypes: ResourceType[]
  ) => {
    if (selectedTask && updatedName.trim() && updatedResourceTypes.length > 0) {
      const updatedTask: Task = {
        ...selectedTask,
        name: updatedName.trim(),
        duration: updatedDuration,
        resourceTypes: updatedResourceTypes,
      };
      onTaskUpdate(updatedTask);
    }
  };

  /** タスク名の変更処理 */
  const handleNameChange = (newName: string) => {
    setName(newName);
    autoSaveTask(newName, duration, resourceTypes);
  };

  /** 所要時間の変更処理 */
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    autoSaveTask(name, newDuration, resourceTypes);
  };

  /** リソースタイプの選択状態を切り替え */
  const handleResourceTypeChange = (
    resourceType: ResourceType,
    checked: boolean
  ) => {
    let newResourceTypes: ResourceType[];
    if (checked) {
      newResourceTypes = [...resourceTypes, resourceType];
    } else {
      newResourceTypes = resourceTypes.filter((type) => type !== resourceType);
    }
    setResourceTypes(newResourceTypes);
    autoSaveTask(name, duration, newResourceTypes);
  };

  /** タスクを削除 */
  const handleRemove = () => {
    if (selectedTask && window.confirm("このタスクを削除しますか？")) {
      onTaskRemove(selectedTask.id);
    }
  };

  /** 所要時間を読みやすい日本語形式にフォーマット */

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}時間${remainingMinutes}分`
        : `${hours}時間`;
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
      </div>

      <div className="task-sidebar__content">
        <div className="task-sidebar__field">
          <label htmlFor="task-name">タスク名</label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="タスク名を入力"
          />
        </div>

        <div className="task-sidebar__field">
          <label htmlFor="task-duration">工数</label>
          <div className="task-sidebar__slider-container">
            <input
              id="task-duration"
              type="range"
              min={DURATION_MIN}
              max={DURATION_MAX}
              step={DURATION_STEP}
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="task-sidebar__slider"
            />
            <div className="task-sidebar__slider-display">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        <div className="task-sidebar__field">
          <label>リソースタイプ</label>
          <div className="task-sidebar__checkbox-group">
            {resourceTypeOptions.map((type) => (
              <label key={type.value} className="task-sidebar__checkbox-label">
                <input
                  type="checkbox"
                  checked={resourceTypes.includes(type.value)}
                  onChange={(e) =>
                    handleResourceTypeChange(type.value, e.target.checked)
                  }
                  className="task-sidebar__checkbox"
                />
                <span className="task-sidebar__checkbox-text">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedTask.isPlaced && selectedTask.startTime && (
          <div className="task-sidebar__info">
            <div><strong>開始時間:</strong> {selectedTask.startTime}</div>
            <div><strong>終了時間:</strong> {calculateEndTime(selectedTask.startTime, selectedTask.duration)}</div>
          </div>
        )}
      </div>

      <div className="task-sidebar__actions">
        <button className="task-sidebar__remove" onClick={handleRemove}>
          削除
        </button>
      </div>
    </div>
  );
};
