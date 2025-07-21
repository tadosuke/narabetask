import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskHeader } from "../../src/components/TaskCard/TaskHeader";
import type { Task } from "../../src/types";

describe("TaskHeader", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
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
});