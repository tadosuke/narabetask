import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Timeline } from "../../src/components/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../src/types";

describe("Timeline Self Drop Test - 自分自身と重なっているところにもドロップできるようにする", () => {
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

  it("タスクを自分自身の同じ位置にドラッグした場合、有効なドロップフィードバックを表示する", () => {
    // 30分タスクを09:00に配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "自分自身のタスク",
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
        draggedTaskId="1" // 同じタスクがドラッグされている
      />
    );

    // 同じ位置（09:00）のスロットにドラッグエンターをシミュレート
    const timeSlot = container.querySelector('[data-time="09:00"]');
    expect(timeSlot).not.toBeNull();

    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // 有効なドロップフィードバックを表示することを確認（drag-invalidクラスがないこと）
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
    
    // ドロップできることを確認
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") },
    });

    fireEvent(timeSlot!, dropEvent);

    // onTaskDropが呼ばれることを確認（配置が許可されたことを意味する）
    expect(mockOnTaskDrop).toHaveBeenCalledWith("1", "09:00");
  });

  it("タスクを自分自身の占有する2番目のスロットにドラッグした場合も有効なドロップフィードバックを表示する", () => {
    // 30分タスクを09:00に配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "自分自身のタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00", // 09:00-09:30を占有（09:00と09:15の2つのスロット）
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
        draggedTaskId="1" // 同じタスクがドラッグされている
      />
    );

    // 自分自身が占有する2番目のスロット（09:15）にドラッグエンターをシミュレート
    const timeSlot = container.querySelector('[data-time="09:15"]');
    expect(timeSlot).not.toBeNull();

    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // 有効なドロップフィードバックを表示することを確認（drag-invalidクラスがないこと）
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
    
    // ドロップできることを確認
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") },
    });

    fireEvent(timeSlot!, dropEvent);

    // onTaskDropが呼ばれることを確認（配置が許可されたことを意味する）
    expect(mockOnTaskDrop).toHaveBeenCalledWith("1", "09:15");
  });

  it("他のタスクが占有しているスロットには無効なドロップフィードバックを表示する", () => {
    // 複数のタスクを配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "ドラッグ中のタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00", // 09:00-09:30を占有
      },
      {
        id: "2",
        name: "他のタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:30", // 09:30-10:00を占有
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
        draggedTaskId="1" // タスク1がドラッグされている
      />
    );

    // 他のタスクが占有しているスロット（09:30）にドラッグエンターをシミュレート
    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // 無効なドロップフィードバックを表示することを確認
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
  });

  it("ドラッグ中のタスクのpointer-eventsがnoneに設定される", () => {
    // 30分タスクを09:00に配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "ドラッグ中のタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00",
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
        draggedTaskId="1" // このタスクがドラッグされている
      />
    );

    // ドラッグ中のタスクカードを見つける
    const taskCard = container.querySelector('.task-card--placed');
    expect(taskCard).not.toBeNull();

    // pointer-eventsがnoneに設定されていることを確認
    expect(taskCard).toHaveStyle('pointer-events: none');
  });

  it("ドラッグされていないタスクのpointer-eventsがautoのまま", () => {
    // 複数のタスクを配置
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "ドラッグされていないタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:00",
      },
      {
        id: "2",
        name: "ドラッグ中のタスク",
        duration: 30,
        resourceTypes: ["self"],
        isPlaced: true,
        startTime: "09:30",
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
        draggedTaskId="2" // タスク2がドラッグされている
      />
    );

    // 09:00のタスク（ドラッグされていない）を見つける
    const slot900 = container.querySelector('[data-time="09:00"]');
    const taskCard1 = slot900?.querySelector('.task-card--placed');
    expect(taskCard1).not.toBeNull();

    // pointer-eventsがautoのまま（デフォルト値）
    expect(taskCard1).toHaveStyle('pointer-events: auto');

    // 09:30のタスク（ドラッグ中）を見つける
    const slot930 = container.querySelector('[data-time="09:30"]');
    const taskCard2 = slot930?.querySelector('.task-card--placed');
    expect(taskCard2).not.toBeNull();

    // pointer-eventsがnoneに設定されている
    expect(taskCard2).toHaveStyle('pointer-events: none');
  });
});