import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App";

describe("アプリ - タスクの選択解除", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タスクカードとサイドバーの外側をクリックした時にタスクの選択を解除する", async () => {
    render(<App />);
    
    // First, create a task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // Verify sidebar is open (task is selected)
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
    
    // Click on the main area outside task cards and sidebar
    const main = screen.getByRole("main");
    fireEvent.click(main);
    
    // Verify sidebar is closed (task is deselected)
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
  });

  it("タスクカードをクリックした時はタスクの選択を解除しない", async () => {
    render(<App />);
    
    // Create a task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // Verify sidebar is open
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    
    // Click on the task card itself
    const taskCard = screen.getByText("新しいタスク").closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    fireEvent.click(taskCard!);
    
    // Verify sidebar remains open (task remains selected)
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
  });

  it("サイドバー内をクリックした時はタスクの選択を解除しない", async () => {
    render(<App />);
    
    // Create a task
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);
    
    // Verify sidebar is open
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    
    // Click on an input field in the sidebar
    const taskNameInput = screen.getByDisplayValue("新しいタスク");
    fireEvent.click(taskNameInput);
    
    // Verify sidebar remains open (task remains selected)
    expect(screen.getByText("タスク設定")).toBeInTheDocument();
    expect(screen.getByDisplayValue("新しいタスク")).toBeInTheDocument();
  });

  it("タスクが選択されていない時に選択解除をトリガーしない", async () => {
    render(<App />);
    
    // Initially no task is selected
    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
    
    // Click on the main area
    const main = screen.getByRole("main");
    fireEvent.click(main);
    
    // Should remain in the same state
    expect(screen.getByText("タスクを選択してください")).toBeInTheDocument();
    expect(screen.queryByText("タスク設定")).not.toBeInTheDocument();
  });
});