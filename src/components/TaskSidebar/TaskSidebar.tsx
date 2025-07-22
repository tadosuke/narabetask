import React from 'react';
import type { Task } from '../../types';
import { useTaskSidebarContext } from '../../contexts/useTaskSidebarContext';
import { TaskNameField } from './TaskNameField';
import { TaskDurationField } from './TaskDurationField';
import { ResourceTypeField } from './ResourceTypeField';
import { TaskInfoDisplay } from './TaskInfoDisplay';
import { TaskRemoveButton } from './TaskRemoveButton';
import './TaskSidebar.css';

/**
 * TaskSidebarコンポーネントのプロパティ
 */
interface TaskSidebarProps {
  /** 選択されているタスク */
  selectedTask: Task | null;
  /** タスク削除時のハンドラ */
  onTaskRemove: (taskId: string) => void;
}

/**
 * タスクサイドバーコンポーネント
 * 選択されたタスクの詳細編集機能を提供します
 */
export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  selectedTask,
  onTaskRemove,
}) => {
  const {
    name,
    duration,
    resourceTypes,
    handleNameChange,
    handleDurationChange,
    handleResourceTypeChange,
  } = useTaskSidebarContext();

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

      <TaskRemoveButton
        taskId={selectedTask.id}
        onTaskRemove={onTaskRemove}
      />
    </div>
  );
};
