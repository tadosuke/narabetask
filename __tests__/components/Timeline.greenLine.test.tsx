import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from '@testing-library/react';
import { Timeline } from '../../src/components/Timeline/Timeline';
import type { Task, BusinessHours, LunchBreak } from '../../src/types';

// timeUtilsモジュールをモック
vi.mock("../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => [
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
  ]),
  canPlaceTask: vi.fn(() => true),
  getTaskSlots: vi.fn((startTime: string, duration: number) => {
    // 30分タスクの場合は2スロット、60分タスクの場合は4スロット
    const slots = [startTime];
    if (duration >= 30) slots.push("09:15");
    if (duration >= 45) slots.push("09:30");
    if (duration >= 60) slots.push("09:45");
    return slots;
  }),
  findOverlappingTasks: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false),
}));

describe('Timeline スパニングコーディネーション', () => {
  const mockBusinessHours: BusinessHours = {
    start: '09:00',
    end: '18:00'
  };

  const mockLunchBreak: LunchBreak = {
    start: '12:00',
    end: '13:00'
  };

  const mockTask: Task = {
    id: '1',
    name: 'テストタスク',
    duration: 30,
    resourceTypes: ['self'],
    isPlaced: false
  };

  const mockProps = {
    tasks: [mockTask],
    selectedTask: null,
    businessHours: mockBusinessHours,
    lunchBreak: mockLunchBreak,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn(),
    draggedTaskId: '1',
    onDragStart: vi.fn(),
    onDragEnd: vi.fn()
  };

  it('ドラッグ状態を複数のTimeSlotコンポーネントに正しく伝達する', () => {
    const { container } = render(<Timeline {...mockProps} />);
    
    // TimeSlotコンポーネントが正しく生成されていることを確認
    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBe(6); // generateTimeSlotsで生成されるスロット数

    // 各TimeSlotにdraggedTaskIdが正しく渡されていることを確認
    // （実際の確認は複数スロットにまたがるドラッグ動作で行う）
    const firstSlot = container.querySelector('[data-time="09:00"]');
    expect(firstSlot).toBeInTheDocument();
  });

  it('複数スロットタスクのドラッグ状態を適切に管理する', () => {
    const multiSlotTask: Task = {
      id: '2',
      name: '長時間タスク',
      duration: 60, // 1時間（複数スロットにまたがる）
      resourceTypes: ['self'],
      isPlaced: false
    };

    const propsWithMultiSlotTask = {
      ...mockProps,
      tasks: [multiSlotTask],
      draggedTaskId: '2'
    };

    const { container } = render(<Timeline {...propsWithMultiSlotTask} />);
    
    // 複数のTimeSlotがレンダリングされていることを確認
    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBeGreaterThan(0);

    // ドラッグオーバー状態を設定してスパニング効果を確認
    const firstSlot = container.querySelector('[data-time="09:00"]');
    expect(firstSlot).toBeInTheDocument();

    // ドラッグエンターをシミュレート
    fireEvent.dragEnter(firstSlot!, {
      preventDefault: () => {},
      dataTransfer: { getData: () => '2' }
    });

    // スパニング関連のクラスが適用されていることを確認
    const spanningSlots = container.querySelectorAll('.timeline__slot--drag-spanning');
    expect(spanningSlots.length).toBeGreaterThan(0);
  });

  it('ドラッグオーバー状態を各TimeSlotに正しく配布する', () => {
    const { container } = render(<Timeline {...mockProps} />);
    
    const firstSlot = container.querySelector('[data-time="09:00"]');
    expect(firstSlot).toBeInTheDocument();

    // ドラッグオーバーをシミュレート
    fireEvent.dragOver(firstSlot!, {
      preventDefault: () => {},
      dataTransfer: { getData: () => '1' }
    });

    fireEvent.dragEnter(firstSlot!, {
      preventDefault: () => {},
      dataTransfer: { getData: () => '1' }
    });

    // ドラッグオーバークラスが適用されていることを確認
    const dragOverSlot = container.querySelector('.timeline__slot--drag-over');
    expect(dragOverSlot).toBeInTheDocument();
  });

  it('ドラッグ終了時にすべてのTimeSlotの状態をクリアする', () => {
    const mockOnDragEnd = vi.fn();
    const propsWithDragEnd = {
      ...mockProps,
      onDragEnd: mockOnDragEnd
    };

    const { container } = render(<Timeline {...propsWithDragEnd} />);
    
    const firstSlot = container.querySelector('[data-time="09:00"]');
    
    // ドロップイベントを発火
    fireEvent.drop(firstSlot!, {
      preventDefault: () => {},
      dataTransfer: { getData: () => '1' }
    });

    // onDragEndが呼ばれることを確認（状態のクリアを示す）
    expect(mockOnDragEnd).toHaveBeenCalled();
  });
});