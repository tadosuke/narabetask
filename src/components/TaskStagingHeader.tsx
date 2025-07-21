import React from 'react';
import './TaskStagingHeader.css';

/**
 * TaskStagingHeaderコンポーネントのプロパティ
 */
interface TaskStagingHeaderProps {
  /** 新しいタスク追加時のハンドラ */
  onAddTask: () => void;
}

/**
 * タスクステージングヘッダーコンポーネント
 * タイトルと新しいタスク追加ボタンを表示します
 */
export const TaskStagingHeader: React.FC<TaskStagingHeaderProps> = ({
  onAddTask
}) => {
  return (
    <div className="task-staging__header">
      <h3>タスク一覧</h3>
      <button 
        className="task-staging__add-button"
        onClick={onAddTask}
      >
        + 新しいタスク
      </button>
    </div>
  );
};