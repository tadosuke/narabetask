import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskDurationField } from "../../src/components/TaskDurationField";

describe("TaskDurationField", () => {
  const defaultProps = {
    duration: 60,
    onDurationChange: vi.fn(),
  };

  it("スライダーとラベルが表示される", () => {
    render(<TaskDurationField {...defaultProps} />);

    expect(screen.getByLabelText("工数")).toBeInTheDocument();
    expect(screen.getByText("工数")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("プロパティで渡された所要時間が表示される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");
    expect(durationSlider).toHaveValue("60");
    expect(screen.getByText("1時間")).toBeInTheDocument();
  });

  it("スライダーの最小値、最大値、ステップが正しく設定される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");
    expect(durationSlider).toHaveAttribute("min", "15");
    expect(durationSlider).toHaveAttribute("max", "240");
    expect(durationSlider).toHaveAttribute("step", "15");
  });

  it("所要時間が変更されたときにonDurationChangeを呼び出す", () => {
    const mockOnDurationChange = vi.fn();
    render(<TaskDurationField {...defaultProps} onDurationChange={mockOnDurationChange} />);

    const durationSlider = screen.getByRole("slider");
    fireEvent.change(durationSlider, { target: { value: "45" } });

    expect(mockOnDurationChange).toHaveBeenCalledWith(45);
  });

  it("分単位の時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} duration={30} />);

    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("時間単位の時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} duration={120} />);

    expect(screen.getByText("2時間")).toBeInTheDocument();
  });

  it("時間と分を組み合わせた時間を正しくフォーマットする", () => {
    render(<TaskDurationField {...defaultProps} duration={90} />);

    expect(screen.getByText("1時間30分")).toBeInTheDocument();
  });

  it("正しいIDが設定される", () => {
    render(<TaskDurationField {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");
    expect(durationSlider).toHaveAttribute("id", "task-duration");
  });

  it("最小値でonDurationChangeを呼び出す", () => {
    const mockOnDurationChange = vi.fn();
    render(<TaskDurationField {...defaultProps} onDurationChange={mockOnDurationChange} />);

    const durationSlider = screen.getByRole("slider");
    fireEvent.change(durationSlider, { target: { value: "15" } });

    expect(mockOnDurationChange).toHaveBeenCalledWith(15);
  });

  it("最大値でonDurationChangeを呼び出す", () => {
    const mockOnDurationChange = vi.fn();
    render(<TaskDurationField {...defaultProps} onDurationChange={mockOnDurationChange} />);

    const durationSlider = screen.getByRole("slider");
    fireEvent.change(durationSlider, { target: { value: "240" } });

    expect(mockOnDurationChange).toHaveBeenCalledWith(240);
  });
});