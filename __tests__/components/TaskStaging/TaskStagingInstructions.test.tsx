import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskStagingInstructions } from "../../../src/components/TaskStaging/TaskStagingInstructions";

describe("TaskStagingInstructions", () => {
  it("使い方のタイトルを表示する", () => {
    render(<TaskStagingInstructions />);
    expect(screen.getByText("使い方:")).toBeInTheDocument();
  });

  it("すべての説明項目を表示する", () => {
    render(<TaskStagingInstructions />);

    expect(
      screen.getByText("タスクをクリックして設定を編集")
    ).toBeInTheDocument();
    expect(
      screen.getByText("タスクをドラッグしてタイムラインに配置")
    ).toBeInTheDocument();
    expect(
      screen.getByText("配置したタスクをドラッグしてここに戻すことも可能")
    ).toBeInTheDocument();
  });

  it("正しいCSSクラスを持つ", () => {
    render(<TaskStagingInstructions />);
    
    const instructions = screen.getByText("使い方:").closest(".task-staging__instructions");
    expect(instructions).toBeInTheDocument();
  });
});