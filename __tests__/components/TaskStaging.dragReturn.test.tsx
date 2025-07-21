import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TaskStaging } from "../../src/components/TaskStaging";
import type { Task } from "../../src/types";

describe("TaskStaging - Drag Return Functionality", () => {
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

  it("should handle drag over event on staging area", () => {
    const { container } = render(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    const dragOverEvent = new Event("dragover", { bubbles: true });
    Object.defineProperty(dragOverEvent, "preventDefault", { value: vi.fn() });

    fireEvent(stagingArea!, dragOverEvent);
    
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
  });

  it("should add drag-over class when dragging over staging area", () => {
    const { container } = render(<TaskStaging {...defaultProps} />);
    
    const stagingArea = container.querySelector('.task-staging');
    
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(stagingArea!, dragEnterEvent);
    
    expect(stagingArea).toHaveClass('task-staging--drag-over');
  });

  it("should remove drag-over class when drag leaves staging area", () => {
    const { container } = render(<TaskStaging {...defaultProps} />);
    
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

  it("should call onTaskReturn when placed task is dropped on staging area", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = render(
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

  it("should not call onTaskReturn when unplaced task is dropped on staging area", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = render(
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

  it("should not call onTaskReturn when non-existent task is dropped", () => {
    const mockOnTaskReturn = vi.fn();
    const { container } = render(
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

  it("should call onDragEnd when drop occurs", () => {
    const mockOnDragEnd = vi.fn();
    const { container } = render(
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

  it("should remove drag-over class when drop occurs", () => {
    const { container } = render(<TaskStaging {...defaultProps} />);
    
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