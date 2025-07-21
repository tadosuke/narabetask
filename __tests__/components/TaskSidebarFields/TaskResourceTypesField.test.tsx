import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskResourceTypesField } from "../../../src/components/TaskSidebarFields/TaskResourceTypesField";
import type { Task } from "../../../src/types";

describe("TaskResourceTypesField", () => {
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

  it("すべてのリソースタイプオプションを表示する", () => {
    render(<TaskResourceTypesField {...defaultProps} />);

    expect(screen.getByText("自分")).toBeInTheDocument();
    expect(screen.getByText("他人")).toBeInTheDocument();
    expect(screen.getByText("マシンパワー")).toBeInTheDocument();
    expect(screen.getByText("ネットワーク")).toBeInTheDocument();
  });

  it("選択されたタスクのリソースタイプを正しく表示する", () => {
    render(<TaskResourceTypesField {...defaultProps} />);

    // Check that the "自分" checkbox is checked
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });
    expect(selfCheckbox).toBeChecked();

    // Check that other checkboxes are not checked
    const othersCheckbox = screen.getByRole('checkbox', { name: '他人' });
    const machineCheckbox = screen.getByRole('checkbox', { name: 'マシンパワー' });
    const networkCheckbox = screen.getByRole('checkbox', { name: 'ネットワーク' });
    
    expect(othersCheckbox).not.toBeChecked();
    expect(machineCheckbox).not.toBeChecked();
    expect(networkCheckbox).not.toBeChecked();
  });

  it("変更されたときにリソースタイプを更新する", async () => {
    const user = userEvent.setup();
    render(<TaskResourceTypesField {...defaultProps} />);

    // Find the "他人" checkbox by its label text
    const othersCheckbox = screen.getByRole('checkbox', { name: '他人' });
    await user.click(othersCheckbox);

    expect(othersCheckbox).toBeChecked();
  });

  it("リソースタイプが変更されたときに自動的にonTaskUpdateを呼び出す", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskResourceTypesField {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    // Find the "他人" checkbox by its label text
    const othersCheckbox = screen.getByRole('checkbox', { name: '他人' });
    await user.click(othersCheckbox);

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        resourceTypes: ['self', 'others'],
      });
    });
  });

  it("リソースタイプが選択されていない場合でも有効なタスク名があれば自動保存を行う", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    
    // リソースタイプが空のタスクを使用
    const taskWithNoResources = { ...mockTask, resourceTypes: [] };
    render(<TaskResourceTypesField {...defaultProps} selectedTask={taskWithNoResources} onTaskUpdate={mockOnTaskUpdate} />);

    // Add a resource type
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });
    await user.click(selfCheckbox);

    // Should save with the new resource type
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...taskWithNoResources,
        resourceTypes: ['self'],
      });
    });
  });

  it("すべてのリソースタイプのチェックを外した場合でもタスクが更新される", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskResourceTypesField {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    // 「自分」のチェックボックスを取得
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });
    expect(selfCheckbox).toBeChecked();

    // 「自分」のチェックを外す
    await user.click(selfCheckbox);

    // タスクが空のresourceTypesで更新されることを確認
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        resourceTypes: [],
      });
    });
  });

  it("複数のリソースタイプを選択できる", async () => {
    const mockOnTaskUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskResourceTypesField {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />);

    // Add "他人" to existing "自分"
    const othersCheckbox = screen.getByRole('checkbox', { name: '他人' });
    await user.click(othersCheckbox);

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        resourceTypes: ['self', 'others'],
      });
    });

    // Add "マシンパワー" as well
    const machineCheckbox = screen.getByRole('checkbox', { name: 'マシンパワー' });
    await user.click(machineCheckbox);

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        resourceTypes: ['self', 'others', 'machine'],
      });
    });
  });

  it("タスクが変更されたときにリソースタイプをリセットする", () => {
    const { rerender } = render(<TaskResourceTypesField {...defaultProps} />);

    // Check initial state
    const selfCheckbox = screen.getByRole('checkbox', { name: '自分' });
    expect(selfCheckbox).toBeChecked();

    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 30,
      resourceTypes: ["machine", "network"],
      isPlaced: false,
    };

    rerender(<TaskResourceTypesField {...defaultProps} selectedTask={newTask} />);

    // Check that new resource types are selected
    const machineCheckbox = screen.getByRole('checkbox', { name: 'マシンパワー' });
    const networkCheckbox = screen.getByRole('checkbox', { name: 'ネットワーク' });
    expect(machineCheckbox).toBeChecked();
    expect(networkCheckbox).toBeChecked();

    // Check that previous resource type is no longer selected
    expect(selfCheckbox).not.toBeChecked();
  });
});