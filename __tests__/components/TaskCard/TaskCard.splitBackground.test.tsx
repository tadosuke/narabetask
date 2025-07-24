import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "../../../src/components/TaskCard/TaskCard";
import type { Task } from "../../../src/types";

describe("TaskCard - Split Background", () => {
  it("ステージングエリアのタスクで作業時間と待ち時間がある場合、分割背景が適用される", () => {
    const taskWithWorkAndWait: Task = {
      id: "1",
      name: "分割テストタスク",
      duration: 60,
      workTime: 30,
      waitTime: 30,
      isPlaced: false
    };

    render(<TaskCard task={taskWithWorkAndWait} />);
    
    const taskCard = screen.getByText("分割テストタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    
    // インラインスタイルでgradient背景が設定されているかチェック（ステージングエリアは横分割）
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, var(--taskcard-blue) 0%, var(--taskcard-blue) 50%, var(--taskcard-default) 50%, var(--taskcard-default) 100%)"
    });
  });

  it("ステージングエリアのタスクで作業時間のみの場合、100%青色の背景が適用される", () => {
    const taskWithWorkOnly: Task = {
      id: "2",
      name: "作業のみタスク",
      duration: 45,
      workTime: 45,
      waitTime: 0,
      isPlaced: false
    };

    render(<TaskCard task={taskWithWorkOnly} />);
    
    const taskCard = screen.getByText("作業のみタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    
    // 100%青色の背景が設定されているかチェック（ステージングエリアは横分割）
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, var(--taskcard-blue) 0%, var(--taskcard-blue) 100%, var(--taskcard-default) 100%, var(--taskcard-default) 100%)"
    });
  });

  it("ステージングエリアのタスクで待ち時間のみの場合、100%通常背景が適用される", () => {
    const taskWithWaitOnly: Task = {
      id: "3",
      name: "待ちのみタスク",
      duration: 60,
      workTime: 0,
      waitTime: 60,
      isPlaced: false
    };

    render(<TaskCard task={taskWithWaitOnly} />);
    
    const taskCard = screen.getByText("待ちのみタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    
    // 100%通常背景色が設定されているかチェック（ステージングエリアは横分割）
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, var(--taskcard-blue) 0%, var(--taskcard-blue) 0%, var(--taskcard-default) 0%, var(--taskcard-default) 100%)"
    });
  });

  it("作業時間・待ち時間が両方とも未定義の場合、分割背景は適用されない", () => {
    const taskWithoutWorkWait: Task = {
      id: "4",
      name: "時間未設定タスク",
      duration: 30,
      isPlaced: false
    };

    render(<TaskCard task={taskWithoutWorkWait} />);
    
    const taskCard = screen.getByText("時間未設定タスク").closest(".task-card");
    expect(taskCard).not.toHaveClass("task-card--split-background");
  });

  it("配置済みタスクの場合、分割背景が適用される（縦分割）", () => {
    const placedTaskWithWorkAndWait: Task = {
      id: "5",
      name: "配置済みタスク",
      duration: 90,
      workTime: 60,
      waitTime: 30,
      isPlaced: true,
      startTime: "09:00"
    };

    render(<TaskCard task={placedTaskWithWorkAndWait} />);
    
    const taskCard = screen.getByText("配置済みタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    
    // 配置済みタスクは縦分割（to bottom）
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to bottom, var(--taskcard-blue) 0%, var(--taskcard-blue) 66.66666666666666%, var(--taskcard-default) 66.66666666666666%, var(--taskcard-default) 100%)"
    });
  });

  it("選択済みタスクの場合、選択済み背景色で分割背景が適用される", () => {
    const selectedTaskWithWorkAndWait: Task = {
      id: "6",
      name: "選択済みタスク",
      duration: 120,
      workTime: 90,
      waitTime: 30,
      isPlaced: false
    };

    render(<TaskCard task={selectedTaskWithWorkAndWait} isSelected={true} />);
    
    const taskCard = screen.getByText("選択済みタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    expect(taskCard).toHaveClass("task-card--selected");
    
    // 選択済み背景色 (#e8f4fd) で分割背景が設定されているかチェック（ステージングエリアは横分割）
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, var(--taskcard-blue) 0%, var(--taskcard-blue) 75%, var(--taskcard-selected) 75%, var(--taskcard-selected) 100%)"
    });
  });

  it("配置済みタスクで作業時間のみの場合、100%青色の縦分割背景が適用される", () => {
    const placedTaskWithWorkOnly: Task = {
      id: "7",
      name: "配置済み作業のみタスク",
      duration: 45,
      workTime: 45,
      waitTime: 0,
      isPlaced: true,
      startTime: "10:00"
    };

    render(<TaskCard task={placedTaskWithWorkOnly} />);
    
    const taskCard = screen.getByText("配置済み作業のみタスク").closest(".task-card");
    expect(taskCard).toHaveClass("task-card--split-background");
    
    // 100%青色の縦分割背景が設定されているかチェック
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to bottom, var(--taskcard-blue) 0%, var(--taskcard-blue) 100%, var(--taskcard-default) 100%, var(--taskcard-default) 100%)"
    });
  });
});