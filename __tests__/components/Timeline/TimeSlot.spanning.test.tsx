import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render } from '@testing-library/react';
import { TimeSlot } from '../../../src/components/Timeline/TimeSlot';
import type { Task } from '../../../src/types';

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  canPlaceTask: vi.fn(() => true),
  getTaskSlots: vi.fn((startTime: string, duration: number) => {
    // 30分タスクの場合は2スロット、60分タスクの場合は4スロット
    const slots = [startTime];
    if (duration >= 30) slots.push("09:15");
    if (duration >= 45) slots.push("09:30");
    if (duration >= 60) slots.push("09:45");
    return slots;
  })
}));

import { getTaskSlots } from "../../../src/utils/timeUtils";

describe('TimeSlot Drag Spanning', () => {
  const mockTask: Task = {
    id: '1',
    name: 'テストタスク',
    duration: 60, // 1時間（複数スロットにまたがる）
    isPlaced: false
  };

  const mockTimeSlots = ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15"];
  const mockOccupiedSlots = new Set<string>();
  const mockOverlappingTaskIds = new Set<string>();

  const defaultProps = {
    time: "09:00",
    isLunchTime: false,
    isOccupied: false,
    dragOverSlot: "09:00",
    draggedTaskId: "1",
    tasks: [mockTask],
    timeSlots: mockTimeSlots,
    occupiedSlots: mockOccupiedSlots,
    selectedTask: null,
    overlappingTaskIds: mockOverlappingTaskIds,
    onDragOver: vi.fn(),
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onTaskClick: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn()
  };

  it('最初のスロットに正しいスパニングクラスを適用する', () => {
    const { container } = render(<TimeSlot {...defaultProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-first");
  });

  it('中間のスロットに正しいスパニングクラスを適用する', () => {
    const middleProps = {
      ...defaultProps,
      time: "09:15", // 中間のスロット
    };
    
    const { container } = render(<TimeSlot {...middleProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-middle");
  });

  it('最後のスロットに正しいスパニングクラスを適用する', () => {
    const lastProps = {
      ...defaultProps,
      time: "09:45", // 最後のスロット（60分タスクの場合）
    };
    
    const { container } = render(<TimeSlot {...lastProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-last");
  });

  it('単一スロットタスクに正しいスパニングクラスを適用する', () => {
    const singleSlotTask: Task = {
      id: '2',
      name: '短いタスク',
      duration: 15, // 15分（単一スロット）
      isPlaced: false
    };

    // Override the mock for this test
    vi.mocked(getTaskSlots).mockReturnValue(["09:00"]); // 単一スロット

    const singleProps = {
      ...defaultProps,
      tasks: [singleSlotTask],
      draggedTaskId: "2"
    };
    
    const { container } = render(<TimeSlot {...singleProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-single");
  });

  it('ドラッグオーバー対象でないスロットにはスパニングクラスを適用しない', () => {
    const nonTargetProps = {
      ...defaultProps,
      time: "10:00", // ドラッグされたタスクが占有しないスロット
    };
    
    const { container } = render(<TimeSlot {...nonTargetProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning-first");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning-middle");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning-last");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning-single");
  });

  it('ドラッグオーバーが設定されていない場合はスパニングクラスを適用しない', () => {
    const noDragProps = {
      ...defaultProps,
      dragOverSlot: null
    };
    
    const { container } = render(<TimeSlot {...noDragProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning");
  });

  it('ドラッグされたタスクがない場合はスパニングクラスを適用しない', () => {
    const noTaskProps = {
      ...defaultProps,
      draggedTaskId: null
    };
    
    const { container } = render(<TimeSlot {...noTaskProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-spanning");
  });
});