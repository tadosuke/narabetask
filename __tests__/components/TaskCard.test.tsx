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
    resourceType: "self",
    isPlaced: false,
  };

  it("should render task information correctly", () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
    expect(screen.getByText("自分")).toBeInTheDocument();
  });

  it("should show duration in minutes when less than 60 minutes", () => {
    const shortTask = { ...mockTask, duration: 45 };
    render(<TaskCard task={shortTask} />);

    expect(screen.getByText("45m")).toBeInTheDocument();
  });

  it("should show start time when task is placed", () => {
    const placedTask = { ...mockTask, isPlaced: true, startTime: "09:00" };
    render(<TaskCard task={placedTask} />);

    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const mockOnClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText("テストタスク"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling classes", () => {
    render(<TaskCard task={mockTask} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).toHaveClass("task-card--staging");
    expect(taskCard).not.toHaveClass("task-card--placed");
  });

  it("should have placed styling when task is placed", () => {
    const placedTask = { ...mockTask, isPlaced: true };
    render(<TaskCard task={placedTask} />);
    const taskCard = screen.getByText("テストタスク").closest(".task-card");

    expect(taskCard).toHaveClass("task-card--placed");
    expect(taskCard).not.toHaveClass("task-card--staging");
  });
});
