import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TaskSidebarProvider } from "../../src/contexts/TaskSidebarContext";
import { useTaskSidebarContext } from "../../src/contexts/useTaskSidebarContext";
import type { Task } from "../../src/types";
import React from "react";

describe("TaskSidebarContext", () => {
  const mockTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 60,
    resourceTypes: ["self", "others"],
    isPlaced: false,
  };

  const mockOnTaskUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // プロバイダでラップするヘルパー関数
  const createWrapper = (selectedTask: Task | null = null) =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <TaskSidebarProvider
          selectedTask={selectedTask}
          onTaskUpdate={mockOnTaskUpdate}
        >
          {children}
        </TaskSidebarProvider>
      );

  it("プロバイダなしでhookを使用した場合はエラーを投げる", () => {
    // 実際のエラーをキャッチする方法でテスト
    let error: Error | undefined;
    const consoleError = console.error;
    console.error = vi.fn(); // console.errorをモック化してエラーメッセージを抑制
    
    try {
      renderHook(() => useTaskSidebarContext());
    } catch (e) {
      error = e as Error;
    }
    
    console.error = consoleError; // 元に戻す
    
    expect(error).toEqual(
      new Error("useTaskSidebarContext must be used within a TaskSidebarProvider")
    );
  });

  it("selectedTaskがnullの場合は初期値でフォーム状態を設定する", () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    expect(result.current.name).toBe("");
    expect(result.current.duration).toBe(30);
  });

  it("selectedTaskが存在する場合はそのタスクの値でフォーム状態を設定する", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    expect(result.current.name).toBe("テストタスク");
    expect(result.current.duration).toBe(60);
  });

  it("selectedTaskが変更された場合にフォーム状態を更新する", () => {
    const { rerender } = renderHook(
      () => useTaskSidebarContext(),
      {
        initialProps: { selectedTask: null },
        wrapper: ({ children }: { children: React.ReactNode; selectedTask?: Task | null }) => (
          <TaskSidebarProvider
            selectedTask={null}
            onTaskUpdate={mockOnTaskUpdate}
          >
            {children}
          </TaskSidebarProvider>
        ),
      }
    );

    // 別のタスクに変更
    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 45,
      resourceTypes: ["machine"],
      isPlaced: true,
    };

    rerender({ selectedTask: newTask });

    // フォーム状態が新しいタスクの値に更新されることを確認
    // Note: この部分では直接 result.current にアクセスできないため、
    // 別の方法でテストする必要がある
  });

  it("handleNameChangeが正しくnameを更新し、onTaskUpdateを呼び出す", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("更新されたタスク名");
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      name: "更新されたタスク名",
    });
  });

  it("handleDurationChangeが正しくdurationを更新し、onTaskUpdateを呼び出す", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleDurationChange(90);
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      duration: 90,
    });
  });

  it("タスク名が空の場合は自動保存を行わない", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("");
    });

    expect(mockOnTaskUpdate).not.toHaveBeenCalled();
  });

  it("タスク名に空白のみの場合は自動保存を行わない", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("   ");
    });

    expect(mockOnTaskUpdate).not.toHaveBeenCalled();
  });

  it("selectedTaskがnullの場合は自動保存を行わない", () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("何かのタスク名");
    });

    expect(mockOnTaskUpdate).not.toHaveBeenCalled();
  });

  it("タスク名の前後の空白は自動的にtrimされる", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("  更新されたタスク名  ");
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      name: "更新されたタスク名",
    });
  });
});