/**
 * 一意のIDを生成します
 * @returns {string} タイムスタンプとランダム文字列を組み合わせた一意ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}