import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  TimelineProvider,
  TimelineContext,
} from "../../src/contexts/TimelineContext";
import { useTimelineContext } from "../../src/contexts/useTimelineContext";
import { useContext } from "react";
import type { Task, BusinessHours } from "../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../src/utils/timeUtils", () => ({
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
  doTasksShareResources: vi.fn(() => false),
}));

describe("TimelineContext", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00",
  };

  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "2",
      name: "テストタスク2",
      duration: 60,
      isPlaced: false,
    },
  ];

  const defaultProviderProps = {
    tasks: mockTasks,
    businessHours: mockBusinessHours,
    onTaskDrop: vi.fn(),
  };

  // Test component that consumes the context
  const TestConsumer = () => {
    const context = useTimelineContext();
    if (!context) return <div>No context</div>;

    const {
      dragOverSlot,
      timeSlots,
      placedTasks,
      overlappingTaskIds,
      occupiedSlots,
      handleDragOver,
      handleDrop,
    } = context;

    return (
      <div data-testid="context-consumer">
        <div data-testid="drag-over-slot">{dragOverSlot || "none"}</div>
        <div data-testid="time-slots-count">{timeSlots.length}</div>
        <div data-testid="placed-tasks-count">{placedTasks.length}</div>
        <div data-testid="overlapping-task-ids-count">
          {overlappingTaskIds.size}
        </div>
        <div data-testid="occupied-slots-count">{occupiedSlots.size}</div>
        <button
          data-testid="drag-over-button"
          onClick={(e) => handleDragOver(e as any, "09:30")}
        >
          Test Drag Over
        </button>
        <button
          data-testid="drop-button"
          onClick={(e) => {
            const mockEvent = {
              preventDefault: vi.fn(),
              dataTransfer: { getData: vi.fn(() => "2") },
            };
            handleDrop(mockEvent as any, "09:30");
          }}
        >
          Test Drop
        </button>
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Providerコンテキストを正しく提供する", () => {
    const { getByTestId } = render(
      <TimelineProvider {...defaultProviderProps}>
        <TestConsumer />
      </TimelineProvider>
    );

    expect(getByTestId("context-consumer")).toBeInTheDocument();
    expect(getByTestId("drag-over-slot")).toHaveTextContent("none");
    expect(getByTestId("time-slots-count")).toHaveTextContent("8");
    expect(getByTestId("placed-tasks-count")).toHaveTextContent("1");
    expect(getByTestId("overlapping-task-ids-count")).toHaveTextContent("0");
    expect(getByTestId("occupied-slots-count")).toHaveTextContent("2");
  });

  it("ドラッグオーバー状態を正しく管理する", () => {
    const { getByTestId } = render(
      <TimelineProvider {...defaultProviderProps}>
        <TestConsumer />
      </TimelineProvider>
    );

    expect(getByTestId("drag-over-slot")).toHaveTextContent("none");

    fireEvent.click(getByTestId("drag-over-button"));

    expect(getByTestId("drag-over-slot")).toHaveTextContent("09:30");
  });

  it("タスクドロップを処理してonTaskDropを呼び出す", () => {
    const mockOnTaskDrop = vi.fn();
    const { getByTestId } = render(
      <TimelineProvider {...defaultProviderProps} onTaskDrop={mockOnTaskDrop}>
        <TestConsumer />
      </TimelineProvider>
    );

    fireEvent.click(getByTestId("drop-button"));

    expect(mockOnTaskDrop).toHaveBeenCalledWith("2", "09:30");
  });

  it("Provider外で使用された場合エラーを投げる", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestConsumer />)).toThrow(
      "useTimelineContext must be used within a TimelineProvider"
    );

    console.error = originalError;
  });
});
