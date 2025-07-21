import React from 'react';

/**
 * TaskNameFieldコンポーネントのプロパティ
 */
interface TaskNameFieldProps {
  /** タスク名 */
  name: string;
  /** 名前変更時のハンドラ */
  onNameChange: (name: string) => void;
}

/**
 * タスク名入力フィールドコンポーネント
 */
export const TaskNameField: React.FC<TaskNameFieldProps> = ({
  name,
  onNameChange,
}) => {
  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-name">タスク名</label>
      <input
        id="task-name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="タスク名を入力"
      />
    </div>
  );
};