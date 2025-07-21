import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskActions } from "../../src/components/TaskActions";

// window.confirmをモック
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(),
});

describe("TaskActions", () => {
  const defaultProps = {
    taskId: "task-1",
    onTaskRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("削除ボタンが表示される", () => {
    render(<TaskActions {...defaultProps} />);

    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("削除ボタンに正しいCSSクラスが設定される", () => {
    render(<TaskActions {...defaultProps} />);

    const deleteButton = screen.getByText("削除");
    expect(deleteButton).toHaveClass("task-sidebar__remove");
  });

  it("削除ボタンがクリックされ確認されたときにonTaskRemoveを呼び出す", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<TaskActions {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).toHaveBeenCalledWith("task-1");
  });

  it("削除ボタンがクリックされたが確認されなかった場合はonTaskRemoveを呼び出さない", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<TaskActions {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).not.toHaveBeenCalled();
  });

  it("異なるタスクIDで正しくonTaskRemoveを呼び出す", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<TaskActions {...defaultProps} taskId="task-2" onTaskRemove={mockOnTaskRemove} />);

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(mockOnTaskRemove).toHaveBeenCalledWith("task-2");
  });

  it("削除確認のメッセージが正しく表示される", () => {
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<TaskActions {...defaultProps} />);

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
  });
});