import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSidebar } from "../../../src/components/TaskSidebar/TaskSidebar";
import { TaskSidebarProvider } from "../../../src/contexts/TaskSidebarContext";
import type { Task } from "../../../src/types";

// window.confirmをモック
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn()
});

// TaskSidebarをProviderでラップするヘルパーコンポーネント
interface TaskSidebarWrapperProps {
  selectedTask: Task | null;
  onTaskUpdate: (task: Task) => void;
  onTaskRemove: (taskId: string) => void;
}

const TaskSidebarWrapper: React.FC<TaskSidebarWrapperProps> = ({
  selectedTask,
  onTaskUpdate,
  onTaskRemove
}) => (
  <TaskSidebarProvider 
    selectedTask={selectedTask}
    onTaskUpdate={onTaskUpdate}
  >
    <TaskSidebar
      selectedTask={selectedTask}
      onTaskRemove={onTaskRemove}
    />
  </TaskSidebarProvider>
);

// window.confirmをモック
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn()
});

describe("TaskSidebar", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    isPlaced: false
  };

  const mockPlacedTask: Task = {
    id: "2",
    name: "配置済みタスク",
    duration: 30,
    isPlaced: true,
    startTime: "09:00"
  };

  const defaultProps = {
    selectedTask: mockTask,
    onTaskUpdate: vi.fn(),
    onTaskRemove: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("タスクが選択されていない場合は空の状態を表示する", () => {
    render(<TaskSidebarWrapper {...defaultProps} selectedTask={null} />);

    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
  });

  it("タスクが選択されている場合はタスク設定フォームを表示する", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByLabelText("タスク名")).toBeInTheDocument();
    expect(screen.getByLabelText("工数")).toBeInTheDocument();
  });

  it("フォームフィールドに選択されたタスクのデータを入力する", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("テストタスク");
    const durationSlider = screen.getByRole("slider");

    expect(nameInput).toBeInTheDocument();
    expect(durationSlider).toBeInTheDocument();
    expect(durationSlider).toHaveValue("60"); // 1時間 = 60分

    // Check that duration display shows "1時間"
    expect(screen.getByText("1時間")).toBeInTheDocument();
  });

  it("配置済みタスクの開始時間と終了時間を表示する", () => {
    render(<TaskSidebarWrapper {...defaultProps} selectedTask={mockPlacedTask} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("配置されていないタスクの時間情報は'-'を表示する", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("変更されたときに名前入力を更新する", async () => {
    const user = userEvent.setup();
    render(<TaskSidebarWrapper {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名") as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, "新しいタスク名");

    expect(nameInput.value).toBe("新しいタスク名");
  });

  it("変更されたときに所要時間を更新する", async () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");

    // Change the slider value to 45 minutes
    fireEvent.change(durationSlider, { target: { value: "45" } });

    expect(durationSlider).toHaveValue("45");
  });

  it("タスク名が変更されたときに自動的にonTaskUpdateを呼び出す", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskSidebarWrapper {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const nameInput = screen.getByLabelText("タスク名");
    await user.clear(nameInput);
    await user.type(nameInput, "更新されたタスク");

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        name: "更新されたタスク"
      });
    });
  });

  it("所要時間が変更されたときに自動的にonTaskUpdateを呼び出す", async () => {
    const mockOnTaskUpdate = vi.fn();
    render(<TaskSidebarWrapper {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const durationSlider = screen.getByRole("slider");

    // Change the slider value to 45 minutes
    fireEvent.change(durationSlider, { target: { value: "45" } });

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 45
      });
    });
  });

  it("タスク名が空の場合は自動保存を行わない", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskSidebarWrapper {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const nameInput = screen.getByLabelText("タスク名");
    await user.clear(nameInput);

    // 空の名前では自動保存されない
    expect(mockOnTaskUpdate).not.toHaveBeenCalled();
  });

  it("保存ボタンが表示されない", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    expect(screen.queryByText("保存")).not.toBeInTheDocument();
  });

  it("削除ボタンのみが表示される", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    expect(screen.getByText("削除")).toBeInTheDocument();
    expect(screen.queryByText("保存")).not.toBeInTheDocument();
  });

  it("削除ボタンがクリックされ確認されたときにonTaskRemoveを呼び出す", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true
    );

    render(<TaskSidebarWrapper {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    fireEvent.click(screen.getByText("削除"));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).toHaveBeenCalledWith("1");
  });

  it("削除ボタンがクリックされたが確認されなかった場合はonTaskRemoveを呼び出さない", () => {
    const mockOnTaskRemove = vi.fn();
    (window.confirm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false
    );

    render(<TaskSidebarWrapper {...defaultProps} onTaskRemove={mockOnTaskRemove} />);

    fireEvent.click(screen.getByText("削除"));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockOnTaskRemove).not.toHaveBeenCalled();
  });

  it("スライダーで最小値と最大値を設定できる", async () => {
    const mockOnTaskUpdate = vi.fn();
    render(<TaskSidebarWrapper {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    const durationSlider = screen.getByRole("slider");

    // Test minimum value (15 minutes)
    fireEvent.change(durationSlider, { target: { value: "15" } });

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 15
      });
    });

    fireEvent.change(durationSlider, { target: { value: "240" } });

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        duration: 240
      });
    });
  });

  it("スライダーの最小値と最大値を正しく設定する", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");

    // Check slider attributes for the required range
    expect(durationSlider).toHaveAttribute("min", "15"); // 最小値15分
    expect(durationSlider).toHaveAttribute("max", "240"); // 最大値4時間
    expect(durationSlider).toHaveAttribute("step", "15"); // 15分刻み
  });

  it("所要時間の表示とスライダーの範囲を正しく設定する", () => {
    render(<TaskSidebarWrapper {...defaultProps} />);

    const durationSlider = screen.getByRole("slider");

    // Check slider attributes
    expect(durationSlider).toHaveAttribute("min", "15");
    expect(durationSlider).toHaveAttribute("max", "240");
    expect(durationSlider).toHaveAttribute("step", "15");

    // Check that duration displays are formatted correctly
    expect(screen.getByText("1時間")).toBeInTheDocument(); // default 60 minutes
  });

  it("タスクが変更されたときにフォームをリセットする", () => {
    const { rerender } = render(<TaskSidebarWrapper {...defaultProps} />);

    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();

    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 30,
      isPlaced: false
    };

    rerender(<TaskSidebarWrapper {...defaultProps} selectedTask={newTask} />);

    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();

    // Check that slider value is 30 and display shows "30分"
    const durationSlider = screen.getByRole("slider");
    expect(durationSlider).toHaveValue("30");
    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("タスク名入力フィールドにフォーカスしたときにテキストが全選択される", async () => {
    const user = userEvent.setup();
    render(<TaskSidebarWrapper {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名") as HTMLInputElement;

    // Focus the input field
    await user.click(nameInput);

    // Check that all text is selected
    expect(nameInput.selectionStart).toBe(0);
    expect(nameInput.selectionEnd).toBe(nameInput.value.length);
    expect(nameInput.value).toBe("テストタスク");
  });
});
