import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App";

describe("アプリ - ドラッグ時のタスク選択", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タスクをドラッグ開始した時に自動的に選択状態にする", () => {
    render(<App />);

    // Create a task first
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);

    // The task should be selected after creation
    expect(screen.getByText("タスク設定")).toBeInTheDocument();

    // Click elsewhere to deselect the task
    const main = screen.getByRole('main');
    fireEvent.click(main);

    // Task should be deselected
    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();

    // Find the task card and start dragging it
    const taskCard = screen.getByText("新しいタスク").closest('.task-card');
    expect(taskCard).toBeInTheDocument();

    // Start drag operation
    const dragStartEvent = new Event("dragstart", { bubbles: true });
    Object.defineProperty(dragStartEvent, "dataTransfer", {
      value: { setData: vi.fn() }
    });
    fireEvent(taskCard!, dragStartEvent);

    // After drag start, the task should be selected
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.queryByText("タスクを選択してください")).not.toBeInTheDocument();
  });

  it("配置済みタスクをドラッグ開始した時に選択状態にする", () => {
    render(<App />);

    // Create a task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);

    // Change task name to identify it
    const taskNameInput = screen.getByDisplayValue("新しいタスク");
    fireEvent.change(taskNameInput, { target: { value: "Placed Task" } });

    // Find the task card and drag it to timeline
    const taskCard = screen.getByText("Placed Task").closest('.task-card');
    expect(taskCard).toBeInTheDocument();

    // Find a timeline slot and drop the task there
    const timeSlot = screen.getByText("09:00").closest('.timeline__slot');
    expect(timeSlot).toBeInTheDocument();

    // Simulate drag and drop to place the task
    const dragStartEvent = new Event("dragstart", { bubbles: true });
    const dragEndEvent = new Event("dragend", { bubbles: true });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dragStartEvent, "dataTransfer", {
      value: { setData: vi.fn() }
    });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn().mockReturnValue(taskCard!.getAttribute('data-task-id') || 'mock-task-id') }
    });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });

    fireEvent(taskCard!, dragStartEvent);
    fireEvent(timeSlot!, dropEvent);
    fireEvent(taskCard!, dragEndEvent);

    // Click elsewhere to deselect
    const main = screen.getByRole('main');
    fireEvent.click(main);
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();

    // Now drag the placed task
    const placedTaskCard = screen.getByText("Placed Task").closest('.task-card');
    expect(placedTaskCard).toBeInTheDocument();

    const placedDragStartEvent = new Event("dragstart", { bubbles: true });
    Object.defineProperty(placedDragStartEvent, "dataTransfer", {
      value: { setData: vi.fn() }
    });
    fireEvent(placedTaskCard!, placedDragStartEvent);

    // After drag start, the task should be selected
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Placed Task")).toBeInTheDocument();
  });
});