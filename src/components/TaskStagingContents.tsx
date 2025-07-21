import React from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import './TaskStagingContents.css';

/**
 * TaskStagingContentsコンポーネントのプロパティ
 */
interface TaskStagingContentsProps {
  /** タスクの配列 */
  tasks: Task[];
  /** 選択中のタスク */
  selectedTask: Task | null;
  /** タスククリック時のハンドラ */
  onTaskClick: (task: Task) => void;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (taskId: string) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: () => void;
}

/**
 * タスクステージングコンテンツコンポーネント
 * タスク一覧または空の状態を表示します
 */
export const TaskStagingContents: React.FC<TaskStagingContentsProps> = ({
  tasks,
  selectedTask,
  onTaskClick,
  onDragStart,
  onDragEnd
}) => {
  /** まだタイムラインに配置されていないタスクを取得 */
  const unplacedTasks = tasks.filter(task => !task.isPlaced);

  return (
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
              isSelected={selectedTask?.id === task.id}
              isOverlapping={false} // Unplaced tasks cannot overlap
              onClick={() => onTaskClick(task)}
              onDragStart={onDragStart ? () => onDragStart(task.id) : undefined}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
};