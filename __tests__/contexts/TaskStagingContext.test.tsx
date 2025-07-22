import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskStagingProvider } from "../../src/contexts/TaskStagingContext";
import { useTaskStagingContext } from "../../src/contexts/useTaskStagingContext";
import type { Task } from "../../src/types";

// Test component that uses TaskStagingContext
const TestComponent: React.FC = () => {
  const {
    isDragOver,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    getUnplacedTasks,
    hasUnplacedTasks,
    isEmpty
  } = useTaskStagingContext();

  const mockTasks: Task[] = [
    {
      id: "1",
      name: "未配置タスク",
      duration: 30,
      isPlaced: false,
    },
    {
      id: "2", 
      name: "配置済みタスク",
      duration: 60,
      isPlaced: true,
      startTime: "09:00",
    }
  ];

  const handleTestDrop = (e: React.DragEvent) => {
    const mockOnTaskReturn = vi.fn();
    const mockOnDragEnd = vi.fn();
    handleDrop(e, mockOnTaskReturn, mockOnDragEnd, mockTasks);
  };

  return (
    <div>
      <div 
        data-testid="drag-area"
        className={isDragOver ? "drag-over" : ""}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleTestDrop}
      >
        Drag Area
      </div>
      <div data-testid="unplaced-count">
        {getUnplacedTasks(mockTasks).length}
      </div>
      <div data-testid="has-unplaced">
        {hasUnplacedTasks(mockTasks) ? "true" : "false"}
      </div>
      <div data-testid="is-empty">
        {isEmpty(mockTasks) ? "true" : "false"}
      </div>
      <div data-testid="is-empty-empty">
        {isEmpty([]) ? "true" : "false"}
      </div>
    </div>
  );
};

describe("TaskStagingContext", () => {
  it("useTaskStagingContextをプロバイダ外で使用すると例外が発生する", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTaskStagingContext must be used within a TaskStagingProvider");
  });

  it("プロバイダ内でコンテキストが正常に動作する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    expect(screen.getByTestId("drag-area")).toBeInTheDocument();
  });

  it("ドラッグオーバー状態を正しく管理する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    const dragArea = screen.getByTestId("drag-area");

    // 初期状態ではdrag-overクラスは付かない
    expect(dragArea).not.toHaveClass("drag-over");

    // ドラッグエンターでdrag-overクラスが付く
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(dragArea, dragEnterEvent);

    expect(dragArea).toHaveClass("drag-over");
  });

  it("getUnplacedTasksが未配置のタスクのみを返す", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    // 未配置のタスクは1つ（id: "1"）
    expect(screen.getByTestId("unplaced-count")).toHaveTextContent("1");
  });

  it("hasUnplacedTasksが正しく判定する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    // 未配置のタスクが存在するのでtrue
    expect(screen.getByTestId("has-unplaced")).toHaveTextContent("true");
  });

  it("isEmptyが正しく判定する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    // タスクがあるのでfalse
    expect(screen.getByTestId("is-empty")).toHaveTextContent("false");
    // 空の配列の場合はtrue
    expect(screen.getByTestId("is-empty-empty")).toHaveTextContent("true");
  });

  it("ドラッグリーブ時に適切にdrag-overクラスを削除する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    const dragArea = screen.getByTestId("drag-area");

    // まずドラッグエンターでクラスを追加
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(dragArea, dragEnterEvent);

    expect(dragArea).toHaveClass("drag-over");

    // ドラッグリーブでクラスを削除
    const dragLeaveEvent = new Event("dragleave", { bubbles: true });
    Object.defineProperty(dragLeaveEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dragLeaveEvent, "relatedTarget", { value: document.body });
    Object.defineProperty(dragLeaveEvent, "currentTarget", { value: dragArea });
    fireEvent(dragArea, dragLeaveEvent);

    expect(dragArea).not.toHaveClass("drag-over");
  });

  it("ドロップ時にdrag-overクラスを削除する", () => {
    render(
      <TaskStagingProvider>
        <TestComponent />
      </TaskStagingProvider>
    );

    const dragArea = screen.getByTestId("drag-area");

    // まずドラッグエンターでクラスを追加
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(dragArea, dragEnterEvent);

    expect(dragArea).toHaveClass("drag-over");

    // ドロップでクラスを削除
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: () => "test-id" }
    });
    fireEvent(dragArea, dropEvent);

    expect(dragArea).not.toHaveClass("drag-over");
  });
});