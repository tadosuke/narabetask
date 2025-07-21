import { render, screen } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';
import { Task } from '../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  resourceTypes: [],
  isPlaced: false
};

describe('TaskCard Empty Resources Test', () => {
  it('should not show resource icons when resourceTypes is empty array', () => {
    render(<TaskCard task={baseMockTask} />);
    
    const taskCard = screen.getByText('テストタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // リソースアイコンの容器が存在しないことを確認
    const resourceContainer = taskCard?.querySelector('.task-card__resource-squares');
    expect(resourceContainer).not.toBeInTheDocument();
  });
});