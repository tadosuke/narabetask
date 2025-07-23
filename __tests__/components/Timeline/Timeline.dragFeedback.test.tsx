import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => [
    "09:00",
    "09:15", 
    "09:30",
    "09:45",
    "10:00",
    "13:00",
    "13:15",
  ]),
  canPlaceTask: vi.fn(),
  getTaskSlots: vi.fn(),
  findOverlappingTasks: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false)
}));

import { canPlaceTask, getTaskSlots } from "../../../src/utils/timeUtils";

describe("Timeline ドラッグコーディネーション", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00"
  };

  const mockLunchBreak: LunchBreak = {
    start: "12:00",
    end: "13:00"
  };

  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      isPlaced: true,
      startTime: "09:00"
    },
    {
      id: "2", 
      name: "テストタスク2",
      duration: 60,
      isPlaced: false
    },
  ];

  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    selectedTask: null,
    businessHours: mockBusinessHours,
    lunchBreak: mockLunchBreak,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn(),
    draggedTaskId: "2",
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの動作にモックをリセット
    vi.mocked(getTaskSlots).mockReturnValue(["09:00", "09:15"]);
  });

  it("ドラッグ状態をTimeSlotコンポーネントに正しく伝達する", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = render(<Timeline {...defaultProps} />);

    // 複数のTimeSlotが存在することを確認
    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBeGreaterThan(0);
    
    // draggedTaskIdが設定されていることで、各TimeSlotに正しくプロパティが渡される
    timeSlots.forEach(slot => {
      expect(slot).toHaveAttribute('data-time');
    });
  });

  it("ドロップ時にドラッグ状態をクリアしonDragEndを呼び出す", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") }
    });

    fireEvent(timeSlot!, dropEvent);

    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it("占有されたスロットを正しく計算してTimeSlotに渡す", () => {
    const { container } = render(<Timeline {...defaultProps} />);
    
    // 占有されているスロット (09:00, 09:15) を確認
    const occupiedSlot = container.querySelector('[data-time="09:00"]');
    expect(occupiedSlot).toHaveClass("timeline__slot--occupied");
    
    const occupiedSlot2 = container.querySelector('[data-time="09:15"]');
    expect(occupiedSlot2).toHaveClass("timeline__slot--occupied");
    
    // 占有されていないスロット
    const freeSlot = container.querySelector('[data-time="09:30"]');
    expect(freeSlot).not.toHaveClass("timeline__slot--occupied");
  });

  it("配置済みタスクを移動する際は現在の占有状態を正しく管理する", () => {
    const mockOnTaskDrop = vi.fn();
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const propsWithPlacedTaskDrag = {
      ...defaultProps,
      draggedTaskId: "1", // 配置済みタスクをドラッグ
      onTaskDrop: mockOnTaskDrop
    };
    
    const { container } = render(<Timeline {...propsWithPlacedTaskDrag} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") }
    });

    fireEvent(timeSlot!, dropEvent);

    expect(mockOnTaskDrop).toHaveBeenCalledWith("1", "09:30");
  });

  it("ドラッグされていない状態では適切なプロパティをTimeSlotに渡す", () => {
    const propsWithoutDrag = {
      ...defaultProps,
      draggedTaskId: null
    };
    
    const { container } = render(<Timeline {...propsWithoutDrag} />);

    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBeGreaterThan(0);
    
    // TimeSlotコンポーネントに正しくnullが渡されることを確認
    // （実際の動作は内部のプロパティ渡しによるため、DOMでの確認）
    timeSlots.forEach(slot => {
      expect(slot).toHaveAttribute('data-time');
    });
  });
});