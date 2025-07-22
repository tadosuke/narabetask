import React from 'react';
import type { ResourceType } from '../../types';

/**
 * ResourceTypeSelectorコンポーネントのプロパティ
 */
interface ResourceTypeSelectorProps {
  /** 選択されているリソースタイプのリスト */
  selectedResourceTypes: ResourceType[];
  /** リソースタイプ変更時のハンドラ */
  onResourceTypesChange: (resourceTypes: ResourceType[]) => void;
}

/**
 * リソースタイプ情報
 */
const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: 'self', label: '自分' },
  { value: 'others', label: '他人' },
  { value: 'machine', label: 'マシンパワー' },
  { value: 'network', label: 'ネットワーク' },
];

/**
 * リソースタイプ選択コンポーネント
 */
export const ResourceTypeSelector: React.FC<ResourceTypeSelectorProps> = ({
  selectedResourceTypes,
  onResourceTypesChange,
}) => {
  /**
   * チェックボックスの変更を処理
   */
  const handleCheckboxChange = (resourceType: ResourceType, checked: boolean) => {
    let newResourceTypes: ResourceType[];
    
    if (checked) {
      // チェックされた場合、リストに追加
      newResourceTypes = [...selectedResourceTypes, resourceType];
    } else {
      // チェックが外された場合、リストから削除
      newResourceTypes = selectedResourceTypes.filter(type => type !== resourceType);
    }
    
    onResourceTypesChange(newResourceTypes);
  };

  return (
    <div className="task-sidebar__field">
      <label>リソースタイプ</label>
      <div className="task-sidebar__resource-types">
        {RESOURCE_TYPE_OPTIONS.map(({ value, label }) => (
          <div key={value} className="task-sidebar__resource-type">
            <input
              type="checkbox"
              id={`resource-${value}`}
              checked={selectedResourceTypes.includes(value)}
              onChange={(e) => handleCheckboxChange(value, e.target.checked)}
            />
            <label htmlFor={`resource-${value}`}>{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};