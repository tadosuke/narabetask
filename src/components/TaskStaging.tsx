import React from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import './TaskStaging.css';

/**
 * TaskStagingコンポーネントのプロパティ
 */
interface TaskStagingProps {
  /** タスクの配列 */
  tasks: Task[];
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** 新しいタスク追加時のハンドラ */
  onAddTask: () => void;
}

/**
 * タスクステージングコンポーネント
 * 配置前のタスク一覧を表示し、新しいタスクの作成機能を提供します
 */
export const TaskStaging: React.FC<TaskStagingProps> = ({
  tasks,
  onTaskClick,
  onAddTask
}) => {
  /** まだタイムラインに配置されていないタスクを取得 */
  const unplacedTasks = tasks.filter(task => !task.isPlaced);

  return (
    <div className="task-staging">
      <div className="task-staging__header">
        <h3>タスク一覧</h3>
        <button 
          className="task-staging__add-button"
          onClick={onAddTask}
        >
          + 新しいタスク
        </button>
      </div>
      
      <div className="task-staging__content">
        {unplacedTasks.length === 0 ? (
          <div className="task-staging__empty">
            タスクがありません。<br />
            「新しいタスク」ボタンでタスクを作成してください。
          </div>
        ) : (
          <div className="task-staging__list">
            {unplacedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </div>
        )}
        
        <div className="task-staging__instructions">
          <p><strong>使い方:</strong></p>
          <ul>
            <li>タスクをクリックして設定を編集</li>
            <li>タスクをドラッグしてタイムラインに配置</li>
            <li>配置したタスクは重複できません</li>
          </ul>
        </div>
      </div>
    </div>
  );
};