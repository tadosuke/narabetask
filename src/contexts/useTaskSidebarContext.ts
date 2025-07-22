import { useContext } from 'react';
import { TaskSidebarContext } from './TaskSidebarContext';

/**
 * TaskSidebarContextを使用するためのhook
 * @returns TaskSidebarContextの値
 * @throws Providerでラップされていない場合にError
 */
export const useTaskSidebarContext = () => {
  const context = useContext(TaskSidebarContext);
  if (!context) {
    throw new Error('useTaskSidebarContext must be used within a TaskSidebarProvider');
  }
  return context;
};