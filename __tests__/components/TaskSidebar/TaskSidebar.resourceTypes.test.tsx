import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskSidebar } from '../../../src/components/TaskSidebar/TaskSidebar';
import { TaskCard } from '../../../src/components/TaskCard/TaskCard';
import { Task } from '../../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  resourceTypes: ['self'],
  isPlaced: false
};

describe('TaskSidebar Resource Type Updates', () => {
  it('すべてのリソースタイプのチェックを外した場合でもタスクが更新される', () => {
    const onTaskUpdate = vi.fn();
    const onTaskRemove = vi.fn();
    const onClose = vi.fn();

    render(
      <TaskSidebar
        selectedTask={baseMockTask}
        onTaskUpdate={onTaskUpdate}
        onTaskRemove={onTaskRemove}
        onClose={onClose}
      />
    );

    // 「自分」のチェックボックスを取得
    const selfCheckbox = screen.getByLabelText('自分');
    expect(selfCheckbox).toBeChecked();

    // 「自分」のチェックを外す
    fireEvent.click(selfCheckbox);

    // タスクが空のresourceTypesで更新されることを確認
    expect(onTaskUpdate).toHaveBeenCalledWith({
      ...baseMockTask,
      resourceTypes: []
    });
  });

  it('リソースタイプが空のタスクではTaskCardでリソースアイコンは表示されないが、ロックボタンは表示される', () => {
    const taskWithNoResources: Task = {
      ...baseMockTask,
      resourceTypes: []
    };

    render(<TaskCard task={taskWithNoResources} />);

    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();

    // リソースアイコンの容器は存在するが、個別のリソースアイコンはないことを確認
    const resourceContainer = taskCard?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).toBeInTheDocument();
    
    // 個別のリソースアイコンは表示されない
    const resourceSquares = resourceContainer?.querySelectorAll('.task-card__resource-square');
    expect(resourceSquares?.length).toBe(0);
    
    // ロックボタンは表示される（無効状態）
    const lockButton = taskCard?.querySelector('.task-card__lock-button');
    expect(lockButton).toBeInTheDocument();
  });
});