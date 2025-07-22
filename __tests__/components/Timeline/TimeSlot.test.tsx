import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import type { Task } from "../../../src/types";
import { renderTimeSlotWithProvider } from "./testUtils";

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
  doTasksShareResources: vi.fn(() => false),
}));

describe("TimeSlot", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク1",
    duration: 30,
    resourceTypes: ["self"],
    isPlaced: true,
    startTime: "09:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("時刻ラベルを表示する", () => {
    renderTimeSlotWithProvider({
      timeSlotProps: { time: "09:30" }
    });

    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("タスクが配置されている場合はタスクを表示する", () => {
    renderTimeSlotWithProvider({
      timeSlotProps: { 
        time: "09:00",
        task: mockTask
      }
    });

    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
  });

  it("占有済みスロットのスタイルを適用する", () => {
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: { 
        time: "09:00",
        isOccupied: true
      }
    });

    const slot = container.querySelector('[data-time="09:00"]');
    expect(slot).toHaveClass("timeline__slot--occupied");
  });

  it("ドラッグオーバーイベントを処理する", () => {
    const mockOnDragOver = vi.fn();
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: {
        time: "09:00",
        onDragOver: mockOnDragOver
      }
    });

    const slot = container.querySelector('[data-time="09:00"]');
    fireEvent.dragOver(slot!);

    expect(mockOnDragOver).toHaveBeenCalled();
    expect(mockOnDragOver.mock.calls[0][1]).toBe("09:00");
  });

  it("タスクドロップを処理する", () => {
    const mockOnDrop = vi.fn();
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: {
        time: "09:15",
        onDrop: mockOnDrop
      }
    });

    const slot = container.querySelector('[data-time="09:15"]');
    fireEvent.drop(slot!, {
      dataTransfer: { getData: vi.fn(() => "2") },
    });

    expect(mockOnDrop).toHaveBeenCalled();
    expect(mockOnDrop.mock.calls[0][1]).toBe("09:15");
  });

  it("配置済みタスクがクリックされたときにonTaskClickを呼び出す", () => {
    const mockOnTaskClick = vi.fn();
    renderTimeSlotWithProvider({
      timeSlotProps: {
        time: "09:00",
        task: mockTask,
        onTaskClick: mockOnTaskClick
      }
    });

    fireEvent.click(screen.getByText("テストタスク1"));

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTask);
  });

  it("ドラッグフィードバックスタイルを適用する", () => {
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: {
        time: "09:00",
        dragOverSlot: "09:00",
        draggedTaskId: "2"
      }
    });

    const slot = container.querySelector('[data-time="09:00"]');
    expect(slot).toHaveClass("timeline__slot--drag-over");
  });

  it("タスクカードのドラッグイベントを処理する", () => {
    const mockOnDragStart = vi.fn();
    renderTimeSlotWithProvider({
      timeSlotProps: {
        time: "09:00",
        task: mockTask,
        onDragStart: mockOnDragStart
      }
    });

    const taskCard = screen.getByText("テストタスク1").closest('.task-card');
    expect(taskCard).toBeInTheDocument();
  });
});