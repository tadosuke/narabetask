import React from 'react';
import type { ResourceType } from '../types';

/**
 * ResourceTypeFieldコンポーネントのプロパティ
 */
interface ResourceTypeFieldProps {
  /** 選択されているリソースタイプ */
  resourceTypes: ResourceType[];
  /** リソースタイプ変更時のハンドラ */
  onResourceTypeChange: (resourceType: ResourceType, checked: boolean) => void;
}

/** リソースタイプの選択肢一覧 */
const resourceTypeOptions: Array<{ value: ResourceType; label: string }> = [
  { value: "self", label: "自分" },
  { value: "others", label: "他人" },
  { value: "machine", label: "マシンパワー" },
  { value: "network", label: "ネットワーク" },
];

/**
 * リソースタイプ選択チェックボックスコンポーネント
 */
export const ResourceTypeField: React.FC<ResourceTypeFieldProps> = ({
  resourceTypes,
  onResourceTypeChange,
}) => {
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
                onResourceTypeChange(type.value, e.target.checked)
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