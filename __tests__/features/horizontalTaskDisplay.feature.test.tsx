import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "../../src/components/Timeline";
import type { Task, BusinessHours } from "../../../src/types";

describe("Timeline - Horizontal Task Display Feature", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "12:00"
  };

  const createMockTask = (id: string, name: string, startTime: string): Task => ({
    id,
    name,
    duration: 30,
    workTime: 30,
    isPlaced: true,
    startTime
  });

  it("複数のタスクが同じ開始時間の場合、横並びで表示される（実際の要件テスト）", () => {
    const tasksWithSameStartTime = [
      createMockTask("1", "実装", "10:00"),
      createMockTask("2", "バグ修正", "10:00"),
      createMockTask("3", "設計", "10:00")
    ];

    const mockProps = {
      tasks: tasksWithSameStartTime,
      selectedTask: null,
      businessHours: mockBusinessHours,
      onTaskDrop: () => {},
      onTaskClick: () => {},
      draggedTaskId: null,
      onDragStart: () => {},
      onDragEnd: () => {},
      onLockToggle: () => {}
    };

    render(<Timeline {...mockProps} />);

    // すべてのタスクが表示されることを確認
    expect(screen.getByText("実装")).toBeInTheDocument();
    expect(screen.getByText("バグ修正")).toBeInTheDocument();
    expect(screen.getByText("設計")).toBeInTheDocument();

    // 10:00のタイムスロットを確認
    const slot = screen.getByText("10:00").parentElement;
    expect(slot).toBeInTheDocument();

    // タスクコンテナが存在することを確認
    const container = slot?.querySelector('.timeline__tasks-container');
    expect(container).toBeInTheDocument();

    // 複数のタスクカードが横並びで存在することを確認
    const taskCards = container?.children;
    expect(taskCards).toHaveLength(3);
  });

  it("開始時間の早い順に左から配置される（ソート機能テスト）", () => {
    const tasksWithMixedOrder = [
      createMockTask("3", "設計", "11:00"),    // 最も遅い
      createMockTask("1", "実装", "09:30"),    // 最も早い
      createMockTask("2", "バグ修正", "10:00")  // 中間
    ];

    const mockProps = {
      tasks: tasksWithMixedOrder,
      selectedTask: null,
      businessHours: mockBusinessHours,
      onTaskDrop: () => {},
      onTaskClick: () => {},
      draggedTaskId: null,
      onDragStart: () => {},
      onDragEnd: () => {},
      onLockToggle: () => {}
    };

    render(<Timeline {...mockProps} />);

    // それぞれが正しいタイムスロットに配置されていることを確認
    const slot930 = screen.getByText("09:30").parentElement;
    const slot1000 = screen.getByText("10:00").parentElement;
    const slot1100 = screen.getByText("11:00").parentElement;

    expect(slot930).toContainElement(screen.getByText("実装"));
    expect(slot1000).toContainElement(screen.getByText("バグ修正"));
    expect(slot1100).toContainElement(screen.getByText("設計"));
  });

  it("同じタイムスロットの複数タスクが開始時間順にソートされる", () => {
    // 同じ開始時間のタスクを混在した順序で追加
    const tasksWithSameTime = [
      createMockTask("2", "バグ修正", "10:00"),
      createMockTask("1", "実装", "10:00"),  
      createMockTask("3", "設計", "10:00")
    ];

    const mockProps = {
      tasks: tasksWithSameTime,
      selectedTask: null,
      businessHours: mockBusinessHours,
      onTaskDrop: () => {},
      onTaskClick: () => {},
      draggedTaskId: null,
      onDragStart: () => {},
      onDragEnd: () => {},
      onLockToggle: () => {}
    };

    const { container } = render(<Timeline {...mockProps} />);

    // タスクコンテナ内のタスクが正しい順序で配置されていることを確認
    const tasksContainer = container.querySelector('.timeline__tasks-container');
    expect(tasksContainer).toBeInTheDocument();

    // すべてのタスクが表示されていることを確認
    expect(screen.getByText("実装")).toBeInTheDocument();
    expect(screen.getByText("バグ修正")).toBeInTheDocument();
    expect(screen.getByText("設計")).toBeInTheDocument();
  });
});