import React from 'react';

/**
 * TaskRemoveButtonコンポーネントのプロパティ
 */
interface TaskRemoveButtonProps {
  /** タスクID */
  taskId: string;
  /** タスク削除時のハンドラ */
  onTaskRemove: (taskId: string) => void;
}

/**
 * タスク削除ボタンコンポーネント
 */
export const TaskRemoveButton: React.FC<TaskRemoveButtonProps> = ({
  taskId,
  onTaskRemove,
}) => {
  /** タスクを削除 */
  const handleRemove = () => {
    if (window.confirm("このタスクを削除しますか？")) {
      onTaskRemove(taskId);
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