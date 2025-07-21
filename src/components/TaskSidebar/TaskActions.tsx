import React from 'react';

/**
 * TaskActionsコンポーネントのプロパティ
 */
interface TaskActionsProps {
  /** タスクID */
  taskId: string;
  /** タスク削除時のハンドラ */
  onTaskRemove: (taskId: string) => void;
}

/**
 * タスク操作ボタンコンポーネント
 */
export const TaskActions: React.FC<TaskActionsProps> = ({
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