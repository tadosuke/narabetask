import React, { useState, useEffect } from 'react';
import type { Task, ResourceType } from '../../types';

interface TaskResourceTypesFieldProps {
  selectedTask: Task;
  onTaskUpdate: (task: Task) => void;
}

/** リソースタイプの選択肢一覧 */
const resourceTypeOptions: Array<{ value: ResourceType; label: string }> = [
  { value: "self", label: "自分" },
  { value: "others", label: "他人" },
  { value: "machine", label: "マシンパワー" },
  { value: "network", label: "ネットワーク" },
];

export const TaskResourceTypesField: React.FC<TaskResourceTypesFieldProps> = ({
  selectedTask,
  onTaskUpdate,
}) => {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    selectedTask.resourceTypes || ['self']
  );

  useEffect(() => {
    setResourceTypes(selectedTask.resourceTypes || ['self']);
  }, [selectedTask.id, selectedTask.resourceTypes]);

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
    
    const updatedTask: Task = {
      ...selectedTask,
      resourceTypes: newResourceTypes,
    };
    onTaskUpdate(updatedTask);
  };

  return (
    <div className="task-sidebar__field">
      <label>リソースタイプ</label>
      <div className="task-sidebar__checkbox-group">
        {resourceTypeOptions.map((type) => (
          <label key={type.value} className="task-sidebar__checkbox-label">
            <input
              type="checkbox"
              checked={resourceTypes.includes(type.value)}
              onChange={(e) =>
                handleResourceTypeChange(type.value, e.target.checked)
              }
              className="task-sidebar__checkbox"
            />
            <span className="task-sidebar__checkbox-text">
              {type.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};