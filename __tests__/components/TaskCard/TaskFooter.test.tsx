import { render, screen } from '@testing-library/react';
import { TaskFooter } from '../../../src/components/TaskCard/TaskFooter';
import { Task } from '../../../src/types';

const baseMockTask: Task = {
  id: '1',
  name: 'テストタスク',
  duration: 30,
  isPlaced: false
};

describe('TaskFooter', () => {
  it('ロックボタンが表示される', () => {
    render(<TaskFooter task={baseMockTask} />);
    
    // ロックボタンが表示されることを確認
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toBeDisabled(); // 非配置タスクなので無効
  });

  it('配置済みタスクの場合はロックボタンが有効になる', () => {
    const placedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00'
    } as Task;
    
    render(<TaskFooter task={placedTask} />);
    
    // ロックボタンが有効になることを確認
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).not.toBeDisabled();
  });

  it('ロック済みタスクの場合はロックアイコンが表示される', () => {
    const lockedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00',
      isLocked: true
    } as Task;
    
    render(<TaskFooter task={lockedTask} />);
    
    // ロックアイコンが表示されることを確認
    expect(screen.getByText('lock')).toBeInTheDocument();
  });

  it('未ロックタスクの場合はオープンロックアイコンが表示される', () => {
    const unlockedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00',
      isLocked: false
    } as Task;
    
    render(<TaskFooter task={unlockedTask} />);
    
    // オープンロックアイコンが表示されることを確認
    expect(screen.getByText('lock_open')).toBeInTheDocument();
  });
});