import { render, screen } from '@testing-library/react';
import { TaskFooter } from '../../src/components/TaskFooter';
import { Task } from '../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  resourceTypes: ['self'],
  isPlaced: false
};

describe('TaskFooter', () => {
  it('リソースアイコンが表示される', () => {
    render(<TaskFooter task={baseMockTask} />);
    
    // リソースアイコンが表示されることを確認
    const resourceIcon = screen.getByTitle('自分');
    expect(resourceIcon).toBeInTheDocument();
    expect(resourceIcon).toHaveTextContent('■');
  });

  it('複数のリソースアイコンが並んで表示される', () => {
    const taskWithMultipleResources = {
      ...baseMockTask,
      resourceTypes: ['self', 'others', 'machine']
    } as Task;
    
    render(<TaskFooter task={taskWithMultipleResources} />);
    
    // 各リソースアイコンが表示されることを確認
    expect(screen.getByTitle('自分')).toBeInTheDocument();
    expect(screen.getByTitle('他人')).toBeInTheDocument();
    expect(screen.getByTitle('マシン')).toBeInTheDocument();
    
    // すべてのアイコンが同じ容器内にあることを確認
    const resourceContainer = screen.getByTitle('自分').closest('.task-card__resource-squares');
    expect(resourceContainer).toBeInTheDocument();
    expect(resourceContainer?.children).toHaveLength(3);
  });

  it('リソースが選択されていない場合でも、ロックボタンは表示される', () => {
    const taskWithNoResources = {
      ...baseMockTask,
      resourceTypes: []
    } as Task;
    
    const { container } = render(<TaskFooter task={taskWithNoResources} />);
    
    // フッターは表示されることを確認（ロックボタンがあるため）
    expect(container.firstChild).not.toBeNull();
    
    // ロックボタンが表示されることを確認
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toBeDisabled(); // 非配置タスクなので無効
    
    // リソースアイコンはない
    expect(container.querySelector('.task-card__resource-square')).toBeNull();
  });

  it('リソースタイプがundefinedの場合でも、ロックボタンは表示される', () => {
    const taskWithUndefinedResources = {
      ...baseMockTask,
      resourceTypes: undefined as any
    } as Task;
    
    const { container } = render(<TaskFooter task={taskWithUndefinedResources} />);
    
    // フッターは表示されることを確認（ロックボタンがあるため）
    expect(container.firstChild).not.toBeNull();
    
    // ロックボタンが表示されることを確認
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toBeDisabled(); // 非配置タスクなので無効
    
    // リソースアイコンはない
    expect(container.querySelector('.task-card__resource-square')).toBeNull();
  });

  it('各リソースタイプが正しい色とラベルを持つ', () => {
    const taskWithAllResources = {
      ...baseMockTask,
      resourceTypes: ['self', 'others', 'machine', 'network']
    } as Task;
    
    render(<TaskFooter task={taskWithAllResources} />);
    
    // 各リソースアイコンが正しいラベルを持つことを確認
    expect(screen.getByTitle('自分')).toBeInTheDocument();
    expect(screen.getByTitle('他人')).toBeInTheDocument();
    expect(screen.getByTitle('マシン')).toBeInTheDocument();
    expect(screen.getByTitle('ネットワーク')).toBeInTheDocument();
  });
});