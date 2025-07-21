import React from 'react';

interface TaskDeleteButtonProps {
  selectedTask: { id: string };
  onTaskRemove: (taskId: string) => void;
}

export const TaskDeleteButton: React.FC<TaskDeleteButtonProps> = ({
  selectedTask,
  onTaskRemove,
}) => {
  /** タスクを削除 */
  const handleRemove = () => {
    if (selectedTask && window.confirm("このタスクを削除しますか？")) {
      onTaskRemove(selectedTask.id);
    }
  };

  return (
    <div className="task-sidebar__actions">
      <button className="task-sidebar__remove" onClick={handleRemove}>
        削除
      </button>
    </div>
  );
};