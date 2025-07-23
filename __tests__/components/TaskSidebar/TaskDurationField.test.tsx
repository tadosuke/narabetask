import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskDurationField } from "../../../src/components/TaskSidebar/TaskDurationField";

describe("TaskDurationField", () => {
  const defaultProps = {
    workTime: 60,
    waitTime: 30,
    onWorkTimeChange: vi.fn(),
    onWaitTimeChange: vi.fn()
  };

  it("工数ラベルと作業時間・待ち時間スライダーが表示される", () => {
    render(<TaskDurationField {...defaultProps} />);

    expect(screen.getByText("工数")).toBeInTheDocument();
    expect(screen.getByLabelText("作業時間")).toBeInTheDocument();
    expect(screen.getByLabelText("待ち時間")).toBeInTheDocument();
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("プロパティで渡された作業時間と待ち時間が表示される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const workTimeSlider = screen.getByLabelText("作業時間");
    const waitTimeSlider = screen.getByLabelText("待ち時間");
    
    expect(workTimeSlider).toHaveValue("60");
    expect(waitTimeSlider).toHaveValue("30");
    expect(screen.getByText("1時間")).toBeInTheDocument();
    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("作業時間スライダーの最小値、最大値、ステップが正しく設定される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const workTimeSlider = screen.getByLabelText("作業時間");
    expect(workTimeSlider).toHaveAttribute("min", "15");
    expect(workTimeSlider).toHaveAttribute("max", "240");
    expect(workTimeSlider).toHaveAttribute("step", "15");
  });

  it("待ち時間スライダーの最小値、最大値、ステップが正しく設定される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const waitTimeSlider = screen.getByLabelText("待ち時間");
    expect(waitTimeSlider).toHaveAttribute("min", "0");
    expect(waitTimeSlider).toHaveAttribute("max", "240");
    expect(waitTimeSlider).toHaveAttribute("step", "15");
  });

  it("作業時間が変更されたときにonWorkTimeChangeを呼び出す", () => {
    const mockOnWorkTimeChange = vi.fn();
    render(<TaskDurationField {...defaultProps} onWorkTimeChange={mockOnWorkTimeChange} />);

    const workTimeSlider = screen.getByLabelText("作業時間");
    fireEvent.change(workTimeSlider, { target: { value: "45" } });

    expect(mockOnWorkTimeChange).toHaveBeenCalledWith(45);
  });

  it("待ち時間が変更されたときにonWaitTimeChangeを呼び出す", () => {
    const mockOnWaitTimeChange = vi.fn();
    render(<TaskDurationField {...defaultProps} onWaitTimeChange={mockOnWaitTimeChange} />);

    const waitTimeSlider = screen.getByLabelText("待ち時間");
    fireEvent.change(waitTimeSlider, { target: { value: "60" } });

    expect(mockOnWaitTimeChange).toHaveBeenCalledWith(60);
  });

  it("合計時間が正しく表示される", () => {
    render(<TaskDurationField {...defaultProps} />);

    expect(screen.getByText("合計: 1時間30分")).toBeInTheDocument();
  });

  it("分単位の時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} workTime={30} waitTime={15} />);

    expect(screen.getByText("30分")).toBeInTheDocument();
    expect(screen.getByText("15分")).toBeInTheDocument();
    expect(screen.getByText("合計: 45分")).toBeInTheDocument();
  });

  it("時間単位の時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} workTime={120} waitTime={60} />);

    expect(screen.getByText("2時間")).toBeInTheDocument();
    expect(screen.getByText("1時間")).toBeInTheDocument();
    expect(screen.getByText("合計: 3時間")).toBeInTheDocument();
  });

  it("0分の待ち時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} workTime={60} waitTime={0} />);

    expect(screen.getByText("1時間")).toBeInTheDocument();
    expect(screen.getByText("0分")).toBeInTheDocument();
    expect(screen.getByText("合計: 1時間")).toBeInTheDocument();
  });
});