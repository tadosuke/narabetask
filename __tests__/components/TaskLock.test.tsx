import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';
import { TaskFooter } from '../../src/components/TaskFooter';
import { Task } from '../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  resourceTypes: ['self'],
  isPlaced: false,
  isLocked: false
};

describe('Task Lock Functionality', () => {
  it('ステージング中のタスクではロックボタンが無効になる', () => {
    const stagingTask = { ...baseMockTask, isPlaced: false };
    
    render(<TaskFooter task={stagingTask} />);
    
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeDisabled();
    expect(lockButton).toHaveAttribute('title', 'タイムラインに配置されたタスクのみロック可能');
  });

  it('配置されたタスクではロックボタンが有効になる', () => {
    const placedTask = { ...baseMockTask, isPlaced: true, startTime: '09:00' };
    
    render(<TaskFooter task={placedTask} />);
    
    const lockButton = screen.getByRole('button');
    expect(lockButton).not.toBeDisabled();
  });

  it('ロックされていないタスクでは開いた錠前アイコンが表示される', () => {
    const unlockedTask = { ...baseMockTask, isPlaced: true, isLocked: false };
    
    render(<TaskFooter task={unlockedTask} />);
    
    const lockIcon = screen.getByText('lock_open');
    expect(lockIcon).toBeInTheDocument();
  });

  it('ロックされたタスクでは閉じた錠前アイコンが表示される', () => {
    const lockedTask = { ...baseMockTask, isPlaced: true, isLocked: true };
    
    render(<TaskFooter task={lockedTask} />);
    
    const lockIcon = screen.getByText('lock');
    expect(lockIcon).toBeInTheDocument();
  });

  it('ロックボタンをクリックしたときにハンドラが呼ばれる', () => {
    const placedTask = { ...baseMockTask, isPlaced: true, startTime: '09:00' };
    const mockLockToggle = vi.fn();
    
    render(<TaskFooter task={placedTask} onLockToggle={mockLockToggle} />);
    
    const lockButton = screen.getByRole('button');
    fireEvent.click(lockButton);
    
    expect(mockLockToggle).toHaveBeenCalledWith('1');
  });

  it('ロックされたタスクカードではdraggableがfalseになる', () => {
    const lockedTask = { ...baseMockTask, isPlaced: true, isLocked: true };
    
    const { container } = render(<TaskCard task={lockedTask} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveAttribute('draggable', 'false');
  });

  it('ロックされていないタスクカードではdraggableがtrueになる', () => {
    const unlockedTask = { ...baseMockTask, isPlaced: true, isLocked: false };
    
    const { container } = render(<TaskCard task={unlockedTask} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveAttribute('draggable', 'true');
  });

  it('ロックされたタスクカードにはロック状態のCSSクラスが付く', () => {
    const lockedTask = { ...baseMockTask, isPlaced: true, isLocked: true };
    
    const { container } = render(<TaskCard task={lockedTask} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveClass('task-card--locked');
  });

  it('ロックボタンのクリックイベントがタスクカードのクリックイベントを阻止する', () => {
    const placedTask = { ...baseMockTask, isPlaced: true, startTime: '09:00' };
    const mockTaskClick = vi.fn();
    const mockLockToggle = vi.fn();
    
    render(
      <TaskCard 
        task={placedTask} 
        onClick={mockTaskClick}
        onLockToggle={mockLockToggle}
      />
    );
    
    const lockButton = screen.getByRole('button');
    fireEvent.click(lockButton);
    
    // ロックボタンがクリックされたときはタスククリックは発火しない
    expect(mockLockToggle).toHaveBeenCalledWith('1');
    expect(mockTaskClick).not.toHaveBeenCalled();
  });
});