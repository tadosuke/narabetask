import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeSlot } from "../../../src/components/Timeline/TimeSlot";
import type { Task } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  canPlaceTask: vi.fn(() => true),
  canPlaceTaskWithWorkTime: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["10:00", "10:15"]),
  getWorkTimeSlots: vi.fn(() => ["10:00", "10:15"])
}));

describe("TimeSlot - Horizontal Task Display", () => {
  const mockTask1: Task = {
    id: "1",
    name: "実装タスク",
    duration: 30,
    workTime: 30,
    isPlaced: true,
    startTime: "10:00"
  };

  const mockTask2: Task = {
    id: "2", 
    name: "バグ修正",
    duration: 30,
    workTime: 30,
    isPlaced: true,
    startTime: "10:00"
  };

  const mockTask3: Task = {
    id: "3",
    name: "設計レビュー", 
    duration: 30,
    workTime: 30,
    isPlaced: true,
    startTime: "10:00"
  };

  const mockTimeSlots = ["10:00", "10:15", "10:30"];
  const mockOccupiedSlots = new Set(["10:00", "10:15"]);
  const mockOverlappingTaskIds = new Set<string>();

  const defaultProps = {
    time: "10:00",
    isOccupied: true,
    dragOverSlot: null,
    draggedTaskId: null,
    tasks: [mockTask1, mockTask2, mockTask3],
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

  it("複数のタスクが同じ開始時間の場合、横並びで表示される", () => {
    const propsWithMultipleTasks = {
      ...defaultProps,
      slotTasks: [mockTask1, mockTask2, mockTask3]
    };

    render(<TimeSlot {...propsWithMultipleTasks} />);

    // すべてのタスク名が表示されていることを確認
    expect(screen.getByText("実装タスク")).toBeInTheDocument();
    expect(screen.getByText("バグ修正")).toBeInTheDocument();
    expect(screen.getByText("設計レビュー")).toBeInTheDocument();
  });

  it("タスクが開始時間順に左から並ぶ", () => {
    const task1Early: Task = { ...mockTask1, startTime: "09:00" };
    const task2Middle: Task = { ...mockTask2, startTime: "10:00" };
    const task3Late: Task = { ...mockTask3, startTime: "11:00" };

    const propsWithSortedTasks = {
      ...defaultProps,
      slotTasks: [task3Late, task1Early, task2Middle] // 意図的に順序を混在させる
    };

    const { container } = render(<TimeSlot {...propsWithSortedTasks} />);

    // タスクコンテナが存在することを確認
    const tasksContainer = container.querySelector('.timeline__tasks-container');
    expect(tasksContainer).toBeInTheDocument();

    // タスクカードが複数存在することを確認
    const taskCards = container.querySelectorAll('.timeline__tasks-container > div');
    expect(taskCards).toHaveLength(3);
  });

  it("単一タスクの場合は通常表示される", () => {
    const propsWithSingleTask = {
      ...defaultProps,
      slotTasks: [mockTask1]
    };

    render(<TimeSlot {...propsWithSingleTask} />);

    expect(screen.getByText("実装タスク")).toBeInTheDocument();
    
    // タスクカードが1つだけ存在することを確認
    const { container } = render(<TimeSlot {...propsWithSingleTask} />);
    const taskCards = container.querySelectorAll('.timeline__tasks-container > div');
    expect(taskCards).toHaveLength(1);
  });

  it("タスクが存在しない場合はタスクコンテナが表示されない", () => {
    const propsWithNoTasks = {
      ...defaultProps,
      slotTasks: []
    };

    const { container } = render(<TimeSlot {...propsWithNoTasks} />);

    const tasksContainer = container.querySelector('.timeline__tasks-container');
    expect(tasksContainer).not.toBeInTheDocument();
  });

  it("後方互換性: taskプロパティを使った単一タスク表示", () => {
    const propsWithLegacyTask = {
      ...defaultProps,
      task: mockTask1,
      slotTasks: undefined
    };

    render(<TimeSlot {...propsWithLegacyTask} />);

    expect(screen.getByText("実装タスク")).toBeInTheDocument();
  });
});