import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderTimeSlot } from "./testUtils";
import type { Task } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => [
    "09:00",
    "09:15",
    "09:30",
    "12:00",
    "12:15",
    "13:00",
    "13:15",
    "17:00",
  ]),
  canPlaceTask: vi.fn(),
  getTaskSlots: vi.fn(),
  findOverlappingTasks: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false),
}));

import { canPlaceTask, getTaskSlots } from "../../../src/utils/timeUtils";

describe("TimeSlot ドラッグフィードバック", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "2", 
      name: "テストタスク2",
      duration: 60,
      resourceTypes: ["others"],
      isPlaced: false,
    },
  ];

  const mockTimeSlots = ["09:00", "09:15", "09:30", "09:45", "10:00"];
  const mockOccupiedSlots = new Set(["09:00", "09:15"]);
  const mockOverlappingTaskIds = new Set<string>();

  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();

  const defaultProps = {
    time: "09:30",
    isLunchTime: false,
    isOccupied: false,
    dragOverSlot: null,
    draggedTaskId: null,
    tasks: mockTasks,
    timeSlots: mockTimeSlots,
    occupiedSlots: mockOccupiedSlots,
    selectedTask: null,
    overlappingTaskIds: mockOverlappingTaskIds,
    onDragOver: vi.fn(),
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onTaskClick: vi.fn(),
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの動作にモックをリセット
    vi.mocked(getTaskSlots).mockReturnValue(["09:30", "09:45"]);
  });

  it("有効なスロット上でドラッグしているときにドラッグオーバークラスを適用する", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const propsWithDragOver = {
      ...defaultProps,
      dragOverSlot: "09:30",
      draggedTaskId: "2",
    };
    
    const { container } = renderTimeSlot( {...propsWithDragOver});

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-over");
  });

  it("無効なスロット上でドラッグしているときにドラッグ無効クラスを適用する", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    
    const propsWithDragOver = {
      ...defaultProps,
      dragOverSlot: "09:30",
      draggedTaskId: "2",
    };
    
    const { container } = renderTimeSlot( {...propsWithDragOver});

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
  });

  it("ドラッグエンターイベントを処理する", () => {
    const mockOnDragEnter = vi.fn();
    const propsWithDragEnter = {
      ...defaultProps,
      onDragEnter: mockOnDragEnter,
    };
    
    const { container } = renderTimeSlot( {...propsWithDragEnter});

    const timeSlot = container.querySelector('.timeline__slot');
    
    fireEvent.dragEnter(timeSlot!);

    expect(mockOnDragEnter).toHaveBeenCalled();
    expect(mockOnDragEnter.mock.calls[0][1]).toBe("09:30");
  });

  it("ドラッグリーブイベントを処理する", () => {
    const mockOnDragLeave = vi.fn();
    const propsWithDragLeave = {
      ...defaultProps,
      onDragLeave: mockOnDragLeave,
    };
    
    const { container } = renderTimeSlot( {...propsWithDragLeave});

    const timeSlot = container.querySelector('.timeline__slot');
    
    fireEvent.dragLeave(timeSlot!);

    expect(mockOnDragLeave).toHaveBeenCalled();
  });

  it("タスクがドラッグされていない場合はドラッグフィードバックを表示しない", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const propsWithoutDrag = {
      ...defaultProps,
      dragOverSlot: "09:30",
      draggedTaskId: null, // ドラッグされていない
    };
    
    const { container } = renderTimeSlot( {...propsWithoutDrag});

    const timeSlot = container.querySelector('.timeline__slot');
    // ドラッグフィードバッククラスを持たないことを確認
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });

  it("ドラッグオーバー対象でない場合はドラッグフィードバックを表示しない", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const propsNotDraggedOver = {
      ...defaultProps,
      dragOverSlot: "09:45", // 異なる時刻
      draggedTaskId: "2",
    };
    
    const { container } = renderTimeSlot( {...propsNotDraggedOver});

    const timeSlot = container.querySelector('.timeline__slot');
    // ドラッグフィードバッククラスを持たないことを確認
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });

  it("配置済みタスクを移動する際は現在の占有スロットを除外して判定する", () => {
    const placedTask: Task = {
      id: "1",
      name: "配置済みタスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "09:00",
    };

    vi.mocked(canPlaceTask).mockReturnValue(true);
    vi.mocked(getTaskSlots).mockReturnValue(["09:00", "09:15"]);

    const propsWithPlacedTask = {
      ...defaultProps,
      tasks: [placedTask],
      dragOverSlot: "09:30",
      draggedTaskId: "1", // 配置済みタスクを移動
    };
    
    const { container } = renderTimeSlot( {...propsWithPlacedTask});

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-over");
    
    // canPlaceTaskが正しく呼ばれることを確認
    expect(canPlaceTask).toHaveBeenCalled();
  });
});