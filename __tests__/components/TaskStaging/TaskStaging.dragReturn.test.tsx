import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TaskStagingProvider } from "../../../src/contexts/TaskStagingContext";
import { TaskStaging } from "../../../src/components/TaskStaging/TaskStaging";
import type { Task } from "../../../src/types";

// Helper function to render TaskStaging with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TaskStagingProvider>
      {component}
    </TaskStagingProvider>
  );
};

describe("タスクステージング - ドラッグ戻り機能", () => {
  const unplacedTask: Task = {
    id: "1",
    name: "未配置タスク",
    duration: 30,
    resourceType: "self",
    isPlaced: false,
  };

  const placedTask: Task = {
    id: "2",
    name: "配置済みタスク",
    duration: 60,
    resourceType: "others",
    isPlaced: true,
    startTime: "09:00",
  };

  const mockTasks: Task[] = [unplacedTask, placedTask];

  const defaultProps = {
    tasks: mockTasks,
    onTaskClick: vi.fn(),
    onAddTask: vi.fn(),
    onTaskReturn: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ステージングエリアでのドラッグオーバーイベントを処理する", () => {
    const { container } = renderWithProvider(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    const dragOverEvent = new Event("dragover", { bubbles: true });
    Object.defineProperty(dragOverEvent, "preventDefault", { value: vi.fn() });

    fireEvent(stagingArea!, dragOverEvent);
    
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
  });

  it("ステージングエリアの上でドラッグしている時にdrag-overクラスを追加する", () => {
    const { container } = renderWithProvider(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(stagingArea!, dragEnterEvent);
    
    expect(stagingArea).toHaveClass('task-staging--drag-over');
  });

  it("ドラッグがステージングエリアから離れた時にdrag-overクラスを削除する", () => {
    const { container } = renderWithProvider(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    
    // First trigger drag enter
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(stagingArea!, dragEnterEvent);
    
    expect(stagingArea).toHaveClass('task-staging--drag-over');
    
    // Then trigger drag leave
    const dragLeaveEvent = new Event("dragleave", { bubbles: true });
    Object.defineProperty(dragLeaveEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dragLeaveEvent, "relatedTarget", { value: document.body });
    Object.defineProperty(dragLeaveEvent, "currentTarget", { value: stagingArea });
    
    fireEvent(stagingArea!, dragLeaveEvent);
    
    expect(stagingArea).not.toHaveClass('task-staging--drag-over');
  });

  it("配置済みタスクがステージングエリアにドロップされた時にonTaskReturnを呼び出す", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = renderWithProvider(
      <TaskStaging {...defaultProps} onTaskReturn={mockOnTaskReturn} />
    );
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") }, // placed task id
    });
    
    fireEvent(stagingArea!, dropEvent);
    
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskReturn).toHaveBeenCalledWith("2");
  });

  it("未配置タスクがステージングエリアにドロップされた時はonTaskReturnを呼び出さない", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = renderWithProvider(
      <TaskStaging {...defaultProps} onTaskReturn={mockOnTaskReturn} />
    );
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "1") }, // unplaced task id
    });
    
    fireEvent(stagingArea!, dropEvent);
    
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskReturn).not.toHaveBeenCalled();
  });

  it("存在しないタスクがドロップされた時はonTaskReturnを呼び出さない", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = renderWithProvider(
      <TaskStaging {...defaultProps} onTaskReturn={mockOnTaskReturn} />
    );
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "nonexistent") },
    });
    
    fireEvent(stagingArea!, dropEvent);
    
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskReturn).not.toHaveBeenCalled();
  });

  it("ドロップが発生した時にonDragEndを呼び出す", () => {
    const mockOnDragEnd = vi.fn();
    const { container } = renderWithProvider(
      <TaskStaging {...defaultProps} onDragEnd={mockOnDragEnd} />
    );
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });
    
    fireEvent(stagingArea!, dropEvent);
    
    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it("ドロップが発生した時にdrag-overクラスを削除する", () => {
    const { container } = renderWithProvider(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    
    // First add drag-over class
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(stagingArea!, dragEnterEvent);
    
    expect(stagingArea).toHaveClass('task-staging--drag-over');
    
    // Then drop
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });
    
    fireEvent(stagingArea!, dropEvent);
    
    expect(stagingArea).not.toHaveClass('task-staging--drag-over');
  });
});