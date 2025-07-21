import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Timeline } from "../../src/components/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../src/types";

// Real timeUtils functions without mocking
import { generateTimeSlots, canPlaceTask, getTaskSlots } from "../../src/utils/timeUtils";

describe("Timeline Self Collision Test", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00",
  };

  const mockLunchBreak: LunchBreak = {
    start: "12:00",
    end: "13:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("30分タスクを15分だけ下にドラッグして自分自身と部分的に重複配置できる", () => {
    // 30分タスクを09:00に配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "30分タスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00", // 09:00-09:30を占有
      }
    ];

    const mockOnTaskDrop = vi.fn();

    const { container } = render(
      <Timeline
        tasks={mockTasks}
        selectedTask={null}
        businessHours={mockBusinessHours}
        lunchBreak={mockLunchBreak}
        onTaskDrop={mockOnTaskDrop}
        onTaskClick={() => {}}
        draggedTaskId="1"
      />
    );

    // 09:15のスロットにドロップしてみる（09:15-09:45になるので部分的にオーバーラップ）
    const timeSlot = container.querySelector('[data-time="09:15"]');
    expect(timeSlot).not.toBeNull();

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") },
    });

    fireEvent(timeSlot!, dropEvent);

    // onTaskDropが呼ばれることを確認（配置が許可されたことを意味する）
    expect(mockOnTaskDrop).toHaveBeenCalledWith("1", "09:15");
  });

  it("直接的な衝突検出ロジックのテスト", () => {
    // タイムスロットを生成
    const timeSlots = generateTimeSlots(mockBusinessHours, mockLunchBreak);
    
    // 既存タスクが占有しているスロット（09:00-09:30）
    const occupiedSlots = new Set(["09:00", "09:15"]);
    
    // 移動するタスクのスロットを除外（canPlaceTaskの前に行うべき処理）
    const occupiedSlotsForCheck = new Set(occupiedSlots);
    const currentTaskSlots = getTaskSlots("09:00", 30);
    currentTaskSlots.forEach(slot => occupiedSlotsForCheck.delete(slot));
    
    // 09:15（現在のタスクと部分的に重複）に配置できるかテスト
    const canPlace = canPlaceTask("09:15", 30, occupiedSlotsForCheck, timeSlots);
    
    expect(canPlace).toBe(true);
  });
});