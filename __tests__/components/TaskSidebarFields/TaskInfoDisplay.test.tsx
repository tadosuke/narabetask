import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskInfoDisplay } from "../../../src/components/TaskSidebarFields/TaskInfoDisplay";
import type { Task } from "../../../src/types";

describe("TaskInfoDisplay", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  const mockPlacedTask: Task = {
    id: "2",
    name: "配置済みタスク",
    duration: 30,
    resourceTypes: ["others"],
    isPlaced: true,
    startTime: "09:00",
  };

  it("配置済みタスクの開始時間と終了時間を表示する", () => {
    render(<TaskInfoDisplay selectedTask={mockPlacedTask} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("配置されていないタスクの時間情報は表示しない", () => {
    render(<TaskInfoDisplay selectedTask={mockTask} />);

    expect(screen.queryByText("開始時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("終了時間:")).not.toBeInTheDocument();
  });

  it("配置済みだが開始時間がないタスクの時間情報は表示しない", () => {
    const taskWithoutStartTime: Task = {
      ...mockTask,
      isPlaced: true,
      startTime: undefined,
    };

    render(<TaskInfoDisplay selectedTask={taskWithoutStartTime} />);

    expect(screen.queryByText("開始時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("終了時間:")).not.toBeInTheDocument();
  });

  it("異なる時間のタスクで正しい終了時間を計算する", () => {
    const taskWithDifferentTime: Task = {
      id: "3",
      name: "長時間タスク",
      duration: 90, // 1時間30分
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "10:15",
    };

    render(<TaskInfoDisplay selectedTask={taskWithDifferentTime} />);

    expect(screen.getByText("10:15")).toBeInTheDocument(); // 開始時間
    expect(screen.getByText("11:45")).toBeInTheDocument(); // 終了時間 (10:15 + 1:30)
  });
});