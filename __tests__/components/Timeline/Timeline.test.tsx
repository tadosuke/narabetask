import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import { renderTimelineWithProvider, mockBusinessHours, mockTasks } from "./testUtils";
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
  doTasksShareResources: vi.fn(() => false),
}));

describe("Timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイムラインヘッダーを正しく表示する", () => {
    renderTimelineWithProvider();

    expect(screen.getByText("タイムライン")).toBeInTheDocument();
    expect(screen.getByText("業務時間: 09:00 - 17:00")).toBeInTheDocument();
  });

  it("タイムスロットを表示する", () => {
    renderTimelineWithProvider();

    // 時刻ラベルを具体的に確認
    const timeLabels = screen.getAllByText("09:00");
    expect(timeLabels.length).toBeGreaterThan(0);
    expect(screen.getByText("09:15")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("配置済みタスクをタイムスロット内に表示する", () => {
    renderTimelineWithProvider();

    // 配置済みタスクがタイムライン内に表示される
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
  });

  it("配置済みタスクのみを表示する", () => {
    renderTimelineWithProvider();

    // 配置済みタスクが表示される
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
    // 配置されていないタスクは表示されない
    expect(screen.queryByText("テストタスク2")).not.toBeInTheDocument();
  });

  it("正しい数のタイムスロットを生成する", () => {
    const { container } = renderTimelineWithProvider();

    // TimeSlotコンポーネントの数を確認（generateTimeSlotsの結果に基づく）
    const timeSlots = container.querySelectorAll('[data-time]');
    expect(timeSlots.length).toBe(8); // モックで設定した8つのスロット
  });

  it("タスクドロップを処理してonTaskDropを呼び出す", () => {
    const mockOnTaskDrop = vi.fn();
    const { container } = renderTimelineWithProvider({
      providerProps: { onTaskDrop: mockOnTaskDrop }
    });

    const timeSlot = container.querySelector('[data-time="09:30"]');

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });

    fireEvent(timeSlot!, dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskDrop).toHaveBeenCalledWith("2", "09:30");
  });

  it("配置済みタスクがクリックされたときにonTaskClickを呼び出す", () => {
    const mockOnTaskClick = vi.fn();
    renderTimelineWithProvider({
      timelineProps: { onTaskClick: mockOnTaskClick }
    });

    fireEvent.click(screen.getByText("テストタスク1"));

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("ドラッグ状態を正しく管理する", () => {
    const mockOnDragStart = vi.fn();
    const mockOnDragEnd = vi.fn();
    
    const { container } = renderTimelineWithProvider({
      timelineProps: {
        onDragStart: mockOnDragStart,
        onDragEnd: mockOnDragEnd,
      },
      providerProps: {
        draggedTaskId: "2",
        onDragEnd: mockOnDragEnd,
      }
    });

    // TimeSlot コンポーネントに正しいプロパティが渡されていることを確認
    const timeSlot = container.querySelector('[data-time="09:00"]');
    expect(timeSlot).toBeInTheDocument();
    
    // ドロップ時にonDragEndが呼ばれることを確認
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });

    fireEvent(timeSlot!, dropEvent);
    expect(mockOnDragEnd).toHaveBeenCalled();
  });
});
