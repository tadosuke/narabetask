import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeSlot } from "../../../src/components/Timeline/TimeSlot";
import type { Task } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  canPlaceTask: vi.fn(() => true),
  canPlaceTaskWithWorkTime: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["09:00", "09:15"]),
  getWorkTimeSlots: vi.fn(() => ["09:00", "09:15"])
}));

describe("TimeSlot", () => {
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

  const mockTimeSlots = ["09:00", "09:15", "09:30", "12:00", "12:15", "13:00", "13:15", "17:00"];
  const mockOccupiedSlots = new Set(["09:00", "09:15"]);
  const mockOverlappingTaskIds = new Set<string>();

  const defaultProps = {
    time: "09:00",
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
    onDragStart: vi.fn(),
    onDragEnd: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("時刻ラベルを表示する", () => {
    render(<TimeSlot {...defaultProps} />);
    
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("タスクが配置されている場合はタスクを表示する", () => {
    const propsWithTask = {
      ...defaultProps,
      task: mockTasks[0]
    };
    
    render(<TimeSlot {...propsWithTask} />);
    
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
  });

  it("占有済みスロットのスタイルを適用する", () => {
    const occupiedProps = {
      ...defaultProps,
      isOccupied: true
    };
    
    const { container } = render(<TimeSlot {...occupiedProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--occupied");
  });

  it("ドラッグオーバーイベントを処理する", () => {
    const mockOnDragOver = vi.fn();
    const propsWithDragOver = {
      ...defaultProps,
      onDragOver: mockOnDragOver
    };
    
    const { container } = render(<TimeSlot {...propsWithDragOver} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    
    fireEvent.dragOver(timeSlot!);
    
    expect(mockOnDragOver).toHaveBeenCalled();
    expect(mockOnDragOver.mock.calls[0][1]).toBe("09:00");
  });

  it("タスクドロップを処理する", () => {
    const mockOnDrop = vi.fn();
    const propsWithDrop = {
      ...defaultProps,
      onDrop: mockOnDrop
    };
    
    const { container } = render(<TimeSlot {...propsWithDrop} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    
    fireEvent.drop(timeSlot!, {
      dataTransfer: { getData: vi.fn(() => "2") }
    });
    
    expect(mockOnDrop).toHaveBeenCalled();
    expect(mockOnDrop.mock.calls[0][1]).toBe("09:00");
  });

  it("配置済みタスクがクリックされたときにonTaskClickを呼び出す", () => {
    const mockOnTaskClick = vi.fn();
    const propsWithTask = {
      ...defaultProps,
      task: mockTasks[0],
      onTaskClick: mockOnTaskClick
    };
    
    render(<TimeSlot {...propsWithTask} />);
    
    fireEvent.click(screen.getByText("テストタスク1"));
    
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("data-time属性を設定する", () => {
    const { container } = render(<TimeSlot {...defaultProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveAttribute('data-time', '09:00');
  });

  it("複数のCSSクラスを組み合わせて適用する", () => {
    const combinedProps = {
      ...defaultProps,
      time: "12:00",
      isOccupied: true,
      dragOverSlot: "12:00",
      draggedTaskId: "2"
    };
    
    const { container } = render(<TimeSlot {...combinedProps} />);
    
    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot");
    expect(timeSlot).toHaveClass("timeline__slot--occupied");
    // ドラッグフィードバックのクラスも追加される（canPlaceTaskがtrueを返すため）
    expect(timeSlot).toHaveClass("timeline__slot--drag-over");
  });
});