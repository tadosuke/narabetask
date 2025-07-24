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

  it("所要時間は表示されない", () => {
    render(<TaskHeader task={mockTask} />);

    expect(screen.queryByText("1h 0m")).not.toBeInTheDocument();
  });

  it("45分のタスクでも所要時間は表示されない", () => {
    const shortTask = { ...mockTask, duration: 45 };
    render(<TaskHeader task={shortTask} />);

    expect(screen.queryByText("45m")).not.toBeInTheDocument();
  });
});