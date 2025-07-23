import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import type { Task, BusinessHours } from "../../../src/types";

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
  canPlaceTask: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["09:00", "09:15"]),
  findOverlappingTasks: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false)
}));

describe("Timeline", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00"
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

  const defaultProps = {
    tasks: mockTasks,
    selectedTask: null,
    businessHours: mockBusinessHours,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイムラインヘッダーを正しく表示する", () => {
    render(<Timeline {...defaultProps} />);

    expect(screen.getByText("タイムライン")).toBeInTheDocument();
    expect(screen.getByText("業務時間: 09:00 - 17:00")).toBeInTheDocument();
  });

  it("タイムスロットを表示する", () => {
    render(<Timeline {...defaultProps} />);

    // 時刻ラベルを具体的に確認
    const timeLabels = screen.getAllByText("09:00");
    expect(timeLabels.length).toBeGreaterThan(0);
    expect(screen.getByText("09:15")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("配置済みタスクをタイムスロット内に表示する", () => {
    render(<Timeline {...defaultProps} />);

    // 配置済みタスクがタイムライン内に表示される
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
  });

  it("配置済みタスクのみを表示する", () => {
    render(<Timeline {...defaultProps} />);

    // 配置済みタスクが表示される
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
    // 配置されていないタスクは表示されない
    expect(screen.queryByText("テストタスク2")).not.toBeInTheDocument();
  });

  it("正しい数のタイムスロットを生成する", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    // TimeSlotコンポーネントの数を確認（generateTimeSlotsの結果に基づく）
    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBe(8); // モックで設定した8つのスロット
  });

  it("タスクドロップを処理してonTaskDropを呼び出す", () => {
    const mockOnTaskDrop = vi.fn();
    const { container } = render(
      <Timeline {...defaultProps} onTaskDrop={mockOnTaskDrop} />
    );

    const timeSlot = container.querySelector('[data-time="09:30"]');

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") }
    });

    fireEvent(timeSlot!, dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskDrop).toHaveBeenCalledWith("2", "09:30");
  });

  it("配置済みタスクがクリックされたときにonTaskClickを呼び出す", () => {
    const mockOnTaskClick = vi.fn();
    render(<Timeline {...defaultProps} onTaskClick={mockOnTaskClick} />);

    fireEvent.click(screen.getByText("テストタスク1"));

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("ドラッグ状態を正しく管理する", () => {
    const mockOnDragStart = vi.fn();
    const mockOnDragEnd = vi.fn();
    
    const propsWithDragHandlers = {
      ...defaultProps,
      draggedTaskId: "2",
      onDragStart: mockOnDragStart,
      onDragEnd: mockOnDragEnd
    };

    const { container } = render(<Timeline {...propsWithDragHandlers} />);

    // TimeSlot コンポーネントに正しいプロパティが渡されていることを確認
    const timeSlot = container.querySelector('[data-time="09:00"]');
    expect(timeSlot).toBeInTheDocument();
    
    // ドロップ時にonDragEndが呼ばれることを確認
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") }
    });

    fireEvent(timeSlot!, dropEvent);
    expect(mockOnDragEnd).toHaveBeenCalled();
  });
});
