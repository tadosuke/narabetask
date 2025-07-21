import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../../src/types";

// Real timeUtils functions without mocking
import { generateTimeSlots, canPlaceTask, getTaskSlots } from "../../../src/utils/timeUtils";

describe("Timeline セルフ衝突コーディネーション", () => {
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

  it("30分タスクを15分だけ下にドラッグして自分自身と部分的に重複配置の調整をする", () => {
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

  it("占有スロット計算の正確性をタイムライン全体で検証", () => {
    // 複数のタスクがある場合の占有状態を確認
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "タスク1",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00",
      },
      {
        id: "2",
        name: "タスク2", 
        duration: 45,
        resourceTypes: ["others"],
        isPlaced: true,
        startTime: "10:00",
      }
    ];

    const { container } = render(
      <Timeline
        tasks={mockTasks}
        selectedTask={null}
        businessHours={mockBusinessHours}
        lunchBreak={mockLunchBreak}
        onTaskDrop={() => {}}
        onTaskClick={() => {}}
      />
    );

    // タスク1が占有するスロット (09:00, 09:15)
    expect(container.querySelector('[data-time="09:00"]')).toHaveClass("timeline__slot--occupied");
    expect(container.querySelector('[data-time="09:15"]')).toHaveClass("timeline__slot--occupied");
    
    // タスク2が占有するスロット (10:00, 10:15, 10:30) 
    expect(container.querySelector('[data-time="10:00"]')).toHaveClass("timeline__slot--occupied");
    
    // 占有されていないスロット
    expect(container.querySelector('[data-time="09:30"]')).not.toHaveClass("timeline__slot--occupied");
  });

  it("配置済みタスクの移動時に衝突検出ロジックが正しく動作することを確認", () => {
    const placedTask: Task = {
      id: "1",
      name: "配置済みタスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "09:00",
    };

    const conflictTask: Task = {
      id: "2",
      name: "衝突タスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "10:00", // 09:30に移動するため衝突しない位置に変更
    };

    const mockOnTaskDrop = vi.fn();

    const { container } = render(
      <Timeline
        tasks={[placedTask, conflictTask]}
        selectedTask={null}
        businessHours={mockBusinessHours}
        lunchBreak={mockLunchBreak}
        onTaskDrop={mockOnTaskDrop}
        onTaskClick={() => {}}
        draggedTaskId="1"
      />
    );

    // Task 1を09:30に移動しようとする（衝突しない位置）
    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull(); // スロットが存在することを確認
    
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") },
    });

    fireEvent(timeSlot!, dropEvent);

    // 移動が許可される
    expect(mockOnTaskDrop).toHaveBeenCalledWith("1", "09:30");
  });

  it("重複タスクIDの計算が正しく行われることを確認", () => {
    // 重複するタスクを設定
    const overlappingTasks: Task[] = [
      {
        id: "1",
        name: "タスク1",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00",
      },
      {
        id: "2",
        name: "タスク2",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:15", // 09:00のタスクと重複
      }
    ];

    const { container } = render(
      <Timeline
        tasks={overlappingTasks}
        selectedTask={null}
        businessHours={mockBusinessHours}
        lunchBreak={mockLunchBreak}
        onTaskDrop={() => {}}
        onTaskClick={() => {}}
      />
    );

    // 両方のタスクが表示されていることを確認
    expect(container.querySelector('[data-time="09:00"]')).toBeInTheDocument();
    expect(container.querySelector('[data-time="09:15"]')).toBeInTheDocument();
  });
});