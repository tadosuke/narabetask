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

  it('配置されたタスクではロックボタンが有効になる', () => {
    const placedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00'
    };
    
    render(<TaskFooter task={placedTask} />);
    
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).not.toBeDisabled();
  });

  it('ロックされたタスクではロックアイコンが表示される', () => {
    const lockedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00',
      isLocked: true
    };
    
    render(<TaskFooter task={lockedTask} />);
    
    const lockIcon = screen.getByText('lock');
    expect(lockIcon).toBeInTheDocument();
  });

  it('ロックされていないタスクではロック解除アイコンが表示される', () => {
    const unlockedTask = {
      ...baseMockTask,
      isPlaced: true,
      startTime: '09:00',
      isLocked: false
    };
    
    render(<TaskFooter task={unlockedTask} />);
    
    const unlockIcon = screen.getByText('lock_open');
    expect(unlockIcon).toBeInTheDocument();
  });
});