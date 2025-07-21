import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';

interface TaskNameFieldProps {
  selectedTask: Task;
  onTaskUpdate: (task: Task) => void;
}

export const TaskNameField: React.FC<TaskNameFieldProps> = ({
  selectedTask,
  onTaskUpdate,
}) => {
  const [name, setName] = useState(selectedTask.name);

  useEffect(() => {
    setName(selectedTask.name);
  }, [selectedTask.id, selectedTask.name]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (newName.trim()) {
      const updatedTask: Task = {
        ...selectedTask,
        name: newName.trim(),
      };
      onTaskUpdate(updatedTask);
    }
  };

  return (
    <div className="task-sidebar__field">
      <label htmlFor="task-name">タスク名</label>
      <input
        id="task-name"
        type="text"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="タスク名を入力"
      />
    </div>
  );
};