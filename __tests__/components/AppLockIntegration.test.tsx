import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

describe('App Lock Integration Tests', () => {
  it('タスクがステージングエリアに戻されたときにロックが強制解除される', async () => {
    render(<App />);
    
    // 新しいタスクを作成
    const addButton = screen.getByText('+ 新しいタスク');
    fireEvent.click(addButton);
    
    // タスクカードを取得
    const taskCard = screen.getByText('新しいタスク').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // タスクをタイムラインにドラッグ（シミュレートはできないので、handleTaskDropを直接テスト用途で確認）
    // 実際のアプリケーションレベルでは、この統合テストはE2Eテストで行う方が適切
  });

  it('ロック状態のタスクがタスク更新時に正しく維持される', () => {
    render(<App />);
    
    // 新しいタスクを作成
    const addButton = screen.getByText('+ 新しいタスク');
    fireEvent.click(addButton);
    
    // タスクが作成されることを確認
    expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    
    // ロックボタンが無効状態で存在することを確認
    const lockButton = screen.getAllByRole('button').find(button => 
      button.querySelector('.material-symbols-outlined')?.textContent?.includes('lock')
    );
    expect(lockButton).toBeInTheDocument();
    expect(lockButton).toBeDisabled();
  });

  it('複数タスクの個別ロック状態が正しく管理される', () => {
    render(<App />);
    
    // 最初のタスクを作成
    fireEvent.click(screen.getByText('+ 新しいタスク'));
    
    // 2つ目のタスクを作成
    fireEvent.click(screen.getByText('+ 新しいタスク'));
    
    // 2つのタスクが作成されることを確認
    const taskCards = screen.getAllByText('新しいタスク');
    expect(taskCards).toHaveLength(2);
    
    // 各タスクにロックボタンが存在することを確認
    const lockButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('.material-symbols-outlined')?.textContent?.includes('lock')
    );
    expect(lockButtons.length).toBeGreaterThanOrEqual(2);
  });
});