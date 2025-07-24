import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskTotalTimeDisplay } from "../../../src/components/TaskSidebar/TaskTotalTimeDisplay";

describe("TaskTotalTimeDisplay", () => {
  it("作業時間と待ち時間を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={60} waitTime={30} />);

    expect(screen.getByText("合計時間")).toBeInTheDocument();
    expect(screen.getByText("作業: 1時間")).toBeInTheDocument();
    expect(screen.getByText("待ち: 30分")).toBeInTheDocument();
    expect(screen.getByText("= 1時間30分")).toBeInTheDocument();
  });

  it("作業時間のみの場合を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={45} waitTime={0} />);

    expect(screen.getByText("作業: 45分")).toBeInTheDocument();
    expect(screen.getByText("待ち: 0分")).toBeInTheDocument();
    expect(screen.getByText("= 45分")).toBeInTheDocument();
  });

  it("待ち時間のみの場合を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={0} waitTime={60} />);

    expect(screen.getByText("作業: 0分")).toBeInTheDocument();
    expect(screen.getByText("待ち: 1時間")).toBeInTheDocument();
    expect(screen.getByText("= 1時間")).toBeInTheDocument();
  });

  it("両方が0分の場合を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={0} waitTime={0} />);

    expect(screen.getByText("作業: 0分")).toBeInTheDocument();
    expect(screen.getByText("待ち: 0分")).toBeInTheDocument();
    expect(screen.getByText("= 0分")).toBeInTheDocument();
  });

  it("時間と分を含む場合を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={75} waitTime={105} />);

    expect(screen.getByText("作業: 1時間15分")).toBeInTheDocument();
    expect(screen.getByText("待ち: 1時間45分")).toBeInTheDocument();
    expect(screen.getByText("= 3時間")).toBeInTheDocument();
  });

  it("長時間の場合を正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={120} waitTime={120} />);

    expect(screen.getByText("作業: 2時間")).toBeInTheDocument();
    expect(screen.getByText("待ち: 2時間")).toBeInTheDocument();
    expect(screen.getByText("= 4時間")).toBeInTheDocument();
  });

  it("複雑な時間の組み合わせを正しく表示する", () => {
    render(<TaskTotalTimeDisplay workTime={135} waitTime={45} />);

    expect(screen.getByText("作業: 2時間15分")).toBeInTheDocument();
    expect(screen.getByText("待ち: 45分")).toBeInTheDocument();
    expect(screen.getByText("= 3時間")).toBeInTheDocument();
  });

  it("正しいCSSクラスが適用される", () => {
    const { container } = render(<TaskTotalTimeDisplay workTime={60} waitTime={30} />);

    expect(container.querySelector('.task-sidebar__total-time-display')).toBeInTheDocument();
    expect(container.querySelector('.task-sidebar__total-time-breakdown')).toBeInTheDocument();
    expect(container.querySelector('.task-sidebar__time-component')).toBeInTheDocument();
    expect(container.querySelector('.task-sidebar__time-separator')).toBeInTheDocument();
    expect(container.querySelector('.task-sidebar__total-time-value')).toBeInTheDocument();
  });
});