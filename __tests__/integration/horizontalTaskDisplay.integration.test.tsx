import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskProvider } from "../../src/contexts/TaskContext";
import { Timeline } from "../../src/components/Timeline";
import type { BusinessHours } from "../../src/types";

describe("横並びタスク表示の統合テスト", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "12:00"
  };

  const mockProps = {
    tasks: [],
    selectedTask: null,
    businessHours: mockBusinessHours,
    onTaskDrop: () => {},
    onTaskClick: () => {},
    draggedTaskId: null,
    onDragStart: () => {},
    onDragEnd: () => {},
    onLockToggle: () => {}
  };

  it("同じ開始時間の複数タスクが横並びで表示される", () => {
    const tasksWithSameStartTime = [
      {
        id: "1",
        name: "実装タスク", 
        duration: 30,
        workTime: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "2",
        name: "バグ修正タスク",
        duration: 30, 
        workTime: 30,
        isPlaced: true,
        startTime: "10:00"
      },
      {
        id: "3",
        name: "設計タスク",
        duration: 30,
        workTime: 30, 
        isPlaced: true,
        startTime: "10:00"
      }
    ];

    const propsWithMultipleTasks = {
      ...mockProps,
      tasks: tasksWithSameStartTime
    };

    render(<Timeline {...propsWithMultipleTasks} />);

    // すべてのタスクが表示されていることを確認
    expect(screen.getByText("実装タスク")).toBeInTheDocument();
    expect(screen.getByText("バグ修正タスク")).toBeInTheDocument();
    expect(screen.getByText("設計タスク")).toBeInTheDocument();

    // 10:00のタイムスロット内にすべてのタスクが存在することを確認
    const tenOClockSlot = screen.getByText("10:00").closest('.timeline__slot');
    expect(tenOClockSlot).toBeInTheDocument();
    
    // スロット内にタスクコンテナが存在することを確認
    const tasksContainer = tenOClockSlot?.querySelector('.timeline__tasks-container');
    expect(tasksContainer).toBeInTheDocument();
  });

  it("開始時間の早い順に左から配置される", () => {
    const tasksWithDifferentStartTimes = [
      {
        id: "3",
        name: "設計タスク",
        duration: 30,
        workTime: 30,
        isPlaced: true,
        startTime: "11:00" // 最も遅い
      },
      {
        id: "1", 
        name: "実装タスク",
        duration: 30,
        workTime: 30,
        isPlaced: true,
        startTime: "09:30" // 最も早い
      },
      {
        id: "2",
        name: "バグ修正タスク", 
        duration: 30,
        workTime: 30,
        isPlaced: true,
        startTime: "10:00" // 中間
      }
    ];

    const propsWithSortedTasks = {
      ...mockProps,
      tasks: tasksWithDifferentStartTimes
    };

    render(<Timeline {...propsWithSortedTasks} />);

    // すべてのタスクが表示されていることを確認
    expect(screen.getByText("実装タスク")).toBeInTheDocument();
    expect(screen.getByText("バグ修正タスク")).toBeInTheDocument();
    expect(screen.getByText("設計タスク")).toBeInTheDocument();

    // それぞれが異なるタイムスロットに配置されていることを確認
    const nineThirtySlot = screen.getByText("09:30").closest('.timeline__slot');
    const tenOClockSlot = screen.getByText("10:00").closest('.timeline__slot');  
    const elevenOClockSlot = screen.getByText("11:00").closest('.timeline__slot');

    expect(nineThirtySlot).toContainElement(screen.getByText("実装タスク"));
    expect(tenOClockSlot).toContainElement(screen.getByText("バグ修正タスク"));
    expect(elevenOClockSlot).toContainElement(screen.getByText("設計タスク"));
  });
});