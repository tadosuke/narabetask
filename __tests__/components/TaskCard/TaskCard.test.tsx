import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "../../../src/components/TaskCard/TaskCard";
import type { Task } from "../../../src/types";

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    isPlaced: false
  };

  it("タスク情報を正しく表示する", () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
  });



  it("クリックされたときにonClickを呼び出す", () => {
    const mockOnClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText("テストタスク"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("正しいスタイルクラスを持つ", () => {
    render(<TaskCard task={mockTask} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).toHaveClass("task-card--staging");
    expect(taskCard).not.toHaveClass("task-card--placed");
  });

  it("タスクが配置されている場合は配置済みスタイルを持つ", () => {
    const placedTask = { ...mockTask, isPlaced: true };
    render(<TaskCard task={placedTask} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).toHaveClass("task-card--placed");
    expect(taskCard).not.toHaveClass("task-card--staging");
  });

  it("選択中の場合は選択済みスタイルを持つ", () => {
    render(<TaskCard task={mockTask} isSelected={true} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).toHaveClass("task-card--selected");
  });

  it("選択されていない場合は選択済みスタイルを持たない", () => {
    render(<TaskCard task={mockTask} isSelected={false} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).not.toHaveClass("task-card--selected");
  });
});
