import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TaskSidebar } from "../../src/components/TaskSidebar";
import type { Task } from "../../src/types";

describe("TaskSidebar Placement Issue Debug", () => {
  const placedTask: Task = {
    id: "placed-task",
    name: "配置済みタスク",
    duration: 30,
    resourceTypes: ["self"],
    isPlaced: true,
    startTime: "09:00",
  };

  const mockOnTaskUpdate = vi.fn();

  const defaultProps = {
    selectedTask: placedTask,
    onTaskUpdate: mockOnTaskUpdate,
    onTaskRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should preserve placement state when duration is changed", () => {
    const { container } = render(<TaskSidebar {...defaultProps} />);
    
    // Find the duration slider
    const durationSlider = container.querySelector('#task-duration') as HTMLInputElement;
    expect(durationSlider).toBeInTheDocument();
    expect(durationSlider.value).toBe("30");
    
    // Change the duration
    fireEvent.change(durationSlider, { target: { value: "60" } });
    
    // Check that onTaskUpdate was called
    expect(mockOnTaskUpdate).toHaveBeenCalledTimes(1);
    
    // Check the task object passed to onTaskUpdate
    const updatedTask = mockOnTaskUpdate.mock.calls[0][0];
    console.log("Updated task:", updatedTask);
    
    // Verify that placement properties are preserved
    expect(updatedTask.isPlaced).toBe(true);
    expect(updatedTask.startTime).toBe("09:00");
    expect(updatedTask.duration).toBe(60);
    expect(updatedTask.id).toBe("placed-task");
    expect(updatedTask.name).toBe("配置済みタスク");
  });
});