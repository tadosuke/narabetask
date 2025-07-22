import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskStagingProvider } from "../../../src/contexts/TaskStagingContext";
import { TaskStagingContents } from "../../../src/components/TaskStaging/TaskStagingContents";
import type { Task } from "../../../src/types";

// Helper function to render TaskStagingContents with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TaskStagingProvider>
      {component}
    </TaskStagingProvider>
  );
};

describe("TaskStagingContents", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "タスク1",
      duration: 30,
      isPlaced: false,
    },
    {
      id: "2",
      name: "タスク2",
      duration: 60,
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "3",
      name: "タスク3",
      duration: 45,
      isPlaced: false,
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    selectedTask: null,
    onTaskClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("配置されていないタスクのみを表示する", () => {
    renderWithProvider(<TaskStagingContents {...defaultProps} />);

    // 配置されていないタスクが表示される
    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.getByText("タスク3")).toBeInTheDocument();

    // 配置済みタスクは表示されない
    expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
  });

  it("タスクをクリックするとonTaskClickが呼ばれる", () => {
    const mockOnTaskClick = vi.fn();
    renderWithProvider(<TaskStagingContents {...defaultProps} onTaskClick={mockOnTaskClick} />);

    fireEvent.click(screen.getByText("タスク1"));
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("配置されていないタスクが存在しない場合は空の状態を表示する", () => {
    const tasksAllPlaced: Task[] = [
      {
        id: "1",
        name: "タスク1",
        duration: 30,
        isPlaced: true,
        startTime: "09:00",
      },
    ];

    renderWithProvider(<TaskStagingContents {...defaultProps} tasks={tasksAllPlaced} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false,
      })
    ).toBeInTheDocument();

    // タスクリストは表示されない
    expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
  });

  it("タスク配列が空の場合は空の状態を表示する", () => {
    renderWithProvider(<TaskStagingContents {...defaultProps} tasks={[]} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("正しいCSSクラスを持つ", () => {
    renderWithProvider(<TaskStagingContents {...defaultProps} />);

    const content = screen.getByText("タスク1").closest(".task-staging__content");
    expect(content).toBeInTheDocument();

    const taskList = screen.getByText("タスク1").closest(".task-staging__list");
    expect(taskList).toBeInTheDocument();
  });
});