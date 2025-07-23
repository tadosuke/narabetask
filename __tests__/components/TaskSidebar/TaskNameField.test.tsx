import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskNameField } from "../../../src/components/TaskSidebar/TaskNameField";

describe("TaskNameField", () => {
  const defaultProps = {
    name: "テストタスク名",
    onNameChange: vi.fn()
  };

  it("入力フィールドにラベルが表示される", () => {
    render(<TaskNameField {...defaultProps} />);

    expect(screen.getByLabelText("タスク名")).toBeInTheDocument();
    expect(screen.getByText("タスク名")).toBeInTheDocument();
  });

  it("プロパティで渡された名前が表示される", () => {
    render(<TaskNameField {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名");
    expect(nameInput).toHaveValue("テストタスク名");
  });

  it("プレースホルダーが表示される", () => {
    render(<TaskNameField {...defaultProps} name="" />);

    const nameInput = screen.getByLabelText("タスク名");
    expect(nameInput).toHaveAttribute("placeholder", "タスク名を入力");
  });

  it("名前が変更されたときにonNameChangeを呼び出す", () => {
    const mockOnNameChange = vi.fn();
    
    render(<TaskNameField {...defaultProps} onNameChange={mockOnNameChange} />);

    const nameInput = screen.getByLabelText("タスク名");
    fireEvent.change(nameInput, { target: { value: "新しいタスク名" } });

    expect(mockOnNameChange).toHaveBeenCalledWith("新しいタスク名");
  });

  it("入力フィールドにフォーカスしたときにテキストが全選択される", async () => {
    const user = userEvent.setup();
    render(<TaskNameField {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名") as HTMLInputElement;
    
    // Focus the input field
    await user.click(nameInput);

    // Check that all text is selected
    expect(nameInput.selectionStart).toBe(0);
    expect(nameInput.selectionEnd).toBe(nameInput.value.length);
    expect(nameInput.value).toBe("テストタスク名");
  });

  it("正しいIDが設定される", () => {
    render(<TaskNameField {...defaultProps} />);

    const nameInput = screen.getByLabelText("タスク名");
    expect(nameInput).toHaveAttribute("id", "task-name");
  });
});