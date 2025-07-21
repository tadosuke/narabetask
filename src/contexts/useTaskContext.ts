import { useContext } from 'react';
import { TaskContext } from './TaskContext';

/**
 * TaskContextを使用するためのカスタムフック
 */
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};