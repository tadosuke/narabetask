import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskInfoDisplay } from "../../../src/components/TaskSidebar/TaskInfoDisplay";
import type { Task } from "../../../src/types";

describe("TaskInfoDisplay", () => {
  const placedTask: Task = {
    id: "1",
    name: "配置済みタスク",
    duration: 30,
    resourceTypes: ["self"],
    isPlaced: true,
    startTime: "09:00",
  };

  const unplacedTask: Task = {
    id: "2",
    name: "未配置タスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  const placedTaskWithoutStartTime: Task = {
    id: "3",
    name: "開始時間なしタスク",
    duration: 45,
    resourceTypes: ["self"],
    isPlaced: true,
  };

  it("配置済みタスクの開始時間と終了時間を表示する", () => {
    render(<TaskInfoDisplay task={placedTask} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("配置されていないタスクでは'-'を表示する", () => {
    render(<TaskInfoDisplay task={unplacedTask} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("配置済みでも開始時間がないタスクでは'-'を表示する", () => {
    render(<TaskInfoDisplay task={placedTaskWithoutStartTime} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("終了時間が正しく計算される（異なる所要時間）", () => {
    const longerTask: Task = {
      id: "4",
      name: "長いタスク",
      duration: 90,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "10:00",
    };

    render(<TaskInfoDisplay task={longerTask} />);

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("11:30")).toBeInTheDocument();
  });

  it("異なる開始時間で正しく終了時間が計算される", () => {
    const afternoonTask: Task = {
      id: "5",
      name: "午後のタスク",
      duration: 45,
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "14:15",
    };

    render(<TaskInfoDisplay task={afternoonTask} />);

    expect(screen.getByText("14:15")).toBeInTheDocument();
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });
});