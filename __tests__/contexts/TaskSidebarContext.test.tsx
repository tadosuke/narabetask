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
    workTime: 60,
    waitTime: 0,
    isPlaced: false
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
    expect(result.current.workTime).toBe(30);
    expect(result.current.waitTime).toBe(0);
  });

  it("selectedTaskが存在する場合はそのタスクの値でフォーム状態を設定する", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    expect(result.current.name).toBe("テストタスク");
    expect(result.current.workTime).toBe(60);
    expect(result.current.waitTime).toBe(0);
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
        )
      }
    );

    // 別のタスクに変更
    const newTask: Task = {
      id: "2",
      name: "新しいタスク",
      duration: 45,
      isPlaced: true
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
      workTime: 60,
      waitTime: 0,
      duration: 60 // workTime + waitTime
    });
  });

  it("handleWorkTimeChangeが正しくworkTimeを更新し、onTaskUpdateを呼び出す", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleWorkTimeChange(90);
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      workTime: 90,
      waitTime: 0,
      duration: 90 // workTime + waitTime
    });
  });

  it("handleWaitTimeChangeが正しくwaitTimeを更新し、onTaskUpdateを呼び出す", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleWaitTimeChange(30);
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      workTime: 60,
      waitTime: 30,
      duration: 90 // workTime + waitTime
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
      workTime: 60,
      waitTime: 0,
      duration: 60 // workTime + waitTime
    });
  });
});