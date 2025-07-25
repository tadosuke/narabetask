import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../../src/App";

// window.confirm のモック
const originalConfirm = window.confirm;
beforeEach(() => {
  window.confirm = vi.fn();
});

afterEach(() => {
  window.confirm = originalConfirm;
});

describe("アプリ - Delete キー機能", () => {
  it("選択されたタスクでDeleteキーが押された時にタスクを削除する", async () => {
    // window.confirm をモックして true を返すようにする
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<App />);

    // 新しいタスクを追加
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);

    // タスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("新しいタスク")).toBeInTheDocument();
    });

    // タスクカードを取得して選択
    const taskCard = screen.getByText("新しいタスク").closest(".task-card");
    expect(taskCard).toBeInTheDocument();
    fireEvent.click(taskCard);

    // タスクが選択されていることを確認（サイドバーが表示される）
    await waitFor(() => {
      expect(screen.getByText("タスク設定")).toBeInTheDocument();
    });

    // Delete キーを押す
    fireEvent.keyDown(document, { key: "Delete" });

    // 確認ダイアログが表示されたことを確認
    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");

    // タスクが削除されることを確認
    await waitFor(() => {
      expect(screen.queryByText("新しいタスク")).not.toBeInTheDocument();
    });
  });

  it("Deleteキーが押されたがユーザーがキャンセルした場合はタスクを削除しない", async () => {
    // window.confirm をモックして false を返すようにする
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<App />);

    // 新しいタスクを追加
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);

    // タスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("新しいタスク")).toBeInTheDocument();
    });

    // タスクカードを取得して選択
    const taskCard = screen.getByText("新しいタスク").closest(".task-card");
    expect(taskCard).toBeInTheDocument();
    fireEvent.click(taskCard);

    // Delete キーを押す
    fireEvent.keyDown(document, { key: "Delete" });

    // 確認ダイアログが表示されたことを確認
    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");

    // タスクが削除されないことを確認
    expect(screen.getByText("新しいタスク")).toBeInTheDocument();
  });

  it("入力フィールドがフォーカスされている状態でDeleteキーが押された場合はタスクを削除しない", async () => {
    // Mock document.activeElement to simulate input field focus
    const originalActiveElement = document.activeElement;
    const mockInput = document.createElement("input");
    Object.defineProperty(document, "activeElement", {
      get: () => mockInput,
      configurable: true
    });

    vi.mocked(window.confirm).mockReturnValue(true);

    render(<App />);

    // 新しいタスクを追加
    const addButton = screen.getByText("+ 新しいタスク");
    fireEvent.click(addButton);

    // タスクが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("新しいタスク")).toBeInTheDocument();
    });

    // タスクカードを取得して選択
    const taskCard = screen.getByText("新しいタスク").closest(".task-card");
    expect(taskCard).toBeInTheDocument();
    fireEvent.click(taskCard);

    // Delete キーを押す（入力フィールドがフォーカスされている状態をシミュレート）
    fireEvent.keyDown(document, { key: "Delete" });

    // 確認ダイアログが表示されないことを確認（入力フィールドにフォーカスがあるため）
    expect(window.confirm).not.toHaveBeenCalled();

    // タスクが削除されないことを確認
    expect(screen.getByText("新しいタスク")).toBeInTheDocument();

    // Cleanup: restore original activeElement
    Object.defineProperty(document, "activeElement", {
      get: () => originalActiveElement,
      configurable: true
    });
  });
});
