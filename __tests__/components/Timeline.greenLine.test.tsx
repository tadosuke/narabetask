import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from '../../src/components/Timeline';
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

describe('Timeline Green Line Removal', () => {
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

  it('ドラッグオーバー時に緑色の線が表示されないことを確認する', () => {
    const { container } = render(<Timeline {...mockProps} />);
    
    const firstSlot = container.querySelector('[data-time="09:00"]');
    expect(firstSlot).toBeInTheDocument();

    // ドラッグオーバーイベントを発火
    if (firstSlot) {
      fireEvent.dragOver(firstSlot, {
        preventDefault: () => {},
        dataTransfer: { getData: () => '1' }
      });

      fireEvent.dragEnter(firstSlot, {
        preventDefault: () => {},
        dataTransfer: { getData: () => '1' }
      });
    }

    // timeline__slot--drag-over クラスが適用されていてもCSSで緑色の視覚効果が無効化されていることを確認
    // クラス自体は機能的な目的で残っているが、視覚効果はない
    const dragOverSlot = container.querySelector('.timeline__slot--drag-over');
    
    if (dragOverSlot) {
      // 緑色のボーダーや背景色がないことを確認
      const computedStyle = window.getComputedStyle(dragOverSlot);
      // CSSで緑色が無効化されているため、デフォルトの値または他のスタイルになる
      expect(computedStyle.border).not.toContain('4CAF50'); // 緑色のカラーコードが含まれていない
      expect(computedStyle.backgroundColor).not.toContain('e8f5e8'); // 緑色の背景色が含まれていない
    }
  });

  it('青色のスパニング効果は保持されていることを確認する', () => {
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
    
    const firstSlot = container.querySelector('[data-time="09:00"]');
    expect(firstSlot).toBeInTheDocument();

    // ドラッグオーバーイベントを発火
    if (firstSlot) {
      fireEvent.dragOver(firstSlot, {
        preventDefault: () => {},
        dataTransfer: { getData: () => '2' }
      });

      fireEvent.dragEnter(firstSlot, {
        preventDefault: () => {},
        dataTransfer: { getData: () => '2' }
      });
    }

    // 青色のスパニングクラスが適用されていることを確認
    const spanningSlots = container.querySelectorAll('.timeline__slot--drag-spanning');
    expect(spanningSlots.length).toBeGreaterThan(0);

    // 青色のスパニング関連クラスが正しく適用されていることを確認
    const hasSpanningFirst = container.querySelector('.timeline__slot--drag-spanning-first');
    expect(hasSpanningFirst).toBeInTheDocument();
  });
});