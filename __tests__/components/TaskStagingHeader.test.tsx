import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskStagingHeader } from "../../src/components/TaskStaging/TaskStagingHeader";

describe("TaskStagingHeader", () => {
  const mockOnAddTask = vi.fn();

  const defaultProps = {
    onAddTask: mockOnAddTask,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイトルを表示する", () => {
    render(<TaskStagingHeader {...defaultProps} />);
    expect(screen.getByText("タスク一覧")).toBeInTheDocument();
  });

  it("追加ボタンを表示する", () => {
    render(<TaskStagingHeader {...defaultProps} />);
    expect(screen.getByText("+ 新しいタスク")).toBeInTheDocument();
  });

  it("追加ボタンをクリックするとonAddTaskが呼ばれる", () => {
    render(<TaskStagingHeader {...defaultProps} />);
    fireEvent.click(screen.getByText("+ 新しいタスク"));
    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it("正しいCSSクラスを持つ", () => {
    render(<TaskStagingHeader {...defaultProps} />);
    const header = screen.getByText("タスク一覧").closest(".task-staging__header");
    expect(header).toBeInTheDocument();
    
    const addButton = screen.getByText("+ 新しいタスク");
    expect(addButton).toHaveClass("task-staging__add-button");
  });
});