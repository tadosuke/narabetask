import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

describe('最適化機能の統合テスト', () => {
  it('最適化ボタンをクリックして全タスクが配置される', () => {
    render(<App />);

    // タスクを3つ作成
    const addButton = screen.getByRole('button', { name: '+ 新しいタスク' });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    // 最適化ボタンを見つけてクリック
    const optimizeButton = screen.getByRole('button', { name: '最適化' });
    expect(optimizeButton).toBeInTheDocument();
    expect(optimizeButton).not.toBeDisabled();

    fireEvent.click(optimizeButton);

    // 配置されたタスクがタイムライン上に表示されることを確認
    const placedTasks = screen.getAllByText('新しいタスク');
    expect(placedTasks.length).toBeGreaterThan(0);

    // タスクステージングエリアに「タスクがありません」メッセージが表示されることを確認
    const emptyMessage = screen.getByText(/タスクがありません/);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('タスクがない場合は最適化ボタンが無効化される', () => {
    render(<App />);

    const optimizeButton = screen.getByRole('button', { name: '最適化' });
    expect(optimizeButton).toBeDisabled();
  });

  it('最適化後にタスクの選択状態がクリアされる', () => {
    render(<App />);

    // タスクを作成
    const addButton = screen.getByRole('button', { name: '+ 新しいタスク' });
    fireEvent.click(addButton);

    // タスクが選択されていることを確認
    const taskSettings = screen.getByText('タスク設定');
    expect(taskSettings).toBeInTheDocument();

    // 最適化実行
    const optimizeButton = screen.getByRole('button', { name: '最適化' });
    fireEvent.click(optimizeButton);

    // 選択状態がクリアされていることを確認
    const noSelectionMessage = screen.getByText('タスクを選択してください');
    expect(noSelectionMessage).toBeInTheDocument();
  });
});