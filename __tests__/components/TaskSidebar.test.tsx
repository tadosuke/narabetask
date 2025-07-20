import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskSidebar } from '../../src/components/TaskSidebar';
import type { Task } from '../../src/types';

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn()
});

describe('TaskSidebar', () => {
  const mockTask: Task = {
    id: '1',
    name: 'テストタスク',
    duration: 60,
    resourceType: 'self',
    isPlaced: false
  };

  const mockPlacedTask: Task = {
    id: '2',
    name: '配置済みタスク',
    duration: 30,
    resourceType: 'others',
    isPlaced: true,
    startTime: '09:00'
  };

  const defaultProps = {
    selectedTask: mockTask,
    onTaskUpdate: vi.fn(),
    onTaskRemove: vi.fn(),
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it('should render empty state when no task is selected', () => {
    render(<TaskSidebar {...defaultProps} selectedTask={null} />);
    
    expect(screen.getByText('タスクを選択してください')).toBeInTheDocument();
    expect(screen.queryByText('タスク設定')).not.toBeInTheDocument();
  });

  it('should render task settings form when task is selected', () => {
    render(<TaskSidebar {...defaultProps} />);
    
    expect(screen.getByText('タスク設定')).toBeInTheDocument();
    expect(screen.getByLabelText('タスク名')).toBeInTheDocument();
    expect(screen.getByLabelText('工数')).toBeInTheDocument();
    expect(screen.getByLabelText('リソースタイプ')).toBeInTheDocument();
  });

  it('should populate form fields with selected task data', () => {
    render(<TaskSidebar {...defaultProps} />);
    
    const nameInput = screen.getByDisplayValue('テストタスク');
    const durationSelect = screen.getByDisplayValue('1時間');
    const resourceSelect = screen.getByDisplayValue('自分');
    
    expect(nameInput).toBeInTheDocument();
    expect(durationSelect).toBeInTheDocument();
    expect(resourceSelect).toBeInTheDocument();
  });

  it('should show start time for placed tasks', () => {
    render(<TaskSidebar {...defaultProps} selectedTask={mockPlacedTask} />);
    
    expect(screen.getByText('配置時間:')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  it('should not show start time for unplaced tasks', () => {
    render(<TaskSidebar {...defaultProps} />);
    
    expect(screen.queryByText('配置時間:')).not.toBeInTheDocument();
  });

  it('should update name input when changed', async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('タスク名') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, '新しいタスク名');
    
    expect(nameInput.value).toBe('新しいタスク名');
  });

  it('should update duration when changed', async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);
    
    const durationSelect = screen.getByLabelText('工数');
    await user.selectOptions(durationSelect, '45');
    
    expect(durationSelect).toHaveValue('45');
  });

  it('should update resource type when changed', async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);
    
    const resourceSelect = screen.getByLabelText('リソースタイプ');
    await user.selectOptions(resourceSelect, 'machine');
    
    expect(resourceSelect).toHaveValue('machine');
  });

  it('should call onTaskUpdate when save button is clicked', async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);
    
    const nameInput = screen.getByLabelText('タスク名');
    const saveButton = screen.getByText('保存');
    
    await user.clear(nameInput);
    await user.type(nameInput, '更新されたタスク');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        name: '更新されたタスク'
      });
    });
  });

  it('should disable save button when name is empty', async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('タスク名');
    const saveButton = screen.getByText('保存');
    
    await user.clear(nameInput);
    
    expect(saveButton).toBeDisabled();
  });

  it('should call onTaskRemove when remove button is clicked and confirmed', () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    
    render(<TaskSidebar {...defaultProps} onTaskRemove={mockOnTaskRemove} />);
    
    fireEvent.click(screen.getByText('削除'));
    
    expect(window.confirm).toHaveBeenCalledWith('このタスクを削除しますか？');
    expect(mockOnTaskRemove).toHaveBeenCalledWith('1');
  });

  it('should not call onTaskRemove when remove button is clicked but not confirmed', () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    
    render(<TaskSidebar {...defaultProps} onTaskRemove={mockOnTaskRemove} />);
    
    fireEvent.click(screen.getByText('削除'));
    
    expect(window.confirm).toHaveBeenCalledWith('このタスクを削除しますか？');
    expect(mockOnTaskRemove).not.toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<TaskSidebar {...defaultProps} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByLabelText('閉じる'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should format duration options correctly', () => {
    render(<TaskSidebar {...defaultProps} />);
    
    // Check some common duration options
    expect(screen.getByText('15分')).toBeInTheDocument();
    expect(screen.getByText('30分')).toBeInTheDocument();
    expect(screen.getByText('1時間')).toBeInTheDocument();
    expect(screen.getByText('1時間30分')).toBeInTheDocument();
    expect(screen.getByText('2時間')).toBeInTheDocument();
  });

  it('should render all resource type options', () => {
    render(<TaskSidebar {...defaultProps} />);
    
    expect(screen.getByText('自分')).toBeInTheDocument();
    expect(screen.getByText('他人')).toBeInTheDocument();
    expect(screen.getByText('マシンパワー')).toBeInTheDocument();
    expect(screen.getByText('ネットワーク')).toBeInTheDocument();
  });

  it('should reset form when task changes', () => {
    const { rerender } = render(<TaskSidebar {...defaultProps} />);
    
    expect(screen.getByDisplayValue('テストタスク')).toBeInTheDocument();
    
    const newTask: Task = {
      id: '2',
      name: '新しいタスク',
      duration: 30,
      resourceType: 'machine',
      isPlaced: false
    };
    
    rerender(<TaskSidebar {...defaultProps} selectedTask={newTask} />);
    
    expect(screen.getByDisplayValue('新しいタスク')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30分')).toBeInTheDocument();
    expect(screen.getByDisplayValue('マシンパワー')).toBeInTheDocument();
  });
});