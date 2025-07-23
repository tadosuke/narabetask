import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskHeader } from "../../../src/components/TaskCard/TaskHeader";
import type { Task } from "../../../src/types";

describe("TaskHeader", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    workTime: 30,
    waitTime: 30,
    duration: 60,
    isPlaced: false
  };

  it("タスク名を正しく表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("ステージングタスクの場合は作業時間と待ち時間を表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("30m + 30m")).toBeInTheDocument();
  });

  it("配置済みタスクの場合はタスク名のみ表示する", () => {
    const placedTask = { ...mockTask, isPlaced: true };
    render(<TaskHeader task={placedTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByText("30m + 30m")).not.toBeInTheDocument();
  });

  it("60分未満の場合は正しく表示する", () => {
    const shortTask = { ...mockTask, workTime: 15, waitTime: 30, duration: 45 };
    render(<TaskHeader task={shortTask} />);

    expect(screen.getByText("15m + 30m")).toBeInTheDocument();
  });

  it("作業時間が60分以上の場合は正しく表示する", () => {
    const longTask = { ...mockTask, workTime: 90, waitTime: 30, duration: 120 };
    render(<TaskHeader task={longTask} />);

    expect(screen.getByText("1h30m + 30m")).toBeInTheDocument();
  });

  it("待ち時間が60分以上の場合は正しく表示する", () => {
    const longTask = { ...mockTask, workTime: 30, waitTime: 120, duration: 150 };
    render(<TaskHeader task={longTask} />);

    expect(screen.getByText("30m + 2h")).toBeInTheDocument();
  });
});