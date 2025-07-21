import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Timeline } from "../../src/components/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../src/utils/timeUtils", () => ({
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
}));

import { canPlaceTask, getTaskSlots } from "../../src/utils/timeUtils";

describe("Timeline ドラッグフィードバック", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00",
  };

  const mockLunchBreak: LunchBreak = {
    start: "12:00",
    end: "13:00",
  };

  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      resourceType: "self",
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "2", 
      name: "テストタスク2",
      duration: 60,
      resourceType: "others",
      isPlaced: false,
    },
  ];

  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    businessHours: mockBusinessHours,
    lunchBreak: mockLunchBreak,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn(),
    draggedTaskId: "2",
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの動作にモックをリセット
    vi.mocked(getTaskSlots).mockReturnValue(["09:00", "09:15"]);
  });

  it("有効なスロット上でドラッグしているときにドラッグオーバークラスを適用する", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // ドラッグエンターをシミュレート
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // スロットがドラッグオーバークラスを持つことを確認
    expect(timeSlot).toHaveClass("timeline__slot--drag-over");
  });

  it("無効なスロット上でドラッグしているときにドラッグ無効クラスを適用する", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // ドラッグエンターをシミュレート
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // スロットがドラッグ無効クラスを持つことを確認
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
  });

  it("ドラッグリーブでドラッグフィードバックをクリアする", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // 最初にドラッグエンターをシミュレート
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(timeSlot!, dragEnterEvent);

    expect(timeSlot).toHaveClass("timeline__slot--drag-over");

    // ドラッグリーブをシミュレート
    const dragLeaveEvent = new Event("dragleave", { bubbles: true });
    Object.defineProperty(dragLeaveEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dragLeaveEvent, "currentTarget", { value: timeSlot });
    Object.defineProperty(dragLeaveEvent, "relatedTarget", { value: document.body });
    
    fireEvent(timeSlot!, dragLeaveEvent);

    // ドラッグフィードバッククラスが削除されることを確認
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });

  it("ドロップが発生したときにonDragEndを呼び出す", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });

    fireEvent(timeSlot!, dropEvent);

    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it("タスクがドラッグされていない場合はドラッグフィードバックを表示しない", () => {
    const propsWithoutDrag = {
      ...defaultProps,
      draggedTaskId: null,
    };
    
    const { container } = render(<Timeline {...propsWithoutDrag} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    
    // ドラッグエンターをシミュレート
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // ドラッグフィードバッククラスを持たないことを確認
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });
});