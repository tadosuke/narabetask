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
    
    // インラインスタイルでgradient背景が設定されているかチェック
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, #2196F3 0%, #2196F3 50%, #f5f5f5 50%, #f5f5f5 100%)"
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
    
    // 100%青色の背景が設定されているかチェック
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, #2196F3 0%, #2196F3 100%, #f5f5f5 100%, #f5f5f5 100%)"
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
    
    // 100%通常背景色が設定されているかチェック
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, #2196F3 0%, #2196F3 0%, #f5f5f5 0%, #f5f5f5 100%)"
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

  it("配置済みタスクの場合、分割背景は適用されない", () => {
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
    expect(taskCard).not.toHaveClass("task-card--split-background");
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
    
    // 選択済み背景色 (#e8f4fd) で分割背景が設定されているかチェック
    expect(taskCard).toHaveStyle({
      background: "linear-gradient(to right, #2196F3 0%, #2196F3 75%, #e8f4fd 75%, #e8f4fd 100%)"
    });
  });
});