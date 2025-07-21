import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "../../src/components/TaskCard";
import type { Task } from "../../src/types";

describe("TaskCard Time Display", () => {
  const baseTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 30,
    resourceTypes: ["self"],
    isPlaced: true,
    startTime: "09:00"
  };

  it("15分のタスクでは時刻を表示しない", () => {
    const task15min = { ...baseTask, duration: 15 };
    render(<TaskCard task={task15min} />);

    // 時刻が表示されていないことを確認
    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
  });

  it("30分以上のタスクでは時刻を表示する", () => {
    const task30min = { ...baseTask, duration: 30 };
    render(<TaskCard task={task30min} />);

    // 時刻が表示されていることを確認
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("60分のタスクでは時刻を表示する", () => {
    const task60min = { ...baseTask, duration: 60 };
    render(<TaskCard task={task60min} />);

    // 時刻が表示されていることを確認
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("配置されていないタスクでは時刻を表示しない", () => {
    const unplacedTask = { ...baseTask, isPlaced: false, startTime: undefined };
    render(<TaskCard task={unplacedTask} />);

    // 時刻が表示されていないことを確認
    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
  });

  it("開始時刻がないタスクでは時刻を表示しない", () => {
    const taskWithoutTime = { ...baseTask, startTime: undefined };
    render(<TaskCard task={taskWithoutTime} />);

    // 時刻が表示されていないことを確認
    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
  });
});