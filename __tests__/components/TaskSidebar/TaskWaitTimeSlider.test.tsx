import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskWaitTimeSlider } from "../../../src/components/TaskSidebar/TaskWaitTimeSlider";

describe("TaskWaitTimeSlider", () => {
  const defaultProps = {
    waitTime: 30,
    onWaitTimeChange: vi.fn()
  };

  it("スライダーとラベルが表示される", () => {
    render(<TaskWaitTimeSlider {...defaultProps} />);

    expect(screen.getByLabelText("待ち時間")).toBeInTheDocument();
    expect(screen.getByText("待ち時間")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("プロパティで渡された待ち時間が表示される", () => {
    render(<TaskWaitTimeSlider {...defaultProps} />);

    const waitTimeSlider = screen.getByRole("slider");
    expect(waitTimeSlider).toHaveValue("30");
    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("スライダーの最小値、最大値、ステップが正しく設定される", () => {
    render(<TaskWaitTimeSlider {...defaultProps} />);

    const waitTimeSlider = screen.getByRole("slider");
    expect(waitTimeSlider).toHaveAttribute("min", "0");
    expect(waitTimeSlider).toHaveAttribute("max", "240");
    expect(waitTimeSlider).toHaveAttribute("step", "15");
  });

  it("待ち時間が変更されたときにonWaitTimeChangeを呼び出す", () => {
    const mockOnWaitTimeChange = vi.fn();
    render(<TaskWaitTimeSlider {...defaultProps} onWaitTimeChange={mockOnWaitTimeChange} />);

    const waitTimeSlider = screen.getByRole("slider");
    fireEvent.change(waitTimeSlider, { target: { value: "45" } });

    expect(mockOnWaitTimeChange).toHaveBeenCalledWith(45);
  });

  it("0分の時間を正しくフォーマットする", () => {
    render(<TaskWaitTimeSlider {...defaultProps} waitTime={0} />);

    expect(screen.getByText("0分")).toBeInTheDocument();
  });

  it("分単位の時間を正しくフォーマットする", () => {
    render(<TaskWaitTimeSlider {...defaultProps} waitTime={45} />);

    expect(screen.getByText("45分")).toBeInTheDocument();
  });

  it("時間単位の時間を正しくフォーマットする", () => {
    render(<TaskWaitTimeSlider {...defaultProps} waitTime={120} />);

    expect(screen.getByText("2時間")).toBeInTheDocument();
  });

  it("時間と分を組み合わせた時間を正しくフォーマットする", () => {
    render(<TaskWaitTimeSlider {...defaultProps} waitTime={75} />);

    expect(screen.getByText("1時間15分")).toBeInTheDocument();
  });

  it("正しいIDが設定される", () => {
    render(<TaskWaitTimeSlider {...defaultProps} />);

    const waitTimeSlider = screen.getByRole("slider");
    expect(waitTimeSlider).toHaveAttribute("id", "task-wait-time");
  });

  it("最小値でonWaitTimeChangeを呼び出す", () => {
    const mockOnWaitTimeChange = vi.fn();
    render(<TaskWaitTimeSlider {...defaultProps} onWaitTimeChange={mockOnWaitTimeChange} />);

    const waitTimeSlider = screen.getByRole("slider");
    fireEvent.change(waitTimeSlider, { target: { value: "0" } });

    expect(mockOnWaitTimeChange).toHaveBeenCalledWith(0);
  });

  it("最大値でonWaitTimeChangeを呼び出す", () => {
    const mockOnWaitTimeChange = vi.fn();
    render(<TaskWaitTimeSlider {...defaultProps} onWaitTimeChange={mockOnWaitTimeChange} />);

    const waitTimeSlider = screen.getByRole("slider");
    fireEvent.change(waitTimeSlider, { target: { value: "240" } });

    expect(mockOnWaitTimeChange).toHaveBeenCalledWith(240);
  });
});