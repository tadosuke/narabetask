import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskSidebar } from "../../src/components/TaskSidebar";
import type { Task } from "../../src/types";

describe("TaskSidebar - 時間情報表示テスト", () => {
  const mockOnTaskUpdate = vi.fn();
  const mockOnTaskRemove = vi.fn();

  const defaultProps = {
    selectedTask: null as Task | null,
    onTaskUpdate: mockOnTaskUpdate,
    onTaskRemove: mockOnTaskRemove,
  };

  it("タスクがタイムラインに配置されている時に時間情報を表示する", () => {
    const placedTask: Task = {
      id: "1",
      name: "配置済みタスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "09:00",
    };

    render(<TaskSidebar {...defaultProps} selectedTask={placedTask} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("タスクが一覧に戻された時に時間情報を隠す", () => {
    const returnedTask: Task = {
      id: "1",
      name: "戻されたタスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: false,
      startTime: undefined, // This should be undefined when returned to staging
    };

    render(<TaskSidebar {...defaultProps} selectedTask={returnedTask} />);

    expect(screen.queryByText("開始時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("終了時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
    expect(screen.queryByText("09:30")).not.toBeInTheDocument();
  });

  it("配置済みだが開始時間がないタスクでは時間情報を表示しない", () => {
    const inconsistentTask: Task = {
      id: "1",
      name: "不整合タスク",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: undefined, // This inconsistent state should not show time info
    };

    render(<TaskSidebar {...defaultProps} selectedTask={inconsistentTask} />);

    expect(screen.queryByText("開始時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("終了時間:")).not.toBeInTheDocument();
  });
});