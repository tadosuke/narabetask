import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskStagingProvider } from "../../../src/contexts/TaskStagingContext";
import { TaskStaging } from "../../../src/components/TaskStaging/TaskStaging";
import type { Task } from "../../../src/types";

// Helper function to render TaskStaging with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TaskStagingProvider>
      {component}
    </TaskStagingProvider>
  );
};

describe("TaskStaging", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "タスク1",
      duration: 30,
      isPlaced: false
    },
    {
      id: "2",
      name: "タスク2",
      duration: 60,
      isPlaced: true,
      startTime: "09:00"
    },
    {
      id: "3",
      name: "タスク3",
      duration: 45,
      isPlaced: false
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    onTaskClick: vi.fn(),
    onAddTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイトルと追加ボタンを含むヘッダーを表示する", () => {
    renderWithProvider(<TaskStaging {...defaultProps} />);

    expect(screen.getByText("タスク一覧")).toBeInTheDocument();
    expect(screen.getByText("+ 新しいタスク")).toBeInTheDocument();
  });

  it("配置されていないタスクのみを表示する", () => {
    renderWithProvider(<TaskStaging {...defaultProps} />);

    // 配置されていないタスクが表示される
    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.getByText("タスク3")).toBeInTheDocument();

    // 配置済みタスクは表示されない
    expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
  });

  it("追加ボタンをクリックするとonAddTaskが呼ばれる", () => {
    const mockOnAddTask = vi.fn();
    renderWithProvider(<TaskStaging {...defaultProps} onAddTask={mockOnAddTask} />);

    fireEvent.click(screen.getByText("+ 新しいタスク"));

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it("タスクをクリックするとonTaskClickが呼ばれる", () => {
    const mockOnTaskClick = vi.fn();
    renderWithProvider(<TaskStaging {...defaultProps} onTaskClick={mockOnTaskClick} />);

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
        startTime: "09:00"
      },
    ];

    renderWithProvider(<TaskStaging {...defaultProps} tasks={tasksAllPlaced} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false
      })
    ).toBeInTheDocument();

    // タスクリストは表示されない
    expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
  });

  it("タスク配列が空の場合は空の状態を表示する", () => {
    renderWithProvider(<TaskStaging {...defaultProps} tasks={[]} />);

    expect(
      screen.getByText("タスクがありません。", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("「新しいタスク」ボタンでタスクを作成してください。", {
        exact: false
      })
    ).toBeInTheDocument();
  });

  it("説明セクションを表示する", () => {
    renderWithProvider(<TaskStaging {...defaultProps} />);

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

  it("正しいCSSクラスを持つ", () => {
    renderWithProvider(<TaskStaging {...defaultProps} />);

    const stagingContainer = screen
      .getByText("タスク一覧")
      .closest(".task-staging");
    expect(stagingContainer).toBeInTheDocument();

    const addButton = screen.getByText("+ 新しいタスク");
    expect(addButton).toHaveClass("task-staging__add-button");
  });

  it("配置されていないタスクが存在する場合はタスクリストを表示する", () => {
    renderWithProvider(<TaskStaging {...defaultProps} />);

    const taskList = screen.getByText("タスク1").closest(".task-staging__list");
    expect(taskList).toBeInTheDocument();
  });
});
