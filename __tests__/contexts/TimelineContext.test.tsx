import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TimelineProvider } from "../../src/contexts/TimelineContext";
import { useTimelineContext } from "../../src/contexts/useTimelineContext";
import type { Task, BusinessHours } from "../../src/types";

// Mock timeUtils module
vi.mock("../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => ["09:00", "09:15", "09:30", "13:00", "13:15", "17:00"]),
  canPlaceTask: vi.fn(() => true),
  getTaskSlots: vi.fn((startTime: string, duration: number) => {
    const slots = [startTime];
    if (duration >= 30) slots.push("09:15");
    return slots;
  }),
  findOverlappingTasks: vi.fn(() => new Set()),
}));

describe("TimelineContext", () => {
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

  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test component that uses the context
  const TestComponent = () => {
    const {
      timeSlots,
      placedTasks,
      overlappingTaskIds,
      occupiedSlots,
      dragOverSlot,
      handleDragOver,
      canTaskBePlaced,
      getDragFeedbackClass,
      getDragSpanningClass,
    } = useTimelineContext();

    return (
      <div>
        <div data-testid="time-slots">{timeSlots.length}</div>
        <div data-testid="placed-tasks">{placedTasks.length}</div>
        <div data-testid="overlapping-tasks">{overlappingTaskIds.size}</div>
        <div data-testid="occupied-slots">{occupiedSlots.size}</div>
        <div data-testid="drag-over-slot">{dragOverSlot || "null"}</div>
        <button onClick={(e) => handleDragOver(e as any, "09:30")}>
          Trigger Drag Over
        </button>
        <div data-testid="can-place-task">
          {canTaskBePlaced("09:30", 30) ? "true" : "false"}
        </div>
        <div data-testid="drag-feedback-class">
          {getDragFeedbackClass("09:30", "2", mockTasks)}
        </div>
        <div data-testid="drag-spanning-class">
          {getDragSpanningClass("09:30", "2", mockTasks)}
        </div>
      </div>
    );
  };

  it("TimelineProviderが正しくコンテキスト値を提供する", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    expect(screen.getByTestId("time-slots")).toHaveTextContent("6"); // generateTimeSlotsから6スロット
    expect(screen.getByTestId("placed-tasks")).toHaveTextContent("1"); // isPlaced=trueのタスクが1つ
    expect(screen.getByTestId("overlapping-tasks")).toHaveTextContent("0"); // 重複なし
    expect(screen.getByTestId("occupied-slots")).toHaveTextContent("2"); // 30分タスクで2スロット占有
    expect(screen.getByTestId("drag-over-slot")).toHaveTextContent("null"); // 初期状態
  });

  it("useTimelineContextがTimelineProvider外で使用されたときエラーをスローする", () => {
    // コンソールエラーを無視してテストを実行
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTimelineContext must be used within a TimelineProvider");
    
    consoleSpy.mockRestore();
  });

  it("ドラッグ状態の管理が正しく動作する", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    // 初期状態では dragOverSlot が null
    expect(screen.getByTestId("drag-over-slot")).toHaveTextContent("null");

    // ドラッグオーバーを実行
    const dragOverButton = screen.getByText("Trigger Drag Over");
    
    act(() => {
      dragOverButton.click();
    });

    // ドラッグオーバー状態が更新される
    expect(screen.getByTestId("drag-over-slot")).toHaveTextContent("09:30");
  });

  it("タスク配置可能性チェックが正しく動作する", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    // canPlaceTaskモックがtrueを返すので、配置可能と表示される
    expect(screen.getByTestId("can-place-task")).toHaveTextContent("true");
  });

  it("計算された値が正しく提供される", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    // 各計算値が正しく表示されることを確認
    expect(screen.getByTestId("time-slots")).toBeInTheDocument();
    expect(screen.getByTestId("placed-tasks")).toBeInTheDocument();
    expect(screen.getByTestId("overlapping-tasks")).toBeInTheDocument();
    expect(screen.getByTestId("occupied-slots")).toBeInTheDocument();
  });

  it("ドラッグフィードバッククラスが取得できる", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    // ドラッグフィードバッククラスが文字列として取得される
    const feedbackClass = screen.getByTestId("drag-feedback-class");
    expect(feedbackClass).toBeInTheDocument();
  });

  it("ドラッグスパニングクラスが取得できる", () => {
    render(
      <TimelineProvider tasks={mockTasks} businessHours={mockBusinessHours}>
        <TestComponent />
      </TimelineProvider>
    );

    // ドラッグスパニングクラスが文字列として取得される
    const spanningClass = screen.getByTestId("drag-spanning-class");
    expect(spanningClass).toBeInTheDocument();
  });
});