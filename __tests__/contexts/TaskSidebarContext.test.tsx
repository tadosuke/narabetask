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

  it("handleNameChangeでタスク名を変更できる", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("新しい名前");
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      name: "新しい名前",
    });
  });

  it("handleDurationChangeでタスクの所要時間を変更できる", () => {
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

  it("タスク名が空の場合は更新されない", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("");
    });

    expect(mockOnTaskUpdate).not.toHaveBeenCalled();
  });

  it("タスク名に空白がある場合はトリムされて更新される", () => {
    const wrapper = createWrapper(mockTask);
    const { result } = renderHook(() => useTaskSidebarContext(), { wrapper });

    act(() => {
      result.current.handleNameChange("  新しい名前  ");
    });

    expect(mockOnTaskUpdate).toHaveBeenCalledWith({
      ...mockTask,
      name: "新しい名前",
    });
  });
});