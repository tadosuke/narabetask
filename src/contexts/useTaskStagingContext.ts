import { useContext } from 'react';
import { TaskStagingContext } from './TaskStagingContext';

/**
 * TaskStagingContextを使用するためのカスタムフック
 */
export const useTaskStagingContext = () => {
  const context = useContext(TaskStagingContext);
  if (context === undefined) {
    throw new Error('useTaskStagingContext must be used within a TaskStagingProvider');
  }
  return context;
};