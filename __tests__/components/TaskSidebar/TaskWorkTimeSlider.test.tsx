import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskWorkTimeSlider } from "../../../src/components/TaskSidebar/TaskWorkTimeSlider";

describe("TaskWorkTimeSlider", () => {
  const defaultProps = {
    workTime: 60,
    onWorkTimeChange: vi.fn(),
  };

  it("スライダーとラベルが表示される", () => {
    render(<TaskWorkTimeSlider {...defaultProps} />);

    expect(screen.getByLabelText("作業時間")).toBeInTheDocument();
    expect(screen.getByText("作業時間")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("プロパティで渡された作業時間が表示される", () => {
    render(<TaskWorkTimeSlider {...defaultProps} />);

    const workTimeSlider = screen.getByRole("slider");
    expect(workTimeSlider).toHaveValue("60");
    expect(screen.getByText("1時間")).toBeInTheDocument();
  });

  it("スライダーの最小値、最大値、ステップが正しく設定される", () => {
    render(<TaskWorkTimeSlider {...defaultProps} />);

    const workTimeSlider = screen.getByRole("slider");
    expect(workTimeSlider).toHaveAttribute("min", "15");
    expect(workTimeSlider).toHaveAttribute("max", "240");
    expect(workTimeSlider).toHaveAttribute("step", "15");
  });

  it("作業時間が変更されたときにonWorkTimeChangeを呼び出す", () => {
    const mockOnWorkTimeChange = vi.fn();
    render(
      <TaskWorkTimeSlider
        {...defaultProps}
        onWorkTimeChange={mockOnWorkTimeChange}
      />
    );

    const workTimeSlider = screen.getByRole("slider");
    fireEvent.change(workTimeSlider, { target: { value: "45" } });

    expect(mockOnWorkTimeChange).toHaveBeenCalledWith(45);
  });

  it("0分の時間を正しくフォーマットする", () => {
    render(<TaskWorkTimeSlider {...defaultProps} workTime={0} />);

    expect(screen.getByText("0分")).toBeInTheDocument();
  });

  it("分単位の時間を正しくフォーマットする", () => {
    render(<TaskWorkTimeSlider {...defaultProps} workTime={30} />);

    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("時間単位の時間を正しくフォーマットする", () => {
    render(<TaskWorkTimeSlider {...defaultProps} workTime={120} />);

    expect(screen.getByText("2時間")).toBeInTheDocument();
  });

  it("時間と分を組み合わせた時間を正しくフォーマットする", () => {
    render(<TaskWorkTimeSlider {...defaultProps} workTime={90} />);

    expect(screen.getByText("1時間30分")).toBeInTheDocument();
  });

  it("正しいIDが設定される", () => {
    render(<TaskWorkTimeSlider {...defaultProps} />);

    const workTimeSlider = screen.getByRole("slider");
    expect(workTimeSlider).toHaveAttribute("id", "task-work-time");
  });

  it("最小値でonWorkTimeChangeを呼び出す", () => {
    const mockOnWorkTimeChange = vi.fn();
    render(
      <TaskWorkTimeSlider
        {...defaultProps}
        onWorkTimeChange={mockOnWorkTimeChange}
      />
    );

    const workTimeSlider = screen.getByRole("slider");
    fireEvent.change(workTimeSlider, { target: { value: "15" } });

    expect(mockOnWorkTimeChange).toHaveBeenCalledWith(15);
  });

  it("最大値でonWorkTimeChangeを呼び出す", () => {
    const mockOnWorkTimeChange = vi.fn();
    render(
      <TaskWorkTimeSlider
        {...defaultProps}
        onWorkTimeChange={mockOnWorkTimeChange}
      />
    );

    const workTimeSlider = screen.getByRole("slider");
    fireEvent.change(workTimeSlider, { target: { value: "240" } });

    expect(mockOnWorkTimeChange).toHaveBeenCalledWith(240);
  });
});
