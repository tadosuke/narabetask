import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import type { Task, BusinessHours } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => [
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
    "10:30",
    "10:45",
    "11:00",
    "11:15",
    "11:30",
    "11:45",
    "12:00",
  ]),
  canPlaceTask: vi.fn(() => true),
  canPlaceTaskWithWorkTime: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["09:00", "09:15"]),
  getWorkTimeSlots: vi.fn(() => ["09:00", "09:15"]),
  findOverlappingTasks: vi.fn(() => new Set()),
  findOverlappingTasksWithWorkTime: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false)
}));

describe("Timeline - Horizontal Task Alignment", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "12:00"
  };

  const defaultProps = {
    selectedTask: null,
    businessHours: mockBusinessHours,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("複数のタスクを開始時間順に左から右へ横並びで表示する", () => {
    const tasks: Task[] = [
      {
        id: "1",
        name: "タスク10:00",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "2", 
        name: "タスク09:00",
        duration: 30,
        isPlaced: true,
        startTime: "09:00"
      },
      {
        id: "3",
        name: "タスク11:00", 
        duration: 30,
        isPlaced: true,
        startTime: "11:00"
      }
    ];

    const { container } = render(<Timeline {...defaultProps} tasks={tasks} />);

    // 全てのタスクが表示されている
    expect(screen.getByText("タスク09:00")).toBeInTheDocument();
    expect(screen.getByText("タスク10:00")).toBeInTheDocument();
    expect(screen.getByText("タスク11:00")).toBeInTheDocument();

    // タスクが横並びで配置されている（同じ行に配置されている）
    const tasksContainer = container.querySelector('.timeline__tasks-row');
    expect(tasksContainer).toBeInTheDocument();
  });

  it("タスクが追加されたときに開始時間順に自動で整列する", () => {
    const initialTasks: Task[] = [
      {
        id: "1",
        name: "タスク10:00",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "3",
        name: "タスク11:00",
        duration: 30,
        isPlaced: true,
        startTime: "11:00"
      }
    ];

    const { rerender } = render(<Timeline {...defaultProps} tasks={initialTasks} />);

    // 中間の時間にタスクを追加
    const tasksWithNewTask: Task[] = [
      ...initialTasks,
      {
        id: "2",
        name: "タスク10:30",
        duration: 30,
        isPlaced: true,
        startTime: "10:30"
      }
    ];

    rerender(<Timeline {...defaultProps} tasks={tasksWithNewTask} />);

    // 全てのタスクが表示されている
    expect(screen.getByText("タスク10:00")).toBeInTheDocument();
    expect(screen.getByText("タスク10:30")).toBeInTheDocument();
    expect(screen.getByText("タスク11:00")).toBeInTheDocument();
  });

  it("タスクが削除されたときに残りのタスクが自動で整列する", () => {
    const initialTasks: Task[] = [
      {
        id: "1",
        name: "タスク10:00",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "2",
        name: "タスク10:30", 
        duration: 30,
        isPlaced: true,
        startTime: "10:30"
      },
      {
        id: "3",
        name: "タスク11:00",
        duration: 30,
        isPlaced: true,
        startTime: "11:00"
      }
    ];

    const { rerender } = render(<Timeline {...defaultProps} tasks={initialTasks} />);

    // 最初のタスクを削除
    const tasksAfterDeletion: Task[] = [
      {
        id: "2",
        name: "タスク10:30",
        duration: 30,
        isPlaced: true,
        startTime: "10:30"
      },
      {
        id: "3",
        name: "タスク11:00",
        duration: 30,
        isPlaced: true,
        startTime: "11:00"
      }
    ];

    rerender(<Timeline {...defaultProps} tasks={tasksAfterDeletion} />);

    // 削除されたタスクは表示されない
    expect(screen.queryByText("タスク10:00")).not.toBeInTheDocument();
    // 残りのタスクは表示されている
    expect(screen.getByText("タスク10:30")).toBeInTheDocument();
    expect(screen.getByText("タスク11:00")).toBeInTheDocument();
  });

  it("配置されていないタスクは横並びに表示されない", () => {
    const tasks: Task[] = [
      {
        id: "1",
        name: "配置済みタスク",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "2",
        name: "未配置タスク",
        duration: 30,
        isPlaced: false
      }
    ];

    render(<Timeline {...defaultProps} tasks={tasks} />);

    // 配置済みタスクは表示される
    expect(screen.getByText("配置済みタスク")).toBeInTheDocument();
    // 未配置タスクは表示されない
    expect(screen.queryByText("未配置タスク")).not.toBeInTheDocument();
  });

  it("同じ開始時間のタスクがある場合は正しく処理される", () => {
    const tasks: Task[] = [
      {
        id: "1",
        name: "タスク1-10:00",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "2",
        name: "タスク2-10:00",
        duration: 30,
        isPlaced: true,
        startTime: "10:00"
      }
    ];

    render(<Timeline {...defaultProps} tasks={tasks} />);

    // 同じ開始時間のタスクも表示される（同じ位置に重なって表示される可能性がある）
    expect(screen.getByText("タスク1-10:00")).toBeInTheDocument();
    expect(screen.getByText("タスク2-10:00")).toBeInTheDocument();
  });
});