import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskStaging } from "../../src/components/TaskStaging";
import type { Task } from "../../src/types";

describe("TaskStaging", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "タスク1",
      duration: 30,
      resourceType: "self",
      isPlaced: false,
    },
    {
      id: "2",
      name: "タスク2",
      duration: 60,
      resourceType: "others",
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "3",
      name: "タスク3",
      duration: 45,
      resourceType: "machine",
      isPlaced: false,
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    onTaskClick: vi.fn(),
    onAddTask: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render header with title and add button", () => {
    render(<TaskStaging {...defaultProps} />);

    expect(screen.getByText("タスク一覧")).toBeInTheDocument();
    expect(screen.getByText("+ 新しいタスク")).toBeInTheDocument();
  });

  it("should render only unplaced tasks", () => {
    render(<TaskStaging {...defaultProps} />);

    // Unplaced tasks should be visible
    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.getByText("タスク3")).toBeInTheDocument();

    // Placed task should not be visible
    expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
  });

  it("should call onAddTask when add button is clicked", () => {
    const mockOnAddTask = vi.fn();
    render(<TaskStaging {...defaultProps} onAddTask={mockOnAddTask} />);

    fireEvent.click(screen.getByText("+ 新しいタスク"));

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it("should call onTaskClick when task is clicked", () => {
    const mockOnTaskClick = vi.fn();
    render(<TaskStaging {...defaultProps} onTaskClick={mockOnTaskClick} />);

    fireEvent.click(screen.getByText("タスク1"));

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("should show empty state when no unplaced tasks exist", () => {
    const tasksAllPlaced: Task[] = [
      {
        id: "1",
        name: "タスク1",
        duration: 30,
        resourceType: "self",
        isPlaced: true,
        startTime: "09:00",
      },
    ];

    render(<TaskStaging {...defaultProps} tasks={tasksAllPlaced} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false,
      })
    ).toBeInTheDocument();

    // Task list should not be present
    expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
  });

  it("should show empty state when tasks array is empty", () => {
    render(<TaskStaging {...defaultProps} tasks={[]} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("should render instructions section", () => {
    render(<TaskStaging {...defaultProps} />);

    expect(screen.getByText("使い方:")).toBeInTheDocument();
    expect(
      screen.getByText("タスクをクリックして設定を編集")
    ).toBeInTheDocument();
    expect(
      screen.getByText("タスクをドラッグしてタイムラインに配置")
    ).toBeInTheDocument();
    expect(
      screen.getByText("配置したタスクをドラッグしてここに戻すことも可能")
    ).toBeInTheDocument();
  });

  it("should have correct CSS classes", () => {
    render(<TaskStaging {...defaultProps} />);

    const stagingContainer = screen
      .getByText("タスク一覧")
      .closest(".task-staging");
    expect(stagingContainer).toBeInTheDocument();

    const addButton = screen.getByText("+ 新しいタスク");
    expect(addButton).toHaveClass("task-staging__add-button");
  });

  it("should render task list when unplaced tasks exist", () => {
    render(<TaskStaging {...defaultProps} />);

    const taskList = screen.getByText("タスク1").closest(".task-staging__list");
    expect(taskList).toBeInTheDocument();
  });
});
