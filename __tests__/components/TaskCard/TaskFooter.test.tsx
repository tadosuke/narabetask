import { render, screen } from "@testing-library/react";
import { TaskFooter } from "../../../src/components/TaskCard/TaskFooter";
import { Task } from "../../../src/types";

const baseMockTask: Task = {
  id: "1",
  name: "テストタスク",
  duration: 30,
  isPlaced: false,
};

describe("TaskFooter", () => {
  it("ロックボタンが表示される（非配置タスクは無効状態）", () => {
    render(<TaskFooter task={baseMockTask} />);

    // ロックボタンが表示されることを確認
    const lockButton = screen.getByRole("button");
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toBeDisabled(); // 非配置タスクなので無効
  });

  it("配置済みタスクではロックボタンが有効になる", () => {
    const placedTask = {
      ...baseMockTask,
      isPlaced: true,
    } as Task;

    render(<TaskFooter task={placedTask} />);

    // ロックボタンが表示され、有効であることを確認
    const lockButton = screen.getByRole("button");
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).not.toBeDisabled();
  });

  it("ロック済みタスクではロック済みスタイルが適用される", () => {
    const lockedTask = {
      ...baseMockTask,
      isPlaced: true,
      isLocked: true,
    } as Task;

    render(<TaskFooter task={lockedTask} />);

    // ロックボタンが表示され、ロック済みスタイルが適用されることを確認
    const lockButton = screen.getByRole("button");
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toHaveClass("task-card__lock-button--locked");
  });
});
