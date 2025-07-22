import { useContext } from "react";
import { TimelineContext } from "./TimelineContext";

/**
 * TimelineContextを使用するためのカスタムフック
 * @returns TimelineContextの値
 * @throws TimelineProvider外で使用された場合はエラー
 */
export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimelineContext must be used within a TimelineProvider");
  }
  return context;
};