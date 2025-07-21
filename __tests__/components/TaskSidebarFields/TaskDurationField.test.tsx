import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDurationField } from "../../../src/components/TaskSidebarFields/TaskDurationField";
import type { Task } from "../../../src/types";

describe("TaskDurationField", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  const defaultProps = {
    selectedTask: mockTask,
    onTaskUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("選択されたタスクの所要時間を表示する", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole('slider');
    expect(durationSlider).toHaveValue("60"); // 1時間 = 60分
    expect(screen.getByText("1時間")).toBeInTheDocument();
  });

  it("変更されたときに所要時間を更新する", async () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole('slider');
    
    // Change the slider value to 45 minutes
    fireEvent.change(durationSlider, { target: { value: '45' } });

    expect(durationSlider).toHaveValue("45");
  });

  it("所要時間が変更されたときに自動的にonTaskUpdateを呼び出す", async () => {
    const mockOnTaskUpdate = vi.fn();
    render(<TaskDurationField {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const durationSlider = screen.getByRole('slider');
    
    // Change the slider value to 45 minutes
    fireEvent.change(durationSlider, { target: { value: '45' } });

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 45,
      });
    });
  });

  it("スライダーで最小値と最大値を設定できる", async () => {
    const mockOnTaskUpdate = vi.fn();
    render(<TaskDurationField {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const durationSlider = screen.getByRole('slider');
    
    // Test minimum value (15 minutes)
    fireEvent.change(durationSlider, { target: { value: '15' } });
    
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 15,
      });
    });
    
    // Test maximum value (240 minutes = 4 hours)
    fireEvent.change(durationSlider, { target: { value: '240' } });
    
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 240,
      });
    });
  });

  it("スライダーの最小値と最大値を正しく設定する", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole('slider');
    
    // Check slider attributes for the required range
    expect(durationSlider).toHaveAttribute('min', '15'); // 最小値15分
    expect(durationSlider).toHaveAttribute('max', '240'); // 最大値4時間
    expect(durationSlider).toHaveAttribute('step', '15'); // 15分刻み
  });

  it("所要時間の表示とスライダーの範囲を正しく設定する", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole('slider');
    
    // Check slider attributes
    expect(durationSlider).toHaveAttribute('min', '15');
    expect(durationSlider).toHaveAttribute('max', '240');
    expect(durationSlider).toHaveAttribute('step', '15');
    
    // Check that duration displays are formatted correctly
    expect(screen.getByText("1時間")).toBeInTheDocument(); // default 60 minutes
  });

  it("時間表示のフォーマットが正しい", () => {
    const { rerender } = render(<TaskDurationField {...defaultProps} />);

    // Test different duration formats
    const testCases = [
      { duration: 30, expected: "30分" },
      { duration: 60, expected: "1時間" },
      { duration: 75, expected: "1時間15分" },
      { duration: 120, expected: "2時間" },
      { duration: 135, expected: "2時間15分" },
    ];

    testCases.forEach(({ duration, expected }) => {
      const taskWithDuration = { ...mockTask, duration };
      rerender(<TaskDurationField {...defaultProps} selectedTask={taskWithDuration} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it("タスクが変更されたときに所要時間をリセットする", () => {
    const { rerender } = render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole('slider');
    expect(durationSlider).toHaveValue("60");
    expect(screen.getByText("1時間")).toBeInTheDocument();

    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 30,
      resourceTypes: ["machine"],
      isPlaced: false,
    };

    rerender(<TaskDurationField {...defaultProps} selectedTask={newTask} />);

    expect(durationSlider).toHaveValue("30");
    expect(screen.getByText("30分")).toBeInTheDocument();
  });
});