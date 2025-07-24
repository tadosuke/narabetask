import React from "react";
import type { Task } from "../../types";
import { TaskHeader } from "./TaskHeader";
import { TaskFooter } from "./TaskFooter";
import "./TaskCard.css";

/**
 * TaskCardコンポーネントのプロパティ
 */
interface TaskCardProps {
  /** 表示するタスク */
  task: Task;
  /** クリック時のハンドラ */
  onClick?: () => void;
  /** ドラッグ開始時のハンドラ */
  onDragStart?: (e: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラ */
  onDragEnd?: (e: React.DragEvent) => void;
  /** ロック状態を切り替えるハンドラ */
  onLockToggle?: (taskId: string) => void;
  /** 追加のスタイル */
  style?: React.CSSProperties;
  /** 選択中かどうか */
  isSelected?: boolean;
  /** 重複しているかどうか */
  isOverlapping?: boolean;
}

/**
 * タスクカードコンポーネント
 * タスクの情報を表示し、ドラッグ&ドロップに対応します
 */

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  onLockToggle,
  style,
  isSelected = false,
  isOverlapping = false,
}) => {
  /** ドラッグ開始時の処理 */
  const handleDragStart = (e: React.DragEvent) => {
    // ロックされているタスクはドラッグできない
    if (task.isLocked) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData("text/plain", task.id);
    if (onDragStart) {
      onDragStart(e);
    }
  };

  /** タスクの高さを計算（15分 = 40px の基本高さ） */
  const calculateHeight = (duration: number): number => {
    const baseSlotHeight = 40; // timeline__slotの最小高さに合わせる
    const slotsNeeded = Math.ceil(duration / 15);
    return slotsNeeded * baseSlotHeight;
  };

  /** 背景グラデーションを計算（作業時間・待ち時間に基づく） */
  const calculateBackgroundStyle = (): React.CSSProperties => {
    const workTime = task.workTime || 0;
    const waitTime = task.waitTime || 0;
    const totalTime = workTime + waitTime;

    // 合計時間が0の場合は、デフォルトの背景を使用
    if (totalTime === 0) {
      return {};
    }

    const workPercentage = (workTime / totalTime) * 100;

    // 作業時間の部分は青色、待ち時間の部分は元の背景色
    const blueColor = "#2196F3"; // 枠線と同じ青色
    const defaultColor = isSelected ? "#e8f4fd" : "#f5f5f5";

    // 配置済みタスク（タイムライン）は縦分割、ステージングエリアは横分割
    const gradientDirection = task.isPlaced ? "to bottom" : "to right";

    return {
      background: `linear-gradient(${gradientDirection}, ${blueColor} 0%, ${blueColor} ${workPercentage}%, ${defaultColor} ${workPercentage}%, ${defaultColor} 100%)`,
      backgroundColor: "transparent", // CSS の background-color を無効化
    };
  };

  /** 作業時間・待ち時間の分割背景が適用されるかチェック */
  const hasSplitBackground = (): boolean => {
    const workTime = task.workTime || 0;
    const waitTime = task.waitTime || 0;
    return workTime + waitTime > 0;
  };

  const taskHeight = task.isPlaced ? calculateHeight(task.duration) : 60; // デフォルトの高さは60px

  return (
    <div
      className={`task-card ${
        task.isPlaced ? "task-card--placed" : "task-card--staging"
      } ${isSelected ? "task-card--selected" : ""} ${
        isOverlapping ? "task-card--overlapping" : ""
      } ${task.isLocked ? "task-card--locked" : ""} ${
        hasSplitBackground() ? "task-card--split-background" : ""
      }`}
      onClick={onClick}
      draggable={!task.isLocked}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        ...style,
        ...calculateBackgroundStyle(),
        width: task.isPlaced ? "120px" : "200px",
        height: `${taskHeight}px`,
        minHeight: `${taskHeight}px`,
      }}
    >
      <TaskHeader task={task} />
      {/* タスク一覧上（isPlacedがfalse）の場合のみ時間表示 */}
      {!task.isPlaced && (
        <div className="task-card__time">
          {task.workTime !== undefined && task.waitTime !== undefined ? (
            <>
              <span>作業: {task.workTime}分</span> /{" "}
              <span>待ち: {task.waitTime}分</span>
            </>
          ) : (
            <span>合計: {task.duration}分</span>
          )}
        </div>
      )}
      <TaskFooter task={task} onLockToggle={onLockToggle} />
    </div>
  );
};
