import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskHeader } from "../../../src/components/TaskCard/TaskHeader";
import type { Task } from "../../../src/types";

describe("TaskHeader", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    isPlaced: false
  };

  it("タスク名を正しく表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("60分以上の場合は時間と分で所要時間を表示する", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.getByText("1h 0m")).toBeInTheDocument();
  });

  it("60分未満の場合は分単位で所要時間を表示する", () => {
    const shortTask = { ...mockTask, duration: 45 };
    render(<TaskHeader task={shortTask} />);

    expect(screen.getByText("45m")).toBeInTheDocument();
  });

  it("90分の場合は正しく表示する", () => {
    const longTask = { ...mockTask, duration: 90 };
    render(<TaskHeader task={longTask} />);

    expect(screen.getByText("1h 30m")).toBeInTheDocument();
  });

  it("120分の場合は正しく表示する", () => {
    const longTask = { ...mockTask, duration: 120 };
    render(<TaskHeader task={longTask} />);

    expect(screen.getByText("2h 0m")).toBeInTheDocument();
  });

  describe("ステージングエリアでの作業時間・待ち時間分割表示", () => {
    it("ステージングエリアで作業時間と待ち時間が両方ある場合は分割表示する", () => {
      const taskWithWorkWait: Task = {
        ...mockTask,
        duration: 60,
        workTime: 45,
        waitTime: 15,
        isPlaced: false
      };
      render(<TaskHeader task={taskWithWorkWait} />);

      expect(screen.getByText("45m + 15m")).toBeInTheDocument();
    });

    it("ステージングエリアで作業時間・待ち時間が時間単位の場合も正しく表示する", () => {
      const taskWithLongTimes: Task = {
        ...mockTask,
        duration: 135,
        workTime: 75,
        waitTime: 60,
        isPlaced: false
      };
      render(<TaskHeader task={taskWithLongTimes} />);

      expect(screen.getByText("1h 15m + 1h 0m")).toBeInTheDocument();
    });

    it("配置済みタスクでは作業時間・待ち時間があっても分割表示しない", () => {
      const placedTaskWithWorkWait: Task = {
        ...mockTask,
        duration: 60,
        workTime: 45,
        waitTime: 15,
        isPlaced: true
      };
      render(<TaskHeader task={placedTaskWithWorkWait} />);

      expect(screen.getByText("1h 0m")).toBeInTheDocument();
      expect(screen.queryByText("45m + 15m")).not.toBeInTheDocument();
    });

    it("ステージングエリアで作業時間のみの場合は通常表示する", () => {
      const taskWithWorkOnly: Task = {
        ...mockTask,
        duration: 45,
        workTime: 45,
        isPlaced: false
      };
      render(<TaskHeader task={taskWithWorkOnly} />);

      expect(screen.getByText("45m")).toBeInTheDocument();
      expect(screen.queryByText("45m +")).not.toBeInTheDocument();
    });

    it("ステージングエリアで待ち時間のみの場合は通常表示する", () => {
      const taskWithWaitOnly: Task = {
        ...mockTask,
        duration: 30,
        waitTime: 30,
        isPlaced: false
      };
      render(<TaskHeader task={taskWithWaitOnly} />);

      expect(screen.getByText("30m")).toBeInTheDocument();
      expect(screen.queryByText("+ 30m")).not.toBeInTheDocument();
    });
  });
});