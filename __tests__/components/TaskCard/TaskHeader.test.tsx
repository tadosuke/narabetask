import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskHeader } from "../../../src/components/TaskCard/TaskHeader";
import type { Task } from "../../../src/types";

describe("TaskHeader", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 90,
    workTime: 60,
    waitTime: 30,
    isPlaced: false
  };

  it("タスク名を正しく表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("作業時間と待ち時間の両方がある場合に分離して表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("1h 0m")).toBeInTheDocument(); // 作業時間
    expect(screen.getByText("+30m")).toBeInTheDocument(); // 待ち時間
  });

  it("作業時間のみの場合は作業時間のみ表示する", () => {
    const workOnlyTask = { ...mockTask, waitTime: 0, duration: 45, workTime: 45 };
    render(<TaskHeader task={workOnlyTask} />);

    expect(screen.getByText("45m")).toBeInTheDocument();
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("60分未満の作業時間は分単位で表示する", () => {
    const shortTask = { ...mockTask, workTime: 45, waitTime: 15, duration: 60 };
    render(<TaskHeader task={shortTask} />);

    expect(screen.getByText("45m")).toBeInTheDocument();
    expect(screen.getByText("+15m")).toBeInTheDocument();
  });

  it("待ち時間が長時間の場合は時間と分で表示する", () => {
    const longWaitTask = { ...mockTask, workTime: 30, waitTime: 90, duration: 120 };
    render(<TaskHeader task={longWaitTask} />);

    expect(screen.getByText("30m")).toBeInTheDocument();
    expect(screen.getByText("+1h 30m")).toBeInTheDocument();
  });

  it("両方とも時間単位の場合は正しく表示する", () => {
    const longTask = { ...mockTask, workTime: 120, waitTime: 60, duration: 180 };
    render(<TaskHeader task={longTask} />);

    expect(screen.getByText("2h 0m")).toBeInTheDocument();
    expect(screen.getByText("+1h 0m")).toBeInTheDocument();
  });
});