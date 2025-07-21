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

  it('リソースが選択されていない場合は何も表示しない', () => {
    const taskWithNoResources = {
      ...baseMockTask,
      resourceTypes: []
    } as Task;
    
    const { container } = render(<TaskFooter task={taskWithNoResources} />);
    
    // 何も表示されないことを確認
    expect(container.firstChild).toBeNull();
  });

  it('リソースタイプがundefinedの場合は何も表示しない', () => {
    const taskWithUndefinedResources = {
      ...baseMockTask,
      resourceTypes: undefined as any
    } as Task;
    
    const { container } = render(<TaskFooter task={taskWithUndefinedResources} />);
    
    // 何も表示されないことを確認
    expect(container.firstChild).toBeNull();
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