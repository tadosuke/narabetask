import { render, screen } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';
import { Task } from '../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  resourceTypes: ['self'],
  isPlaced: false
};

describe('TaskCard Resource Icons', () => {
  it('リソースアイコンがタイトルの下に左寄せで表示される', () => {
    render(<TaskCard task={baseMockTask} />);
    
    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // リソースアイコンの容器が存在することを確認
    const resourceContainer = taskCard?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).toBeInTheDocument();
    
    // リソースアイコンが表示されることを確認
    const resourceIcon = screen.getByTitle('自分');
    expect(resourceIcon).toBeInTheDocument();
    expect(resourceIcon).toHaveTextContent('■');
  });

  it('複数のリソースアイコンが左寄せで並んで表示される', () => {
    const taskWithMultipleResources = {
      ...baseMockTask,
      resourceTypes: ['self', 'others', 'machine']
    } as Task;
    
    render(<TaskCard task={taskWithMultipleResources} />);
    
    // 各リソースアイコンが表示されることを確認
    expect(screen.getByTitle('自分')).toBeInTheDocument();
    expect(screen.getByTitle('他人')).toBeInTheDocument();
    expect(screen.getByTitle('マシン')).toBeInTheDocument();
    
    // すべてのアイコンが同じ容器内にあることを確認
    const resourceContainer = screen.getByText('テストタスク').closest('.task-card')?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).toBeInTheDocument();
    expect(resourceContainer?.children).toHaveLength(3);
  });

  it('リソースが選択されていない場合はリソースアイコンを表示しない', () => {
    const taskWithNoResources = {
      ...baseMockTask,
      resourceTypes: []
    } as Task;
    
    render(<TaskCard task={taskWithNoResources} />);
    
    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // リソースアイコンの容器が存在しないことを確認
    const resourceContainer = taskCard?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).not.toBeInTheDocument();
  });

  it('リソースタイプがundefinedの場合はリソースアイコンを表示しない', () => {
    const taskWithUndefinedResources = {
      ...baseMockTask,
      resourceTypes: undefined as any
    } as Task;
    
    render(<TaskCard task={taskWithUndefinedResources} />);
    
    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // リソースアイコンの容器が存在しないことを確認
    const resourceContainer = taskCard?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).not.toBeInTheDocument();
  });

  it('配置済みタスクでもリソースアイコンが正しく表示される', () => {
    const placedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00'
    } as Task;
    
    render(<TaskCard task={placedTask} />);
    
    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // リソースアイコンが表示されることを確認
    const resourceIcon = screen.getByTitle('自分');
    expect(resourceIcon).toBeInTheDocument();
    expect(resourceIcon).toHaveTextContent('■');
    
    // 時刻表示機能が削除されたため、開始時刻は表示されない
    expect(screen.queryByText('09:00')).not.toBeInTheDocument();
  });
});