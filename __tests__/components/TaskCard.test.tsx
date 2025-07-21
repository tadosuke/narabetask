import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "../../src/components/TaskCard";
import type { Task } from "../../src/types";

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  it("タスク情報を正しく表示する", () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
    // Resource name should be in tooltip, not as visible text
    expect(screen.getByTitle("自分")).toBeInTheDocument();
  });

  it("60分未満の場合は分単位で所要時間を表示する", () => {
    const shortTask = { ...mockTask, duration: 45 };
    render(<TaskCard task={shortTask} />);

    expect(screen.getByText("45m")).toBeInTheDocument();
  });

  it("タスクが配置されている場合は開始時刻を表示する", () => {
    const placedTask = { ...mockTask, isPlaced: true, startTime: "09:00" };
    render(<TaskCard task={placedTask} />);

    expect(screen.getByText("09:00")).toBeInTheDocument();
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
});
