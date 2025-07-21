import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App";

describe("アプリ - タスク作成時の選択", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("現在の選択状態に関係なく新しく作成されたタスクを自動的に選択する", async () => {
    render(<App />);
    
    // Initially no task is selected
    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
    
    // Create first task by clicking the add button
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // The new task should be automatically selected (sidebar should be open)
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
  });

  it("タイムラインで他のタスクが既に選択されている場合でも新しく作成されたタスクを選択する", async () => {
    render(<App />);
    
    // Create first task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // Verify first task is selected
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    const taskNameInput = screen.getByDisplayValue("新しいタスク");
    
    // Change the first task name to distinguish it
    fireEvent.change(taskNameInput, { target: { value: "First Task" } });
    
    // Now create a second task
    fireEvent.click(addButton);
    
    // The second task should now be selected (sidebar should show new task)
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
    
    // Should have two tasks in the staging area
    const taskCards = screen.getAllByText(/タスク|First Task/);
    // We should have at least the two task names visible somewhere
    expect(taskCards.length).toBeGreaterThanOrEqual(2);
  });

  it("タスク追加ボタンをクリックした後にタスクの選択を維持する", async () => {
    render(<App />);
    
    // Create a task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // Verify task is selected immediately after creation
    // The sidebar should be open showing the task settings
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
    
    // The task should remain selected - sidebar should not close
    // This tests that the add button click doesn't trigger deselection
    expect(screen.queryByText("タスクを選択してください")).not.toBeInTheDocument();
  });
});