import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSidebar } from "../../src/components/TaskSidebar";
import type { Task } from "../../src/types";

// window.confirmをモック
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(),
});

describe("TaskSidebar", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceType: "self",
    isPlaced: false,
  };

  const mockPlacedTask: Task = {
    id: "2",
    name: "配置済みタスク",
    duration: 30,
    resourceType: "others",
    isPlaced: true,
    startTime: "09:00",
  };

  const defaultProps = {
    selectedTask: mockTask,
    onTaskUpdate: vi.fn(),
    onTaskRemove: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("タスクが選択されていない場合は空の状態を表示する", () => {
    render(<TaskSidebar {...defaultProps} selectedTask={null} />);

    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
  });

  it("タスクが選択されている場合はタスク設定フォームを表示する", () => {
    render(<TaskSidebar {...defaultProps} />);

    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByLabelText("タスク名")).toBeInTheDocument();
    expect(screen.getByLabelText("工数")).toBeInTheDocument();
    expect(screen.getByLabelText("リソースタイプ")).toBeInTheDocument();
  });

  it("フォームフィールドに選択されたタスクのデータを入力する", () => {
    render(<TaskSidebar {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("テストタスク");
    const durationSelect = screen.getByDisplayValue("1時間");
    const resourceSelect = screen.getByDisplayValue("自分");

    expect(nameInput).toBeInTheDocument();
    expect(durationSelect).toBeInTheDocument();
    expect(resourceSelect).toBeInTheDocument();
  });

  it("配置済みタスクの開始時刻を表示する", () => {
    render(<TaskSidebar {...defaultProps} selectedTask={mockPlacedTask} />);

    expect(screen.getByText("配置時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("配置されていないタスクの開始時刻は表示しない", () => {
    render(<TaskSidebar {...defaultProps} />);

    expect(screen.queryByText("配置時間:")).not.toBeInTheDocument();
  });

  it("変更されたときに名前入力を更新する", async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名") as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, "新しいタスク名");

    expect(nameInput.value).toBe("新しいタスク名");
  });

  it("変更されたときに所要時間を更新する", async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);

    const durationSelect = screen.getByLabelText("工数");
    await user.selectOptions(durationSelect, "45");

    expect(durationSelect).toHaveValue("45");
  });

  it("変更されたときにリソースタイプを更新する", async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);

    const resourceSelect = screen.getByLabelText("リソースタイプ");
    await user.selectOptions(resourceSelect, "machine");

    expect(resourceSelect).toHaveValue("machine");
  });

  it("保存ボタンがクリックされたときにonTaskUpdateを呼び出す", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const nameInput = screen.getByLabelText("タスク名");
    const saveButton = screen.getByText("保存");

    await user.clear(nameInput);
    await user.type(nameInput, "更新されたタスク");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        name: "更新されたタスク",
      });
    });
  });

  it("名前が空の場合は保存ボタンを無効にする", async () => {
    const user = userEvent.setup();
    render(<TaskSidebar {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名");
    const saveButton = screen.getByText("保存");

    await user.clear(nameInput);

    expect(saveButton).toBeDisabled();
  });

  it("削除ボタンがクリックされ確認されたときにonTaskRemoveを呼び出す", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true
    );

    render(<TaskSidebar {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    fireEvent.click(screen.getByText("削除"));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).toHaveBeenCalledWith("1");
  });

  it("削除ボタンがクリックされたが確認されなかった場合はonTaskRemoveを呼び出さない", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false
    );

    render(<TaskSidebar {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    fireEvent.click(screen.getByText("削除"));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).not.toHaveBeenCalled();
  });

  it("閉じるボタンがクリックされたときにonCloseを呼び出す", () => {
    const mockOnClose = vi.fn();
    render(<TaskSidebar {...defaultProps} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("所要時間オプションを正しくフォーマットする", () => {
    render(<TaskSidebar {...defaultProps} />);

    // 一般的な所要時間オプションを確認
    expect(screen.getByText("15分")).toBeInTheDocument();
    expect(screen.getByText("30分")).toBeInTheDocument();
    expect(screen.getByText("1時間")).toBeInTheDocument();
    expect(screen.getByText("1時間30分")).toBeInTheDocument();
    expect(screen.getByText("2時間")).toBeInTheDocument();
  });

  it("すべてのリソースタイプオプションを表示する", () => {
    render(<TaskSidebar {...defaultProps} />);

    expect(screen.getByText("自分")).toBeInTheDocument();
    expect(screen.getByText("他人")).toBeInTheDocument();
    expect(screen.getByText("マシンパワー")).toBeInTheDocument();
    expect(screen.getByText("ネットワーク")).toBeInTheDocument();
  });

  it("タスクが変更されたときにフォームをリセットする", () => {
    const { rerender } = render(<TaskSidebar {...defaultProps} />);

    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();

    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 30,
      resourceType: "machine",
      isPlaced: false,
    };

    rerender(<TaskSidebar {...defaultProps} selectedTask={newTask} />);

    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30分")).toBeInTheDocument();
    expect(screen.getByDisplayValue("マシンパワー")).toBeInTheDocument();
  });
});
