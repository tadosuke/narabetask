import React, { useState, useEffect } from 'react';
import type { Task, ResourceType } from '../../types';
import { TaskNameField } from './TaskNameField';
import { TaskDurationField } from './TaskDurationField';
import { ResourceTypeField } from './ResourceTypeField';
import { TaskInfoDisplay } from './TaskInfoDisplay';
import { TaskActions } from './TaskActions';
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
    if (selectedTask && updatedName.trim()) {
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
        <TaskNameField
          name={name}
          onNameChange={handleNameChange}
        />

        <TaskDurationField
          duration={duration}
          onDurationChange={handleDurationChange}
        />

        <ResourceTypeField
          resourceTypes={resourceTypes}
          onResourceTypeChange={handleResourceTypeChange}
        />

        {selectedTask && (
          <TaskInfoDisplay task={selectedTask} />
        )}
      </div>

      <TaskActions
        taskId={selectedTask.id}
        onTaskRemove={onTaskRemove}
      />
    </div>
  );
};
