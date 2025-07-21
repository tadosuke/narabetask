import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskSidebar } from "../../src/components/TaskSidebar";
import type { Task } from "../../src/types";

describe("TaskSidebar", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  const mockPlacedTask: Task = {
    id: "2",
    name: "配置済みタスク",
    duration: 30,
    resourceTypes: ["others"],
    isPlaced: true,
    startTime: "09:00",
  };

  const defaultProps = {
    selectedTask: mockTask,
    onTaskUpdate: vi.fn(),
    onTaskRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByText("リソースタイプ")).toBeInTheDocument();
  });

  it("フォームフィールドに選択されたタスクのデータを入力する", () => {
    render(<TaskSidebar {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("テストタスク");
    const durationSlider = screen.getByRole('slider');
    
    // Check that the "自分" checkbox is checked
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });

    expect(nameInput).toBeInTheDocument();
    expect(durationSlider).toBeInTheDocument();
    expect(durationSlider).toHaveValue("60"); // 1時間 = 60分
    expect(selfCheckbox).toBeChecked();
    
    // Check that duration display shows "1時間"
    expect(screen.getByText("1時間")).toBeInTheDocument();
  });

  it("配置済みタスクの場合は時間情報も表示する", () => {
    render(<TaskSidebar {...defaultProps} selectedTask={mockPlacedTask} />);

    // Check main form fields are present
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("配置済みタスク")).toBeInTheDocument();
    
    // Check time information is shown
    expect(screen.getByText("開始時間:")).toBeInTheDocument();
    expect(screen.getByText("終了時間:")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("削除ボタンが表示され、保存ボタンは表示されない", () => {
    render(<TaskSidebar {...defaultProps} />);

    expect(screen.getByText("削除")).toBeInTheDocument();
    expect(screen.queryByText("保存")).not.toBeInTheDocument();
  });

  it("タスクが変更されたときにフォーム全体をリセットする", () => {
    const { rerender } = render(<TaskSidebar {...defaultProps} />);

    // Check initial task data
    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
    const durationSlider = screen.getByRole('slider');
    expect(durationSlider).toHaveValue("60");
    expect(screen.getByText("1時間")).toBeInTheDocument();
    
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });
    expect(selfCheckbox).toBeChecked();

    // Switch to new task
    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 30,
      resourceTypes: ["machine"],
      isPlaced: false,
    };

    rerender(<TaskSidebar {...defaultProps} selectedTask={newTask} />);

    // Check that all fields have been updated
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
    expect(durationSlider).toHaveValue("30");
    expect(screen.getByText("30分")).toBeInTheDocument();
    
    const machineCheckbox = screen.getByRole('checkbox', { name: 'マシンパワー' });
    expect(machineCheckbox).toBeChecked();
    
    // Verify previous selections are cleared
    expect(selfCheckbox).not.toBeChecked();
  });

  it("すべてのサブコンポーネントが統合されて動作する", () => {
    render(<TaskSidebar {...defaultProps} />);

    // Verify all sub-components are rendered
    // TaskNameField
    expect(screen.getByLabelText("タスク名")).toBeInTheDocument();
    
    // TaskDurationField
    expect(screen.getByLabelText("工数")).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    
    // TaskResourceTypesField
    expect(screen.getByText("リソースタイプ")).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '自分' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '他人' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'マシンパワー' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'ネットワーク' })).toBeInTheDocument();
    
    // TaskDeleteButton
    expect(screen.getByText("削除")).toBeInTheDocument();
    
    // TaskInfoDisplay (should not be visible for unplaced task)
    expect(screen.queryByText("開始時間:")).not.toBeInTheDocument();
    expect(screen.queryByText("終了時間:")).not.toBeInTheDocument();
  });
});
